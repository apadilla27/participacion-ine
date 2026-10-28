// Verificación de los datos del sitio. Corre como "prebuild": si algo no cuadra, el build falla y no se
// publica un sitio con cifras equivocadas o con celdas privadas expuestas.
//
//   node scripts/verificar-datos.mjs
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { z } from "zod";

const raiz = resolve(import.meta.dirname, "..");
const UMBRAL = 30;
// Anclas del reporte de validación del ETL (etl/sql/validate.sql, corrida completa): si cambian, cambió la fuente.
const ANCLAS = { FED2024: 55.83, PJ2025: 12.84 };

const fallas = [];
const falla = (msg) => fallas.push(msg);
const leer = (rel) => {
  const ruta = join(raiz, rel);
  if (!existsSync(ruta)) {
    falla(`Falta ${rel}. Corre npm run datos.`);
    return null;
  }
  return JSON.parse(readFileSync(ruta, "utf8"));
};

const Compacto = z.object({ v: z.string(), c: z.array(z.string()), f: z.array(z.array(z.union([z.string(), z.number(), z.null()]))) });
const Meta = z.object({
  v: z.string(),
  fecha_proceso: z.string(),
  umbral: z.literal(UMBRAL),
  nacional: z.array(z.object({ e: z.number(), clave: z.string(), ln: z.number(), sv: z.number(), pct: z.number() })).length(7),
  correcciones: z.object({ nombres: z.number(), reasignaciones: z.array(z.object({ anio: z.number(), entidad: z.number(), de: z.number(), a: z.number() })) }),
});
const Catalogo = z.object({
  v: z.string(),
  elecciones: z.array(z.object({ id: z.number(), clave: z.string(), slug: z.string(), anio: z.number() })).length(7),
  entidades: z.array(z.object({ clave: z.number(), nombre: z.string(), abrev: z.string() })).length(33),
  grupos: z.array(z.object({ id: z.number(), etiqueta: z.string() })).length(10),
});
const Geo = z.object({
  fuente: z.object({ cita: z.string(), licencia: z.string() }),
  trazos: z.array(z.object({ clave: z.number(), nombre: z.string(), d: z.string().min(10) })).length(32),
});

function validar(esquema, datos, nombre) {
  if (datos == null) return null;
  const r = esquema.safeParse(datos);
  if (!r.success) {
    falla(`${nombre}: forma inesperada (${r.error.issues[0]?.path.join(".")}: ${r.error.issues[0]?.message})`);
    return null;
  }
  return datos;
}

const meta = validar(Meta, leer("data/web/meta.json"), "meta.json");
const catalogo = validar(Catalogo, leer("data/web/catalogo.json"), "catalogo.json");
const municipios = validar(Compacto, leer("data/web/municipios.json"), "municipios.json");
const entidad = validar(Compacto, leer("public/datos/entidad.json"), "entidad.json");
const edad = validar(Compacto, leer("data/web/edad.json"), "edad.json");
const tipo = validar(Compacto, leer("data/web/tipo.json"), "tipo.json");
const modalidad = validar(Compacto, leer("data/web/modalidad.json"), "modalidad.json");
const geo = validar(Geo, leer("public/geo/entidades.json"), "entidades.json");

// 1. Misma versión en todos los archivos de datos
if (meta) {
  for (const [nombre, datos] of Object.entries({ catalogo, municipios, entidad, edad, tipo, modalidad })) {
    if (datos && datos.v !== meta.v) falla(`${nombre}.json es de la versión ${datos.v} y meta.json de ${meta.v}`);
  }
}

// 2. Participación nacional = meta = anclas del ETL
if (meta && entidad && catalogo) {
  for (const n of meta.nacional) {
    const fila = entidad.f.find(([e, ent, s, g]) => e === n.e && ent === 0 && s === 9 && g === 0);
    const pct = fila ? Math.round((10000 * fila[5]) / fila[4]) / 100 : null;
    if (pct !== n.pct) falla(`Nacional ${n.clave}: entidad.json da ${pct} y meta.json ${n.pct}`);
    if (n.clave in ANCLAS && n.pct !== ANCLAS[n.clave]) falla(`Nacional ${n.clave} = ${n.pct}; el ETL validado da ${ANCLAS[n.clave]}`);
  }
}

// 3. Privacidad (D46): celdas desagregadas con ln < 30 sin votos
function revisarPrivacidad(datos, nombre, esDesagregada, idxLn) {
  if (!datos) return;
  let expuestas = 0;
  for (const fila of datos.f) {
    if (esDesagregada(fila) && fila[idxLn] < UMBRAL && (fila[idxLn + 1] != null || fila[idxLn + 2] != null)) expuestas += 1;
  }
  if (expuestas) falla(`${nombre}: ${expuestas} celdas con menos de ${UMBRAL} personas traen votos`);
}
revisarPrivacidad(entidad, "entidad.json", ([, , s, g]) => s !== 9 || g !== 0, 4);
revisarPrivacidad(edad, "edad.json", () => true, 4);
revisarPrivacidad(tipo, "tipo.json", () => true, 5);

// 4. Archivos municipales: 6 federales × 32 + judicial × 31, privacidad y catálogo
const idsMunicipio = new Set((municipios?.f ?? []).map((fila) => fila[0]));
let archivos = 0;
const dirM = join(raiz, "public", "datos", "m");
if (!existsSync(dirM)) falla("Falta public/datos/m. Corre npm run datos.");
else {
  for (const eleccion of readdirSync(dirM)) {
    for (const archivo of readdirSync(join(dirM, eleccion))) {
      archivos += 1;
      const datos = JSON.parse(readFileSync(join(dirM, eleccion, archivo), "utf8"));
      if (meta && datos.v !== meta.v) falla(`m/${eleccion}/${archivo}: versión ${datos.v}`);
      revisarPrivacidad(datos, `m/${eleccion}/${archivo}`, ([, s, g]) => s !== 9 || g !== 0, 3);
      for (const clave of Object.keys(datos.mun)) {
        if (!idsMunicipio.has(datos.ent * 1000 + Number(clave))) falla(`m/${eleccion}/${archivo}: municipio ${clave} no está en el catálogo`);
      }
    }
  }
  if (archivos !== 6 * 32 + 31) falla(`Hay ${archivos} archivos municipales; se esperan ${6 * 32 + 31}`);
}

// 5. Chiapas 2018 reasignado (etl/remapeo_municipios.csv)
const chiapas = leer("public/datos/m/fed2018/7.json");
if (chiapas) {
  const total = (m) => chiapas.f.find(([mm, s, g]) => mm === m && s === 9 && g === 0)?.[3];
  if (chiapas.mun["122"] !== "Emiliano Zapata" || total(122) !== 2301 || total(120) !== 936) {
    falla("Chiapas 2018: las claves 120-124 no están reasignadas (ver etl/remapeo_municipios.csv)");
  }
}

// 6. Geometría con las 32 claves
if (geo) {
  const claves = geo.trazos.map((t) => t.clave).sort((a, b) => a - b);
  if (claves.some((c, i) => c !== i + 1)) falla("entidades.json: las claves no son 1-32");
}

if (fallas.length) {
  console.error(`verificar-datos: ${fallas.length} problema(s)`);
  for (const f of fallas) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`verificar-datos: OK · versión ${meta.v} · ${archivos} archivos municipales · privacidad y anclas en orden`);
