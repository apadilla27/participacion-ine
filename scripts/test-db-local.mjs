// Prueba local, sin Docker ni Supabase, de las migraciones y de la salida del ETL.
// Usa PGlite (PostgreSQL 17 compilado a WebAssembly): aplica supabase/migrations en orden,
// carga supabase/seed + la carpeta out/ del ETL y ejecuta las mismas comprobaciones que etl/load.py.
//
// Uso:  node scripts/test-db-local.mjs [carpeta_out]
//       (por defecto %USERPROFILE%\participacion-ine-etl\out)

import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';

const raiz = resolve(import.meta.dirname, '..');
const entrada = resolve(process.argv[2] ?? join(homedir(), 'participacion-ine-etl', 'out'));
const migraciones = join(raiz, 'supabase', 'migrations');
const semillas = join(raiz, 'supabase', 'seed');

const ORDEN = [
  ['elecciones', semillas], ['entidades', semillas], ['grupos_edad', semillas],
  ['municipios', entrada], ['agg_entidad', entrada], ['agg_entidad_edad', entrada],
  ['agg_municipio', entrada], ['agg_tipo_seccion', entrada], ['secciones_resumen', entrada],
  ['agg_modalidad_voto', entrada], ['metadatos', entrada],
];

let fallas = 0;
const ok = (m) => console.log(`  OK     ${m}`);
const falla = (m) => { fallas += 1; console.log(`  FALLA  ${m}`); };
const t0 = Date.now();
const seg = () => `${((Date.now() - t0) / 1000).toFixed(1)} s`;

if (!existsSync(join(entrada, 'metadatos.csv'))) {
  console.error(`No existe ${join(entrada, 'metadatos.csv')}. Corre primero etl/run_etl.py.`);
  process.exit(1);
}

const db = await PGlite.create();
// Roles que Supabase trae de fábrica y que las migraciones referencian.
await db.exec('create role anon nologin; create role authenticated nologin; create role service_role nologin;');

console.log('Migraciones');
for (const archivo of readdirSync(migraciones).filter((f) => f.endsWith('.sql')).sort()) {
  await db.exec(readFileSync(join(migraciones, archivo), 'utf8'));
  ok(`${archivo} (${seg()})`);
}

console.log(`Carga desde ${entrada}`);
for (const [tabla, carpeta] of ORDEN) {
  const ruta = join(carpeta, `${tabla}.csv`);
  const columnas = readFileSync(ruta, 'utf8').split(/\r?\n/, 1)[0];
  await db.query(`COPY public.${tabla} (${columnas}) FROM '/dev/blob' WITH (FORMAT csv, HEADER true)`, [], {
    blob: new Blob([readFileSync(ruta)]),
  });
  const { rows } = await db.query(`select count(*)::int as n from public.${tabla}`);
  ok(`${tabla}: ${rows[0].n.toLocaleString('es-MX')} filas (${seg()})`);
}
await db.exec('analyze');

console.log('Comprobaciones');
const meta = Object.fromEntries(
  readFileSync(join(entrada, 'metadatos.csv'), 'utf8').split(/\r?\n/).slice(1).filter(Boolean)
    .map((l) => { const i = l.indexOf(','); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, '')]; }),
);
for (const [clave, valor] of Object.entries(meta)) {
  if (!clave.startsWith('filas_') || clave === 'filas_fuente') continue;
  const tabla = clave.slice(6);
  const { rows } = await db.query(`select count(*)::int as n from public.${tabla}`);
  (rows[0].n === Number(valor) ? ok : falla)(`${tabla} = metadatos (${rows[0].n})`);
}

const conc = await db.query('select count(*)::int as total, count(*) filter (where ok is not true)::int as malas from public.rpc_conciliacion()');
const esperadas = meta.alcance === 'completo' ? 6 * 32 + 31 : conc.rows[0].total;
(conc.rows[0].malas === 0 && conc.rows[0].total === esperadas ? ok : falla)(
  `rpc_conciliacion: ${conc.rows[0].total} combinaciones, ${conc.rows[0].malas} no cuadran (esperadas ${esperadas})`);

// Lectura pública como anon (RLS + GRANT) y prohibición de escritura
await db.exec('set role anon');
const medir = async (etiqueta, consulta, params = []) => {
  const t = Date.now();
  const { rows } = await db.query(consulta, params);
  return { rows, ms: Date.now() - t, etiqueta };
};
const pruebas = [
  await medir('v_participacion_entidad', 'select count(*)::int as n from public.v_participacion_entidad'),
  await medir('rpc_serie_entidad(0)', 'select count(*)::int as n from public.rpc_serie_entidad(0::smallint)'),
  await medir('rpc_ranking_municipios(FED2024, Oaxaca)', 'select jsonb_array_length(public.rpc_ranking_municipios(6::smallint, 20::smallint)) as n'),
  await medir('rpc_ranking_municipios(PJ2025, Edomex, 18-19)', 'select jsonb_array_length(public.rpc_ranking_municipios(7::smallint, 15::smallint, 1::smallint)) as n'),
  // Ecatepec de Morelos = clave INE 15034 (en INEGI es 15033: las claves no coinciden)
  await medir('rpc_secciones_municipio(FED2024, Ecatepec)', 'select jsonb_array_length(public.rpc_secciones_municipio(6::smallint, 15034)) as n'),
  await medir('v_brecha_sexo_municipio(Ecatepec)', 'select count(*)::int as n from public.v_brecha_sexo_municipio where municipio_id = 15034'),
  await medir('v_participacion_tipo_seccion(nacional)', 'select count(*)::int as n from public.v_participacion_tipo_seccion where entidad_clave = 0'),
];
for (const p of pruebas) (p.rows[0].n > 0 ? ok : falla)(`anon · ${p.etiqueta}: ${p.rows[0].n} filas en ${p.ms} ms`);
try {
  await db.query("insert into public.metadatos (clave, valor) values ('prueba', 'x')");
  falla('anon pudo escribir en metadatos');
} catch (e) {
  (/permission denied/i.test(e.message) ? ok : falla)(`anon no puede escribir: ${e.message}`);
}
await db.exec('reset role');

const nac = await db.query(`select eleccion, sexo, pct from public.rpc_serie_entidad(0::smallint) where sexo = 9 order by anio`);
console.log('  Participación nacional (sv / ln): ' + nac.rows.map((r) => `${r.eleccion} ${r.pct}%`).join(' · '));

const tam = await db.query(`
  select relname as tabla, pg_total_relation_size(c.oid)::bigint as bytes
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' order by 2 desc`);
const total = tam.rows.reduce((s, r) => s + Number(r.bytes), 0);
console.log(`  Tamaño de las tablas (datos + índices): ${(total / 1048576).toFixed(1)} MB`);
for (const r of tam.rows) console.log(`         ${r.tabla.padEnd(22)} ${(Number(r.bytes) / 1048576).toFixed(1)} MB`);
(total < 300 * 1048576 ? ok : falla)('cabe con margen en el plan Free (500 MB por proyecto)');

await db.close();
console.log(fallas === 0 ? `PRUEBA LOCAL APROBADA (${seg()})` : `PRUEBA LOCAL CON ${fallas} FALLAS`);
process.exit(fallas === 0 ? 0 : 1);
