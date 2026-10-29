-- Etapa 4 · Validaciones. run_etl.py ejecuta cada bloque y escribe out/validation_report.md.
--   "-- check: id | descripción"           → debe devolver 0 filas; cada fila es una falla (se muestran hasta 20).
--   "-- check-completo: id | descripción"  → igual, pero solo en una corrida completa (las 32 entidades).
--   "-- info: id | descripción"            → informativo; se copia al reporte.
-- Si cualquier check falla, no se exportan CSV ni deben exportarse los JSON del sitio.

-- check: base_identidad | En cada fila de la fuente ln = sv + nv + ns
SELECT archivo, seccion, sexo, edad, ln, sv, nv, ns
FROM base
WHERE ln <> sv + nv + ns
LIMIT 20;

-- check: base_valores | Sin claves nulas ni valores fuera de dominio en la fuente (DEF/DEL pueden ser nulos: ver info secciones_sin_distrito)
SELECT *
FROM (
  SELECT count(*) FILTER (WHERE eleccion_id IS NULL)                         AS sin_eleccion,
         count(*) FILTER (WHERE grupo_edad_id IS NULL)                       AS sin_grupo_edad,
         count(*) FILTER (WHERE tiposec IS NULL OR tiposec NOT IN ('U', 'M', 'R')) AS tiposec_invalido,
         count(*) FILTER (WHERE sexo NOT IN (0, 1, 2))                       AS sexo_invalido,
         count(*) FILTER (WHERE edad < 18)                                   AS menores_18,
         count(*) FILTER (WHERE mpio_nom IS NULL OR mpio_nom = '')           AS sin_nombre_municipio,
         count(*) FILTER (WHERE ln < 0 OR sv < 0 OR nv < 0 OR ns < 0)        AS negativos,
         count(*) FILTER (WHERE entidad NOT BETWEEN 1 AND 32)                AS entidad_invalida
  FROM base
)
WHERE sin_eleccion + sin_grupo_edad + tiposec_invalido + sexo_invalido
    + menores_18 + sin_nombre_municipio + negativos + entidad_invalida > 0;

-- check: base_grano_unico | Una sola fila por elección × entidad × sección × sexo × edad
SELECT eleccion_id, entidad, seccion, sexo, edad, count(*) AS filas
FROM base
GROUP BY eleccion_id, entidad, seccion, sexo, edad
HAVING count(*) > 1
LIMIT 20;

-- check: seccion_atributos_constantes | Municipio, tipo y distritos son constantes dentro de cada sección
SELECT eleccion_id, entidad, seccion,
       count(DISTINCT mpio)                AS municipios,
       count(DISTINCT tiposec)             AS tipos,
       count(DISTINCT coalesce(def, -1))   AS defs,
       count(DISTINCT coalesce(del, -1))   AS dels,
       count(DISTINCT coalesce(cj, -1))    AS cjs,
       count(DISTINCT coalesce(dej, -1))   AS dejs
FROM base
GROUP BY eleccion_id, entidad, seccion
HAVING count(DISTINCT mpio) > 1 OR count(DISTINCT tiposec) > 1
    OR count(DISTINCT coalesce(def, -1)) > 1 OR count(DISTINCT coalesce(del, -1)) > 1
    OR count(DISTINCT coalesce(cj, -1)) > 1  OR count(DISTINCT coalesce(dej, -1)) > 1
LIMIT 20;

-- check: conciliacion_tablas | Por elección y entidad: fuente = entidad = Σ municipios = Σ secciones = Σ tipo de sección = Σ edades
WITH b AS (
  SELECT eleccion_id, entidad AS entidad_clave,
         SUM(ln) AS ln, SUM(sv) AS sv, SUM(nv) AS nv, SUM(ns) AS ns
  FROM base GROUP BY eleccion_id, entidad
),
e AS (
  SELECT eleccion_id, entidad_clave, ln, sv, nv, ns
  FROM out_agg_entidad
  WHERE sexo = 9 AND grupo_edad_id = 0 AND entidad_clave > 0
),
m AS (
  SELECT a.eleccion_id, mu.entidad_clave,
         SUM(a.ln) AS ln, SUM(a.sv) AS sv, SUM(a.nv) AS nv, SUM(a.ns) AS ns
  FROM out_agg_municipio a
  JOIN out_municipios mu ON mu.id = a.municipio_id
  WHERE a.sexo = 9 AND a.grupo_edad_id = 0
  GROUP BY a.eleccion_id, mu.entidad_clave
),
s AS (
  SELECT eleccion_id, entidad_clave,
         SUM(ln) AS ln, SUM(sv) AS sv, SUM(nv) AS nv, SUM(ns) AS ns
  FROM out_secciones_resumen GROUP BY eleccion_id, entidad_clave
),
t AS (
  SELECT eleccion_id, entidad_clave,
         SUM(ln) AS ln, SUM(sv) AS sv, SUM(nv) AS nv, SUM(ns) AS ns
  FROM out_agg_tipo_seccion
  WHERE sexo = 9 AND grupo_edad_id = 0 AND entidad_clave > 0
  GROUP BY eleccion_id, entidad_clave
),
d AS (
  SELECT eleccion_id, entidad_clave, SUM(ln) AS ln, SUM(sv) AS sv
  FROM out_agg_entidad_edad
  WHERE sexo = 9 AND entidad_clave > 0
  GROUP BY eleccion_id, entidad_clave
)
SELECT b.eleccion_id, b.entidad_clave,
       b.ln AS ln_fuente, e.ln AS ln_entidad, m.ln AS ln_municipios, s.ln AS ln_secciones,
       t.ln AS ln_tipo_seccion, d.ln AS ln_edades,
       b.sv AS sv_fuente, e.sv AS sv_entidad, m.sv AS sv_municipios, s.sv AS sv_secciones
FROM b
LEFT JOIN e ON e.eleccion_id = b.eleccion_id AND e.entidad_clave = b.entidad_clave
LEFT JOIN m ON m.eleccion_id = b.eleccion_id AND m.entidad_clave = b.entidad_clave
LEFT JOIN s ON s.eleccion_id = b.eleccion_id AND s.entidad_clave = b.entidad_clave
LEFT JOIN t ON t.eleccion_id = b.eleccion_id AND t.entidad_clave = b.entidad_clave
LEFT JOIN d ON d.eleccion_id = b.eleccion_id AND d.entidad_clave = b.entidad_clave
WHERE b.ln IS DISTINCT FROM e.ln OR b.ln IS DISTINCT FROM m.ln OR b.ln IS DISTINCT FROM s.ln
   OR b.ln IS DISTINCT FROM t.ln OR b.ln IS DISTINCT FROM d.ln
   OR b.sv IS DISTINCT FROM e.sv OR b.sv IS DISTINCT FROM m.sv OR b.sv IS DISTINCT FROM s.sv
   OR b.sv IS DISTINCT FROM t.sv OR b.sv IS DISTINCT FROM d.sv
   OR b.nv IS DISTINCT FROM e.nv OR b.nv IS DISTINCT FROM m.nv OR b.nv IS DISTINCT FROM s.nv
   OR b.ns IS DISTINCT FROM e.ns OR b.ns IS DISTINCT FROM m.ns OR b.ns IS DISTINCT FROM s.ns
LIMIT 20;

-- check: marginal_grupos | Σ grupos 1-9 = grupo 0 (entidad, municipio y tipo de sección; sexos 0, 1 y 9)
WITH ent AS (
  SELECT 'agg_entidad' AS tabla, eleccion_id, entidad_clave AS unidad, '' AS extra, sexo,
         SUM(ln) FILTER (WHERE grupo_edad_id > 0) AS ln_grupos,
         SUM(ln) FILTER (WHERE grupo_edad_id = 0) AS ln_total
  FROM out_agg_entidad WHERE sexo IN (0, 1, 9)
  GROUP BY eleccion_id, entidad_clave, sexo
),
mun AS (
  SELECT 'agg_municipio', eleccion_id, municipio_id, '', sexo,
         SUM(ln) FILTER (WHERE grupo_edad_id > 0),
         SUM(ln) FILTER (WHERE grupo_edad_id = 0)
  FROM out_agg_municipio
  GROUP BY eleccion_id, municipio_id, sexo
),
tip AS (
  SELECT 'agg_tipo_seccion', eleccion_id, entidad_clave, tipo_seccion, sexo,
         SUM(ln) FILTER (WHERE grupo_edad_id > 0),
         SUM(ln) FILTER (WHERE grupo_edad_id = 0)
  FROM out_agg_tipo_seccion
  GROUP BY eleccion_id, entidad_clave, tipo_seccion, sexo
)
SELECT * FROM (SELECT * FROM ent UNION ALL SELECT * FROM mun UNION ALL SELECT * FROM tip)
WHERE ln_grupos IS DISTINCT FROM ln_total
LIMIT 20;

-- check: marginal_sexo | Hombres + mujeres <= total en toda celda; la diferencia total por elección = personas no binarias de la fuente
WITH celdas AS (
  SELECT 'agg_entidad' AS tabla, eleccion_id, entidad_clave AS unidad, grupo_edad_id,
         SUM(ln) FILTER (WHERE sexo IN (0, 1)) AS ln_hm,
         SUM(ln) FILTER (WHERE sexo = 9)       AS ln_total
  FROM out_agg_entidad GROUP BY eleccion_id, entidad_clave, grupo_edad_id
  UNION ALL
  SELECT 'agg_municipio', eleccion_id, municipio_id, grupo_edad_id,
         SUM(ln) FILTER (WHERE sexo IN (0, 1)), SUM(ln) FILTER (WHERE sexo = 9)
  FROM out_agg_municipio GROUP BY eleccion_id, municipio_id, grupo_edad_id
),
nb_fuente AS (
  SELECT eleccion_id, SUM(ln) AS ln FROM base WHERE sexo = 2 GROUP BY eleccion_id
),
nb_tablas AS (
  SELECT eleccion_id, SUM(ln_total - ln_hm) AS ln
  FROM celdas WHERE tabla = 'agg_municipio' AND grupo_edad_id = 0
  GROUP BY eleccion_id
)
SELECT 'celda' AS tipo, tabla, eleccion_id, unidad, grupo_edad_id, ln_hm, ln_total
FROM celdas WHERE ln_hm > ln_total OR ln_total IS NULL
UNION ALL
SELECT 'no_binario', 'agg_municipio', t.eleccion_id, NULL, NULL, coalesce(f.ln, 0), t.ln
FROM nb_tablas t LEFT JOIN nb_fuente f ON f.eleccion_id = t.eleccion_id
WHERE coalesce(f.ln, 0) <> t.ln
LIMIT 20;

-- check: marginal_nacional | Nacional (entidad 0) = Σ entidades en agg_entidad, agg_entidad_edad y agg_tipo_seccion
WITH e AS (
  SELECT 'agg_entidad' AS tabla, eleccion_id, sexo, CAST(grupo_edad_id AS VARCHAR) AS celda,
         SUM(ln) FILTER (WHERE entidad_clave = 0) AS ln_nacional,
         SUM(ln) FILTER (WHERE entidad_clave > 0) AS ln_entidades
  FROM out_agg_entidad WHERE sexo IN (0, 1, 9)
  GROUP BY eleccion_id, sexo, grupo_edad_id
  UNION ALL
  SELECT 'agg_entidad_edad', eleccion_id, sexo, CAST(edad AS VARCHAR),
         SUM(ln) FILTER (WHERE entidad_clave = 0), SUM(ln) FILTER (WHERE entidad_clave > 0)
  FROM out_agg_entidad_edad WHERE sexo IN (0, 1, 9)
  GROUP BY eleccion_id, sexo, edad
  UNION ALL
  SELECT 'agg_tipo_seccion', eleccion_id, sexo, tipo_seccion || '-' || CAST(grupo_edad_id AS VARCHAR),
         SUM(ln) FILTER (WHERE entidad_clave = 0), SUM(ln) FILTER (WHERE entidad_clave > 0)
  FROM out_agg_tipo_seccion
  GROUP BY eleccion_id, sexo, tipo_seccion, grupo_edad_id
)
SELECT * FROM e
WHERE ln_nacional IS DISTINCT FROM ln_entidades
LIMIT 20;

-- check: privacidad_no_binario | sexo = 2 solo en tablas de entidad y con ln >= 30
SELECT 'agg_entidad' AS tabla, eleccion_id, entidad_clave, ln FROM out_agg_entidad WHERE sexo = 2 AND ln < 30
UNION ALL
SELECT 'agg_entidad_edad', eleccion_id, entidad_clave, ln FROM out_agg_entidad_edad WHERE sexo = 2 AND ln < 30
UNION ALL
SELECT 'agg_municipio', eleccion_id, municipio_id, ln FROM out_agg_municipio WHERE sexo NOT IN (0, 1, 9)
UNION ALL
SELECT 'agg_tipo_seccion', eleccion_id, entidad_clave, ln FROM out_agg_tipo_seccion WHERE sexo NOT IN (0, 1, 9)
LIMIT 20;

-- check: secciones_sexo | En cada sección ln_h + ln_m <= ln y votos por sexo <= lista por sexo
SELECT eleccion_id, entidad_clave, seccion, ln, ln_h, ln_m, sv_h, sv_m
FROM out_secciones_resumen
WHERE ln_h + ln_m > ln OR sv_h > ln_h OR sv_m > ln_m OR municipio_id IS NULL
LIMIT 20;

-- check: catalogo_municipios | Nombres y slugs no vacíos y únicos por entidad; id = entidad*1000 + clave
SELECT entidad_clave, slug, count(*) AS repetidos, min(nombre) AS ejemplo
FROM out_municipios
GROUP BY entidad_clave, slug
HAVING count(*) > 1 OR slug IS NULL OR slug = ''
UNION ALL
SELECT entidad_clave, slug, 1, nombre
FROM out_municipios
WHERE nombre IS NULL OR nombre = '' OR id <> entidad_clave * 1000 + clave
LIMIT 20;

-- check: municipios_referenciados | Todo municipio usado por los agregados existe en el catálogo
SELECT 'agg_municipio' AS tabla, municipio_id FROM out_agg_municipio WHERE municipio_id NOT IN (SELECT id FROM out_municipios)
UNION ALL
SELECT 'secciones_resumen', municipio_id FROM out_secciones_resumen WHERE municipio_id NOT IN (SELECT id FROM out_municipios)
UNION ALL
SELECT 'agg_modalidad_voto', municipio_id FROM out_agg_modalidad_voto
WHERE municipio_id IS NOT NULL AND municipio_id NOT IN (SELECT id FROM out_municipios)
LIMIT 20;

-- check: modalidades_valores | Modalidades sin entidad o distrito nulos y con sexo 0/1 en la fuente
SELECT modalidad, entidad_clave, municipio_id, def, sexo, count(*) AS filas
FROM fuente_modalidades
WHERE entidad_clave IS NULL OR entidad_clave NOT BETWEEN 1 AND 32 OR def IS NULL OR sexo NOT IN (0, 1)
GROUP BY ALL
LIMIT 20;

-- check: spot_ags_2009 | Aguascalientes 2009 coincide con el perfil manual (LN 773,430; SV 291,485)
SELECT ln, sv FROM out_agg_entidad
WHERE eleccion_id = 1 AND entidad_clave = 1 AND sexo = 9 AND grupo_edad_id = 0
  AND NOT (ln = 773430 AND sv = 291485);

-- check: spot_ags_2024 | Aguascalientes 2024 coincide con el perfil manual (57.06%; mujeres 62.1%; hombres 51.7%)
SELECT sexo, ln, sv, nv, ns FROM out_agg_entidad
WHERE eleccion_id = 6 AND entidad_clave = 1 AND grupo_edad_id = 0
  AND ((sexo = 9 AND NOT (ln = 1097171 AND sv = 626084 AND nv = 441222 AND ns = 29865))
    OR (sexo = 1 AND NOT (ln = 567908 AND sv = 352654))
    OR (sexo = 0 AND NOT (ln = 529260 AND sv = 273427)));

-- check: spot_ags_pj2025 | Aguascalientes PJ2025 coincide con el perfil manual (12.09%)
SELECT ln, sv, ns FROM out_agg_entidad
WHERE eleccion_id = 7 AND entidad_clave = 1 AND sexo = 9 AND grupo_edad_id = 0
  AND NOT (ln = 1122918 AND sv = 135790 AND ns = 18701);

-- check-completo: cobertura_entidades | Cada elección trae las entidades que declara su catálogo (32; PJ2025 = 31)
SELECT e.clave, e.entidades_cubiertas, count(DISTINCT b.entidad) AS entidades_en_fuente
FROM seed_elecciones e
LEFT JOIN (SELECT DISTINCT eleccion_id, entidad FROM base) b ON b.eleccion_id = e.id
GROUP BY e.clave, e.entidades_cubiertas
HAVING count(DISTINCT b.entidad) <> e.entidades_cubiertas;

-- check-completo: modalidades_totales | Prisión preventiva 26,563 (24,232 H / 2,331 M); voto anticipado 3,449 (1,306 H / 2,143 M)
WITH t AS (
  SELECT modalidad, sexo, SUM(personas) AS personas
  FROM out_agg_modalidad_voto GROUP BY modalidad, sexo
)
SELECT * FROM t
WHERE (modalidad = 'prision_preventiva' AND ((sexo = 9 AND personas <> 26563) OR (sexo = 0 AND personas <> 24232) OR (sexo = 1 AND personas <> 2331)))
   OR (modalidad = 'voto_anticipado'    AND ((sexo = 9 AND personas <> 3449)  OR (sexo = 0 AND personas <> 1306)  OR (sexo = 1 AND personas <> 2143)));

-- check-completo: plausibilidad_nacional | FED2024 entre 55% y 65%; PJ2025 entre 10% y 16%; mujeres > hombres en cada federal
WITH n AS (
  SELECT e.clave, e.tipo, a.sexo, 100.0 * a.sv / a.ln AS pct
  FROM out_agg_entidad a JOIN seed_elecciones e ON e.id = a.eleccion_id
  WHERE a.entidad_clave = 0 AND a.grupo_edad_id = 0
)
SELECT clave, sexo, round(pct, 2) AS pct, 'fuera de rango' AS motivo FROM n
WHERE sexo = 9 AND ((clave = 'FED2024' AND pct NOT BETWEEN 55 AND 65) OR (clave = 'PJ2025' AND pct NOT BETWEEN 10 AND 16))
UNION ALL
SELECT m.clave, 1, round(m.pct, 2), 'mujeres <= hombres' FROM n m JOIN n h ON h.clave = m.clave AND h.sexo = 0
WHERE m.sexo = 1 AND m.tipo = 'federal' AND m.pct <= h.pct;

-- info: participacion_nacional | Participación nacional (entidad 0) por elección: total, hombres, mujeres, ajustada y % NS
SELECT e.clave,
       max(a.ln) FILTER (WHERE a.sexo = 9) AS ln,
       max(a.sv) FILTER (WHERE a.sexo = 9) AS sv,
       round(100.0 * max(a.sv) FILTER (WHERE a.sexo = 9) / max(a.ln) FILTER (WHERE a.sexo = 9), 2) AS pct_total,
       round(100.0 * max(a.sv) FILTER (WHERE a.sexo = 0) / max(a.ln) FILTER (WHERE a.sexo = 0), 2) AS pct_hombres,
       round(100.0 * max(a.sv) FILTER (WHERE a.sexo = 1) / max(a.ln) FILTER (WHERE a.sexo = 1), 2) AS pct_mujeres,
       round(100.0 * max(a.sv) FILTER (WHERE a.sexo = 9) / (max(a.ln) FILTER (WHERE a.sexo = 9) - max(a.ns) FILTER (WHERE a.sexo = 9)), 2) AS pct_ajustada,
       round(100.0 * max(a.ns) FILTER (WHERE a.sexo = 9) / max(a.ln) FILTER (WHERE a.sexo = 9), 2) AS pct_ns
FROM out_agg_entidad a JOIN seed_elecciones e ON e.id = a.eleccion_id
WHERE a.entidad_clave = 0 AND a.grupo_edad_id = 0
GROUP BY e.id, e.clave ORDER BY e.id;

-- info: participacion_grupo_edad | Participación nacional por grupo de edad (total)
SELECT e.clave, g.etiqueta, round(100.0 * a.sv / a.ln, 2) AS pct
FROM out_agg_entidad a
JOIN seed_elecciones e ON e.id = a.eleccion_id
JOIN seed_grupos_edad g ON g.id = a.grupo_edad_id
WHERE a.entidad_clave = 0 AND a.sexo = 9 AND a.grupo_edad_id > 0
ORDER BY e.id, g.orden;

-- info: filas_por_eleccion | Filas y archivos leídos de la fuente por elección
SELECT e.clave, count(*) AS filas, count(DISTINCT b.archivo) AS archivos, count(DISTINCT b.entidad) AS entidades
FROM base b JOIN seed_elecciones e ON e.id = b.eleccion_id
GROUP BY e.id, e.clave ORDER BY e.id;

-- info: secciones_sin_distrito | Secciones sin distrito federal (DEF vacío): secciones que ya no existen en el marco cartográfico con que el INE asignó distritos
SELECT e.clave,
       count(DISTINCT (b.entidad, b.seccion)) AS secciones,
       SUM(b.ln)                              AS ln,
       round(100.0 * SUM(b.ln) / (SELECT SUM(ln) FROM base x WHERE x.eleccion_id = e.id), 3) AS pct_ln
FROM base b JOIN seed_elecciones e ON e.id = b.eleccion_id
WHERE b.def IS NULL
GROUP BY e.id, e.clave ORDER BY e.id;

-- info: del_sin_asignar | Lista nominal en secciones sin distrito local (DEL vacío) por elección federal
SELECT e.clave,
       SUM(b.ln) FILTER (WHERE b.del IS NULL) AS ln_sin_del,
       round(100.0 * SUM(b.ln) FILTER (WHERE b.del IS NULL) / SUM(b.ln), 3) AS pct_ln_sin_del,
       count(DISTINCT b.entidad) FILTER (WHERE b.del IS NULL) AS entidades_afectadas
FROM base b JOIN seed_elecciones e ON e.id = b.eleccion_id
WHERE e.tipo = 'federal'
GROUP BY e.id, e.clave ORDER BY e.id;

-- info: edades_extremas | Personas en lista nominal con más de 100 años (se agrupan en "100 y más" y "80+")
SELECT e.clave, SUM(b.ln) AS ln_mayores_100, max(b.edad) AS edad_maxima
FROM base b JOIN seed_elecciones e ON e.id = b.eleccion_id
WHERE b.edad > 100
GROUP BY e.id, e.clave ORDER BY e.id;

-- info: no_binario | Personas no binarias (sexo 2) por elección; solo se publican por entidad cuando ln >= 30
SELECT e.clave, SUM(b.ln) AS ln, SUM(b.sv) AS sv, count(DISTINCT b.entidad) AS entidades
FROM base b JOIN seed_elecciones e ON e.id = b.eleccion_id
WHERE b.sexo = 2
GROUP BY e.id, e.clave ORDER BY e.id;

-- info: remapeo_aplicado | Filas reasignadas de clave de municipio (etl/remapeo_municipios.csv)
SELECT r.anio, r.entidad_clave, r.clave_fuente, r.clave_destino,
       count(b.mpio_fuente) AS filas_reasignadas, coalesce(SUM(b.ln), 0) AS ln
FROM remapeo_municipios r
LEFT JOIN base b ON b.anio = r.anio AND b.entidad = r.entidad_clave AND b.mpio_fuente = r.clave_fuente
GROUP BY ALL ORDER BY ALL;

-- info: municipios_grafias | Municipios con más de una grafía en la fuente (detalle en out/municipios_variantes.csv)
SELECT count(*) AS municipios_con_variantes, count(*) FILTER (WHERE corregido) AS corregidos_a_mano
FROM out_municipios WHERE grafias > 1;

-- info: filas_por_tabla | Filas de cada tabla exportada
SELECT 'municipios' AS tabla, count(*) AS filas FROM out_municipios
UNION ALL SELECT 'agg_entidad', count(*) FROM out_agg_entidad
UNION ALL SELECT 'agg_entidad_edad', count(*) FROM out_agg_entidad_edad
UNION ALL SELECT 'agg_municipio', count(*) FROM out_agg_municipio
UNION ALL SELECT 'agg_tipo_seccion', count(*) FROM out_agg_tipo_seccion
UNION ALL SELECT 'secciones_resumen', count(*) FROM out_secciones_resumen
UNION ALL SELECT 'agg_modalidad_voto', count(*) FROM out_agg_modalidad_voto;
