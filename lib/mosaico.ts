// Cuadrícula geográfica aproximada de las 32 entidades: 7 columnas × 6 filas. Con casillas de 46 px y
// 2 px de separación mide 334 px de ancho y cabe en un teléfono de 375 px (plan §5.2, Vista Mosaico).
// [clave, columna, fila], con columna y fila desde 0.
export const MOSAICO: readonly (readonly [number, number, number])[] = [
  [2, 0, 0], [26, 1, 0], [8, 2, 0], [5, 3, 0], [19, 4, 0], [28, 5, 0],
  [3, 0, 1], [25, 1, 1], [10, 2, 1], [32, 3, 1], [24, 4, 1], [30, 5, 1],
  [18, 1, 2], [1, 2, 2], [11, 3, 2], [22, 4, 2], [13, 5, 2], [31, 6, 2],
  [14, 1, 3], [16, 2, 3], [15, 3, 3], [9, 4, 3], [29, 5, 3], [23, 6, 3],
  [6, 1, 4], [12, 2, 4], [17, 3, 4], [21, 4, 4], [27, 5, 4], [4, 6, 4],
  [20, 3, 5], [7, 4, 5],
];

export const COLUMNAS = 7;
export const FILAS = 6;
