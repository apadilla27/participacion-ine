// Tipos de los datos que el servidor entrega a los componentes. Sin dependencias de servidor:
// se pueden importar desde componentes cliente.
import type { Celda } from "@/lib/tasas";

export type Lectura = "todas" | "mujeres" | "hombres" | "joven" | "rural" | "urbana";

export const LECTURAS: { id: Lectura; nombre: string }[] = [
  { id: "todas", nombre: "Todas" },
  { id: "mujeres", nombre: "Mujeres" },
  { id: "hombres", nombre: "Hombres" },
  { id: "joven", nombre: "18 a 29" },
  { id: "rural", nombre: "Rural" },
  { id: "urbana", nombre: "Urbana" },
];

export type EleccionVista = {
  id: number;
  slug: string;
  anio: number;
  etiqueta: string;
  fecha: string;
  tipo: "federal" | "judicial";
  presidencial: boolean;
  cargos: string;
  /** Claves de entidad que no vienen en los datos abiertos de esa elección. */
  faltantes: number[];
};

export type PuntoCurva = { edad: number; todos: number | null; hombres: number | null; mujeres: number | null };

export type Momentos = {
  estreno: { edad: number; todos: number };
  alAnio: { edad: number; todos: number };
  piso: { edad: number; hombres: number; mujeres: number };
  cumbre: { edad: number; todos: number };
  volteo: { edad: number; hombres: number; mujeres: number } | null;
};

export type Banda = { etiqueta: string; todos: number | null; hombres: number | null; mujeres: number | null };

export type FilaSerie = {
  slug: string;
  etiqueta: string;
  tipo: "federal" | "judicial";
  presidencial: boolean;
  pct: number;
  joven: number | null;
};

export type Huella = {
  /** edades[entidad][sexo] = 83 celdas, de 18 a 100 años (100 = "100 o más"). */
  edades: Record<number, Record<number, Celda[]>>;
  /** grupos[entidad][sexo][grupo] con grupo 0 = todas las edades. */
  grupos: Record<number, Record<number, Celda[]>>;
};

export type Modalidad = { total: number; hombres: number; mujeres: number; top: { nombre: string; n: number }[] };

export type RelatoDatos = {
  reciente: string;
  elecciones: EleccionVista[];
  hero: {
    estreno: number;
    piso: { edad: number; hombres: number; mujeres: number };
    ln: number;
    pct: number;
    mujeres: number;
    hombres: number;
  };
  curvas: Record<string, { puntos: PuntoCurva[]; momentos: Momentos }>;
  bandas: Record<string, Banda[]>;
  serie: FilaSerie[];
  /** valores[eleccion][lectura][claveEntidad], clave 0 = país; null = sin dato. */
  mapa: Record<string, Record<Lectura, (number | null)[]>>;
  /** Lista nominal total por entidad en la elección reciente (para comparar escenarios). */
  listaReciente: number[];
  huella: Huella;
  llega: {
    prision: Modalidad;
    anticipado: Modalidad;
    noBinario: { ln: number; pct: number | null; entidades: number };
    judicial: { pct: number; veinte: number | null; faltantes: string[]; fecha: string } | null;
  };
};
