# Registro de decisiones

> Se decide una vez y no se vuelve a debatir sin evidencia nueva. Si una decisión cambia, se agrega
> una fila nueva que la reemplaza y se marca la vieja como "Reemplazada por Dxx".

| # | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| D1 | Solo agregados en Supabase; ETL local en DuckDB | 64.7 M filas no caben en 500 MB; el sitio solo necesita agregados | cargar crudo en plan Pro |
| D2 | Marginales precalculados (`sexo=9`, `grupo_edad_id=0`, `entidad_clave=0`) | PostgREST no agrega; consultas tipadas y cacheables | vistas con `GROUP BY` por petición |
| D3 | Pseudo-entidad 0 = Nacional solo en tablas de entidad | una consulta para "nacional contra estado"; `CHECK` evita doble conteo | tabla nacional aparte |
| D4 | `municipio_id = entidad*1000 + clave` + slug | determinista, legible en URLs, sin join en ETL | serial opaco |
| D5 | Prisión preventiva y voto anticipado son modalidades de FED2024 | no son elecciones; no deben entrar a series | `tipo='modalidad'` |
| D6 | Sin `agg_distrito` en v1 | los distritos cambian de marco entre elecciones y no están en el mapa de historias | tabla de distritos |
| D7 | `metadatos` en la BD; fuentes y glosario en `content/` | el contenido editorial es del repo; una sola fila de verdad para la versión de datos | tablas de contenido |
| D8 | Cache Components + parámetros de ruta; sin `/api/datos/*` | modelo recomendado en Next 16.4; prerender garantizado con `ensureStatic` | `force-static` + Route Handlers con `s-maxage` |
| D9 | Imágenes OG con `opengraph-image.tsx` y un solo `TarjetaOG` | idiomático y con un dueño del diseño | `api/og` manual |
| D10 | Sin `/comparar` ni `/capitulos/[slug]` | la comparación contra Nacional va integrada; los capítulos son anclas | páginas extra |
| D11 | `pct = sv/ln` principal; ajustada y `pct_ns` visibles | conservadora y comparable con el INE; honesta sobre NS | solo ajustada |
| D12 | Umbral de privacidad `ln ≥ 30`; no binario solo a nivel entidad | evita identificar personas (hay celdas con LN = 3) | mostrar todo |
| D13 | Mapa coroplético diferido; si se hace, con cartografía del INE (SIGE) | claves INE ≠ INEGI (Ecatepec es 15034 en INE y 15033 en INEGI) | TopoJSON de INEGI |
| D14 | Versiones vigentes pineadas exactas | builds reproducibles | "latest" sin pinear · **Reemplazada por D33** |
| D15 | Keepalive diario por cron de Vercel | Supabase Free se pausa tras 7 días sin actividad; Hobby permite 1 al día | sin keepalive |
| D16 | Sin autenticación ni panel admin | producto público y de solo lectura; operación = `metadatos` + reporte del ETL + Studio | admin propio |
| D17 | Cifras de la narrativa desde `lib/data/cifras.ts`, nunca a mano | narrativa y explorador no pueden contradecirse | números en el texto |
| D18 | Sin identidad gráfica del INE | no suplantar una institución; se cita como fuente | logotipo del INE · **Reemplazada por D36** |
| D19 | Solo Recharts en v1 | menos dependencias; la curva de edad sale con `Area` | D3 |
| D20 | Pruebas: `tsc`, ESLint, verificación de datos y matriz manual | el riesgo está en los datos | Playwright |
| D21 | Impeccable gobierna toda la UI: init → shape → new-work → build → finish-reviewer → documenter; critique/audit/harden/adapt/clarify/polish al cierre | instalado por la usuaria; piso de calidad y revisión con ojos frescos | diseñar a ojo |
| D22 | Modos: Home, Entidad, Metodología y Embeds = Read; Explorar = Operate; todo code-led | superficies de lectura y de tarea | Persuade en home |
| D23 | El mundo visual lo decide la ronda de dirección de Impeccable; DESIGN.md después del primer build | evita el estilo por defecto y defender reglas contra la realidad | fijar tokens ahora |
| D24 | Detector de Impeccable: hook automático en Cursor (`.cursor/hooks.json`); en Claude Code, `impeccable detect --json` manual al final de cada edición de UI | la skill está instalada solo para Cursor; `hooks on` instaló el manifiesto de Cursor | instalar la skill también para Claude Code |
| D25 | Carga con `etl/load.py` (psycopg 3, `COPY FROM STDIN`, una transacción) | no requiere psql; verifica conteos, conciliación y permisos después | `load.ps1` con psql |
| D26 | Prueba local de migraciones y carga con PGlite (`npm run db:test-local`) | ejecuta PostgreSQL 17 real sin Docker antes de tocar Supabase | probar directo en Supabase |
| D27 | DEF y DEL pueden ser nulos | 318 secciones de 2009 y 221 de 2012 no existen en el marco DERFE 2021; 1.9% de la LN de 2024 no tiene DEL | descartar esas filas |
| D28 | Reasignar claves de municipio de Chiapas 2018 (`etl/remapeo_municipios.csv`) | en 2018 las claves 120-124 pertenecían a otros municipios (secciones provisionales 5001-5012) | dejar la clave de la fuente |
| D29 | Nombre de municipio = grafía presente en más elecciones (empate: la más reciente) + `etl/overrides_municipios.csv` | 100 municipios cambian de grafía; la mayoría corrige erratas de un solo año | tomar siempre el año más reciente |
| D30 | La supresión de no binario con `ln < 30` se hace en el ETL; esas celdas nunca llegan a la BD | la tabla es de lectura pública; filtrar solo en vistas no protege | filtrar en vistas |
| D31 | Proyecto fuera de OneDrive (`C:\Users\anafe\Desktop\Proyecto GOB`); datos del ETL en `%USERPROFILE%\participacion-ine-etl`; entorno Python en `etl\.venv` | OneDrive bloqueó `node_modules` y los datos pesan 590 MB | trabajar dentro de OneDrive |
| D32 | Chequeo de plausibilidad: mujeres > hombres en cada federal | "mujeres > 60%" no se cumple en 2009, 2015 ni 2021 | umbral fijo de 60% |
| D33 | Versiones fijadas: Node 24.22.1, Next 16.4.3, React 19.3.0, Tailwind 4.3.3, Recharts 3.10.1, @supabase/supabase-js 2.118.0, zod 4.6.7, Supabase CLI 2.122.0, TypeScript 5.9.3, ESLint 9.39.5, PGlite 0.5.11, Python 3.13.14, DuckDB 2.0.0, psycopg 3.3.6 | versiones instaladas y probadas el 2026-10-24 | rangos `^` |
| D34 | Migraciones con nombre de fecha y `GRANT` explícitos | `supabase db push` ordena por fecha; proyectos nuevos pueden no exponer tablas nuevas a la Data API | depender de permisos por defecto |
| D36 | Identidad institucional del INE, condicionada a autorización escrita de los organizadores y archivos oficiales; sin ellos no se recrea el logotipo y se usa un marcador | decisión de la usuaria: el reto es del INE y el material es educativo institucional | identidad propia (D18) |
| D35 | Supabase solo desde el servidor: `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` sin prefijo `NEXT_PUBLIC_` | todo se lee en build o ISR; el navegador nunca consulta Supabase | cliente en el navegador |
