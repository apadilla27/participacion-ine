# Make the Change · participación ciudadana en México

Prototipo para el Reto 3 (Storytelling y Comunicación Pública) del Hackatón INE 2026. Traduce los Conteos Censales de Participación Ciudadana 2009-2025 en un relato público y un explorador por entidad y municipio.

> Prototipo para el Reto 3 del Hackatón INE 2026. No es un sitio oficial del INE.

## Documentos

| Documento | Para qué |
|---|---|
| [docs/plan-sitio.md](docs/plan-sitio.md) | Plan vigente (reemplaza a `docs/plan-proyecto.md`) |
| [docs/decision-log.md](docs/decision-log.md) | Decisiones vigentes (no se re-debaten) |
| [docs/mensaje-central.md](docs/mensaje-central.md) | Mensaje, públicos y principios de comunicación |
| [docs/mapa-historias.md](docs/mapa-historias.md) | Capítulos del relato con hallazgos verificados |
| [PRODUCT.md](PRODUCT.md) | Contexto de producto para Impeccable |
| [docs/archivo/](docs/archivo/) | Documentos obsoletos que se conservan como historial |

## Rutas

| Ruta | Qué es |
|---|---|
| `/` | Relato: curva por edad, calculadora "Tu huella cívica", mapa y mosaico, espejo por sexo y otras formas de votar |
| `/explorar` | Explorador por elección, entidad, municipio, sexo y edad; los filtros quedan en la dirección |
| `/difusion` | Propuesta de difusión imprimible y guion del video |
| `/metodologia` | Fuentes, definiciones, privacidad, correcciones y versión de datos |

## Tubería de datos (sin base de datos, D37)

```
CSV del INE → npm run etl → conteos.duckdb → npm run datos → data/web/*.json + public/datos/**
            → npm run build (prebuild: scripts/verificar-datos.mjs) → sitio estático
```

La verificación previa al build falla si falta un archivo, si las versiones no coinciden, si la participación nacional no cuadra con el ETL, si alguna celda desagregada con menos de 30 personas trae votos (D46), si Chiapas 2018 no está reasignado o si el mapa no tiene 32 entidades.

## Estructura

```
app/            Next.js 16.4 (App Router, Cache Components): páginas, componentes y estilos
lib/            Catálogo, formato, tasas y lectura de datos (lib/datos)
data/web/       JSON que se empaquetan en el build
public/datos/   JSON que descarga el explorador (entidad.json y m/{eleccion}/{entidad}.json)
public/geo/     Geometría simplificada de las 32 entidades
etl/            ETL en Python + DuckDB, exportación web y geometría (etl/geo)
scripts/        Verificación de datos previa al build
docs/           Plan, decisiones, narrativa y archivo
.cursor/        Impeccable (skill de diseño) y hook del detector
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run etl` | Lee los CSV del INE y genera los agregados en `%USERPROFILE%\participacion-ine-etl` |
| `npm run etl:dry` | Lo mismo solo con Aguascalientes |
| `npm run datos` | Exporta los JSON del sitio desde la base del ETL |
| `npm run datos:todo` | ETL, exportación y verificación seguidos |
| `npm run geo` | Regenera `public/geo/entidades.json` desde la capa estatal del INEGI |
| `npm run verificar-datos` | Verifica los JSON (también corre antes de cada build) |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` y `npm run start` | Build de producción y servidor local |
| `npm run check` | TypeScript y ESLint |

## Requisitos

Node 24, Python 3.13 con el entorno `etl\.venv` (`python -m venv etl\.venv` y `etl\.venv\Scripts\python.exe -m pip install -r etl\requirements.txt`). No hay variables de entorno.

## Fuentes

- Datos: [Conteos Censales de Participación Ciudadana, INE (DECEyEC)](https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/).
- Mapa: INEGI (2024), Área Geoestadística Estatal 1:250000, publicada por CONABIO, licencia [CC BY-NC 2.5 MX](https://creativecommons.org/licenses/by-nc/2.5/mx/). Geometría proyectada, simplificada y escalada por el equipo.
