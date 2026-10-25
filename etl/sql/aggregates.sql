-- Etapa 3 · Agregados que se cargan a Supabase (tablas out_*).
-- Marginales con GROUP BY CUBE + GROUPING():
--   sexo = 9 (total), grupo_edad_id = 0 (todas las edades), entidad_clave = 0 (nacional).
-- Privacidad: sexo = 2 solo en tablas de entidad y solo si ln >= 30; en el resto cuenta solo dentro de sexo = 9.
-- Marcadores: @@LECTURA_PP@@, @@LECTURA_VA@@ (read_csv de los archivos por persona), @@FILTRO_ENTIDADES@@ (condición SQL).

-- Entidad (0 = nacional) × sexo × grupo de edad
CREATE OR REPLACE TABLE out_agg_entidad AS
WITH c AS (
  SELECT eleccion_id,
         entidad       AS e_raw,
         sexo          AS s_raw,
         grupo_edad_id AS g_raw,
         GROUPING(entidad)       AS g_ent,
         GROUPING(sexo)          AS g_sexo,
         GROUPING(grupo_edad_id) AS g_grupo,
         SUM(ln) AS ln, SUM(sv) AS sv, SUM(nv) AS nv, SUM(ns) AS ns
  FROM base
  GROUP BY eleccion_id, CUBE (entidad, sexo, grupo_edad_id)
)
SELECT eleccion_id,
       CASE WHEN g_ent   = 1 THEN 0 ELSE e_raw END::SMALLINT AS entidad_clave,
       CASE WHEN g_sexo  = 1 THEN 9 ELSE s_raw END::SMALLINT AS sexo,
       CASE WHEN g_grupo = 1 THEN 0 ELSE g_raw END::SMALLINT AS grupo_edad_id,
       ln::BIGINT AS ln, sv::BIGINT AS sv, nv::BIGINT AS nv, ns::BIGINT AS ns
FROM c
WHERE NOT (g_sexo = 0 AND s_raw = 2 AND ln < 30);

-- Entidad (0 = nacional) × sexo × edad simple (tope 100)
CREATE OR REPLACE TABLE out_agg_entidad_edad AS
WITH c AS (
  SELECT eleccion_id, edad_cap,
         entidad AS e_raw, sexo AS s_raw,
         GROUPING(entidad) AS g_ent, GROUPING(sexo) AS g_sexo,
         SUM(ln) AS ln, SUM(sv) AS sv, SUM(nv) AS nv, SUM(ns) AS ns
  FROM base
  GROUP BY eleccion_id, edad_cap, CUBE (entidad, sexo)
)
SELECT eleccion_id,
       CASE WHEN g_ent  = 1 THEN 0 ELSE e_raw END::SMALLINT AS entidad_clave,
       CASE WHEN g_sexo = 1 THEN 9 ELSE s_raw END::SMALLINT AS sexo,
       edad_cap AS edad,
       ln::BIGINT AS ln, sv::BIGINT AS sv, nv::BIGINT AS nv, ns::BIGINT AS ns
FROM c
WHERE NOT (g_sexo = 0 AND s_raw = 2 AND ln < 30);

-- Municipio × sexo (0, 1, 9) × grupo de edad
CREATE OR REPLACE TABLE out_agg_municipio AS
WITH c AS (
  SELECT eleccion_id, municipio_id,
         sexo AS s_raw, grupo_edad_id AS g_raw,
         GROUPING(sexo) AS g_sexo, GROUPING(grupo_edad_id) AS g_grupo,
         SUM(ln) AS ln, SUM(sv) AS sv, SUM(nv) AS nv, SUM(ns) AS ns
  FROM base
  GROUP BY eleccion_id, municipio_id, CUBE (sexo, grupo_edad_id)
)
SELECT eleccion_id, municipio_id,
       CASE WHEN g_sexo  = 1 THEN 9 ELSE s_raw END::SMALLINT AS sexo,
       CASE WHEN g_grupo = 1 THEN 0 ELSE g_raw END::SMALLINT AS grupo_edad_id,
       ln::BIGINT AS ln, sv::BIGINT AS sv, nv::BIGINT AS nv, ns::BIGINT AS ns
FROM c
WHERE g_sexo = 1 OR s_raw IN (0, 1);

-- Entidad (0 = nacional) × tipo de sección × sexo (0, 1, 9) × grupo de edad
CREATE OR REPLACE TABLE out_agg_tipo_seccion AS
WITH c AS (
  SELECT eleccion_id, tiposec,
         entidad AS e_raw, sexo AS s_raw, grupo_edad_id AS g_raw,
         GROUPING(entidad) AS g_ent, GROUPING(sexo) AS g_sexo, GROUPING(grupo_edad_id) AS g_grupo,
         SUM(ln) AS ln, SUM(sv) AS sv, SUM(nv) AS nv, SUM(ns) AS ns
  FROM base
  GROUP BY eleccion_id, tiposec, CUBE (entidad, sexo, grupo_edad_id)
)
SELECT eleccion_id,
       CASE WHEN g_ent   = 1 THEN 0 ELSE e_raw END::SMALLINT AS entidad_clave,
       tiposec AS tipo_seccion,
       CASE WHEN g_sexo  = 1 THEN 9 ELSE s_raw END::SMALLINT AS sexo,
       CASE WHEN g_grupo = 1 THEN 0 ELSE g_raw END::SMALLINT AS grupo_edad_id,
       ln::BIGINT AS ln, sv::BIGINT AS sv, nv::BIGINT AS nv, ns::BIGINT AS ns
FROM c
WHERE g_sexo = 1 OR s_raw IN (0, 1);

-- Totales por sección
CREATE OR REPLACE TABLE out_secciones_resumen AS
SELECT eleccion_id,
       entidad                 AS entidad_clave,
       seccion,
       any_value(municipio_id) AS municipio_id,
       any_value(tiposec)      AS tipo_seccion,
       any_value(def)          AS def,
       any_value(del)          AS del,
       any_value(cj)           AS cj,
       any_value(dej)          AS dej,
       SUM(ln)::BIGINT AS ln, SUM(sv)::BIGINT AS sv, SUM(nv)::BIGINT AS nv, SUM(ns)::BIGINT AS ns,
       coalesce(SUM(ln) FILTER (WHERE sexo = 0), 0)::BIGINT AS ln_h,
       coalesce(SUM(sv) FILTER (WHERE sexo = 0), 0)::BIGINT AS sv_h,
       coalesce(SUM(ln) FILTER (WHERE sexo = 1), 0)::BIGINT AS ln_m,
       coalesce(SUM(sv) FILTER (WHERE sexo = 1), 0)::BIGINT AS sv_m
FROM base
GROUP BY eleccion_id, entidad, seccion;

-- Modalidades de voto 2024 (la fuente trae una fila por persona)
CREATE OR REPLACE TABLE fuente_modalidades AS
SELECT 'prision_preventiva'        AS modalidad,
       CAST(ESTADO AS SMALLINT)    AS entidad_clave,
       NULL::INTEGER               AS municipio_id,
       CAST(DEF AS SMALLINT)       AS def,
       CAST(SEXO AS SMALLINT)      AS sexo
FROM @@LECTURA_PP@@
UNION ALL
SELECT 'voto_anticipado',
       CAST(EDOCVE AS SMALLINT),
       CAST(EDOCVE AS INTEGER) * 1000 + CAST(MPIOCVE AS INTEGER),
       CAST(DEF AS SMALLINT),
       CAST(SEXO AS SMALLINT)
FROM @@LECTURA_VA@@;

CREATE OR REPLACE TABLE out_agg_modalidad_voto AS
WITH f AS (
  SELECT * FROM fuente_modalidades WHERE @@FILTRO_ENTIDADES@@
),
c AS (
  SELECT modalidad, entidad_clave, municipio_id, def,
         sexo AS s_raw, GROUPING(sexo) AS g_sexo,
         count(*) AS personas
  FROM f
  GROUP BY modalidad, entidad_clave, municipio_id, def, CUBE (sexo)
)
SELECT (SELECT id FROM seed_elecciones WHERE clave = 'FED2024') AS eleccion_id,
       modalidad, entidad_clave, municipio_id, def,
       CASE WHEN g_sexo = 1 THEN 9 ELSE s_raw END::SMALLINT AS sexo,
       personas::BIGINT AS personas
FROM c
WHERE g_sexo = 1 OR s_raw IN (0, 1);
