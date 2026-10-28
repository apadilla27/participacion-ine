// Formato de números y glosario único del sitio (D45). Toda cifra y todo término pasan por aquí.

export const ENTEROS = new Intl.NumberFormat("es-MX");
export const CIEN = new Intl.NumberFormat("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "57.51 de cada 100" */
export function deCada(valor: number) {
  return `${CIEN.format(valor)} de cada 100`;
}

/** "+3.20" o "−3.20" (signo menos tipográfico). */
export function firmado(valor: number) {
  const texto = CIEN.format(Math.abs(valor));
  if (valor > 0) return `+${texto}`;
  if (valor < 0) return `−${texto}`;
  return texto;
}

/** "3.20 puntos más que el país" / "1.05 puntos menos que el país" */
export function frenteAlPais(valor: number, pais: number) {
  const diferencia = Math.round((valor - pais) * 100) / 100;
  if (diferencia === 0) return "igual que el país";
  return `${CIEN.format(Math.abs(diferencia))} puntos ${diferencia > 0 ? "más" : "menos"} que el país`;
}

/** Glosario D45: los mismos términos en todas las pantallas. */
export const TERMINOS = {
  votaron: "votaron",
  noVotaron: "no votaron",
  sinDato: "sin dato",
  lista: "lista nominal",
  definicionParticipacion:
    "Participación = personas con marca de voto en el cuadernillo de la casilla (SV) entre la lista nominal (LN).",
  definicionSinDato:
    "Sin dato (NS) son registros que no se pudieron leer: cuadernillos sin marcas, no disponibles o con páginas faltantes.",
  umbral: "Hay menos de 30 personas en este corte. Para proteger su privacidad no mostramos cuántas votaron.",
} as const;
