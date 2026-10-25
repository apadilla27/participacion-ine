"""Carga los agregados del ETL en Supabase y verifica el resultado.

Requisitos: las migraciones de supabase/migrations ya aplicadas en el proyecto remoto.
Conexión: Session pooler de Supabase (IPv4). La cadena se toma de --db-url, de la variable
de entorno SUPABASE_DB_URL o del archivo etl/.env (ver etl/.env.example).

Uso (desde la raíz del proyecto):
    <venv>\\Scripts\\python.exe -I etl\\load.py                      # primera carga
    <venv>\\Scripts\\python.exe -I etl\\load.py --reemplazar         # recarga (vacía las tablas antes)
    <venv>\\Scripts\\python.exe -I etl\\load.py --solo-verificar     # solo comprobaciones posteriores a la carga

Qué hace, en una sola transacción: TRUNCATE de las tablas de datos, COPY de los catálogos
(supabase/seed) y de los agregados (salida del ETL), registro de fecha_carga en metadatos.
Después: ANALYZE, conteos contra metadatos, rpc_conciliacion(), prueba de permisos como anon
y tamaño de la base. Sale con código 1 si algo no cuadra.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import os
import sys
from pathlib import Path

import psycopg
from psycopg import errors, sql

ETL_DIR = Path(__file__).resolve().parent
SEED_DIR = ETL_DIR.parent / "supabase" / "seed"
ENTRADA_POR_DEFECTO = Path(os.environ.get("USERPROFILE", str(Path.home()))) / "participacion-ine-etl" / "out"

# Orden de carga (respeta llaves foráneas). (tabla, carpeta: "seed" | "etl")
ORDEN = [
    ("elecciones", "seed"),
    ("entidades", "seed"),
    ("grupos_edad", "seed"),
    ("municipios", "etl"),
    ("agg_entidad", "etl"),
    ("agg_entidad_edad", "etl"),
    ("agg_municipio", "etl"),
    ("agg_tipo_seccion", "etl"),
    ("secciones_resumen", "etl"),
    ("agg_modalidad_voto", "etl"),
    ("metadatos", "etl"),
]
TABLAS = [t for t, _ in ORDEN]


def leer_env_archivo(ruta: Path) -> dict[str, str]:
    valores: dict[str, str] = {}
    if ruta.is_file():
        for linea in ruta.read_text(encoding="utf-8").splitlines():
            linea = linea.strip()
            if linea and not linea.startswith("#") and "=" in linea:
                k, v = linea.split("=", 1)
                valores[k.strip()] = v.strip().strip('"').strip("'")
    return valores


def leer_metadatos(entrada: Path) -> dict[str, str]:
    with open(entrada / "metadatos.csv", encoding="utf-8", newline="") as f:
        return {fila["clave"]: fila["valor"] for fila in csv.DictReader(f)}


def encabezado(ruta: Path) -> list[str]:
    with open(ruta, encoding="utf-8", newline="") as f:
        return next(csv.reader(f))


def copiar(cur: psycopg.Cursor, tabla: str, ruta: Path) -> None:
    columnas = sql.SQL(", ").join(sql.Identifier(c) for c in encabezado(ruta))
    consulta = sql.SQL("COPY public.{} ({}) FROM STDIN WITH (FORMAT csv, HEADER true)").format(
        sql.Identifier(tabla), columnas)
    with open(ruta, "rb") as f, cur.copy(consulta) as copy:
        while bloque := f.read(1 << 20):
            copy.write(bloque)


def ok(msg: str) -> None:
    print(f"  OK     {msg}", flush=True)


def falla(msg: str) -> None:
    print(f"  FALLA  {msg}", flush=True)


def verificar(con: psycopg.Connection, meta: dict[str, str]) -> bool:
    exito = True
    print("Verificación posterior a la carga", flush=True)
    with con.cursor() as cur:
        esperados = {"elecciones": 7, "entidades": 33, "grupos_edad": 10}
        esperados.update({k.removeprefix("filas_"): int(v) for k, v in meta.items() if k.startswith("filas_")
                          and k.removeprefix("filas_") in TABLAS})
        for tabla, n in esperados.items():
            real = cur.execute(sql.SQL("SELECT count(*) FROM public.{}").format(sql.Identifier(tabla))).fetchone()[0]
            (ok if real == n else falla)(f"{tabla}: {real:,} filas (esperadas {n:,})")
            exito &= real == n

        filas = cur.execute("SELECT eleccion_id, entidad_clave, ok FROM public.rpc_conciliacion()").fetchall()
        malas = [f for f in filas if f[2] is not True]
        esperadas = 6 * 32 + 31 if meta.get("alcance") == "completo" else None
        if malas:
            falla(f"rpc_conciliacion: {len(malas)} (elección, entidad) no cuadran, p. ej. {malas[:5]}")
            exito = False
        elif esperadas is not None and len(filas) != esperadas:
            falla(f"rpc_conciliacion: {len(filas)} filas (esperadas {esperadas})")
            exito = False
        else:
            ok(f"rpc_conciliacion: {len(filas)} combinaciones elección × entidad cuadran")

        cur.execute("SELECT valor FROM public.metadatos WHERE clave = 'version_datos'")
        version = cur.fetchone()
        (ok if version and version[0] == meta.get("version_datos") else falla)(
            f"metadatos.version_datos = {version[0] if version else None}")

    # Permisos: anon lee y llama RPC, pero no escribe
    try:
        with con.transaction():
            with con.cursor() as cur:
                cur.execute("SET LOCAL ROLE anon")
                n = cur.execute("SELECT count(*) FROM public.v_participacion_entidad").fetchone()[0]
                serie = cur.execute("SELECT count(*) FROM public.rpc_serie_entidad(0::smallint)").fetchone()[0]
                ranking = cur.execute(
                    "SELECT jsonb_array_length(public.rpc_ranking_municipios(6::smallint, 1::smallint))").fetchone()[0]
                ok(f"anon lee: v_participacion_entidad={n:,} filas, serie nacional={serie}, ranking AGS 2024={ranking}")
                exito &= n > 0 and serie > 0
                try:
                    with con.transaction():
                        cur.execute("INSERT INTO public.metadatos (clave, valor) VALUES ('prueba_anon', 'x')")
                    falla("anon pudo escribir en metadatos")
                    exito = False
                except errors.InsufficientPrivilege:
                    ok("anon no puede escribir (permiso denegado, como se espera)")
                raise _Revertir()
    except _Revertir:
        pass

    with con.cursor() as cur:
        total = cur.execute("SELECT pg_size_pretty(pg_database_size(current_database())), "
                            "pg_database_size(current_database())").fetchone()
        (ok if total[1] < 400 * 1024 * 1024 else falla)(f"tamaño de la base: {total[0]} (límite del plan Free: 500 MB)")
        exito &= total[1] < 400 * 1024 * 1024
        for nombre, tam in cur.execute(
                "SELECT relname, pg_size_pretty(pg_total_relation_size(c.oid)) FROM pg_class c "
                "JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'r' "
                "ORDER BY pg_total_relation_size(c.oid) DESC").fetchall():
            print(f"         {nombre:<22} {tam}")
        print("  Participación nacional (sv / ln):")
        for fila in cur.execute(
                "SELECT eleccion, sexo, pct FROM public.rpc_serie_entidad(0::smallint) ORDER BY anio, sexo").fetchall():
            print(f"         {fila[0]:<8} sexo={fila[1]}  {fila[2]}%")
    return exito


class _Revertir(Exception):
    """Se usa para revertir la transacción de prueba de permisos."""


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--entrada", type=Path, default=ENTRADA_POR_DEFECTO, help="carpeta out/ generada por run_etl.py")
    ap.add_argument("--db-url", default=None, help="cadena del Session pooler de Supabase")
    ap.add_argument("--reemplazar", action="store_true", help="permitir vaciar tablas que ya tienen datos")
    ap.add_argument("--permitir-parcial", action="store_true", help="permitir cargar una corrida parcial (--estados)")
    ap.add_argument("--solo-verificar", action="store_true", help="no cargar; solo comprobar lo que hay en Supabase")
    args = ap.parse_args()

    url = args.db_url or os.environ.get("SUPABASE_DB_URL") or leer_env_archivo(ETL_DIR / ".env").get("SUPABASE_DB_URL")
    if not url:
        sys.exit("Falta la cadena de conexión: usa --db-url, SUPABASE_DB_URL o etl/.env (ver etl/.env.example).")
    if "pooler.supabase.com" not in url:
        print("Aviso: la cadena no apunta al Session pooler (*.pooler.supabase.com:5432). "
              "La conexión directa del plan Free es solo IPv6.", flush=True)

    entrada: Path = args.entrada.resolve()
    meta = leer_metadatos(entrada)
    if meta.get("alcance") != "completo" and not args.permitir_parcial:
        sys.exit(f"La salida en {entrada} es una corrida '{meta.get('alcance')}'. "
                 "Para cargarla de todos modos usa --permitir-parcial.")

    with psycopg.connect(url, connect_timeout=30, application_name="participacion-ine-etl") as con:
        with con.cursor() as cur:
            existentes = {r[0] for r in cur.execute(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'").fetchall()}
        faltan = [t for t in TABLAS if t not in existentes]
        if faltan:
            sys.exit(f"Faltan tablas en Supabase: {faltan}. Aplica primero las migraciones (npx supabase db push).")
        con.commit()

        if not args.solo_verificar:
            with con.cursor() as cur:
                con_datos = [t for t in TABLAS if cur.execute(
                    sql.SQL("SELECT EXISTS (SELECT 1 FROM public.{})").format(sql.Identifier(t))).fetchone()[0]]
            con.commit()
            if con_datos and not args.reemplazar:
                sys.exit(f"Estas tablas ya tienen datos: {con_datos}. Usa --reemplazar para vaciarlas y recargar.")

            print(f"Cargando {entrada} (versión {meta.get('version_datos')})", flush=True)
            with con.transaction():
                with con.cursor() as cur:
                    cur.execute("SET LOCAL statement_timeout = 0")
                    cur.execute(sql.SQL("TRUNCATE {} RESTART IDENTITY").format(
                        sql.SQL(", ").join(sql.Identifier("public", t) for t in TABLAS)))
                    for tabla, origen in ORDEN:
                        ruta = (SEED_DIR if origen == "seed" else entrada) / f"{tabla}.csv"
                        copiar(cur, tabla, ruta)
                        print(f"  copiado {tabla}", flush=True)
                    cur.execute("INSERT INTO public.metadatos (clave, valor) VALUES ('fecha_carga', %s)",
                                (dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),))
            con.autocommit = True
            con.execute("ANALYZE")
            con.autocommit = False

        exito = verificar(con, meta)
    print("CARGA VERIFICADA" if exito else "LA VERIFICACIÓN FALLÓ", flush=True)
    return 0 if exito else 1


if __name__ == "__main__":
    sys.exit(main())
