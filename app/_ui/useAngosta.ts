"use client";

import { useSyncExternalStore } from "react";

const consulta = "(max-width: 767px)";

function suscribir(aviso: () => void) {
  const mq = window.matchMedia(consulta);
  mq.addEventListener("change", aviso);
  return () => mq.removeEventListener("change", aviso);
}

/** Pantalla angosta (menos de 768 px). En el servidor se asume escritorio. */
export function useAngosta() {
  return useSyncExternalStore(suscribir, () => window.matchMedia(consulta).matches, () => false);
}
