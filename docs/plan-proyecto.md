# Plan: Micrositio de Storytelling con Datos de Participación Ciudadana (INE / Reto 3)

> **Reemplazado por [plan-sitio.md](plan-sitio.md)** (2026-10-27): el sitio ya no usa Supabase (D37). Se conserva como historial.

Revisión 2 (2026-10-23). Reescrito tras investigación de versiones y límites vigentes y re-verificación del estado real: la carpeta del proyecto está vacía, no hay código ni despliegue previo. Nada en este plan es "ya hecho".

## Context

El Reto 3 (Storytelling y Comunicación Pública) pide traducir los datos de participación ciudadana del INE en una narrativa pública, veraz y atractiva: *¿cómo traducir los datos de participación en mensajes comprensibles para la ciudadanía?* Fuente: **Conteos Censales de Participación Ciudadana** (DECEyEC; portal oficial en ine.mx → Datos abiertos → Visualización de datos), 9 conjuntos descargados en `C:\Users\anafe\Downloads\DatosAbiertos_DECEyEC_ConteosCensales` (~4.1 GB CSV, ~60 M filas a nivel sección × sexo × edad simple).

Decisiones del usuario (no se re-debaten): Next.js + TypeScript + Tailwind en Vercel; Supabase plan **Free**; **los 9 conjuntos**; granularidad municipio × sexo × grupo de edad + sección con totales; solo producto web (guion PDF y video quedan fuera, el sitio será su insumo).

Proyecto en `C:\Users\anafe\OneDrive\Desktop\Proyecto GOB` (vacío). Máquina: Python 3.13 y Cursor instalados; **faltan Node, Git, Supabase CLI, psql y DuckDB**.

---

## 1. Hallazgos verificados de los datos fuente

### 1.1 Inventario

| Carpeta | Archivos | Tamaño | Grano | Columnas |
|---|---|---|---|---|
| 2009, 2012, 2015, 2018, 2021 | 32 CSV c/u | 550-606 MB c/u | sección × sexo × edad | `AELEC,FELECCION,EDOCVE,EDONOM,MPIOCVE,MPIONOM,SECCION,TIPOSEC,DEF,DEL,SEXO,EDAD,LN,SV,NV,NS` |
| 2024 | 32 CSV | 656 MB | sección × sexo × edad | mismas 16 columnas |
| PoderJudicial_2025 | 31 CSV (**falta Campeche**) | 601 MB | sección × sexo × edad | `…,DEF,CJ,DEJ,…` sin `FELECCION` ni `DEL` |
| PrisionPreventiva2024 | 1 CSV | 0.6 MB | **una fila por persona que votó** | `AELEC,ESTADO,EDONOM,DEF,SEXO` (26,563; 31 entidades; 91% hombres) |
| VotoAnticipado2024 | 1 CSV | 0.1 MB | **una fila por persona que votó** | `AELEC,EDOCVE,EDONOM,MPIOCVE,MPIONOM,DEF,DEL,SEXO` (3,449; 32 entidades; 62% mujeres) |

`LN` lista nominal, `SV` con marca de voto, `NV` sin marca, `NS` no especificado. `LN = SV+NV+NS` se cumple (0 desajustes). PP/VA no tienen denominador. El portal del INE ofrece además la dimensión "referente indígena y afrodescendencia", que **no viene en los CSV abiertos**: no se promete en el sitio.

### 1.2 Volumen → pre-agregar localmente

AGS 2024 = 91,826 filas; Estado de México 2024 = 951,310; ≈72 B/fila → ~8-9 M filas por elección. A Supabase solo llegan ~1.3 M filas agregadas (~120 MB datos; ~180 MB con sistema; margen > 2.5× sobre 500 MB).

### 1.3 Problemas de calidad → tratamiento en ETL

| Problema | Evidencia | Tratamiento |
|---|---|---|
| Fecha inconsistente | 2009-2021 `D/M/YYYY`; 2024 `MM/DD/YYYY`; PJ2025 sin fecha | Leer `FELECCION` como VARCHAR y no usarla; fechas en catálogo `elecciones` |
| Nombres de entidad variables | `DISTRITO FEDERAL`/`CIUDAD DE MEXICO`/`Ciudad de México` | Solo `EDOCVE`; nombre canónico en `entidades` |
| Acentos de municipio | `San José de Gracía` (2024) vs `Gracia` (2025); `Cosío`/`Cosio` | Claves `(EDOCVE,MPIOCVE)` estables (verificado AGS, CDMX); id `edocve*1000+mpiocve`; nombre del año más reciente + `overrides_municipios.csv`; catálogo = unión de todos los años |
| `DEL` vacío en 2024 | 615/91,826 filas en AGS, secciones completas | `del` nullable en `secciones_resumen`; no se agrega por distrito en v1 (D6) |
| `SEXO=2` (no binario) desde 2024 | LN=3 en AGS 2024 | Solo a nivel entidad/nacional y solo si `ln ≥ 30`; en municipio/sección entra únicamente en el total |
| Edades atípicas | hasta 125 | Grupos con tope "80+"; edad simple con tope 100 |
| Marcos cartográficos | diccionarios: 2009-2021 DERFE 2021, 2024 DERFE 2023, PJ2025 DERFE 2025 (el portal dice "corte mayo 2023" para 2009-2024) | Se guarda `marco_cartografico`; la UI nunca compara distritos ni secciones entre elecciones |
| `ESTADO` vs `EDOCVE` | PrisionPreventiva | Renombrar en ETL |
| Claves INE ≠ INEGI | sin crosswalk oficial | Mapa (si se hace) con geometría del propio INE (SIGE, GeoJSON) — D13 |
| BOM UTF-8 | todos los CSV | DuckDB lo maneja |

### 1.4 Ganchos narrativos (cifras de muestra; las nacionales se calculan en el ETL y alimentan `cifras.ts`)

- Mujeres votan más: AGS 2024 M 62.1% vs H 51.7% (total 57.1%). INE confirma que mujeres > 60% desde 2009.
- Elección judicial 2025: AGS 12.1%; estimación nacional INE 12.57-13.32%.
- Intermedias (2009/2015/2021) vs presidenciales (2012/2018/2024): serie en dientes de sierra; INE reporta 59.7% nacional en 2024.
- Edad: mayor participación 60-74; menor 20-29 y 80+ (INE).
- Urbano/mixto/rural; nuevas modalidades 2024 (26,563 en prisión preventiva; 3,449 anticipados).

---

## 2. Definición estratégica

**Mensaje central:** *"Votar es cosa de todas y todos, pero no todos lo hacemos igual: descubre quién participa, dónde y cuánto ha cambiado desde 2009."*

**Públicos:** (1) ciudadanía 18-35 en móvil y redes; (2) docentes y periodistas; (3) personal INE/OPLE. **Principio:** claridad y precisión sobre efecto visual. **Honestidad de marca:** el sitio se presenta como prototipo ciudadano *con datos abiertos del INE*; no usa logotipo ni identidad del INE (no impersonar una institución).

**Capítulos del scrollytelling (`/`, anclas compartibles):** 1 ¿Cuántos votamos? · 2 Ellas votan más · 3 La edad importa · 4 México no vota igual · 5 Nuevas formas de votar · 6 ¿Y tú? (elige tu entidad).

**Roles reales del sistema:** visitante anónimo (solo lectura); editor de contenido (modifica `content/` y redeploya); responsable de datos (corre el ETL con credenciales de servicio). No hay autenticación ni panel admin: la "torre de control" es la tabla `metadatos` + el reporte del ETL + Supabase Studio (§7).

---

## 3. Base de datos en Supabase (PostgreSQL 17, plan Free)

### 3.1 Principios

- Solo agregados, carga única con `\copy` sobre tablas vacías.
- **Marginales precalculados** (`sexo=9` total, `grupo_edad_id=0` todas las edades, `entidad_clave=0` nacional) generados con `GROUP BY CUBE`: PostgREST no agrega, así la consulta frecuente es un filtro de igualdad tipado y cacheable. Regla: *todo `SUM` excluye marginales*.
- Pseudo-entidad 0 solo en tablas de nivel entidad; subnacionales con `CHECK (entidad_clave between 1 and 32)`.
- Prisión preventiva y voto anticipado = **modalidades** de FED2024 (`agg_modalidad_voto`), nunca elecciones.
- Tasa principal `pct_participacion = sv/ln`; además `pct_participacion_ajustada = sv/(ln−ns)` y `pct_ns = ns/ln` (badge si > 5%).
- Vistas `security_invoker = true`; RLS solo lectura; funciones `stable` + `search_path`; listas > 1,000 filas vía RPC `jsonb` (límite `db-max-rows` = 1,000 por defecto en Settings → API).
- Una tabla `metadatos` (clave/valor) escrita solo por el ETL: versión de datos, fecha de carga, filas por tabla, hash de origen. La leen la página de metodología, el pie del explorador y el script `verify-data` (misma verdad en todas las superficies).

### 3.2 Tamaño estimado

| Tabla | Filas | MB |
|---|---|---|
| `agg_entidad` | ~9k | <1 |
| `agg_entidad_edad` | ~77k | 7 |
| `agg_municipio` | ~520k | 46 |
| `agg_tipo_seccion` | ~21k | 2 |
| `secciones_resumen` | ~485k | 64 |
| `agg_modalidad_voto` | <5k | <1 |
| **Total** | **~1.1 M** | **~120 MB** (+40-60 sistema) |

### 3.3 Migraciones (`supabase/migrations/`)

#### `0001_catalogos.sql`

```sql
create table public.elecciones (
  id smallint primary key,                          -- 1..7
  clave text not null unique,                       -- FED2009..FED2024, PJ2025
  slug text not null unique,                        -- fed2009..fed2024, pj2025 (URLs)
  anio smallint not null,
  tipo text not null check (tipo in ('federal','judicial')),
  fecha_jornada date not null,
  es_presidencial boolean not null default false,
  marco_cartografico text not null,
  cargos text,
  entidades_cubiertas smallint not null default 32, -- PJ2025 = 31
  notas text
);

create table public.entidades (
  clave smallint primary key check (clave between 0 and 32),   -- 0 = Nacional
  slug text not null unique,                                   -- nacional, aguascalientes, ...
  nombre text not null,
  nombre_corto text not null,
  abreviatura text not null,
  region text
);

create table public.municipios (
  id integer primary key,                           -- entidad_clave*1000 + clave
  entidad_clave smallint not null references public.entidades(clave) check (entidad_clave between 1 and 32),
  clave smallint not null,
  nombre text not null,
  slug text not null,                               -- jesus-maria
  unique (entidad_clave, clave),
  unique (entidad_clave, slug)
);

create table public.grupos_edad (
  id smallint primary key,                          -- 0 = Todas; 1..9
  etiqueta text not null,                           -- 18-19,20-24,25-29,30-39,40-49,50-59,60-69,70-79,80+
  edad_min smallint, edad_max smallint,
  grupo_amplio text,                                -- 18-29 | 30-59 | 60+
  orden smallint not null
);

create table public.metadatos (
  clave text primary key,                           -- version_datos, fecha_carga, filas_agg_municipio, hash_origen, ...
  valor text not null,
  actualizado_en timestamptz not null default now()
);
```

#### `0002_hechos.sql`

```sql
create table public.agg_entidad (
  eleccion_id smallint not null references public.elecciones(id),
  entidad_clave smallint not null references public.entidades(clave),
  sexo smallint not null check (sexo in (0,1,2,9)),
  grupo_edad_id smallint not null references public.grupos_edad(id),
  ln integer not null, sv integer not null, nv integer not null, ns integer not null,
  primary key (eleccion_id, entidad_clave, sexo, grupo_edad_id),
  check (ln = sv + nv + ns)
);

create table public.agg_entidad_edad (
  eleccion_id smallint not null references public.elecciones(id),
  entidad_clave smallint not null references public.entidades(clave),
  sexo smallint not null check (sexo in (0,1,2,9)),
  edad smallint not null check (edad between 18 and 100),   -- 100 = "100 y más"
  ln integer not null, sv integer not null, nv integer not null, ns integer not null,
  primary key (eleccion_id, entidad_clave, sexo, edad),
  check (ln = sv + nv + ns)
);

create table public.agg_municipio (
  eleccion_id smallint not null references public.elecciones(id),
  municipio_id integer not null references public.municipios(id),
  sexo smallint not null check (sexo in (0,1,9)),
  grupo_edad_id smallint not null references public.grupos_edad(id),
  ln integer not null, sv integer not null, nv integer not null, ns integer not null,
  primary key (eleccion_id, municipio_id, sexo, grupo_edad_id),
  check (ln = sv + nv + ns)
);

create table public.agg_tipo_seccion (
  eleccion_id smallint not null references public.elecciones(id),
  entidad_clave smallint not null references public.entidades(clave),
  tipo_seccion text not null check (tipo_seccion in ('U','M','R')),
  sexo smallint not null check (sexo in (0,1,9)),
  grupo_edad_id smallint not null references public.grupos_edad(id),
  ln integer not null, sv integer not null, nv integer not null, ns integer not null,
  primary key (eleccion_id, entidad_clave, tipo_seccion, sexo, grupo_edad_id),
  check (ln = sv + nv + ns)
);

create table public.secciones_resumen (
  eleccion_id smallint not null references public.elecciones(id),
  entidad_clave smallint not null references public.entidades(clave) check (entidad_clave between 1 and 32),
  seccion smallint not null,
  municipio_id integer not null references public.municipios(id),
  tipo_seccion text not null check (tipo_seccion in ('U','M','R')),
  def smallint, del smallint, cj smallint, dej smallint,
  ln integer not null, sv integer not null, nv integer not null, ns integer not null,
  ln_h integer not null, sv_h integer not null, ln_m integer not null, sv_m integer not null,
  primary key (eleccion_id, entidad_clave, seccion),
  check (ln = sv + nv + ns),
  check (ln_h + ln_m <= ln)
);
create index secciones_resumen_mun_idx on public.secciones_resumen (eleccion_id, municipio_id);

create table public.agg_modalidad_voto (
  eleccion_id smallint not null references public.elecciones(id),   -- siempre FED2024
  modalidad text not null check (modalidad in ('prision_preventiva','voto_anticipado')),
  entidad_clave smallint not null references public.entidades(clave),
  municipio_id integer references public.municipios(id),            -- null en prisión preventiva
  def smallint not null,
  sexo smallint not null check (sexo in (0,1,9)),
  personas integer not null,
  unique nulls not distinct (eleccion_id, modalidad, entidad_clave, municipio_id, def, sexo)
);

comment on table public.agg_entidad is 'Marginales: sexo=9 total, grupo_edad_id=0 todas, entidad_clave=0 nacional. Excluirlos antes de sumar.';
comment on table public.agg_municipio is 'Marginales: sexo=9, grupo_edad_id=0. Excluirlos antes de sumar.';
```

#### `0003_vistas_rpc.sql`

```sql
create or replace function public.pct(num bigint, den bigint) returns numeric
language sql immutable as $$ select round(100.0 * num / nullif(den, 0), 2) $$;

create or replace view public.v_participacion_entidad with (security_invoker = true) as
select a.*, e.clave as eleccion, e.slug as eleccion_slug, e.anio, e.es_presidencial,
       en.nombre as entidad, en.slug as entidad_slug, g.etiqueta as grupo_edad, g.grupo_amplio,
       pct(a.sv, a.ln) as pct_participacion,
       pct(a.sv, a.ln - a.ns) as pct_participacion_ajustada,
       pct(a.ns, a.ln) as pct_ns
from public.agg_entidad a
join public.elecciones e on e.id = a.eleccion_id
join public.entidades en on en.clave = a.entidad_clave
join public.grupos_edad g on g.id = a.grupo_edad_id
where a.sexo <> 2 or a.ln >= 30;

create or replace view public.v_participacion_tipo_seccion with (security_invoker = true) as
select t.*, e.clave as eleccion, e.anio, en.nombre as entidad, g.etiqueta as grupo_edad,
       case t.tipo_seccion when 'U' then 'Urbana' when 'M' then 'Mixta' else 'Rural' end as tipo_seccion_nombre,
       pct(t.sv, t.ln) as pct_participacion, pct(t.ns, t.ln) as pct_ns
from public.agg_tipo_seccion t
join public.elecciones e on e.id = t.eleccion_id
join public.entidades en on en.clave = t.entidad_clave
join public.grupos_edad g on g.id = t.grupo_edad_id;

create or replace view public.v_brecha_sexo_municipio with (security_invoker = true) as
select m.eleccion_id, m.municipio_id, mu.entidad_clave, mu.nombre, mu.slug, m.grupo_edad_id,
       sum(ln) filter (where sexo = 9) as ln,   sum(sv) filter (where sexo = 9) as sv,
       sum(ns) filter (where sexo = 9) as ns,
       sum(ln) filter (where sexo = 0) as ln_h, sum(sv) filter (where sexo = 0) as sv_h,
       sum(ln) filter (where sexo = 1) as ln_m, sum(sv) filter (where sexo = 1) as sv_m,
       pct(sum(sv) filter (where sexo = 9), sum(ln) filter (where sexo = 9)) as pct_total,
       case when sum(ln) filter (where sexo = 0) >= 30 then pct(sum(sv) filter (where sexo = 0), sum(ln) filter (where sexo = 0)) end as pct_h,
       case when sum(ln) filter (where sexo = 1) >= 30 then pct(sum(sv) filter (where sexo = 1), sum(ln) filter (where sexo = 1)) end as pct_m
from public.agg_municipio m
join public.municipios mu on mu.id = m.municipio_id
group by 1, 2, 3, 4, 5, 6;

create or replace function public.rpc_ranking_municipios(
  p_eleccion_id smallint, p_entidad_clave smallint,
  p_grupo_edad_id smallint default 0, p_min_ln integer default 30)
returns jsonb language sql stable security invoker set search_path = public as $$
  with w as (
    select *, pct_m - pct_h as brecha, rank() over (order by pct_total desc nulls last) as rank
    from v_brecha_sexo_municipio
    where eleccion_id = p_eleccion_id and grupo_edad_id = p_grupo_edad_id
      and entidad_clave = p_entidad_clave and ln >= p_min_ln)
  select coalesce(jsonb_agg(to_jsonb(w) order by rank), '[]'::jsonb) from w;
$$;

create or replace function public.rpc_serie_entidad(p_entidad_clave smallint)
returns table (eleccion text, eleccion_slug text, anio smallint, es_presidencial boolean, sexo smallint,
               ln integer, sv integer, pct numeric, pct_ajustada numeric)
language sql stable security invoker set search_path = public as $$
  select e.clave, e.slug, e.anio, e.es_presidencial, a.sexo, a.ln, a.sv, pct(a.sv, a.ln), pct(a.sv, a.ln - a.ns)
  from agg_entidad a join elecciones e on e.id = a.eleccion_id
  where a.entidad_clave = p_entidad_clave and a.grupo_edad_id = 0 and a.sexo in (0, 1, 9)
  order by e.fecha_jornada, a.sexo;
$$;

create or replace function public.rpc_secciones_municipio(p_eleccion_id smallint, p_municipio_id integer)
returns jsonb language sql stable security invoker set search_path = public as $$
  select coalesce(jsonb_agg(to_jsonb(s) || jsonb_build_object(
           'pct',   pct(s.sv, s.ln),
           'pct_h', case when s.ln_h >= 30 then pct(s.sv_h, s.ln_h) end,
           'pct_m', case when s.ln_m >= 30 then pct(s.sv_m, s.ln_m) end) order by s.seccion), '[]'::jsonb)
  from secciones_resumen s
  where s.eleccion_id = p_eleccion_id and s.municipio_id = p_municipio_id;
$$;
```

#### `0004_rls.sql`

```sql
do $$ declare t text; begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists lectura_publica on public.%I', t);
    execute format('create policy lectura_publica on public.%I for select to anon, authenticated using (true)', t);
  end loop;
end $$;
revoke insert, update, delete, truncate on all tables in schema public from anon, authenticated;
grant execute on function
  public.pct(bigint, bigint),
  public.rpc_ranking_municipios(smallint, smallint, smallint, integer),
  public.rpc_serie_entidad(smallint),
  public.rpc_secciones_municipio(smallint, integer)
to anon, authenticated;
notify pgrst, 'reload schema';
```

### 3.4 Seeds (`supabase/seed/`)

- `elecciones.csv`: 1 FED2009 (2009-07-05, intermedia, DERFE 2021) · 2 FED2012 (2012-07-01, presidencial) · 3 FED2015 (2015-06-07) · 4 FED2018 (2018-07-01, presidencial) · 5 FED2021 (2021-06-06) · 6 FED2024 (2024-06-02, presidencial, DERFE 2023) · 7 PJ2025 (2025-06-01, judicial, DERFE 2025, 31 entidades).
- `entidades.csv` (0 Nacional + 32, con slug/región), `grupos_edad.csv` (0 + 9).
- `municipios.csv` y `overrides_municipios.csv` los produce el ETL (§4).

---

## 4. ETL (Python 3.13 + DuckDB, carpeta `etl/`)

Ejecutar con `python -I` desde `etl/`; los CSV fuente son datos descargados (no ejecutar nada desde su carpeta).

1. `build_base.sql`: lectura única de los CSV a `conteos.duckdb` (~700 MB; 2-4 min). `read_csv('.../20*/datosabiertos_*.csv', header=true, union_by_name=true, filename=true, types={FELECCION:'VARCHAR', DEL:'VARCHAR', EDONOM:'VARCHAR', MPIONOM:'VARCHAR', TIPOSEC:'VARCHAR'})` (tipos explícitos: con `union_by_name` `DEL` saldría BIGINT en 2009 y VARCHAR en 2024) `union all` PoderJudicial_2025 (`CJ`, `DEJ`). Vista `base_g` con `eleccion_id`, `municipio_id`, `grupo_edad_id` (join a `grupos_edad` del seed), `edad_cap = least(edad,100)`.
2. `catalogo_municipios.sql`: `arg_max(mpio_nom, anio)` por `(entidad, mpio)` + overrides + slug (`unaccent` + kebab).
3. `aggregates.sql`: un `COPY (...) TO 'out/<tabla>.csv' (header)` por tabla:
   - `agg_entidad`: `group by eleccion_id, cube(entidad, sexo, grupo_edad_id)` con `coalesce(entidad,0)`, `coalesce(sexo,9)`, `coalesce(grupo_edad_id,0)`.
   - `agg_entidad_edad`: igual, `edad_cap` fuera del cube.
   - `agg_municipio`: `group by eleccion_id, municipio_id, cube(sexo, grupo_edad_id) having sexo is null or sexo in (0,1)`.
   - `agg_tipo_seccion`: `group by eleccion_id, tiposec, cube(entidad, sexo, grupo_edad_id)`, mismo `having`.
   - `secciones_resumen`: `group by eleccion_id, entidad, seccion` con `any_value(...)` y `sum(...) filter (sexo=0/1)`.
   - `agg_modalidad_voto`: `count(*)` por `(entidad, [municipio], def, cube(sexo))` en PP (`ESTADO`→entidad, municipio null) y VA.
4. `validate.sql` (§7.1) → `run_etl.py` aborta si falla y escribe `out/validation_report.md`.
5. `metadatos.csv`: `version_datos` (fecha ISO + hash SHA-256 de la lista de archivos fuente y tamaños), `fecha_carga`, `filas_<tabla>`.
6. `load.ps1`: **Session pooler** (IPv4; la conexión directa es solo IPv6 en Free): `postgresql://postgres.<ref>:<pwd>@aws-<n>-<region>.pooler.supabase.com:5432/postgres` (host copiado del diálogo Connect). `\copy` en orden: elecciones, entidades, grupos_edad, municipios, hechos, metadatos; `analyze`. Alternativa sin psql: extensión `postgres` de DuckDB (`attach ... (type postgres)` + `insert into`).
7. Tipos: `npx supabase gen types --lang=typescript --project-id <ref> --schema public > lib/supabase/types.ts`.

---

## 5. Arquitectura web (Next.js 16.4, Cache Components)

### 5.1 Versiones objetivo (pinear exactas al instalar y registrarlas en D14)

| Paquete | Versión verificada hoy | Nota |
|---|---|---|
| Node.js | 24 LTS (activo hasta abr-2028) | `engines` + `.nvmrc`; Node 26 pasa a LTS el 28-oct-2026, no migrar a mitad del proyecto |
| Next.js | 16.4.x | `create-next-app` activa `cacheComponents` y `partialPrefetching`; React 19.3 |
| Tailwind CSS | 4.3.x | `@import "tailwindcss"` + `@theme` |
| Recharts | 3.x | usar prop `responsive` (3.3+), no `ResponsiveContainer`; override `immer ≥ 11.0.1` si 3.6+ |
| @supabase/supabase-js | 2.116+ | sin `@supabase/ssr` (no hay auth) |
| Supabase CLI | última | `gen types --lang=typescript` |
| DuckDB (Python) | última estable (1.5.x; 2.0 en liberación oct-2026) | requiere Python ≥ 3.11 ✓; 1.5 EOL 1-nov-2026 → preferir 2.0 si está en PyPI |
| Python | 3.13 (instalado) | ETL |

### 5.2 Modelo de render y caché (lo que cambia respecto al modelo anterior)

- Los datos son **inmutables entre despliegues** → todo se prerrenderiza. Funciones de datos en `lib/data/queries.ts` con `'use cache'` + `cacheLife('max')`.
- Grupo de rutas `app/(estatico)/` con `export const ensureStatic = 'navigation'` en su `layout.tsx`: home, entidades, metodología, embeds. Cualquier componente dinámico que se cuele **rompe el build** (es la garantía de que estas páginas nunca tocan Supabase en producción).
- Explorador con **parámetros de ruta, no `searchParams`**: `/explorar/[eleccion]/[entidad]` se prerrenderiza con `generateStaticParams` (7 × 33 = 231 páginas); `/explorar/[eleccion]/[entidad]/[municipio]` usa ISR con Cache Components (`dynamicParams = true`): la primera visita sirve el App Shell y genera la página; las siguientes salen de caché. Supabase solo recibe consultas de primera visita.
- `'use cache'` con `cacheLife('max')` deja el dato en el shell estático; `generateMetadata` también cacheado.
- Sin Route Handlers de datos: no hay `/api/datos/*`. Único handler: `app/api/keepalive/route.ts` (GET, valida `Authorization: Bearer ${CRON_SECRET}`, hace `select clave from metadatos limit 1`), programado en `vercel.json` `"0 6 * * *"` (Hobby: una vez al día, precisión ±59 min; suficiente para evitar la pausa por 7 días sin actividad de BD).
- Imágenes OG con la convención de archivo `opengraph-image.tsx` en cada ruta, todas renderizando `components/og/TarjetaOG.tsx` (un solo dueño del diseño de tarjeta).
- Errores: `error.tsx` por grupo de rutas (`reset` = Reintentar) y `not-found.tsx` global.

### 5.3 Estructura del repositorio

```
app/
  layout.tsx                       # html lang="es", fuente next/font, viewport (sin user-scalable=no), safe-area
  not-found.tsx
  (estatico)/
    layout.tsx                     # export const ensureStatic = 'navigation'
    page.tsx                       # Home scrollytelling
    opengraph-image.tsx
    entidades/[clave]/page.tsx     # 33 (incluye "nacional")
    entidades/[clave]/opengraph-image.tsx
    metodologia/page.tsx
    embed/serie/[entidad]/page.tsx # widget serie histórica
    embed/brecha/[entidad]/page.tsx# widget brecha de sexo
  explorar/
    layout.tsx                     # sin ensureStatic (ISR en municipio)
    error.tsx
    page.tsx                       # ranking de entidades (redirige a /explorar/fed2024)
    [eleccion]/page.tsx            # ranking de 32 entidades para esa elección
    [eleccion]/[entidad]/page.tsx  # ranking de municipios (generateStaticParams)
    [eleccion]/[entidad]/opengraph-image.tsx
    [eleccion]/[entidad]/[municipio]/page.tsx        # ISR
    [eleccion]/[entidad]/[municipio]/opengraph-image.tsx
  api/keepalive/route.ts
components/
  charts/   SerieParticipacion.tsx, BrechaSexo.tsx (dumbbell), CurvaEdad.tsx, BarrasTipoSeccion.tsx, Ranking.tsx ('use client', Recharts)
  ui/       Grafica.tsx (título-mensaje, subtítulo métrica, pie fuente, "Ver tabla", "Descargar"), SelectorEleccion.tsx, BuscadorMunicipio.tsx, Tarjeta.tsx, NotaCobertura.tsx, BadgeCalidad.tsx
  story/    Capitulo.tsx, NavCapitulos.tsx, Compartir.tsx
  og/       TarjetaOG.tsx
lib/
  supabase/client.ts               # createClient(url, anon) servidor; nunca en el navegador
  supabase/types.ts                # generado
  data/queries.ts                  # único acceso a datos; 'use cache' + cacheLife('max'); zod para jsonb
  data/cifras.ts                   # cifras nombradas para la narrativa (nacional_2024_pct, brecha_2024_pts, ...)
  data/edad.ts, data/format.ts     # reagrupar edades, formato es-MX
content/
  capitulos/*.mdx                  # textos con placeholders {cifras.x}
  glosario.json, fuentes.json      # fuentes con URL del portal INE y version_datos esperada
supabase/{migrations/, seed/}
etl/{build_base.sql, catalogo_municipios.sql, aggregates.sql, validate.sql, run_etl.py, load.ps1, overrides_municipios.csv}
scripts/verify-data.ts             # prebuild: 3 conciliaciones + version_datos == fuentes.json
docs/{mensaje-central.md, mapa-historias.md, decision-log.md}
vercel.json                        # crons
```

### 5.4 Superficies que comparten estado y cómo se mantienen sincronizadas

| Estado | Quién escribe | Quién lee | Mecanismo de sincronía |
|---|---|---|---|
| Agregados | ETL (una vez por versión) | todas las páginas, OG, embeds | un solo módulo `queries.ts`; redeploy tras cada carga |
| Cifras de la narrativa | `cifras.ts` en build | MDX de capítulos, OG home | ningún número escrito a mano en MDX; `verify-data` falla si `version_datos` ≠ `fuentes.json` |
| Versión/fecha de datos | ETL → `metadatos` | metodología, pie del explorador, `verify-data` | una sola fila de verdad |
| Catálogos (slugs) | seeds | rutas, selectores, `generateStaticParams` | las rutas se generan desde `elecciones`/`entidades`/`municipios`, nunca de listas en código |

### 5.5 Especificación de UI por pantalla (trabajo de cada control y estados)

Convenciones: **Oro** = acción principal, una por trabajo; **Contorno** = ruta hermana; **Espera** = alguien o la máquina trabaja (sin oro); **Oculto** = imposible en este escenario. Móvil primero: ancho 375, objetivos táctiles ≥ 44 pt, `env(safe-area-inset-*)`, sin bloqueo de zoom; texto base 16 px, meta 14 px, mínimo absoluto 12 px solo en ejes de gráficas con contraste AA; una gráfica por fila en móvil; tablas → tarjetas en móvil.

**Home `/` (estática; sin estados de carga ni error en runtime: si faltan datos falla el build)**
- Portada: titular-mensaje + cifra nacional 2024 (de `cifras.ts`) + botón **oro "Explora tu entidad"** (abre selector; selección navega a `/entidades/[clave]`).
- `NavCapitulos` fija (contorno, 6 anclas; en móvil barra inferior con safe-area).
- Cada `Capitulo`: `Grafica` con título-mensaje, subtítulo con la métrica y `NotaCobertura`; controles contorno "Ver tabla" (alterna tabla accesible) y `Compartir` (copia enlace del ancla + botones X/Facebook/WhatsApp). Sin oro dentro de capítulos.
- Capítulo 5: cifras de modalidades como tarjetas; sin porcentaje (no hay denominador) y la copy lo dice.
- Capítulo 6: selector de entidad (mismo que portada) → **oro "Ver mi entidad"**.

**Entidad `/entidades/[clave]` (33 estáticas)**
- Cabecera: nombre, último dato (FED2024) vs Nacional siempre visible (comparación integrada; no hay página "comparar").
- `SelectorEleccion` (segmentado; **oculta PJ2025 para Campeche** y muestra la línea "El INE no publicó Campeche en 2025").
- Gráficas: serie 2009-2025 total/H/M; brecha por grupo de edad; curva por edad simple; urbano/mixto/rural. Sexo "no binario" solo si `ln ≥ 30` (si no, nota en metodología, nada en la gráfica).
- **Oro "Ver municipios"** → `/explorar/fed2024/[entidad]`. Contorno: Compartir, Descargar CSV.
- "Nacional" (`clave=nacional`) reutiliza la misma página; sin botón "Ver municipios" (oculto: no existe ranking nacional de municipios en v1) y en su lugar **oro "Ver entidades"** → `/explorar/fed2024`.

**Explorar índice `/explorar/[eleccion]` (7 estáticas)**
- `SelectorEleccion`; tabla/tarjetas de 32 entidades ordenables por participación, brecha, `pct_ns`; cada fila es un enlace (la fila es la acción; no hay oro aparte).
- Vacío imposible (siempre hay 32 o 31; PJ2025 muestra "31 entidades: sin Campeche").

**Explorar entidad `/explorar/[eleccion]/[entidad]` (231 estáticas)**
- `SelectorEleccion` (PJ2025 oculta en Campeche); `BuscadorMunicipio` (combobox cliente que filtra la lista ya cargada); encabezados ordenables; `BadgeCalidad` si `pct_ns > 5`.
- Filas → `/explorar/[eleccion]/[entidad]/[municipio]`. Municipios con `ln < 30` no aparecen en el ranking (regla `p_min_ln`) y una línea dice cuántos se omitieron y por qué.
- Contorno "Ver la entidad en detalle" → `/entidades/[clave]`.
- Búsqueda sin coincidencias: "No hay municipios con ese nombre en {entidad}" + botón contorno "Limpiar búsqueda" (nunca callejón sin salida).

**Municipio `/explorar/[eleccion]/[entidad]/[municipio]` (ISR)**
- Estados: *cargando* = App Shell con esqueleto de las tres gráficas y copy de espera "Preparando los datos de {municipio}…" (sin oro); *éxito* = brecha por sexo y grupo de edad (de `v_brecha_sexo_municipio`), serie del municipio en las 7 elecciones, tabla de secciones plegada tras contorno "Ver secciones" (hasta ~6,500 filas vía `jsonb`, virtualizada); *fallo de lectura* (`error.tsx`) = oculta las gráficas, muestra "No pudimos cargar los datos de este municipio" + **oro "Reintentar"** (`reset`) + contorno "Volver a {entidad}"; *límite/pausa de Supabase* (HTTP 429/5xx) = tono de espera "El servicio de datos está ocupado; vuelve a intentarlo en un minuto" con el mismo Reintentar (nunca un vacío falso); *no existe* = `not-found.tsx` con buscador de municipio y enlace a la entidad.
- `BadgeCalidad` y nota: "porcentajes por sexo solo con 30 o más personas en lista nominal".
- **Oro "Compartir tarjeta"** (OG del municipio). Contorno: Descargar CSV.

**Metodología `/metodologia` (estática)**: fuentes con URL del portal INE, definiciones (LN, SV, NV, NS, cuadernillo, sección, tipo de sección), cobertura (sin casillas especiales ni voto en el extranjero; no coincide con cómputos distritales), marcos cartográficos, regla de privacidad, versión y fecha de datos (`metadatos`), glosario. Sin oro; enlaces contorno.

**Embed `/embed/{serie|brecha}/[entidad]` (66 estáticas)**: solo la gráfica + pie con fuente y enlace contorno "Ver en el sitio" (target `_top`). Cabeceras: `X-Frame-Options` no se envía para estas rutas; `Content-Security-Policy: frame-ancestors *` solo aquí.

**Keepalive `/api/keepalive`**: sin UI; 401 sin secreto; 200 `{ok:true, version_datos}`.

### 5.6 Visualización y accesibilidad

Recharts 3 (`responsive`), paleta segura para daltonismo con mujeres/hombres en tonos no estereotipados, contraste AA, foco visible, `aria-label` en controles, tabla alterna por gráfica, `prefers-reduced-motion` desactiva animaciones del scrollytelling. Formato `es-MX` (`Intl.NumberFormat`). Sin D3 ni mapa en v1 (D13). La paleta, las tipografías y el "mundo visual" **no se deciden en este plan**: los fija el flujo de Impeccable (§5.7) con el usuario.

### 5.7 Impeccable: gobierna todo el trabajo de UI (instalado en `.cursor/skills/impeccable`, skill 4.7.0, CLI 0.1.16)

Impeccable es el sistema de diseño operativo del proyecto. Se usa en cada fase que toque interfaz (D a G); **no se usa** en base de datos ni ETL (A-C). Funciona desde Cursor (skill nativa + hook `preToolUse` ya en `.cursor/hooks.json`) y desde Claude Code siguiendo el mismo playbook (`SKILL.md` + `reference/*.md`) y el lanzador Windows `.cursor\skills\impeccable\scripts\impeccable.cmd <verbo>` (binario incluido en `scripts/bin/windows-x64/`, no requiere Node).

**Modo por superficie** (el modo nombra el éxito del visitante y decide la ambición):

| Superficie | Modo | Camino | Por qué |
|---|---|---|---|
| Home scrollytelling `/` | Read | code-led | el visitante viene a entender; es un documento de su clase (historia con datos) con marco del mundo visual y columna de lectura calmada |
| Entidad `/entidades/[clave]` | Read | code-led | perfil explicativo con un control |
| Explorar `/explorar/...` | Operate | code-led | el visitante completa una tarea: familiaridad ganada, densidad, estados completos, sin decoración |
| Metodología, embeds | Read | code-led | documentos |

Operate y Read son code-led siempre (sin ronda de comps ni generación de imágenes); por eso `buildPath` no se pregunta y no hay dependencia de herramientas de imagen.

**Secuencia obligatoria (en este orden, una vez):**
1. `impeccable context` una vez por sesión (carga PRODUCT.md/DESIGN.md/briefs; seguir sus directivas; no repetir).
2. `init` → `PRODUCT.md` en la raíz (usuarios, propósito, posicionamiento, capacidades, evidencia = los datos del INE, principios, accesibilidad, `## Stack` = Next.js 16.4 + Tailwind 4 + Supabase + Vercel, plataforma `web`). Entrevista de máximo 3 preguntas por ronda con el usuario; no se piden colores ni estilo en init.
3. `hooks on` → instala el detector también para Claude Code (`.claude/settings.local.json`); en Cursor ya bloquea escrituras con hallazgos reales. Triage de hallazgos: problema real → arreglar; falso positivo con evidencia → `ignore-value` con `--reason`; duda → preguntar una línea.
4. `shape <superficie>` antes de cada grupo de pantallas: entrevista de descubrimiento (propósito, personas, resultado; material, estados, límites) → brief confirmado por el usuario. La §5.5 de este plan es la respuesta pre-rellenada a esa entrevista, no la sustituye: el brief lo confirma el usuario.
5. Primera superficie (home) = **mundo visual nuevo** vía `new-work.md`: siete candidatos del mundo de la audiencia (tradiciones gráficas electorales/estadísticas mexicanas, publicaciones, señalética, boletas, credenciales, cartografía, infografía periodística, etc., evitando el default de "cream + serif + rojo"), `impeccable concept-seed --scope direction --mode read`, página de decisión (`serve-question --start/--wait`) donde el usuario elige dirección (con re-roll, pick, canon), contrato de dirección (THESIS, OWN-WORLD, STORY, FIRST VIEWPORT, FORM con referencia de seed, FINISH) escrito con `surface-brief write app/(estatico)/page.tsx`. Nunca se copia el contrato al código entregado al navegador.
6. Construir con compromiso total; leer `reference/craft-floor.md` justo antes de cada edición de UI (prohibiciones: kickers/eyebrows, sombras duras fuera de neobrutalismo, iconos glifo, display de sistema, texto degradado, etc.).
7. Inspección por lotes: capturas `.impeccable/review/desktop.png` (1440, página completa) y `mobile.png` (390) + `user-<ancho>.png`, validadas (sin regiones negras, desde el tope del documento, motion de entrada asentada); en harness sin hook, `impeccable detect --json <targets>` una vez.
8. `impeccable-finish-reviewer` (agente fresco, sin historial) con el paquete completo → disposición `recapture|rebuild|fix|ship`; se actúa literalmente; máximo dos rondas de fix con verdict pass.
9. `impeccable-documenter` → `DESIGN.md` + `.impeccable/design.json` derivados del build real (nunca antes de construir). Las superficies siguientes heredan ese mundo: `concept-seed --scope surface --mode operate` para `/explorar` (estructura, no identidad), extensiones locales sin torneo.
10. Cierre por comando: `critique` (hierarchy, carga cognitiva, personas), `audit` (a11y, rendimiento, responsive, P0-P3), `harden` (errores, vacíos, desbordes, datos reales extremos: Oaxaca 570 municipios, nombres largos como "Veracruz de Ignacio de la Llave"), `adapt` (375/390/430, 44 pt), `clarify` (copy y errores en español claro), `polish` final; `doctor` si hay drift; `live`/`generate` con dev server corriendo para iterar variantes de un elemento.

**Reglas que Impeccable impone a este proyecto y el plan acata:** el brief gana sobre el gusto del agente; refinar preserva, rediseñar reemplaza (nunca a medias); datos de demostración etiquetados como sintéticos (aquí no hay: todo es dato real del INE); sin afirmaciones comerciales inventadas; sin símbolos cargados; Operate: una familia tipográfica, escala rem fija, motion 150-250 ms solo para estado, skeletons no spinners, estados vacíos que enseñan; Read: columna 60-75 caracteres, cuerpo ~16 px, el mundo vive en el marco (masthead, rail, aperturas), nunca en la columna.

---

## 6. Decision log (`docs/decision-log.md`; no se re-debate salvo evidencia nueva)

| # | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| D1 | Solo agregados en Supabase; ETL local en DuckDB | 60 M filas no caben en 500 MB; el sitio solo necesita agregados | cargar crudo en Pro |
| D2 | Marginales precalculados (`sexo=9`, `grupo=0`, `entidad=0`) | PostgREST no agrega; consultas tipadas y cacheables | vistas con `GROUP BY` por petición |
| D3 | Pseudo-entidad 0 = Nacional solo en tablas de entidad | una consulta para "nacional vs estado"; CHECK evita doble conteo | tabla nacional aparte |
| D4 | `municipio_id = edocve*1000 + mpiocve` + slug | determinista, legible en URLs, sin join en ETL | serial opaco |
| D5 | PP/VA como modalidades de FED2024 | no son elecciones; evita que entren en series | `tipo='modalidad'` |
| D6 | Sin `agg_distrito` en v1 | los distritos cambian de marco entre elecciones y no están en el mapa de historias; derivable de `secciones_resumen` | tabla de distritos |
| D7 | `metadatos` sustituye a `fuentes_datos`; fuentes y glosario en `content/` | contenido editorial es del repo; una fila de verdad para versión de datos | tablas de contenido |
| D8 | Cache Components + rutas con parámetros de ruta; sin `/api/datos/*` | modelo recomendado en Next 16.4; prerrender garantizado con `ensureStatic`; Supabase casi no recibe tráfico | `force-static` + ISR clásico + Route Handlers con `s-maxage` |
| D9 | OG por convención `opengraph-image.tsx` con un solo `TarjetaOG` | idiomático, prerrenderizado, un dueño del diseño | `api/og` manual |
| D10 | Sin `/comparar` ni `/capitulos/[slug]` | la comparación vs Nacional va integrada; capítulos son anclas compartibles | páginas extra |
| D11 | `pct = sv/ln` principal; ajustada y `pct_ns` visibles | conservadora y comparable con el INE; honestidad sobre NS | solo ajustada |
| D12 | Umbral de privacidad `ln ≥ 30`; no binario solo a nivel entidad | evita identificar personas (LN=3) | mostrar todo |
| D13 | Mapa coroplético diferido; si se hace, geometría del INE (SIGE) | no hay crosswalk INE→INEGI; ranking cumple el objetivo narrativo | TopoJSON INEGI |
| D14 | Versiones: Node 24, Next 16.4.x, React 19.3, Tailwind 4.3.x, Recharts 3 (`responsive`), supabase-js 2.116+, DuckDB última estable, Python 3.13; pineadas exactas | vigentes hoy; Node 26 LTS llega el 28-oct pero no se cambia a mitad del proyecto | "latest" sin pinear |
| D15 | Keepalive diario por cron de Vercel | pausa de Free tras 7 días sin actividad de BD; Hobby permite 1/día | sin keepalive |
| D16 | Sin auth ni panel admin | el producto es público y de solo lectura; ops = `metadatos` + reporte ETL + Studio | admin propio |
| D17 | Cifras narrativas desde `cifras.ts`, nunca a mano en MDX | la narrativa y el explorador no pueden contradecirse | números en copy |
| D18 | Sin identidad gráfica del INE | no impersonar una institución; se cita como fuente | logotipo INE |
| D19 | Solo Recharts en v1 | menos dependencias; curva de edad se hace con `Area` | D3 |
| D20 | Pruebas: `tsc` + ESLint + `verify-data` + matriz manual | no se pidió stack E2E; el riesgo está en los datos, no en la UI | Playwright |
| D21 | Impeccable gobierna toda la UI (fases D-G): `init` → `shape` → new-work (home) → build code-led → finish-reviewer → documenter; `critique/audit/harden/adapt/clarify/polish` en cierre | instalado por el usuario; da floor de calidad, detector mecánico y revisión con ojos frescos | diseñar "a ojo" |
| D22 | Modos: Home/Entidad/Metodología/Embeds = Read; Explorar = Operate; todo code-led | superficies de lectura y tarea; sin dependencia de generación de imágenes | Persuade en home |
| D23 | Mundo visual (paleta, tipografías, firma) lo decide la ronda de dirección de Impeccable con el usuario, no este plan; DESIGN.md se escribe después del primer build | evita el default "cream + serif + acento rojo" y defender un rulebook contra la realidad | fijar tokens ahora |
| D24 | Hook del detector activo en Cursor (ya) y en Claude Code (`hooks on`); excepciones solo con `ignore-value --reason` | mismas reglas en ambos harness | sin hook en Claude Code |

---

## 7. Verificación y automatización

### 7.1 ETL (`validate.sql`, automático; aborta la carga si falla)

- `ln = sv+nv+ns` en 100% de `base` y de cada agregado.
- Conciliación por (elección, entidad): `sum(ln)` base = `agg_entidad(9,0)` = Σ municipios = Σ secciones = Σ tipo de sección.
- Marginales: Σ sexo(0,1,2) = 9; Σ grupos 1-9 = 0; Nacional = Σ entidades (PJ2025 con 31).
- Constancia intra-sección (`mpio/tiposec/def/del` únicos por sección-año); % LN con `del null` por entidad/año; personas > 100 años.
- Catálogo: toda (entidad, mpio) existe en `municipios`; slugs únicos por entidad; 32/31 archivos por carpeta; filas por `filename` en log.
- Spot checks: AGS FED2024 57.06% (LN 1,097,171; SV 626,084), M 62.1 / H 51.7; AGS PJ2025 LN 1,122,918 / SV 135,790 / NS 18,701; PP 26,563 (24,232/2,331); VA 3,449 (1,306/2,143). Plausibilidad nacional: 2024 ≈ 59-61%; PJ2025 ≈ 12-14%; mujeres > 60% en todas las federales.
- Tras la carga: `pg_database_size` < 250 MB; `pg_total_relation_size` por tabla; `metadatos.version_datos` presente.

### 7.2 Web (automático en `npm run check` y `prebuild`)

- `tsc --noEmit`, ESLint, `scripts/verify-data.ts` (3 conciliaciones vía RPC + `version_datos == content/fuentes.json`).
- `next build` falla si una ruta del grupo `(estatico)` deja de ser estática (`ensureStatic`) o si `generateStaticParams` no cubre 33 entidades y 231 combinaciones.

### 7.3 Matriz y recorridos manuales (todos son todos del cierre)

- **Matriz de dispositivos:** iPhone Safari (375 y 430 de ancho), Android Chrome, iPad, escritorio Chrome/Firefox/Edge; modo oscuro del sistema; `prefers-reduced-motion`.
- **Recorrido de estados:** cada estado nombrado en §5.5 es alcanzable y tiene acción siguiente (cargando, fallo con Reintentar, espera por límite, no encontrado, búsqueda vacía, Campeche-2025, `ln < 30`).
- **Recorrido de datos:** 5 municipios al azar cotejados contra el CSV fuente con DuckDB; cifras de `cifras.ts` vs explorador.
- **Recorrido a11y:** teclado completo, VoiceOver en iPhone, contraste AA, tamaños 16/14, objetivos 44 pt; Lighthouse móvil ≥ 90 en rendimiento y accesibilidad.
- **Recorrido de difusión:** OG visible al pegar URL de entidad y municipio en X/WhatsApp; embed carga en iframe externo; descarga CSV abre en Excel con acentos correctos (UTF-8 BOM).
- **Recorrido de operación:** cron keepalive registrado en Vercel y respondiendo 200; Supabase Studio muestra `metadatos`; `pg_database_size` registrado en el cierre.

---

## 8. Todos (en orden de ejecución)

**A. Preparación (día 0)**
1. Instalar Node 24 LTS, Git, Supabase CLI; `pip install duckdb`; instalar psql (o usar extensión `postgres` de DuckDB).
2. Crear proyecto Supabase (región us-east o la más cercana), guardar `project ref`, contraseña de BD, `anon key` en `.env.local` (no en el repo); subir "Max rows" en Settings → API no es necesario (RPC jsonb).
3. `git init`; `create-next-app` (TypeScript, Tailwind, App Router, Turbopack; Cache Components activado); pinear versiones exactas y anotarlas en D14; `.nvmrc`; ESLint.
4. Crear `docs/mensaje-central.md`, `docs/mapa-historias.md`, `docs/decision-log.md` (copiar §2 y §6).
5. Impeccable: `impeccable context` → `init` (entrevista corta con el usuario) → `PRODUCT.md`; `hooks on`; verificar `hooks status`.

**B. Base de datos (día 1)**
5. Escribir seeds `elecciones.csv`, `entidades.csv`, `grupos_edad.csv`.
6. Migraciones 0001-0004 (§3.3); aplicarlas con `supabase link` + `supabase db push` (o SQL Editor); `notify pgrst`.
7. Verificar en Studio: tablas, vistas con `security_invoker`, políticas RLS, grants de RPC.

**C. ETL y carga (días 2-3)**
8. `build_base.sql` + `run_etl.py` → `conteos.duckdb`; registrar filas por archivo.
9. `catalogo_municipios.sql` + `overrides_municipios.csv` (acentos verificados contra INE) + slugs.
10. `aggregates.sql` → `out/*.csv`; `validate.sql` → `validation_report.md` (debe pasar al 100%).
11. `metadatos.csv` con `version_datos`; `load.ps1` por Session pooler; `analyze`; tamaño de BD.
12. `supabase gen types` → `lib/supabase/types.ts`; `scripts/verify-data.ts` pasando.

**D. Scaffold y datos (día 4)**
13. `lib/supabase/client.ts`, `lib/data/queries.ts` (`'use cache'`, `cacheLife('max')`, zod), `cifras.ts`, `edad.ts`, `format.ts`.
14. `app/layout.tsx` (lang, fuente, viewport, safe-area), `(estatico)/layout.tsx` con `ensureStatic`, `not-found.tsx`, `explorar/error.tsx`.
15. `api/keepalive/route.ts` + `vercel.json` + `CRON_SECRET`.
16. Componentes `ui/` (Grafica, SelectorEleccion, BuscadorMunicipio, Tarjeta, NotaCobertura, BadgeCalidad) con estados y tamaños de §5.5.

**E. Narrativa (días 5-7)**
17. `shape home` (brief confirmado) → ronda de dirección new-work (`concept-seed --scope direction --mode read`, página de decisión, elección del usuario) → contrato de dirección en el surface brief de `app/(estatico)/page.tsx`.
18. Gráficas `charts/` (Recharts 3, `responsive`, tabla alterna, reduced-motion) dentro del mundo elegido; leer `craft-floor.md` antes de editar.
19. `content/capitulos/*.mdx` con placeholders de `cifras.ts`; `glosario.json`; `fuentes.json`.
20. Home: portada, `NavCapitulos`, 6 capítulos, `Compartir`, selector de entidad, `opengraph-image.tsx`.
21. Inspección (desktop 1440 / mobile 390 / viewport del usuario) → `detect` si no hay hook → `impeccable-finish-reviewer` → fixes → verdict → `impeccable-documenter` → `DESIGN.md` + `.impeccable/design.json`.
22. `/metodologia` leyendo `metadatos` (extensión del mundo; sin torneo).

**F. Explorador (días 8-9)**
23. `shape explorar` + `concept-seed --scope surface --mode operate` (estructura dentro del mundo ya documentado); brief de superficie.
24. `/entidades/[clave]` (33) con reglas Campeche/no binario y OG.
25. `/explorar/[eleccion]` y `/explorar/[eleccion]/[entidad]` con `generateStaticParams`, ranking ordenable, buscador, estados de búsqueda vacía.
26. `/explorar/.../[municipio]` ISR con esqueleto, `error.tsx`, tono de espera en 429/5xx, secciones virtualizadas, OG.
27. Embeds `serie` y `brecha` + cabeceras de frame.
28. `harden explorar` (Oaxaca 570 municipios, nombres largos, `ln < 30`, Campeche-2025, 429) y `adapt explorar mobile`; finish-reviewer sobre el explorador.

**G. Cierre (día 10)**
29. `critique` + `audit` sobre home y explorador; `clarify` de copy/errores en español; `polish` final; `doctor` si reporta drift.
30. Ejecutar §7.2 y los seis recorridos de §7.3; corregir hallazgos.
31. Desplegar en Vercel (variables de entorno, cron activo), verificar OG en producción y keepalive.
32. Registrar en `decision-log.md` las versiones finales, tamaño de BD, dirección visual elegida (seed reference) y resultados de la matriz.

---

## 9. Alcance de esta sesión de ejecución (instrucción del usuario)

Ejecutar el plan **hasta que le toque a Cursor desarrollar la base de datos en Supabase** y detenerse ahí:

1. Fase A completa: instalar Node 24, Git, Supabase CLI y DuckDB (psql opcional); `git init`; `create-next-app` con versiones pineadas; `docs/` (mensaje central, mapa de historias, decision log); Impeccable `context` + `init` (PRODUCT.md con entrevista corta) + `hooks on`. Impeccable no interviene en B-C (no es trabajo de UI).
2. Fase B solo archivos: seeds (`supabase/seed/*.csv`) y migraciones `0001`-`0004` escritas y revisadas; **no** se crea el proyecto Supabase ni se aplican migraciones desde aquí.
3. Scripts del ETL escritos (`etl/`) y probados en seco contra un estado (Aguascalientes) con DuckDB local, sin cargar nada a Supabase.
4. Entregable de parada: `docs/handoff-supabase-cursor.md` con todo lo que Cursor (modelo Grok 4.7 extra high) necesita: contexto de datos, esquema completo con justificación, orden de aplicación, seeds, procedimiento de carga por Session pooler, validaciones post-carga, generación de tipos, errores conocidos y criterios de aceptación. Formato pensado para pegarse como prompt/contexto en Cursor.

Lo que queda para después de Cursor: carga de datos y verificación (C11-C12), y las fases D-G.

## 10. ¿Listos para Build?

**Sí.** El plan especifica base de datos, ETL, arquitectura, cada pantalla con el trabajo de cada control y sus estados, sincronía entre superficies, versiones vigentes, Decision log y la lista completa de todos. No queda nada por decidir en el plan.

Lo único que no puede hacerse sin el usuario, y está como todos A1-A2, son entradas que solo él tiene: instalar las herramientas faltantes en su máquina y crear el proyecto de Supabase con sus credenciales. Riesgos conocidos y acotados: DuckDB 2.0 recién liberado (si da problemas, pinear 1.5.x hasta su EOL de noviembre); la carga por `\copy` requiere psql o la extensión `postgres` de DuckDB (ambas rutas documentadas).

---

## 11. Adenda de ejecución (2026-10-24)

Cambios respecto a este plan durante la ejecución. Las decisiones vigentes están en `docs/decision-log.md` (D25 en adelante).

- **Ubicación:** el proyecto se movió a `C:\Users\anafe\Desktop\Proyecto GOB`, fuera de OneDrive. Los datos pesados del ETL viven en `%USERPROFILE%\participacion-ine-etl` (DuckDB de 590 MB y CSV agregados).
- **ETL completo ya corrido**, no solo la prueba en seco: 225 archivos, 64.7 M filas fuente, 19/19 validaciones aprobadas, 43 s.
- **Carga sin psql:** `etl/load.py` (Python + psycopg 3, `COPY FROM STDIN`) sustituye a `load.ps1`. Hace todo en una transacción y verifica después.
- **Prueba local sin Docker:** `scripts/test-db-local.mjs` aplica las migraciones y carga todo en PGlite (PostgreSQL 17 en WebAssembly). Aprobada: 223/223 combinaciones cuadran, 110 MB.
- **Hallazgos de datos nuevos:** secciones sin DEF en 2009/2012 (ya no existen en el marco DERFE 2021); claves de municipio reutilizadas en Chiapas 2018 (reasignadas con `etl/remapeo_municipios.csv`); 100 municipios con grafías distintas entre años (regla de mayoría + 21 correcciones en `etl/overrides_municipios.csv`).
- **Cifras nacionales reales:** FED2024 55.83% (59.67% ajustada), PJ2025 12.84%. La plausibilidad "mujeres > 60% en todas las federales" no se cumple en 2009, 2015 y 2021; el chequeo vigente es "mujeres > hombres en cada federal".
- **Migraciones con nombre de fecha** (`20261024000100_*.sql`) para `supabase db push`, más la función `rpc_conciliacion()` y `GRANT` explícitos.
