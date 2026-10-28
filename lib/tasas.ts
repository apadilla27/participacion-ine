// Aritmética de participación. Una celda es [ln, sv]; sv es null cuando la celda está protegida (ln < 30).
export type Celda = readonly [ln: number, sv: number | null];

/** Porcentaje con 2 decimales, o null si no hay lista o la celda está protegida. */
export function tasa(celda: Celda | null | undefined): number | null {
  if (!celda || celda[0] <= 0 || celda[1] == null) return null;
  return Math.round((10000 * celda[1]) / celda[0]) / 100;
}

/** Suma celdas; si alguna está protegida, el votos del total no se conoce (null). */
export function sumar(celdas: (Celda | null | undefined)[]): Celda {
  let ln = 0;
  let sv: number | null = 0;
  for (const c of celdas) {
    if (!c) continue;
    ln += c[0];
    sv = sv == null || c[1] == null ? null : sv + c[1];
  }
  return [ln, sv];
}
