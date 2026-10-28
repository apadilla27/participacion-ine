"""ETL de los Conteos Censales de Participación Ciudadana (INE, DECEyEC) → agregados para Supabase.

Lee los CSV originales del INE con DuckDB, construye los agregados que usa el micrositio,
los valida y exporta un CSV por tabla de Supabase más metadatos.csv y validation_report.md.
No escribe nada en Supabase: la carga la hace etl/load.py.

Uso (desde la raíz del proyecto, con el entorno del ETL):
    etl\\.venv\\Scripts\\python.exe -I etl\\run_etl.py                    # corrida completa (32 entidades)
    etl\\.venv\\Scripts\\python.exe -I etl\\run_etl.py --estados ags      # prueba en seco con Aguascalientes
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import os
import re
import sys
import time
from pathlib import Path

import duckdb

ETL_DIR = Path(__file__).resolve().parent
PROYECTO = ETL_DIR.parent
SEED_DIR = ETL_DIR / "seed"
SQL_DIR = ETL_DIR / "sql"
OVERRIDES = ETL_DIR / "overrides_municipios.csv"
REMAPEO = ETL_DIR / "remapeo_municipios.csv"

FUENTE_POR_DEFECTO = Path(r"C:\Users\anafe\Downloads\DatosAbiertos_DECEyEC_ConteosCensales")
TRABAJO_POR_DEFECTO = Path(os.environ.get("USERPROFILE", str(Path.home()))) / "participacion-ine-etl"

CARPETAS_FEDERALES = ["2009", "2012", "2015", "2018", "2021", "2024"]
CARPETA_PJ = "PoderJudicial_2025"
ARCHIVO_PP = "PrisionPreventiva2024/datosabiertos_deceyec_conteoscensales_prisionpreventiva2024.csv"
ARCHIVO_VA = "VotoAnticipado2024/datosabiertos_deceyec_conteoscensales_votoanticipado2024.csv"

# Sufijo de archivo → clave INE de entidad. 2024 usa "tam" para Tamaulipas; el resto de años "tamps".
SUFIJOS = {
    "ags": 1, "bc": 2, "bcs": 3, "camp": 4, "coah": 5, "col": 6, "chis": 7, "chih": 8,
    "cdmx": 9, "dgo": 10, "gto": 11, "gro": 12, "hgo": 13, "jal": 14, "mex": 15, "mich": 16,
    "mor": 17, "nay": 18, "nl": 19, "oax": 20, "pue": 21, "qro": 22, "qroo": 23, "slp": 24,
    "sin": 25, "son": 26, "tab": 27, "tamps": 28, "tam": 28, "tlax": 29, "ver": 30, "yuc": 31,
    "zac": 32,
}
ARCHIVOS_ESPERADOS = {**{c: 32 for c in CARPETAS_FEDERALES}, CARPETA_PJ: 31}

# Tablas exportadas: nombre en Supabase → (tabla DuckDB, columnas en orden, orden de filas)
EXPORTES = {
    "municipios": ("out_municipios", "id, entidad_clave, clave, nombre, slug", "id"),
    "agg_entidad": ("out_agg_entidad", "eleccion_id, entidad_clave, sexo, grupo_edad_id, ln, sv, nv, ns",
                    "eleccion_id, entidad_clave, sexo, grupo_edad_id"),
    "agg_entidad_edad": ("out_agg_entidad_edad", "eleccion_id, entidad_clave, sexo, edad, ln, sv, nv, ns",
                         "eleccion_id, entidad_clave, sexo, edad"),
    "agg_municipio": ("out_agg_municipio", "eleccion_id, municipio_id, sexo, grupo_edad_id, ln, sv, nv, ns",
                      "eleccion_id, municipio_id, sexo, grupo_edad_id"),
    "agg_tipo_seccion": ("out_agg_tipo_seccion",
                         "eleccion_id, entidad_clave, tipo_seccion, sexo, grupo_edad_id, ln, sv, nv, ns",
                         "eleccion_id, entidad_clave, tipo_seccion, sexo, grupo_edad_id"),
    "secciones_resumen": ("out_secciones_resumen",
                          "eleccion_id, entidad_clave, seccion, municipio_id, tipo_seccion, def, del, cj, dej, "
                          "ln, sv, nv, ns, ln_h, sv_h, ln_m, sv_m",
                          "eleccion_id, entidad_clave, seccion"),
    "agg_modalidad_voto": ("out_agg_modalidad_voto",
                           "eleccion_id, modalidad, entidad_clave, municipio_id, def, sexo, personas",
                           "modalidad, entidad_clave, municipio_id NULLS FIRST, def, sexo"),
}


def log(msg: str) -> None:
    print(f"[{dt.datetime.now():%H:%M:%S}] {msg}", flush=True)


def sql_ruta(p: Path) -> str:
    return str(p).replace("\\", "/").replace("'", "''")


def sql_lista(rutas: list[Path]) -> str:
    return "[" + ", ".join(f"'{sql_ruta(r)}'" for r in rutas) + "]"


FORMATO_CSV = "header = true, all_varchar = true, delim = ',', quote = '\"', escape = '\"'"


def lectura_csv(rutas: list[Path]) -> str:
    # Formato fijo: el detector de DuckDB no ve comillas en la muestra de algunos archivos
    # (p. ej. "Heroica Villa Tezoatlán de Segura y Luna, Cuna de" en Oaxaca 2009) y rompe la fila.
    return f"read_csv({sql_lista(rutas)}, {FORMATO_CSV}, filename = true)"


def sufijo(archivo: Path) -> str:
    return archivo.stem.rsplit("_", 1)[-1].lower()


def listar_archivos(fuente: Path, entidades: set[int] | None, completo: bool) -> tuple[list[Path], list[Path]]:
    fed: list[Path] = []
    pj: list[Path] = []
    for carpeta in CARPETAS_FEDERALES + [CARPETA_PJ]:
        archivos = sorted((fuente / carpeta).glob("datosabiertos_*.csv"))
        desconocidos = [a.name for a in archivos if sufijo(a) not in SUFIJOS]
        if desconocidos:
            sys.exit(f"Archivos con sufijo de entidad desconocido en {carpeta}: {desconocidos}")
        if completo and len(archivos) != ARCHIVOS_ESPERADOS[carpeta]:
            sys.exit(f"{carpeta}: se esperaban {ARCHIVOS_ESPERADOS[carpeta]} CSV y hay {len(archivos)}")
        if entidades is not None:
            archivos = [a for a in archivos if SUFIJOS[sufijo(a)] in entidades]
        (pj if carpeta == CARPETA_PJ else fed).extend(archivos)
    if not fed:
        sys.exit("No hay archivos federales que procesar con ese filtro de entidades.")
    return fed, pj


def huella_fuente(archivos: list[Path], fuente: Path) -> str:
    """Huella de los datos: rutas y tamaños de la fuente + contenido de las correcciones manuales del ETL."""
    h = hashlib.sha256()
    for a in sorted(archivos):
        h.update(f"{a.relative_to(fuente).as_posix()}|{a.stat().st_size}\n".encode())
    for curacion in (OVERRIDES, REMAPEO, *sorted(SEED_DIR.glob("*.csv"))):
        h.update(curacion.read_bytes())
    return h.hexdigest()


def plantilla(nombre: str, reemplazos: dict[str, str]) -> str:
    texto = (SQL_DIR / nombre).read_text(encoding="utf-8")
    for clave, valor in reemplazos.items():
        texto = texto.replace(f"@@{clave}@@", valor)
    restantes = re.findall(r"@@[A-Z_]+@@", texto)
    if restantes:
        sys.exit(f"{nombre}: marcadores sin sustituir {sorted(set(restantes))}")
    return texto


def parsear_validaciones(texto: str) -> list[dict]:
    bloques: list[dict] = []
    actual: dict | None = None
    patron = re.compile(r"^-- (check|check-completo|info): ([a-z0-9_]+) \| (.+)$")
    for linea in texto.splitlines():
        m = patron.match(linea.strip())
        if m:
            if actual:
                bloques.append(actual)
            actual = {"tipo": m.group(1), "id": m.group(2), "descripcion": m.group(3), "sql": []}
        elif actual is not None:
            actual["sql"].append(linea)
    if actual:
        bloques.append(actual)
    for b in bloques:
        b["sql"] = "\n".join(b["sql"]).strip().rstrip(";").strip()
    return bloques


def tabla_markdown(columnas: list[str], filas: list[tuple], limite: int = 20) -> str:
    if not filas:
        return "_(sin filas)_\n"
    fmt = lambda v: "" if v is None else (f"{v:,}" if isinstance(v, int) and not isinstance(v, bool) else str(v))
    lineas = ["| " + " | ".join(columnas) + " |", "|" + "---|" * len(columnas)]
    for f in filas[:limite]:
        lineas.append("| " + " | ".join(fmt(v) for v in f) + " |")
    if len(filas) > limite:
        lineas.append(f"\n_… {len(filas) - limite} filas más_")
    return "\n".join(lineas) + "\n"


def validar(con: duckdb.DuckDBPyConnection, completo: bool, reporte: list[str]) -> bool:
    bloques = parsear_validaciones((SQL_DIR / "validate.sql").read_text(encoding="utf-8"))
    fallas = 0
    reporte.append("## Validaciones\n")
    reporte.append("| Resultado | Check | Descripción |\n|---|---|---|")
    detalles: list[str] = []
    infos: list[str] = []
    for b in bloques:
        if b["tipo"] == "check-completo" and not completo:
            reporte.append(f"| OMITIDO (corrida parcial) | `{b['id']}` | {b['descripcion']} |")
            continue
        cur = con.execute(b["sql"])
        columnas = [d[0] for d in cur.description]
        filas = cur.fetchall()
        if b["tipo"] == "info":
            infos.append(f"### {b['id']}\n\n{b['descripcion']}\n\n{tabla_markdown(columnas, filas, 60)}")
            continue
        ok = len(filas) == 0
        reporte.append(f"| {'PASA' if ok else 'FALLA'} | `{b['id']}` | {b['descripcion']} |")
        log(f"  {'PASA ' if ok else 'FALLA'} {b['id']}")
        if not ok:
            fallas += 1
            detalles.append(f"### FALLA `{b['id']}`\n\n{b['descripcion']}\n\n{tabla_markdown(columnas, filas)}")
    reporte.append("")
    reporte.extend(detalles)
    reporte.append("## Información\n")
    reporte.extend(infos)
    return fallas == 0


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--fuente", type=Path, default=FUENTE_POR_DEFECTO, help="carpeta DatosAbiertos_DECEyEC_ConteosCensales")
    ap.add_argument("--trabajo", type=Path, default=TRABAJO_POR_DEFECTO,
                    help="carpeta de trabajo fuera de OneDrive (BD DuckDB y salida)")
    ap.add_argument("--estados", default="", help="sufijos separados por coma (p. ej. ags,col); vacío = las 32")
    ap.add_argument("--memoria", default="5GB", help="memory_limit de DuckDB")
    ap.add_argument("--reusar-base", action="store_true", help="no reconstruir la tabla base si ya existe")
    args = ap.parse_args()

    fuente: Path = args.fuente.resolve()
    if not fuente.is_dir():
        sys.exit(f"No existe la carpeta fuente: {fuente}")

    entidades: set[int] | None = None
    if args.estados.strip():
        sufs = [s.strip().lower() for s in args.estados.split(",") if s.strip()]
        malos = [s for s in sufs if s not in SUFIJOS]
        if malos:
            sys.exit(f"Sufijos desconocidos: {malos}. Válidos: {sorted(SUFIJOS)}")
        entidades = {SUFIJOS[s] for s in sufs}
    completo = entidades is None
    alcance = "completo" if completo else "parcial:" + ",".join(sorted(args.estados.lower().split(",")))

    trabajo: Path = args.trabajo.resolve()
    salida = trabajo / ("out" if completo else "out_parcial")
    salida.mkdir(parents=True, exist_ok=True)
    (trabajo / "tmp").mkdir(exist_ok=True)
    bd = trabajo / ("conteos.duckdb" if completo else "conteos_parcial.duckdb")

    fed, pj = listar_archivos(fuente, entidades, completo)
    pp, va = fuente / ARCHIVO_PP, fuente / ARCHIVO_VA
    for f in (pp, va):
        if not f.is_file():
            sys.exit(f"Falta el archivo {f}")
    todos = fed + pj + [pp, va]
    huella = huella_fuente(todos, fuente)
    log(f"Alcance: {alcance} · {len(fed)} CSV federales · {len(pj)} CSV judiciales · BD {bd}")

    con = duckdb.connect(str(bd))
    con.execute(f"SET memory_limit = '{args.memoria}'")
    con.execute(f"SET temp_directory = '{sql_ruta(trabajo / 'tmp')}'")
    con.execute("SET preserve_insertion_order = false")

    t0 = time.time()
    existe_base = con.execute(
        "SELECT count(*) FROM information_schema.tables WHERE table_name = 'base'").fetchone()[0] > 0
    if args.reusar_base and existe_base:
        log("Etapa 1 · reutilizando tabla base existente")
    else:
        lectura_pj = lectura_csv(pj) if pj else (
            "(SELECT " + ", ".join(f"NULL::VARCHAR AS {c}" for c in
                                   ["AELEC", "EDOCVE", "EDONOM", "MPIOCVE", "MPIONOM", "SECCION", "TIPOSEC", "DEF",
                                    "CJ", "DEJ", "SEXO", "EDAD", "LN", "SV", "NV", "NS", "filename"]) + " WHERE false)")
        log("Etapa 1 · leyendo CSV del INE y construyendo la tabla base…")
        con.execute(plantilla("build_base.sql", {
            "SEED": sql_ruta(SEED_DIR),
            "LECTURA_FED": lectura_csv(fed),
            "LECTURA_PJ": lectura_pj,
            "REMAPEO": sql_ruta(REMAPEO),
        }))
    filas_base = con.execute("SELECT count(*) FROM base").fetchone()[0]
    log(f"  base: {filas_base:,} filas ({time.time() - t0:,.0f} s)")

    t1 = time.time()
    log("Etapa 2 · catálogo de municipios…")
    con.execute(plantilla("catalogo_municipios.sql", {"OVERRIDES": sql_ruta(OVERRIDES)}))

    log("Etapa 3 · agregados…")
    filtro = "true" if completo else f"entidad_clave IN ({', '.join(str(e) for e in sorted(entidades))})"
    con.execute(plantilla("aggregates.sql", {
        "LECTURA_PP": f"read_csv('{sql_ruta(pp)}', {FORMATO_CSV})",
        "LECTURA_VA": f"read_csv('{sql_ruta(va)}', {FORMATO_CSV})",
        "FILTRO_ENTIDADES": filtro,
    }))
    log(f"  agregados listos ({time.time() - t1:,.0f} s)")

    log("Etapa 4 · validaciones…")
    reporte = [
        "# Reporte de validación del ETL",
        "",
        f"- Fecha: {dt.datetime.now():%Y-%m-%d %H:%M}",
        f"- Alcance: `{alcance}`",
        f"- Fuente: `{fuente}`",
        f"- Archivos leídos: {len(todos)} · filas en base: {filas_base:,}",
        f"- Huella de la fuente (SHA-256 de rutas y tamaños): `{huella}`",
        f"- DuckDB {duckdb.__version__}",
        "",
    ]
    ok = validar(con, completo, reporte)
    (salida / "validation_report.md").write_text("\n".join(reporte), encoding="utf-8")
    log(f"  reporte: {salida / 'validation_report.md'}")
    if not ok:
        log("HAY VALIDACIONES FALLIDAS: no se exportan CSV. Revisa el reporte.")
        con.close()
        return 1

    log("Etapa 5 · exportando CSV…")
    filas_por_tabla: dict[str, int] = {}
    for tabla, (origen, columnas, orden) in EXPORTES.items():
        destino = salida / f"{tabla}.csv"
        con.execute(f"COPY (SELECT {columnas} FROM {origen} ORDER BY {orden}) "
                    f"TO '{sql_ruta(destino)}' (HEADER, DELIMITER ',')")
        filas_por_tabla[tabla] = con.execute(f"SELECT count(*) FROM {origen}").fetchone()[0]
        log(f"  {tabla}: {filas_por_tabla[tabla]:,} filas")
    con.execute(f"COPY (SELECT * FROM out_municipios_variantes) TO '{sql_ruta(salida / 'municipios_variantes.csv')}' "
                "(HEADER, DELIMITER ',')")

    version = f"{dt.date.today():%Y%m%d}-{huella[:12]}"
    metadatos = {
        "version_datos": version,
        "alcance": alcance,
        "fecha_proceso": dt.datetime.now().isoformat(timespec="seconds"),
        "hash_origen": huella,
        "archivos_fuente": str(len(todos)),
        "filas_fuente": str(filas_base),
        "duckdb_version": duckdb.__version__,
        "fuente_url": "https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/",
        **{f"filas_{t}": str(n) for t, n in filas_por_tabla.items()},
    }
    with open(salida / "metadatos.csv", "w", encoding="utf-8", newline="") as f:
        f.write("clave,valor\n")
        for k, v in metadatos.items():
            f.write(f'{k},"{v.replace(chr(34), chr(34) * 2)}"\n')
    log(f"Listo en {time.time() - t0:,.0f} s · versión {version} · salida {salida}")
    con.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
