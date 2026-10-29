"""Exporta los agregados validados del ETL a archivos JSON compactos para el sitio.

Lee las tablas out_* de la base DuckDB que deja run_etl.py (solo si las 19 validaciones pasaron,
lo que se comprueba con la presencia de out/metadatos.csv) y escribe:

    data/web/meta.json        versión, fecha, fuente y participación nacional por elección
    data/web/catalogo.json    elecciones, entidades y grupos de edad (lo usan servidor y navegador)
    data/web/municipios.json  catálogo de 2,477 municipios (solo servidor y verificación)
    data/web/edad.json        entidad × sexo × edad simple (7 elecciones)
    data/web/tipo.json        entidad × tipo de sección × sexo × grupo
    data/web/modalidad.json   prisión preventiva y voto anticipado 2024
    public/datos/entidad.json entidad × sexo × grupo (lo usan servidor y explorador)
    public/datos/m/{eleccion}/{entidad}.json   municipios de una entidad en una elección

Regla de privacidad única (D46): toda celda desagregada por sexo o por edad con ln < 30
se exporta sin votos (sv y ns quedan en null). NV se deriva como ln - sv - ns.

Uso (desde la raíz del proyecto):
    etl\\.venv\\Scripts\\python.exe -I etl\\export_web.py
"""

from __future__ import annotations

import csv
import datetime as dt
import json
import os
import shutil
import sys
from pathlib import Path

import duckdb

ETL_DIR = Path(__file__).resolve().parent
PROYECTO = ETL_DIR.parent
TRABAJO = Path(os.environ.get("USERPROFILE", str(Path.home()))) / "participacion-ine-etl"
BD = TRABAJO / "conteos.duckdb"
METADATOS_ETL = TRABAJO / "out" / "metadatos.csv"
SALIDA_WEB = PROYECTO / "data" / "web"
SALIDA_PUBLICA = PROYECTO / "public" / "datos"
UMBRAL = 30
FUENTE_URL = "https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/"


def escribir(ruta: Path, datos: object) -> int:
    ruta.parent.mkdir(parents=True, exist_ok=True)
    texto = json.dumps(datos, ensure_ascii=False, separators=(",", ":"))
    ruta.write_text(texto, encoding="utf-8")
    return len(texto.encode("utf-8"))


def proteger(fila: list, ln_idx: int, desagregada: bool) -> list:
    """Quita votos (sv, ns) de una celda desagregada con menos de UMBRAL personas."""
    if desagregada and fila[ln_idx] < UMBRAL:
        fila[ln_idx + 1] = None
        fila[ln_idx + 2] = None
    return fila


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    if not METADATOS_ETL.is_file():
        sys.exit(f"No existe {METADATOS_ETL}: corre primero npm run etl (y que pasen las validaciones).")
    with open(METADATOS_ETL, encoding="utf-8", newline="") as f:
        meta_etl = {fila["clave"]: fila["valor"] for fila in csv.DictReader(f)}
    if meta_etl.get("alcance") != "completo":
        sys.exit(f"La salida del ETL es '{meta_etl.get('alcance')}'; el sitio necesita la corrida completa.")
    version = meta_etl["version_datos"]

    con = duckdb.connect(str(BD), read_only=True)
    q = lambda sql: con.execute(sql).fetchall()

    elecciones = [
        {"id": r[0], "clave": r[1], "slug": r[2], "anio": r[3], "tipo": r[4], "fecha": r[5].isoformat(),
         "presidencial": bool(r[6]), "marco": r[7], "cargos": r[8], "cubiertas": r[9]}
        for r in q("SELECT id, clave, slug, anio, tipo, fecha_jornada, es_presidencial, marco_cartografico, "
                   "cargos, entidades_cubiertas FROM seed_elecciones ORDER BY id")
    ]
    slug_de = {e["id"]: e["slug"] for e in elecciones}
    entidades = [
        {"clave": r[0], "slug": r[1], "nombre": r[2], "corto": r[3], "abrev": r[4], "region": r[5]}
        for r in q("SELECT clave, slug, nombre, nombre_corto, abreviatura, region FROM seed_entidades ORDER BY clave")
    ]
    grupos = [
        {"id": r[0], "etiqueta": r[1], "min": r[2], "max": r[3], "amplio": r[4]}
        for r in q("SELECT id, etiqueta, edad_min, edad_max, grupo_amplio, orden FROM seed_grupos_edad ORDER BY orden")
    ]
    municipios = [list(r) for r in q("SELECT id, entidad_clave, clave, nombre, slug FROM out_municipios ORDER BY id")]

    tam: dict[str, int] = {}
    tam["catalogo"] = escribir(SALIDA_WEB / "catalogo.json", {
        "v": version, "elecciones": elecciones, "entidades": entidades, "grupos": grupos,
    })
    tam["municipios"] = escribir(SALIDA_WEB / "municipios.json", {
        "v": version, "c": ["id", "ent", "clave", "nombre", "slug"], "f": municipios,
    })

    # entidad × sexo × grupo (0 = nacional) — desagregada si sexo != 9 o grupo != 0
    filas = [proteger(list(r), 4, r[2] != 9 or r[3] != 0) for r in q(
        "SELECT eleccion_id, entidad_clave, sexo, grupo_edad_id, ln, sv, ns FROM out_agg_entidad "
        "ORDER BY 1, 2, 3, 4")]
    tam["entidad"] = escribir(SALIDA_PUBLICA / "entidad.json",
                              {"v": version, "c": ["e", "ent", "s", "g", "ln", "sv", "ns"], "f": filas})

    # entidad × sexo × edad simple — siempre desagregada por edad
    filas = [proteger(list(r), 4, True) for r in q(
        "SELECT eleccion_id, entidad_clave, sexo, edad, ln, sv, ns FROM out_agg_entidad_edad ORDER BY 1, 2, 3, 4")]
    tam["edad"] = escribir(SALIDA_WEB / "edad.json",
                           {"v": version, "c": ["e", "ent", "s", "edad", "ln", "sv", "ns"], "f": filas})

    # entidad × tipo de sección × sexo × grupo — desagregada por tipo
    filas = [proteger(list(r), 5, True) for r in q(
        "SELECT eleccion_id, entidad_clave, tipo_seccion, sexo, grupo_edad_id, ln, sv, ns FROM out_agg_tipo_seccion "
        "ORDER BY 1, 2, 3, 4, 5")]
    tam["tipo"] = escribir(SALIDA_WEB / "tipo.json",
                           {"v": version, "c": ["e", "ent", "t", "s", "g", "ln", "sv", "ns"], "f": filas})

    filas = [list(r) for r in q(
        "SELECT modalidad, entidad_clave, municipio_id, def, sexo, personas FROM out_agg_modalidad_voto "
        "ORDER BY 1, 2, 3 NULLS FIRST, 4, 5")]
    tam["modalidad"] = escribir(SALIDA_WEB / "modalidad.json",
                                {"v": version, "c": ["mod", "ent", "mun", "def", "s", "personas"], "f": filas})

    # Municipios por elección y entidad
    destino_m = SALIDA_PUBLICA / "m"
    if destino_m.exists():
        shutil.rmtree(destino_m)
    nombres = {r[0]: r[3] for r in municipios}
    bloques: dict[tuple[int, int], list] = {}
    for e, mun, s, g, ln, sv, ns in q(
            "SELECT a.eleccion_id, a.municipio_id, a.sexo, a.grupo_edad_id, a.ln, a.sv, a.ns "
            "FROM out_agg_municipio a ORDER BY 1, 2, 3, 4"):
        ent = mun // 1000
        bloques.setdefault((e, ent), []).append(proteger([mun % 1000, s, g, ln, sv, ns], 3, s != 9 or g != 0))
    total_m = 0
    for (e, ent), filas in bloques.items():
        claves = sorted({f[0] for f in filas})
        total_m += escribir(destino_m / slug_de[e] / f"{ent}.json", {
            "v": version, "e": slug_de[e], "ent": ent,
            "mun": {str(c): nombres[ent * 1000 + c] for c in claves},
            "c": ["m", "s", "g", "ln", "sv", "ns"], "f": filas,
        })
    tam["municipios (total)"] = total_m

    nacional = [
        {"e": r[0], "clave": r[1], "ln": r[2], "sv": r[3], "pct": round(100.0 * r[3] / r[2], 2)}
        for r in q("SELECT a.eleccion_id, e.clave, a.ln, a.sv FROM out_agg_entidad a "
                   "JOIN seed_elecciones e ON e.id = a.eleccion_id "
                   "WHERE a.entidad_clave = 0 AND a.sexo = 9 AND a.grupo_edad_id = 0 ORDER BY 1")
    ]
    with open(ETL_DIR / "overrides_municipios.csv", encoding="utf-8", newline="") as f:
        nombres_corregidos = sum(1 for _ in csv.DictReader(f))
    with open(ETL_DIR / "remapeo_municipios.csv", encoding="utf-8", newline="") as f:
        reasignaciones = [
            {"anio": int(r["anio"]), "entidad": int(r["entidad_clave"]), "de": int(r["clave_fuente"]),
             "a": int(r["clave_destino"])}
            for r in csv.DictReader(f)
        ]
    tam["meta"] = escribir(SALIDA_WEB / "meta.json", {
        "v": version,
        "fecha_proceso": meta_etl.get("fecha_proceso"),
        "fecha_exportacion": dt.datetime.now().isoformat(timespec="seconds"),
        "fuente": {"nombre": "Conteos Censales de Participación Ciudadana, INE (DECEyEC)", "url": FUENTE_URL},
        "umbral": UMBRAL,
        "nacional": nacional,
        "archivos_municipio": len(bloques),
        "correcciones": {"nombres": nombres_corregidos, "reasignaciones": reasignaciones},
    })
    con.close()

    for nombre, bytes_ in tam.items():
        print(f"  {nombre:<20} {bytes_ / 1024:,.0f} KB")
    print(f"Listo · versión {version} · {len(bloques)} archivos municipales")
    return 0


if __name__ == "__main__":
    sys.exit(main())
