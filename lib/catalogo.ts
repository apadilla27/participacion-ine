// Catálogos del sitio. Fuente única: data/web/catalogo.json, que exporta etl/export_web.py desde etl/seed.
// Se puede importar en servidor y navegador (pesa 6 KB).
import catalogo from "@/data/web/catalogo.json";

export type Eleccion = {
  id: number;
  clave: string;
  slug: string;
  anio: number;
  tipo: "federal" | "judicial";
  fecha: string;
  presidencial: boolean;
  marco: string;
  cargos: string;
  cubiertas: number;
};

export type Entidad = { clave: number; slug: string; nombre: string; corto: string; abrev: string; region: string | null };
export type Grupo = { id: number; etiqueta: string; min: number | null; max: number | null; amplio: string | null };

export const ELECCIONES = catalogo.elecciones as Eleccion[];
export const ENTIDADES = catalogo.entidades as Entidad[];
export const GRUPOS = catalogo.grupos as Grupo[];

/** Elección federal más reciente: la que usan portada, calculadora y difusión. */
export const RECIENTE = ELECCIONES.filter((e) => e.tipo === "federal").at(-1)!;

export const SEXOS = [
  { id: 9, etiqueta: "Todas las personas" },
  { id: 1, etiqueta: "Mujeres" },
  { id: 0, etiqueta: "Hombres" },
] as const;

export function eleccionPorSlug(slug: string | null | undefined) {
  return ELECCIONES.find((e) => e.slug === slug) ?? null;
}

export function eleccionPorId(id: number) {
  return ELECCIONES.find((e) => e.id === id)!;
}

export function entidad(clave: number) {
  return ENTIDADES.find((e) => e.clave === clave) ?? null;
}

/** Nombre para interfaz; la clave 0 es el país. */
export function nombreLugar(clave: number) {
  return clave === 0 ? "Todo el país" : entidad(clave)?.corto ?? "Entidad";
}

/** Etiqueta corta de una elección: "2024" o "Judicial 2025". */
export function etiquetaEleccion(e: Eleccion) {
  return e.tipo === "judicial" ? `Judicial ${e.anio}` : String(e.anio);
}

/** Fecha larga en español: "2 de junio de 2024". */
export function fechaLarga(iso: string) {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}
