-- Etapa 2 · Catálogo de municipios (unión de las 7 elecciones).
-- Nombre canónico = la grafía que aparece en más elecciones; empate → la más reciente.
-- Así "Cosío" (6 elecciones) gana a "Cosio" (2025) y "San José de Gracia" gana a "San José de Gracía" (2024).
-- overrides_municipios.csv corrige a mano lo que la regla no resuelva.
-- Marcadores: @@OVERRIDES@@ (ruta a etl/overrides_municipios.csv).

CREATE OR REPLACE TABLE overrides_municipios AS
SELECT * FROM read_csv('@@OVERRIDES@@', header = true,
  columns = {'entidad_clave': 'SMALLINT', 'clave': 'SMALLINT', 'nombre': 'VARCHAR', 'motivo': 'VARCHAR'});

CREATE OR REPLACE TABLE municipio_grafias AS
SELECT entidad, mpio, mpio_nom,
       count(DISTINCT anio)           AS elecciones,
       max(anio)                      AS ultimo_anio,
       string_agg(DISTINCT CAST(anio AS VARCHAR), ' ' ORDER BY CAST(anio AS VARCHAR)) AS anios
FROM (SELECT DISTINCT anio, entidad, mpio, mpio_nom FROM base)
GROUP BY entidad, mpio, mpio_nom;

CREATE OR REPLACE TABLE out_municipios AS
WITH elegido AS (
  SELECT entidad, mpio,
         arg_max(mpio_nom, elecciones * 10000 + ultimo_anio) AS nombre_regla,
         count(*)                                             AS grafias
  FROM municipio_grafias
  GROUP BY entidad, mpio
),
con_nombre AS (
  SELECT CAST(e.entidad AS INTEGER) * 1000 + e.mpio AS id,
         e.entidad                                 AS entidad_clave,
         e.mpio                                    AS clave,
         coalesce(o.nombre, e.nombre_regla)        AS nombre,
         e.grafias,
         o.nombre IS NOT NULL                      AS corregido
  FROM elegido e
  LEFT JOIN overrides_municipios o ON o.entidad_clave = e.entidad AND o.clave = e.mpio
),
con_slug AS (
  SELECT *,
         trim(regexp_replace(lower(strip_accents(nombre)), '[^a-z0-9]+', '-', 'g'), '-') AS slug_base
  FROM con_nombre
)
SELECT id, entidad_clave, clave, nombre,
       CASE WHEN count(*) OVER (PARTITION BY entidad_clave, slug_base) > 1
            THEN slug_base || '-' || CAST(clave AS VARCHAR)
            ELSE slug_base END AS slug,
       grafias, corregido
FROM con_slug;

-- Reporte para revisión humana: municipios con más de una grafía en la fuente.
CREATE OR REPLACE TABLE out_municipios_variantes AS
SELECT m.id, m.entidad_clave, m.clave, m.nombre AS nombre_elegido, m.corregido,
       g.mpio_nom AS grafia_fuente, g.elecciones, g.anios
FROM out_municipios m
JOIN municipio_grafias g ON g.entidad = m.entidad_clave AND g.mpio = m.clave
WHERE m.grafias > 1
ORDER BY m.id, g.elecciones DESC;
