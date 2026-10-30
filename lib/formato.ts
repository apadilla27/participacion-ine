// Formato de números y palabras del sitio (D45, D58). Toda cifra y todo término pasan por aquí.

export const ENTEROS = new Intl.NumberFormat("es-MX");
export const CIEN = new Intl.NumberFormat("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "57.51 de cada 100" */
export function deCada(valor: number) {
  return `${CIEN.format(valor)} de cada 100`;
}

/** Celda de "Diferencia" en tablas, con palabras en lugar de signos: "7.92 menos", "23.10 más", "igual". */
export function diferencia(valor: number, referencia: number) {
  const d = Math.round((valor - referencia) * 100) / 100;
  if (d === 0) return "igual";
  return `${CIEN.format(Math.abs(d))} ${d > 0 ? "más" : "menos"}`;
}

/**
 * La comparación se dice con palabras, sin "puntos" (D58): "igual que", "casi igual que",
 * "un poco más que", "más que"… La diferencia exacta queda en la otra cifra, que siempre se muestra.
 */
export function cuanto(valor: number, referencia: number) {
  const d = Math.round((valor - referencia) * 100) / 100;
  const distancia = Math.abs(d);
  if (distancia === 0) return "igual que";
  if (distancia < 1) return "casi igual que";
  const lado = d > 0 ? "más" : "menos";
  return distancia < 5 ? `un poco ${lado} que` : `${lado} que`;
}

/** "un poco menos que en Oaxaca (54.66 de cada 100)". `lugar` lleva su preposición: "en Oaxaca". */
export function frente(valor: number, referencia: number, lugar: string) {
  return `${cuanto(valor, referencia)} ${lugar} (${deCada(referencia)})`;
}

export function frenteAlPais(valor: number, pais: number) {
  return frente(valor, pais, "en todo el país");
}

/** Mensajes que se repiten en varias pantallas. */
export const TERMINOS = {
  umbral: "En este grupo hay menos de 30 personas. Para cuidar su privacidad, no mostramos cuántas votaron.",
} as const;
