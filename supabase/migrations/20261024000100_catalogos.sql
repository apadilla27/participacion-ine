-- 0001 · Catálogos
-- Fuente: Conteos Censales de Participación Ciudadana (INE, DECEyEC). Ver docs/handoff-supabase-cursor.md.
-- Estas tablas se llenan desde supabase/seed/*.csv (elecciones, entidades, grupos_edad)
-- y desde la salida del ETL (municipios, metadatos).

create table public.elecciones (
  id                  smallint primary key,                      -- 1..7, orden cronológico
  clave               text     not null unique,                  -- FED2009..FED2024, PJ2025
  slug                text     not null unique,                  -- fed2009..fed2024, pj2025 (segmento de URL)
  anio                smallint not null unique,
  tipo                text     not null check (tipo in ('federal', 'judicial')),
  fecha_jornada       date     not null,
  es_presidencial     boolean  not null default false,
  marco_cartografico  text     not null,                         -- 'DERFE 2021' | 'DERFE 2023' | 'DERFE 2025'
  cargos              text,
  entidades_cubiertas smallint not null default 32 check (entidades_cubiertas between 1 and 32),
  notas               text
);
comment on table  public.elecciones is 'Las 7 jornadas con conteo censal. Prisión preventiva y voto anticipado NO son elecciones: son modalidades de FED2024 (ver agg_modalidad_voto).';
comment on column public.elecciones.marco_cartografico is 'Marco cartográfico de la DERFE usado por el INE para DEF/DEL/CJ/DEJ. Distritos y secciones no son comparables entre marcos distintos.';
comment on column public.elecciones.entidades_cubiertas is 'PJ2025 = 31: los datos abiertos no incluyen Campeche.';

create table public.entidades (
  clave        smallint primary key check (clave between 0 and 32), -- 0 = Nacional (solo en tablas de nivel entidad)
  slug         text not null unique,
  nombre       text not null,                                        -- nombre oficial
  nombre_corto text not null,                                        -- nombre para interfaz
  abreviatura  text not null unique,
  region       text                                                  -- regiones de Banxico (Norte, Centro Norte, Centro, Sur)
);
comment on table public.entidades is 'Clave INE de entidad (01-32, orden alfabético). La fila 0 = Nacional existe para que los agregados nacionales vivan en las mismas tablas de nivel entidad.';

create table public.municipios (
  id            integer  primary key,                                -- entidad_clave * 1000 + clave
  entidad_clave smallint not null references public.entidades (clave) check (entidad_clave between 1 and 32),
  clave         smallint not null,                                   -- MPIOCVE (clave INE, no INEGI)
  nombre        text     not null,
  slug          text     not null,
  unique (entidad_clave, clave),
  unique (entidad_clave, slug),
  check (id = entidad_clave * 1000 + clave)
);
comment on table public.municipios is 'Unión de los municipios presentes en las 7 elecciones. Las claves son del INE y no siempre coinciden con las del INEGI.';

create table public.grupos_edad (
  id           smallint primary key,                                 -- 0 = Todas las edades; 1..9
  etiqueta     text     not null unique,
  edad_min     smallint,
  edad_max     smallint,                                             -- null en 80+
  grupo_amplio text,                                                 -- '18-29' | '30-59' | '60+'
  orden        smallint not null unique,
  check (id = 0 or edad_min is not null)
);

create table public.metadatos (
  clave          text        primary key,                            -- version_datos, fecha_carga, filas_<tabla>, hash_origen, ...
  valor          text        not null,
  actualizado_en timestamptz not null default now()
);
comment on table public.metadatos is 'Escrita solo por el ETL. Única fuente de verdad de la versión de datos para metodología, pie del explorador y verificación.';
