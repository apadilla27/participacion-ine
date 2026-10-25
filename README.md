# Participación ciudadana en México · micrositio de storytelling con datos

Prototipo para el Reto 3 (Storytelling y Comunicación Pública) del INE. Traduce los Conteos Censales de Participación Ciudadana 2009-2025 en una historia pública y un explorador por entidad y municipio.

## Documentos

| Documento | Para qué |
|---|---|
| [docs/plan-proyecto.md](docs/plan-proyecto.md) | Plan aprobado y adenda de ejecución |
| [docs/decision-log.md](docs/decision-log.md) | Decisiones vigentes (no se re-debaten) |
| [docs/mensaje-central.md](docs/mensaje-central.md) | Mensaje, públicos y principios de comunicación |
| [docs/mapa-historias.md](docs/mapa-historias.md) | Capítulos con hallazgos verificados |
| [docs/handoff-supabase-cursor.md](docs/handoff-supabase-cursor.md) | Instrucciones para construir y verificar la base en Supabase |
| [PRODUCT.md](PRODUCT.md) | Contexto de producto para Impeccable |

## Estructura

```
app/                 Next.js 16.4 (App Router, Cache Components)
etl/                 ETL en Python + DuckDB y cargador a Supabase
supabase/migrations  Esquema (4 migraciones)
supabase/seed        Catálogos: elecciones, entidades, grupos de edad
scripts/             Prueba local de la base con PGlite
docs/                Plan, decisiones, narrativa y traspaso
.cursor/             Impeccable (skill de diseño) y hook del detector
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run etl` | Lee los CSV del INE y genera los agregados en `%USERPROFILE%\participacion-ine-etl\out` |
| `npm run etl:dry` | Lo mismo solo con Aguascalientes |
| `npm run db:test-local` | Aplica las migraciones y carga todo en PGlite, sin Docker |
| `npm run db:push` | Aplica las migraciones al proyecto de Supabase enlazado |
| `npm run db:load` | Carga los agregados en Supabase y verifica |
| `npm run db:verify` | Solo verifica lo que hay en Supabase |
| `npm run db:types` | Genera `lib/supabase/types.ts` |
| `npm run dev` | Servidor de desarrollo |
| `npm run check` | TypeScript y ESLint |

## Requisitos

Node 24, Python 3.13 con el entorno `etl\.venv` (`python -m venv etl\.venv` y `etl\.venv\Scripts\python.exe -m pip install -r etl\requirements.txt`).

Fuente de datos: [Conteos Censales de Participación Ciudadana, INE (DECEyEC)](https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/).
