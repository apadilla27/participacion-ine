import estilos from "./ui.module.css";

/** Pastel "de cada 100": la rebanada rosa son quienes votaron. Sin dato → disco con trama y texto. */
export function Pastel({ valor, titulo, tamano = 160 }: { valor: number | null; titulo: string; tamano?: number | string }) {
  const rebanada = valor == null ? 0 : Math.min(100, Math.max(0, valor));
  return (
    <div
      className={estilos.pastel}
      data-vacio={valor == null}
      role="img"
      aria-label={titulo}
      style={{ width: tamano, height: tamano, ["--voto" as string]: `${rebanada}%` }}
    />
  );
}
