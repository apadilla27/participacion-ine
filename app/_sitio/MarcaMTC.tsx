/**
 * "M" de Make the Change: la diagonal derecha sube como flecha. Paleta INE (D39).
 * `trazo` pinta las patas y `flecha` la flecha; sobre la franja rosa del cierre van en blanco y vino.
 */
export function MarcaMTC({
  tamano = 40,
  titulo,
  trazo = "#1d1d1b",
  flecha = "#d5007f",
}: {
  tamano?: number;
  titulo?: string;
  trazo?: string;
  flecha?: string;
}) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 64 64"
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
    >
      <path d="M11 54V12l21 24" fill="none" stroke={trazo} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 36l17-20" fill="none" stroke={flecha} strokeWidth="8" strokeLinecap="round" />
      <path d="M41 11h14v14" fill="none" stroke={flecha} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M53 33v21" fill="none" stroke={trazo} strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}
