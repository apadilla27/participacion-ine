# Traspaso: construir y verificar la base de datos en Supabase (Cursor · Grok)

> **Obsoleto por D37** (2026-10-27): el sitio no usa base de datos; lee JSON estáticos exportados del ETL. Se conserva como historial.

> Documento para el agente de Cursor. Contiene todo lo necesario para dejar la base lista en Supabase:
> contexto, estado actual, pasos exactos, esquema, reglas, errores conocidos y criterios de aceptación.
> Generado el 2026-10-24. Versión de datos: `20261024-21f4e10f04fc`.

---

## 0. Prompt para pegar en Cursor

```text
Eres el responsable de la base de datos de este proyecto. Lee primero docs/handoff-supabase-cursor.md
completo, luego AGENTS.md y docs/decision-log.md.

Objetivo: dejar el proyecto de Supabase con el esquema de supabase/migrations aplicado, los datos
cargados con etl/load.py y todo verificado, siguiendo la sección 3 del handoff paso a paso.

Reglas:
- No rediseñes el esquema. Si algo falla, corrige la causa y, si de verdad hay que cambiar el esquema,
  crea una migración NUEVA con fecha posterior; nunca edites una migración ya aplicada.
- Cualquier cambio de esquema debe reflejarse también en etl/ y pasar `npm run db:test-local`.
- No escribas credenciales en archivos versionados ni en el chat. Las credenciales van en etl/.env y
  .env.local (ambos en .gitignore) y las escribe la usuaria.
- No toques app/, components/ ni nada de interfaz: esa fase va después y usa Impeccable.
- Termina cuando se cumplan todos los criterios de la sección 7 y reporta la salida de
  `npm run db:verify`.
```

---

## 1. Contexto en breve

- **Producto:** micrositio de storytelling con datos para el Reto 3 del INE (participación ciudadana). Next.js 16.4 + Supabase (plan Free, 500 MB) + Vercel.
- **Fuente:** Conteos Censales de Participación Ciudadana (INE, DECEyEC). 9 conjuntos: federales 2009, 2012, 2015, 2018, 2021, 2024; judicial 2025 (31 entidades, sin Campeche); prisión preventiva 2024 y voto anticipado 2024 (una fila por persona).
- **Volumen:** 64.7 M filas a nivel sección × sexo × edad. No caben en Supabase Free: el ETL local (DuckDB) produce **1.08 M filas agregadas (~110 MB)** y eso es lo único que se carga.
- **Uso de la base:** solo lectura pública. El sitio lee en el servidor (build / ISR); el navegador nunca consulta Supabase. No hay autenticación.

## 2. Estado actual (ya hecho y probado)

| Pieza | Ruta | Estado |
|---|---|---|
| Migraciones (4) | `supabase/migrations/20261024000100_catalogos.sql` … `000400_rls.sql` | Escritas y ejecutadas con éxito en PostgreSQL 17 (PGlite) |
| Catálogos semilla | `supabase/seed/elecciones.csv`, `entidades.csv`, `grupos_edad.csv` | Listos |
| ETL | `etl/run_etl.py` + `etl/sql/*.sql` | Corrida completa: 19/19 validaciones, 43 s |
| Agregados para cargar | `%USERPROFILE%\participacion-ine-etl\out\*.csv` (= `C:\Users\anafe\participacion-ine-etl\out`) | Generados |
| Reporte de validación | `C:\Users\anafe\participacion-ine-etl\out\validation_report.md` | Todo PASA |
| Cargador | `etl/load.py` | Listo (no requiere psql). Su verificación (`--solo-verificar`) se probó por red contra PostgreSQL local: `CARGA VERIFICADA`, 118 MB. El `COPY FROM STDIN` no se pudo probar en local porque el servidor PGlite no lo soporta; se valida en la primera carga real |
| Prueba local | `scripts/test-db-local.mjs` (`npm run db:test-local`) | Aprobada: 223/223 combinaciones cuadran, anon lee y no escribe |
| Config del CLI | `supabase/config.toml` (`project_id = "participacion-ine"`, PostgreSQL 17) | Lista |
| Entorno Python | `etl\.venv` (Python 3.13, duckdb 2.0.0, psycopg 3.3.6) | Listo |
| Supabase CLI | devDependency `supabase@2.122.0` → `npx supabase …` | Listo |

**Falta (esto es lo que haces tú):** crear el proyecto en Supabase, enlazarlo, aplicar migraciones, cargar, verificar, generar tipos y llenar `.env.local`.

## 3. Pasos exactos

Todos los comandos se corren desde la raíz `C:\Users\anafe\Desktop\Proyecto GOB` en PowerShell.

### 3.1 Lo que hace la usuaria en el navegador (Cursor no puede)

1. En [supabase.com/dashboard](https://supabase.com/dashboard) crear un proyecto nuevo en el plan **Free**, nombre `participacion-ine`, región más cercana a México (p. ej. *East US (North Virginia)*), con una contraseña de base de datos fuerte guardada en un gestor de contraseñas.
2. Anotar el **project ref** (lo que va en `https://<ref>.supabase.co`).
3. Botón **Connect** → pestaña de cadena de conexión → **Session pooler** → copiar la URI (`postgresql://postgres.<ref>:[YOUR-PASSWORD]@aws-<n>-<region>.pooler.supabase.com:5432/postgres`).
4. **Settings → API Keys** → copiar la **publishable key** (`sb_publishable_…`). Si el proyecto solo muestra claves heredadas, usar la `anon`.
5. Crear `etl\.env` copiando `etl\.env.example` y pegar la URI del Session pooler con la contraseña real.
6. Crear `.env.local` copiando `.env.example` y llenar `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY`. `CRON_SECRET` puede quedar vacío por ahora.

### 3.2 Comprobación previa local (sin tocar Supabase)

```powershell
npm run db:test-local
```

Debe terminar con `PRUEBA LOCAL APROBADA`. Si los CSV del ETL no existen (otra máquina), regenerarlos antes con `npm run etl` (~1 minuto; necesita los CSV del INE en `C:\Users\anafe\Downloads\DatosAbiertos_DECEyEC_ConteosCensales`).

### 3.3 Enlazar y aplicar el esquema

```powershell
npx supabase login
npx supabase link --project-ref <ref>
npx supabase db push
```

- `login` abre el navegador (lo confirma la usuaria). `link` pide la contraseña de la base.
- `db push` aplica las 4 migraciones en orden y muestra la lista antes de confirmar.
- Si `link` o `db push` fallan por red/IPv6, usar el pooler explícito: `npx supabase db push --db-url "<URI del Session pooler>"`.
- Plan C, sin CLI: en **SQL Editor** pegar y ejecutar el contenido de cada archivo de `supabase/migrations` en orden de nombre.

### 3.4 Cargar los datos

```powershell
npm run db:load
```

Hace, en una sola transacción: `TRUNCATE` de las 11 tablas, `COPY` de los 3 catálogos (`supabase/seed`) y de los 8 archivos del ETL, y registra `fecha_carga`. Después corre `ANALYZE` y la verificación. Debe terminar con **`CARGA VERIFICADA`**. Tarda 1 a 3 minutos (sube ~60 MB).

- Para recargar más adelante: `etl\.venv\Scripts\python.exe -I etl\load.py --reemplazar`.
- El cargador se niega a subir una corrida parcial (`npm run etl:dry`) salvo con `--permitir-parcial`.

### 3.5 Tipos de TypeScript

```powershell
npm run db:types
```

Genera `lib/supabase/types.ts`. Si `--linked` falla, usar `npx supabase gen types --lang=typescript --project-id <ref> --schema public > lib/supabase/types.ts`.

### 3.6 Verificación por la API pública (PostgREST)

```powershell
curl.exe "https://<ref>.supabase.co/rest/v1/rpc/rpc_serie_entidad?p_entidad_clave=0" -H "apikey: <publishable key>"
```

Debe devolver 21 objetos (7 elecciones × 3 sexos). FED2024 sexo 9 → `pct` 55.83.

```powershell
curl.exe "https://<ref>.supabase.co/rest/v1/agg_entidad?select=count" -H "apikey: <publishable key>" -H "Prefer: count=exact" -I
```

El encabezado `Content-Range` debe terminar en `/6911`.

### 3.7 Revisión en el dashboard

- **Advisors → Security Advisor:** sin errores (RLS activo en todas las tablas, vistas con `security_invoker`, funciones con `search_path` fijo).
- **Table Editor:** conteos de la tabla de la sección 4.
- **Settings → API:** esquema expuesto `public`; *Max rows* 1000 (no cambiarlo: las listas largas salen por RPC `jsonb`).

## 4. Esquema

### 4.1 Convenciones que no se rompen

- **Métricas:** `ln` lista nominal; `sv` con marca de voto; `nv` sin marca; `ns` no especificado. Siempre `ln = sv + nv + ns` (lo garantiza un `CHECK`).
- **Marginales precalculados:** `sexo = 9` total (incluye no binario), `grupo_edad_id = 0` todas las edades, `entidad_clave = 0` nacional (solo en tablas de nivel entidad). **Todo `SUM` debe filtrar los marginales o excluirlos.**
- **Sexo:** 0 hombres, 1 mujeres, 2 no binario (solo en `agg_entidad` y `agg_entidad_edad`, solo con `ln ≥ 30`), 9 total.
- **Participación:** `pct = sv / ln` (principal). También `pct_ajustada = sv / (ln − ns)` y `pct_ns = ns / ln`.
- **Identificadores:** `municipio_id = entidad_clave * 1000 + clave` (claves del INE, no del INEGI). Elecciones: 1 FED2009 · 2 FED2012 · 3 FED2015 · 4 FED2018 · 5 FED2021 · 6 FED2024 · 7 PJ2025.

### 4.2 Tablas

| Tabla | Llave primaria | Filas | Contenido |
|---|---|---|---|
| `elecciones` | `id` | 7 | Jornadas; `marco_cartografico`, `entidades_cubiertas` (PJ2025 = 31) |
| `entidades` | `clave` (0-32) | 33 | 0 = Nacional + 32 entidades; `slug`, `nombre_corto`, `region` |
| `grupos_edad` | `id` (0-9) | 10 | 0 = todas; 18-19, 20-24, 25-29, 30-39, 40-49, 50-59, 60-69, 70-79, 80+ |
| `municipios` | `id` | 2,477 | Unión de las 7 elecciones; `slug` único por entidad |
| `metadatos` | `clave` | 16 | `version_datos`, `fecha_carga`, `filas_<tabla>`, `hash_origen`, … |
| `agg_entidad` | `eleccion_id, entidad_clave, sexo, grupo_edad_id` | 6,911 | Entidad (0 = nacional) × sexo × grupo de edad |
| `agg_entidad_edad` | `eleccion_id, entidad_clave, sexo, edad` | 57,270 | Edad simple 18-100 para curvas |
| `agg_municipio` | `eleccion_id, municipio_id, sexo, grupo_edad_id` | 517,206 | Municipio × sexo (0, 1, 9) × grupo de edad |
| `agg_tipo_seccion` | `eleccion_id, entidad_clave, tipo_seccion, sexo, grupo_edad_id` | 20,700 | Urbana (U), mixta (M), rural (R) |
| `secciones_resumen` | `eleccion_id, entidad_clave, seccion` | 477,857 | Totales por sección + H/M; `def`, `del`, `cj`, `dej` (pueden ser nulos) |
| `agg_modalidad_voto` | `id` (identity) | 2,177 | Prisión preventiva / voto anticipado 2024: `personas`, sin porcentaje |

### 4.3 Vistas (todas `security_invoker = true`)

| Vista | Uso |
|---|---|
| `v_participacion_entidad` | `agg_entidad` + nombres + `pct_participacion`, `pct_participacion_ajustada`, `pct_ns` |
| `v_participacion_tipo_seccion` | `agg_tipo_seccion` + nombres + porcentajes |
| `v_brecha_sexo_municipio` | Una fila por municipio y grupo de edad con total, H, M y `pct_h`/`pct_m` (solo con `ln ≥ 30`) |

### 4.4 Funciones RPC

| Función | Devuelve | Ejemplo supabase-js |
|---|---|---|
| `rpc_serie_entidad(p_entidad_clave smallint)` | tabla (≤ 21 filas) | `.rpc('rpc_serie_entidad', { p_entidad_clave: 0 }, { get: true })` |
| `rpc_ranking_municipios(p_eleccion_id, p_entidad_clave, p_grupo_edad_id = 0, p_min_ln = 30)` | `jsonb` (hasta 570 en Oaxaca) | `.rpc('rpc_ranking_municipios', { p_eleccion_id: 6, p_entidad_clave: 20 }, { get: true })` |
| `rpc_secciones_municipio(p_eleccion_id, p_municipio_id)` | `jsonb` (754 en Ecatepec, 15034) | `.rpc('rpc_secciones_municipio', { p_eleccion_id: 6, p_municipio_id: 15034 }, { get: true })` |
| `rpc_conciliacion()` | tabla (223 filas) con `ok` | verificación; todas deben ser `ok = true` |
| `pct(num, den)` | `numeric` | auxiliar |

### 4.5 Seguridad

- RLS activo en todas las tablas con una política `lectura_publica` (`SELECT` para `anon` y `authenticated`).
- `GRANT SELECT` explícito en tablas y vistas; `REVOKE INSERT, UPDATE, DELETE, TRUNCATE` para `anon` y `authenticated`.
- Solo el rol `postgres` (cargador por Session pooler) escribe. No se usa la secret key en el sitio.

## 5. Archivos clave

| Archivo | Para qué |
|---|---|
| `supabase/migrations/*.sql` | Esquema (orden por nombre) |
| `supabase/seed/*.csv` | Catálogos que carga `etl/load.py` |
| `etl/run_etl.py`, `etl/sql/build_base.sql`, `catalogo_municipios.sql`, `aggregates.sql`, `validate.sql` | ETL y validaciones |
| `etl/overrides_municipios.csv` | 21 correcciones de nombre de municipio |
| `etl/remapeo_municipios.csv` | Claves de Chiapas 2018 reasignadas |
| `etl/load.py` | Carga y verificación posterior |
| `scripts/test-db-local.mjs` | Prueba de esquema + carga en PGlite |
| `docs/decision-log.md` | Por qué el esquema es así (D1-D36) |

## 6. Errores conocidos y solución

| Síntoma | Causa | Solución |
|---|---|---|
| `could not translate host name` / timeout con `db.<ref>.supabase.co` | La conexión directa del plan Free es solo IPv6 | Usar el Session pooler (`*.pooler.supabase.com:5432`, usuario `postgres.<ref>`) |
| `Faltan tablas en Supabase` al cargar | No se aplicaron las migraciones | Paso 3.3 |
| `Estas tablas ya tienen datos` | Carga repetida | `etl\.venv\Scripts\python.exe -I etl\load.py --reemplazar` |
| `permission denied` al consultar con la publishable key | Faltan `GRANT` o RLS | Revisar que `000400_rls.sql` se aplicó; `notify pgrst, 'reload schema';` |
| La API no ve una función o vista nueva | Caché de esquema de PostgREST | `notify pgrst, 'reload schema';` en SQL Editor |
| Una lista se corta en 1,000 filas | `db-max-rows` | Usar las RPC que devuelven `jsonb`; no subir el límite |
| `npm run db:load` no encuentra Python | Falta `etl\.venv` | `python -m venv etl\.venv` y `etl\.venv\Scripts\python.exe -m pip install -r etl\requirements.txt` |
| `run_etl.py` dice que faltan CSV | Otra máquina o ruta | `npm run etl -- --fuente "<carpeta del INE>"` |
| El proyecto aparece pausado | Free se pausa tras 7 días sin actividad | Reanudar en el dashboard; el cron de keepalive llega en la fase de la web |
| Security Advisor marca "RLS disabled" | Se creó una tabla fuera de las migraciones | Habilitar RLS en una migración nueva |

## 7. Criterios de aceptación

- [ ] `npx supabase migration list` muestra las 4 migraciones aplicadas en local y en remoto.
- [ ] `npm run db:load` termina con `CARGA VERIFICADA`.
- [ ] `npm run db:verify` muestra los conteos de la sección 4.2, `rpc_conciliacion: 223 combinaciones … cuadran`, `anon no puede escribir` y un tamaño de base menor a 400 MB.
- [ ] Participación nacional en la verificación: FED2009 43.00 · FED2012 61.95 · FED2015 44.19 · FED2018 58.10 · FED2021 49.60 · FED2024 55.83 · PJ2025 12.84.
- [ ] Las dos llamadas `curl.exe` de la sección 3.6 responden como se indica.
- [ ] Security Advisor sin errores.
- [ ] `lib/supabase/types.ts` existe y `npm run typecheck` pasa.
- [ ] `.env.local` y `etl\.env` existen y no aparecen en `git status`.

## 8. Qué no hacer

- No cargar el grano crudo ni tablas intermedias en Supabase (no caben en 500 MB).
- No editar migraciones ya aplicadas; crear una nueva.
- No crear políticas de escritura para `anon` ni exponer la secret key.
- No cambiar `id` de elecciones, claves de entidad ni la fórmula de `municipio_id`: el ETL y las rutas del sitio dependen de ellas.
- No empezar la interfaz: la siguiente fase usa Impeccable (`PRODUCT.md` ya existe) y arranca con `shape` de la portada.

## 9. Lo que sigue después de la base

1. `lib/supabase/client.ts` y `lib/data/queries.ts` (Cache Components: `'use cache'` + `cacheLife('max')`).
2. Keepalive diario (`app/api/keepalive/route.ts` + `vercel.json` + `CRON_SECRET`).
3. Interfaz con Impeccable: `shape` de la portada → ronda de dirección visual con la identidad institucional del INE (requiere autorización escrita y archivos oficiales del logotipo) → construcción → revisión final.
