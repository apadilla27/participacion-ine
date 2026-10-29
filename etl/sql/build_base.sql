-- Etapa 1 · Tabla base con el grano original del INE: elección × sección × sexo × edad simple.
-- run_etl.py sustituye estos marcadores antes de ejecutar:
--   @@SEED@@         carpeta etl/seed (barras normales)
--   @@LECTURA_FED@@  read_csv([...]) de los CSV federales 2009-2024
--   @@LECTURA_PJ@@   read_csv([...]) de los CSV de PoderJudicial_2025 (o un SELECT vacío tipado)
--   @@REMAPEO@@      ruta a etl/remapeo_municipios.csv (claves de municipio que un año usó para otro municipio)
-- Todo se lee como texto (all_varchar) y se convierte explícitamente: un valor inesperado
-- en una columna clave hace fallar la etapa en lugar de colarse como NULL.

CREATE OR REPLACE TABLE remapeo_municipios AS
SELECT * FROM read_csv('@@REMAPEO@@', header = true,
  columns = {'anio': 'SMALLINT', 'entidad_clave': 'SMALLINT', 'clave_fuente': 'SMALLINT',
             'clave_destino': 'SMALLINT', 'motivo': 'VARCHAR'});

CREATE OR REPLACE TABLE seed_elecciones AS
SELECT * FROM read_csv('@@SEED@@/elecciones.csv', header = true,
  types = {'id': 'SMALLINT', 'anio': 'SMALLINT', 'fecha_jornada': 'DATE',
           'es_presidencial': 'BOOLEAN', 'entidades_cubiertas': 'SMALLINT'});

CREATE OR REPLACE TABLE seed_entidades AS
SELECT * FROM read_csv('@@SEED@@/entidades.csv', header = true,
  types = {'clave': 'SMALLINT'});

CREATE OR REPLACE TABLE seed_grupos_edad AS
SELECT * FROM read_csv('@@SEED@@/grupos_edad.csv', header = true,
  types = {'id': 'SMALLINT', 'edad_min': 'SMALLINT', 'edad_max': 'SMALLINT', 'orden': 'SMALLINT'});

CREATE OR REPLACE TABLE base AS
WITH crudo AS (
  SELECT AELEC, EDOCVE, MPIOCVE, MPIONOM, SECCION, TIPOSEC, DEF, DEL,
         NULL::VARCHAR AS CJ, NULL::VARCHAR AS DEJ,
         SEXO, EDAD, LN, SV, NV, NS, filename
  FROM @@LECTURA_FED@@
  UNION ALL
  SELECT AELEC, EDOCVE, MPIOCVE, MPIONOM, SECCION, TIPOSEC, DEF,
         NULL::VARCHAR AS DEL, CJ, DEJ,
         SEXO, EDAD, LN, SV, NV, NS, filename
  FROM @@LECTURA_PJ@@
),
tipado_crudo AS (
  SELECT
    CAST(AELEC   AS SMALLINT)                    AS anio,
    CAST(EDOCVE  AS SMALLINT)                    AS entidad,
    CAST(MPIOCVE AS SMALLINT)                    AS mpio_fuente,
    trim(MPIONOM)                                AS mpio_nom,
    CAST(SECCION AS SMALLINT)                    AS seccion,
    upper(trim(TIPOSEC))                         AS tiposec,
    TRY_CAST(NULLIF(trim(DEF), '') AS SMALLINT)  AS def,
    TRY_CAST(NULLIF(trim(DEL), '') AS SMALLINT)  AS del,
    TRY_CAST(NULLIF(trim(CJ),  '') AS SMALLINT)  AS cj,
    TRY_CAST(NULLIF(trim(DEJ), '') AS SMALLINT)  AS dej,
    CAST(SEXO AS SMALLINT)                       AS sexo,
    CAST(EDAD AS SMALLINT)                       AS edad,
    CAST(LN AS INTEGER)                          AS ln,
    CAST(SV AS INTEGER)                          AS sv,
    CAST(NV AS INTEGER)                          AS nv,
    CAST(NS AS INTEGER)                          AS ns,
    regexp_extract(filename, '[^/\\]+$')         AS archivo
  FROM crudo
),
tipado AS (
  SELECT t.* EXCLUDE (mpio_fuente),
         coalesce(r.clave_destino, t.mpio_fuente) AS mpio,
         t.mpio_fuente
  FROM tipado_crudo t
  LEFT JOIN remapeo_municipios r
         ON r.anio = t.anio AND r.entidad_clave = t.entidad AND r.clave_fuente = t.mpio_fuente
)
SELECT
  t.*,
  e.id                                     AS eleccion_id,
  CAST(t.entidad AS INTEGER) * 1000 + t.mpio AS municipio_id,
  g.id                                     AS grupo_edad_id,
  LEAST(t.edad, 100)::SMALLINT             AS edad_cap
FROM tipado t
LEFT JOIN seed_elecciones  e ON e.anio = t.anio
LEFT JOIN seed_grupos_edad g ON g.id > 0
                            AND t.edad BETWEEN g.edad_min AND coalesce(g.edad_max, 32767);
