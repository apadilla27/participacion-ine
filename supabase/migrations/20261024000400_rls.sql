-- 0004 · Seguridad: lectura pública, escritura solo para el rol de carga (postgres / service_role)
-- Los GRANT son explícitos porque los proyectos nuevos de Supabase pueden tener desactivada
-- la exposición automática de tablas nuevas a la Data API (auto_expose_new_tables).

do $$
declare
  t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists lectura_publica on public.%I', t);
    execute format('create policy lectura_publica on public.%I for select to anon, authenticated using (true)', t);
  end loop;
end
$$;

grant usage on schema public to anon, authenticated;

grant select on
  public.elecciones,
  public.entidades,
  public.municipios,
  public.grupos_edad,
  public.metadatos,
  public.agg_entidad,
  public.agg_entidad_edad,
  public.agg_municipio,
  public.agg_tipo_seccion,
  public.secciones_resumen,
  public.agg_modalidad_voto,
  public.v_participacion_entidad,
  public.v_participacion_tipo_seccion,
  public.v_brecha_sexo_municipio
to anon, authenticated;

revoke insert, update, delete, truncate on all tables in schema public from anon, authenticated;

grant execute on function
  public.pct(bigint, bigint),
  public.rpc_ranking_municipios(smallint, smallint, smallint, integer),
  public.rpc_serie_entidad(smallint),
  public.rpc_secciones_municipio(smallint, integer),
  public.rpc_conciliacion()
to anon, authenticated;

notify pgrst, 'reload schema';
