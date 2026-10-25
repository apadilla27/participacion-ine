-- 0003 · Vistas y funciones RPC (solo lectura)
-- Reglas:
--   * Vistas con security_invoker = true: respetan el RLS de las tablas base.
--   * Funciones stable + search_path fijo; se llaman vía PostgREST con GET (supabase-js: .rpc(fn, args, { get: true })).
--   * Listas que pueden superar 1,000 filas (db-max-rows) devuelven un único jsonb.
--   * Tasa principal: pct_participacion = sv / ln. También pct_participacion_ajustada = sv / (ln - ns) y pct_ns = ns / ln.
--   * Porcentajes por sexo solo con ln >= 30.

create or replace function public.pct(num bigint, den bigint)
returns numeric
language sql
immutable
set search_path = public
as $$ select round(100.0 * num / nullif(den, 0), 2) $$;
comment on function public.pct(bigint, bigint) is 'Porcentaje con 2 decimales; null si el denominador es 0.';

-- Participación por entidad (0 = nacional), sexo y grupo de edad
create or replace view public.v_participacion_entidad
with (security_invoker = true) as
select
  a.eleccion_id, a.entidad_clave, a.sexo, a.grupo_edad_id,
  a.ln, a.sv, a.nv, a.ns,
  e.clave  as eleccion,
  e.slug   as eleccion_slug,
  e.anio,
  e.es_presidencial,
  en.nombre_corto as entidad,
  en.slug  as entidad_slug,
  g.etiqueta     as grupo_edad,
  g.grupo_amplio,
  public.pct(a.sv, a.ln)        as pct_participacion,
  public.pct(a.sv, a.ln - a.ns) as pct_participacion_ajustada,
  public.pct(a.ns, a.ln)        as pct_ns
from public.agg_entidad a
join public.elecciones  e  on e.id = a.eleccion_id
join public.entidades   en on en.clave = a.entidad_clave
join public.grupos_edad g  on g.id = a.grupo_edad_id
where a.sexo <> 2 or a.ln >= 30;

-- Participación por tipo de sección (urbana / mixta / rural)
create or replace view public.v_participacion_tipo_seccion
with (security_invoker = true) as
select
  t.eleccion_id, t.entidad_clave, t.tipo_seccion, t.sexo, t.grupo_edad_id,
  t.ln, t.sv, t.nv, t.ns,
  e.clave  as eleccion,
  e.slug   as eleccion_slug,
  e.anio,
  en.nombre_corto as entidad,
  g.etiqueta as grupo_edad,
  case t.tipo_seccion when 'U' then 'Urbana' when 'M' then 'Mixta' else 'Rural' end as tipo_seccion_nombre,
  public.pct(t.sv, t.ln) as pct_participacion,
  public.pct(t.ns, t.ln) as pct_ns
from public.agg_tipo_seccion t
join public.elecciones  e  on e.id = t.eleccion_id
join public.entidades   en on en.clave = t.entidad_clave
join public.grupos_edad g  on g.id = t.grupo_edad_id;

-- Municipio con total y brecha por sexo en una sola fila por grupo de edad
create or replace view public.v_brecha_sexo_municipio
with (security_invoker = true) as
select
  m.eleccion_id,
  m.municipio_id,
  mu.entidad_clave,
  mu.nombre,
  mu.slug,
  m.grupo_edad_id,
  sum(m.ln) filter (where m.sexo = 9) as ln,
  sum(m.sv) filter (where m.sexo = 9) as sv,
  sum(m.ns) filter (where m.sexo = 9) as ns,
  sum(m.ln) filter (where m.sexo = 0) as ln_h,
  sum(m.sv) filter (where m.sexo = 0) as sv_h,
  sum(m.ln) filter (where m.sexo = 1) as ln_m,
  sum(m.sv) filter (where m.sexo = 1) as sv_m,
  public.pct(sum(m.sv) filter (where m.sexo = 9), sum(m.ln) filter (where m.sexo = 9)) as pct_total,
  public.pct(sum(m.ns) filter (where m.sexo = 9), sum(m.ln) filter (where m.sexo = 9)) as pct_ns,
  case when sum(m.ln) filter (where m.sexo = 0) >= 30
       then public.pct(sum(m.sv) filter (where m.sexo = 0), sum(m.ln) filter (where m.sexo = 0)) end as pct_h,
  case when sum(m.ln) filter (where m.sexo = 1) >= 30
       then public.pct(sum(m.sv) filter (where m.sexo = 1), sum(m.ln) filter (where m.sexo = 1)) end as pct_m
from public.agg_municipio m
join public.municipios mu on mu.id = m.municipio_id
group by m.eleccion_id, m.municipio_id, mu.entidad_clave, mu.nombre, mu.slug, m.grupo_edad_id;

-- Ranking de municipios de una entidad (hasta 570 en Oaxaca: se devuelve jsonb)
create or replace function public.rpc_ranking_municipios(
  p_eleccion_id   smallint,
  p_entidad_clave smallint,
  p_grupo_edad_id smallint default 0,
  p_min_ln        integer  default 30
)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with w as (
    select
      v.*,
      v.pct_m - v.pct_h as brecha,
      rank() over (order by v.pct_total desc nulls last) as posicion
    from public.v_brecha_sexo_municipio v
    where v.eleccion_id   = p_eleccion_id
      and v.entidad_clave = p_entidad_clave
      and v.grupo_edad_id = p_grupo_edad_id
      and v.ln >= p_min_ln
  )
  select coalesce(jsonb_agg(to_jsonb(w) order by w.posicion, w.nombre), '[]'::jsonb) from w;
$$;
comment on function public.rpc_ranking_municipios(smallint, smallint, smallint, integer) is 'Municipios con ln >= p_min_ln ordenados por participación. Devuelve jsonb para no topar con db-max-rows.';

-- Serie histórica de una entidad (0 = nacional): total, hombres y mujeres
create or replace function public.rpc_serie_entidad(p_entidad_clave smallint)
returns table (
  eleccion        text,
  eleccion_slug   text,
  anio            smallint,
  es_presidencial boolean,
  sexo            smallint,
  ln              integer,
  sv              integer,
  pct             numeric,
  pct_ajustada    numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select e.clave, e.slug, e.anio, e.es_presidencial, a.sexo, a.ln, a.sv,
         public.pct(a.sv, a.ln), public.pct(a.sv, a.ln - a.ns)
  from public.agg_entidad a
  join public.elecciones e on e.id = a.eleccion_id
  where a.entidad_clave = p_entidad_clave
    and a.grupo_edad_id = 0
    and a.sexo in (0, 1, 9)
  order by e.fecha_jornada, a.sexo;
$$;

-- Secciones de un municipio (puede superar 1,000 filas: jsonb)
create or replace function public.rpc_secciones_municipio(p_eleccion_id smallint, p_municipio_id integer)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(jsonb_agg(
           to_jsonb(s) || jsonb_build_object(
             'pct',    public.pct(s.sv, s.ln),
             'pct_ns', public.pct(s.ns, s.ln),
             'pct_h',  case when s.ln_h >= 30 then public.pct(s.sv_h, s.ln_h) end,
             'pct_m',  case when s.ln_m >= 30 then public.pct(s.sv_m, s.ln_m) end
           ) order by s.seccion), '[]'::jsonb)
  from public.secciones_resumen s
  where s.eleccion_id = p_eleccion_id
    and s.municipio_id = p_municipio_id;
$$;

-- Conciliación: la misma lista nominal y los mismos votos deben salir de todas las tablas.
-- La usan el script de verificación previo al build y las comprobaciones posteriores a la carga.
create or replace function public.rpc_conciliacion()
returns table (
  eleccion_id   smallint,
  entidad_clave smallint,
  ln_entidad    bigint,
  ln_municipios bigint,
  ln_secciones  bigint,
  ln_tipo_secc  bigint,
  sv_entidad    bigint,
  sv_municipios bigint,
  sv_secciones  bigint,
  ok            boolean
)
language sql
stable
security invoker
set search_path = public
as $$
  with ent as (
    select a.eleccion_id, a.entidad_clave, a.ln::bigint as ln, a.sv::bigint as sv
    from public.agg_entidad a
    where a.sexo = 9 and a.grupo_edad_id = 0 and a.entidad_clave between 1 and 32
  ),
  mun as (
    select m.eleccion_id, mu.entidad_clave, sum(m.ln)::bigint as ln, sum(m.sv)::bigint as sv
    from public.agg_municipio m
    join public.municipios mu on mu.id = m.municipio_id
    where m.sexo = 9 and m.grupo_edad_id = 0
    group by 1, 2
  ),
  sec as (
    select s.eleccion_id, s.entidad_clave, sum(s.ln)::bigint as ln, sum(s.sv)::bigint as sv
    from public.secciones_resumen s
    group by 1, 2
  ),
  tip as (
    select t.eleccion_id, t.entidad_clave, sum(t.ln)::bigint as ln
    from public.agg_tipo_seccion t
    where t.sexo = 9 and t.grupo_edad_id = 0 and t.entidad_clave between 1 and 32
    group by 1, 2
  )
  select ent.eleccion_id, ent.entidad_clave,
         ent.ln, mun.ln, sec.ln, tip.ln,
         ent.sv, mun.sv, sec.sv,
         (ent.ln = mun.ln and ent.ln = sec.ln and ent.ln = tip.ln
          and ent.sv = mun.sv and ent.sv = sec.sv) as ok
  from ent
  left join mun using (eleccion_id, entidad_clave)
  left join sec using (eleccion_id, entidad_clave)
  left join tip using (eleccion_id, entidad_clave)
  order by ent.eleccion_id, ent.entidad_clave;
$$;
comment on function public.rpc_conciliacion() is 'Una fila por (elección, entidad). ok = false indica que las tablas no cuadran; la carga debe considerarse fallida.';
