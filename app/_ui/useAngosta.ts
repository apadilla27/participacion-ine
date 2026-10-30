"use client";

import { useSyncExternalStore } from "react";

const consulta = "(max-width: 767px)";

function suscribir(aviso: () => void) {
  const mq = window.matchMedia(consulta);
  mq.addEventListener("change", aviso);
  return () => mq.removeEventListener("change", aviso);
}

export const esAngosta = () => window.matchMedia(consulta).matches;

/** Pantalla angosta (menos de 768 px). En el servidor, y en el primer render al hidratar, se asume escritorio. */
export function useAngosta() {
  return useSyncExternalStore(suscribir, esAngosta, () => false);
}

const consultaAncha = "(min-width: 960px)";

function suscribirAncha(aviso: () => void) {
  const mq = window.matchMedia(consultaAncha);
  mq.addEventListener("change", aviso);
  return () => mq.removeEventListener("change", aviso);
}

/** Pantalla de computadora (960 px o más). En el servidor se asume que sí, igual que `useAngosta`. */
export function useAncha() {
  return useSyncExternalStore(suscribirAncha, () => window.matchMedia(consultaAncha).matches, () => true);
}
