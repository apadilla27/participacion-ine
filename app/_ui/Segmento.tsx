"use client";

import { useId, useRef } from "react";
import estilos from "./ui.module.css";

type Opcion<T extends string> = { id: T; nombre: string };

/**
 * Grupo de opciones excluyentes (radiogroup) con una sola parada de tabulación: las flechas cambian
 * la opción, Inicio y Fin van a los extremos. Cada opción mide al menos 44 px de alto.
 */
export function Segmento<T extends string>({
  etiqueta,
  opciones,
  valor,
  onCambio,
  columnasMovil,
}: {
  etiqueta: string;
  opciones: Opcion<T>[];
  valor: T | null;
  onCambio: (id: T) => void;
  /** Columnas en pantallas angostas (por defecto, todas en una fila con desplazamiento). */
  columnasMovil?: number;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const idEtiqueta = useId();
  const actual = Math.max(0, opciones.findIndex((o) => o.id === valor));

  function mover(indice: number) {
    const n = opciones.length;
    const siguiente = (indice + n) % n;
    onCambio(opciones[siguiente].id);
    refs.current[siguiente]?.focus();
  }

  return (
    <div className={estilos.segmentoCaja}>
      <span className={estilos.segmentoEtiqueta} id={idEtiqueta}>
        {etiqueta}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={idEtiqueta}
        className={estilos.segmento}
        style={columnasMovil ? { ["--cols" as string]: columnasMovil } : undefined}
        data-rejilla={columnasMovil ? "true" : "false"}
        onKeyDown={(evento) => {
          if (evento.key === "ArrowRight" || evento.key === "ArrowDown") {
            evento.preventDefault();
            mover(actual + 1);
          } else if (evento.key === "ArrowLeft" || evento.key === "ArrowUp") {
            evento.preventDefault();
            mover(actual - 1);
          } else if (evento.key === "Home") {
            evento.preventDefault();
            mover(0);
          } else if (evento.key === "End") {
            evento.preventDefault();
            mover(opciones.length - 1);
          }
        }}
      >
        {opciones.map((o, i) => {
          const elegido = o.id === valor;
          return (
            <button
              key={o.id}
              ref={(nodo) => {
                refs.current[i] = nodo;
              }}
              type="button"
              role="radio"
              aria-checked={elegido}
              tabIndex={i === actual ? 0 : -1}
              className={estilos.segmentoOpcion}
              onClick={() => onCambio(o.id)}
            >
              {o.nombre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
