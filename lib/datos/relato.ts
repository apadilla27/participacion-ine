// Datos del relato (portada) y de las páginas que citan sus cifras. Solo servidor: importa los JSON
// exportados por etl/export_web.py, que quedan empaquetados en el build (sin fs ni rutas en runtime).
import "server-only";
import entidadJson from "@/public/datos/entidad.json";
import edadJson from "@/data/web/edad.json";
import tipoJson from "@/data/web/tipo.json";
import modalidadJson from "@/data/web/modalidad.json";
import { ELECCIONES, ENTIDADES, RECIENTE, etiquetaEleccion, nombreLugar, type Eleccion } from "@/lib/catalogo";
import { sumar, tasa, type Celda } from "@/lib/tasas";
import { leerCuboEntidad, type Compacto } from "./cubo";
import type {
  Banda,
  EleccionVista,
  FilaSerie,
  Huella,
  Lectura,
  Modalidad,
  Momentos,
  PuntoCurva,
  RelatoDatos,
} from "./tipos";

export const cubo = leerCuboEntidad(entidadJson as unknown as Compacto);

const indiceEdad = new Map<string, Celda>();
for (const [e, ent, s, edad, ln, sv] of (edadJson as unknown as Compacto).f as [number, number, number, number, number, number | null][]) {
  indiceEdad.set(`${e}:${ent}:${s}:${edad}`, [ln, sv]);
}
const indiceTipo = new Map<string, Celda>();
for (const [e, ent, t, s, g, ln, sv] of (tipoJson as unknown as Compacto).f as [number, number, string, number, number, number, number | null][]) {
  indiceTipo.set(`${e}:${ent}:${t}:${s}:${g}`, [ln, sv]);
}

const edadCelda = (e: number, ent: number, s: number, edad: number) => indiceEdad.get(`${e}:${ent}:${s}:${edad}`) ?? null;
const tipoCelda = (e: number, ent: number, t: "U" | "M" | "R", s: number, g: number) =>
  indiceTipo.get(`${e}:${ent}:${t}:${s}:${g}`) ?? null;

const CLAVES = Array.from({ length: 33 }, (_, i) => i);
const EDADES = Array.from({ length: 83 }, (_, i) => i + 18);
const JOVENES = [1, 2, 3];

const BANDAS: [string, number, number][] = [
  ["18", 18, 18],
  ["19", 19, 19],
  ["20 a 24", 20, 24],
  ["25 a 29", 25, 29],
  ["30 a 39", 30, 39],
  ["40 a 49", 40, 49],
  ["50 a 59", 50, 59],
  ["60 a 69", 60, 69],
  ["70 a 79", 70, 79],
  ["80 o más", 80, 100],
];

function vista(e: Eleccion): EleccionVista {
  const presentes = new Set(cubo.entidades(e.id));
  return {
    id: e.id,
    slug: e.slug,
    anio: e.anio,
    etiqueta: etiquetaEleccion(e),
    fecha: e.fecha,
    tipo: e.tipo,
    presidencial: e.presidencial,
    cargos: e.cargos,
    faltantes: ENTIDADES.filter((x) => x.clave > 0 && !presentes.has(x.clave)).map((x) => x.clave),
  };
}

function exigir<T>(valor: T | null | undefined, que: string): T {
  if (valor == null) throw new Error(`Dato faltante en los JSON del sitio: ${que}. Corre npm run datos.`);
  return valor;
}

function curva(e: Eleccion): { puntos: PuntoCurva[]; momentos: Momentos } {
  const puntos = EDADES.map((edad) => ({
    edad,
    todos: tasa(edadCelda(e.id, 0, 9, edad)),
    hombres: tasa(edadCelda(e.id, 0, 0, edad)),
    mujeres: tasa(edadCelda(e.id, 0, 1, edad)),
  }));
  const completos = puntos.filter((p) => p.todos != null && p.hombres != null && p.mujeres != null) as {
    edad: number;
    todos: number;
    hombres: number;
    mujeres: number;
  }[];
  const en = (edad: number) => exigir(completos.find((p) => p.edad === edad), `curva ${e.clave} edad ${edad}`);
  const jovenes = completos.filter((p) => p.edad <= 40);
  const madurez = completos.filter((p) => p.edad >= 50 && p.edad <= 80);
  const piso = jovenes.reduce((a, b) => (b.hombres < a.hombres ? b : a));
  const cumbre = madurez.reduce((a, b) => (b.todos > a.todos ? b : a));
  const volteo = completos.find((p) => p.edad >= 60 && p.hombres > p.mujeres) ?? null;
  return {
    puntos,
    momentos: {
      estreno: { edad: 18, todos: en(18).todos },
      alAnio: { edad: 19, todos: en(19).todos },
      piso: { edad: piso.edad, hombres: piso.hombres, mujeres: piso.mujeres },
      cumbre: { edad: cumbre.edad, todos: cumbre.todos },
      volteo: volteo ? { edad: volteo.edad, hombres: volteo.hombres, mujeres: volteo.mujeres } : null,
    },
  };
}

function bandas(e: Eleccion): Banda[] {
  const rango = (s: number, desde: number, hasta: number) =>
    tasa(sumar(EDADES.filter((x) => x >= desde && x <= hasta).map((x) => edadCelda(e.id, 0, s, x))));
  return BANDAS.map(([etiqueta, desde, hasta]) => ({
    etiqueta,
    todos: rango(9, desde, hasta),
    hombres: rango(0, desde, hasta),
    mujeres: rango(1, desde, hasta),
  }));
}

function jovenDe(e: number, ent: number, s = 9) {
  return tasa(sumar(JOVENES.map((g) => cubo.celda(e, ent, s, g))));
}

function valoresMapa(e: Eleccion): Record<Lectura, (number | null)[]> {
  return {
    todas: CLAVES.map((k) => tasa(cubo.celda(e.id, k, 9, 0))),
    mujeres: CLAVES.map((k) => tasa(cubo.celda(e.id, k, 1, 0))),
    hombres: CLAVES.map((k) => tasa(cubo.celda(e.id, k, 0, 0))),
    joven: CLAVES.map((k) => jovenDe(e.id, k)),
    rural: CLAVES.map((k) => tasa(tipoCelda(e.id, k, "R", 9, 0))),
    urbana: CLAVES.map((k) => tasa(tipoCelda(e.id, k, "U", 9, 0))),
  };
}

function modalidad(nombre: "prision_preventiva" | "voto_anticipado"): Modalidad {
  const filas = (modalidadJson as unknown as Compacto).f as [string, number, number | null, number, number, number][];
  let total = 0;
  let hombres = 0;
  let mujeres = 0;
  const porEntidad = new Map<number, number>();
  for (const [mod, ent, , , s, personas] of filas) {
    if (mod !== nombre) continue;
    if (s === 9) {
      total += personas;
      porEntidad.set(ent, (porEntidad.get(ent) ?? 0) + personas);
    } else if (s === 0) hombres += personas;
    else if (s === 1) mujeres += personas;
  }
  const top = [...porEntidad.entries()]
    .map(([clave, n]) => ({ nombre: nombreLugar(clave), n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 5);
  return { total, hombres, mujeres, top };
}

function armar(): RelatoDatos {
  const reciente = RECIENTE;
  const curvas = Object.fromEntries(ELECCIONES.map((e) => [e.slug, curva(e)]));
  const total = exigir(cubo.celda(reciente.id, 0, 9, 0), "país reciente");
  const m = curvas[reciente.slug].momentos;

  const serie: FilaSerie[] = ELECCIONES.map((e) => ({
    slug: e.slug,
    etiqueta: etiquetaEleccion(e),
    tipo: e.tipo,
    presidencial: e.presidencial,
    pct: exigir(tasa(cubo.celda(e.id, 0, 9, 0)), `serie ${e.clave}`),
    joven: jovenDe(e.id, 0),
  }));

  const huella: Huella = { edades: {}, grupos: {} };
  for (const ent of CLAVES) {
    huella.edades[ent] = {};
    huella.grupos[ent] = {};
    for (const s of [0, 1, 9]) {
      huella.edades[ent][s] = EDADES.map((edad) => edadCelda(reciente.id, ent, s, edad) ?? ([0, null] as const));
      huella.grupos[ent][s] = Array.from({ length: 10 }, (_, g) => cubo.celda(reciente.id, ent, s, g) ?? ([0, null] as const));
    }
  }

  const nb = cubo.celda(reciente.id, 0, 2, 0);
  const judicial = ELECCIONES.find((e) => e.tipo === "judicial");
  const vistaJudicial = judicial ? vista(judicial) : null;

  return {
    reciente: reciente.slug,
    elecciones: ELECCIONES.map(vista),
    hero: {
      estreno: m.estreno.todos,
      piso: m.piso,
      ln: total[0],
      pct: exigir(tasa(total), "pct país"),
      mujeres: exigir(tasa(cubo.celda(reciente.id, 0, 1, 0)), "pct mujeres"),
      hombres: exigir(tasa(cubo.celda(reciente.id, 0, 0, 0)), "pct hombres"),
    },
    curvas,
    bandas: Object.fromEntries(ELECCIONES.map((e) => [e.slug, bandas(e)])),
    serie,
    mapa: Object.fromEntries(ELECCIONES.map((e) => [e.slug, valoresMapa(e)])),
    listaReciente: CLAVES.map((k) => cubo.celda(reciente.id, k, 9, 0)?.[0] ?? 0),
    huella,
    llega: {
      prision: modalidad("prision_preventiva"),
      anticipado: modalidad("voto_anticipado"),
      noBinario: {
        ln: nb?.[0] ?? 0,
        pct: tasa(nb),
        entidades: CLAVES.filter((k) => k > 0 && cubo.celda(reciente.id, k, 2, 0) != null).length,
      },
      judicial:
        judicial && vistaJudicial
          ? {
              pct: exigir(tasa(cubo.celda(judicial.id, 0, 9, 0)), "pct judicial"),
              veinte: tasa(cubo.celda(judicial.id, 0, 9, 2)),
              faltantes: vistaJudicial.faltantes.map(nombreLugar),
              fecha: judicial.fecha,
            }
          : null,
    },
  };
}

let memo: RelatoDatos | null = null;

/** Datos de la portada. Se calculan una vez por proceso de build. */
export function datosRelato(): RelatoDatos {
  memo ??= armar();
  return memo;
}

/** Entidades ordenadas por participación en la elección reciente (para difusión y textos). */
export function rankingReciente() {
  const valores = datosRelato().mapa[RECIENTE.slug].todas;
  return CLAVES.filter((k) => k > 0 && valores[k] != null)
    .map((k) => ({ clave: k, nombre: nombreLugar(k), pct: valores[k] as number }))
    .sort((a, b) => b.pct - a.pct);
}
