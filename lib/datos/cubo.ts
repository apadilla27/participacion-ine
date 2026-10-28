// Lectura de los JSON compactos que exporta etl/export_web.py. Se usa en servidor y en navegador
// (el explorador descarga public/datos/entidad.json y public/datos/m/**). Un solo dueño del formato.
import type { Celda } from "@/lib/tasas";

/** Formato compacto: { v, c: nombres de columna, f: filas }. */
export type Compacto = { v: string; c: string[]; f: (string | number | null)[][] };

export type CuboEntidad = {
  version: string;
  /** Celda de entidad (0 = país) × sexo (0, 1, 2, 9) × grupo (0 = todas). */
  celda: (eleccionId: number, entidad: number, sexo: number, grupo: number) => Celda | null;
  /** Entidades con datos en una elección (Campeche no viene en la judicial 2025). */
  entidades: (eleccionId: number) => number[];
};

export function leerCuboEntidad(json: Compacto): CuboEntidad {
  const indice = new Map<string, Celda>();
  const presentes = new Map<number, Set<number>>();
  for (const [e, ent, s, g, ln, sv] of json.f as [number, number, number, number, number, number | null][]) {
    indice.set(`${e}:${ent}:${s}:${g}`, [ln, sv]);
    if (ent > 0) {
      if (!presentes.has(e)) presentes.set(e, new Set());
      presentes.get(e)!.add(ent);
    }
  }
  return {
    version: json.v,
    celda: (e, ent, s, g) => indice.get(`${e}:${ent}:${s}:${g}`) ?? null,
    entidades: (e) => [...(presentes.get(e) ?? [])].sort((a, b) => a - b),
  };
}

export type ArchivoMunicipios = Compacto & { e: string; ent: number; mun: Record<string, string> };

export type CuboMunicipios = {
  version: string;
  municipios: { clave: number; nombre: string }[];
  celda: (municipio: number, sexo: number, grupo: number) => Celda | null;
};

export function leerCuboMunicipios(json: ArchivoMunicipios): CuboMunicipios {
  const indice = new Map<string, Celda>();
  for (const [m, s, g, ln, sv] of json.f as [number, number, number, number, number | null][]) {
    indice.set(`${m}:${s}:${g}`, [ln, sv]);
  }
  const municipios = Object.entries(json.mun)
    .map(([clave, nombre]) => ({ clave: Number(clave), nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es-MX"));
  return { version: json.v, municipios, celda: (m, s, g) => indice.get(`${m}:${s}:${g}`) ?? null };
}

/** Ruta pública del archivo municipal de una elección y entidad. */
export function rutaMunicipios(eleccionSlug: string, entidad: number) {
  return `/datos/m/${eleccionSlug}/${entidad}.json`;
}
