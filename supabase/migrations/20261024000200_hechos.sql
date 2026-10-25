-- 0002 · Tablas de hechos (solo agregados; el grano crudo sección × sexo × edad no se carga)
--
-- Métricas (definiciones del diccionario del INE):
--   ln = lista nominal de los cuadernillos de las casillas catalogadas
--   sv = registros con marca de voto
--   nv = registros sin marca de voto
--   ns = registros no especificados (cuadernillo sin marcas, no disponible o página faltante)
--   Siempre ln = sv + nv + ns.
--
-- Marginales precalculados (no sumar sin filtrarlos):
--   sexo = 9           → total de todos los sexos (incluye no binario)
--   grupo_edad_id = 0  → todas las edades
--   entidad_clave = 0  → nacional (solo en agg_entidad, agg_entidad_edad, agg_tipo_seccion)
--
-- Privacidad: sexo = 2 (no binario) solo existe a nivel entidad/nacional y solo cuando ln >= 30.
-- En niveles inferiores esas personas cuentan únicamente dentro de sexo = 9.

create table public.agg_entidad (
  eleccion_id   smallint not null references public.elecciones (id),
  entidad_clave smallint not null references public.entidades (clave),
  sexo          smallint not null check (sexo in (0, 1, 2, 9)),
  grupo_edad_id smallint not null references public.grupos_edad (id),
  ln integer not null check (ln >= 0),
  sv integer not null check (sv >= 0),
  nv integer not null check (nv >= 0),
  ns integer not null check (ns >= 0),
  primary key (eleccion_id, entidad_clave, sexo, grupo_edad_id),
  check (ln = sv + nv + ns),
  check (sexo <> 2 or ln >= 30)
);

create table public.agg_entidad_edad (
  eleccion_id   smallint not null references public.elecciones (id),
  entidad_clave smallint not null references public.entidades (clave),
  sexo          smallint not null check (sexo in (0, 1, 2, 9)),
  edad          smallint not null check (edad between 18 and 100),   -- 100 = "100 años y más"
  ln integer not null check (ln >= 0),
  sv integer not null check (sv >= 0),
  nv integer not null check (nv >= 0),
  ns integer not null check (ns >= 0),
  primary key (eleccion_id, entidad_clave, sexo, edad),
  check (ln = sv + nv + ns),
  check (sexo <> 2 or ln >= 30)
);

create table public.agg_municipio (
  eleccion_id   smallint not null references public.elecciones (id),
  municipio_id  integer  not null references public.municipios (id),
  sexo          smallint not null check (sexo in (0, 1, 9)),
  grupo_edad_id smallint not null references public.grupos_edad (id),
  ln integer not null check (ln >= 0),
  sv integer not null check (sv >= 0),
  nv integer not null check (nv >= 0),
  ns integer not null check (ns >= 0),
  primary key (eleccion_id, municipio_id, sexo, grupo_edad_id),
  check (ln = sv + nv + ns)
);

create table public.agg_tipo_seccion (
  eleccion_id   smallint not null references public.elecciones (id),
  entidad_clave smallint not null references public.entidades (clave),
  tipo_seccion  text     not null check (tipo_seccion in ('U', 'M', 'R')),
  sexo          smallint not null check (sexo in (0, 1, 9)),
  grupo_edad_id smallint not null references public.grupos_edad (id),
  ln integer not null check (ln >= 0),
  sv integer not null check (sv >= 0),
  nv integer not null check (nv >= 0),
  ns integer not null check (ns >= 0),
  primary key (eleccion_id, entidad_clave, tipo_seccion, sexo, grupo_edad_id),
  check (ln = sv + nv + ns)
);

create table public.secciones_resumen (
  eleccion_id   smallint not null references public.elecciones (id),
  entidad_clave smallint not null references public.entidades (clave) check (entidad_clave between 1 and 32),
  seccion       smallint not null,
  municipio_id  integer  not null references public.municipios (id),
  tipo_seccion  text     not null check (tipo_seccion in ('U', 'M', 'R')),
  def smallint,                                                       -- distrito electoral federal
  del smallint,                                                       -- distrito local; null en PJ2025 y en secciones 2024 sin DEL
  cj  smallint,                                                       -- circuito judicial (solo PJ2025)
  dej smallint,                                                       -- distrito judicial electoral (solo PJ2025)
  ln integer not null check (ln >= 0),
  sv integer not null check (sv >= 0),
  nv integer not null check (nv >= 0),
  ns integer not null check (ns >= 0),
  ln_h integer not null check (ln_h >= 0),
  sv_h integer not null check (sv_h >= 0),
  ln_m integer not null check (ln_m >= 0),
  sv_m integer not null check (sv_m >= 0),
  primary key (eleccion_id, entidad_clave, seccion),
  check (ln = sv + nv + ns),
  check (ln_h + ln_m <= ln),                                          -- la diferencia son personas no binarias
  check (sv_h <= ln_h and sv_m <= ln_m)
);
create index secciones_resumen_municipio_idx on public.secciones_resumen (eleccion_id, municipio_id);

create table public.agg_modalidad_voto (
  id            bigint generated always as identity primary key,
  eleccion_id   smallint not null references public.elecciones (id),   -- siempre FED2024 (id 6)
  modalidad     text     not null check (modalidad in ('prision_preventiva', 'voto_anticipado')),
  entidad_clave smallint not null references public.entidades (clave) check (entidad_clave between 1 and 32),
  municipio_id  integer  references public.municipios (id),             -- null en prisión preventiva (la fuente no trae municipio)
  def           smallint not null,
  sexo          smallint not null check (sexo in (0, 1, 9)),
  personas      integer  not null check (personas > 0),
  unique nulls not distinct (eleccion_id, modalidad, entidad_clave, municipio_id, def, sexo)
);

comment on table public.agg_entidad        is 'Entidad (0 = nacional) × sexo × grupo de edad. Marginales: sexo=9, grupo_edad_id=0, entidad_clave=0. Excluirlos antes de sumar.';
comment on table public.agg_entidad_edad   is 'Entidad (0 = nacional) × sexo × edad simple (tope 100). Para curvas de edad. Marginales: sexo=9, entidad_clave=0.';
comment on table public.agg_municipio      is 'Municipio × sexo (0,1,9) × grupo de edad. Marginales: sexo=9, grupo_edad_id=0. Excluirlos antes de sumar.';
comment on table public.agg_tipo_seccion   is 'Entidad (0 = nacional) × tipo de sección (U/M/R) × sexo × grupo de edad. Marginales: sexo=9, grupo_edad_id=0, entidad_clave=0.';
comment on table public.secciones_resumen  is 'Totales por sección electoral y elección. Las secciones no son comparables entre elecciones (reseccionamiento y marcos distintos).';
comment on table public.agg_modalidad_voto is 'Personas que votaron en prisión preventiva o de forma anticipada en 2024 (la fuente es una fila por persona). Sin denominador: no se calcula porcentaje. Marginal: sexo=9.';

comment on column public.agg_entidad.ln is 'Lista nominal de los cuadernillos de las casillas catalogadas.';
comment on column public.agg_entidad.sv is 'Registros con marca de voto.';
comment on column public.agg_entidad.nv is 'Registros sin marca de voto.';
comment on column public.agg_entidad.ns is 'Registros no especificados: cuadernillo sin marcas, no disponible o página faltante.';
