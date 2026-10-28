// Metadatos del sitio (versión de datos, fuentes) y geometría del mapa. Solo servidor.
import "server-only";
import meta from "@/data/web/meta.json";
import geo from "@/public/geo/entidades.json";
import type { Trazo } from "./tipos-geo";

export const META = meta as {
  v: string;
  fecha_proceso: string;
  fecha_exportacion: string;
  fuente: { nombre: string; url: string };
  umbral: number;
  nacional: { e: number; clave: string; ln: number; sv: number; pct: number }[];
  archivos_municipio: number;
  correcciones: { nombres: number; reasignaciones: { anio: number; entidad: number; de: number; a: number }[] };
};

export const GEO = geo as {
  viewBox: [number, number, number, number];
  fuente: { cita: string; licencia: string; licencia_url: string; url: string; transformacion: string };
  trazos: Trazo[];
};

/** "27 de octubre de 2026 (versión 21f4e10f)" */
export function versionDatos() {
  const fecha = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(META.fecha_proceso),
  );
  return { fecha, corta: META.v.split("-")[1]?.slice(0, 8) ?? META.v, completa: META.v };
}
