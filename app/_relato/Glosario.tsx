import type { ReactNode } from "react";
import estilos from "./relato.module.css";

// Íconos dibujados a mano en una rejilla de 32, trazo de 2.25 y remates redondos (D59).
const ICONOS: Record<string, ReactNode> = {
  lista: (
    <>
      <rect x="8" y="5" width="16" height="22" rx="2" />
      <path d="M12 11h8M12 16h8M12 21h5" />
    </>
  ),
  casilla: (
    <>
      <path d="M4 14h24M7 14v13M25 14v13" />
      <path d="M11 14V8h10v6M14 5h4" />
    </>
  ),
  conteo: (
    <>
      <path d="M6 15h20v12H6z" />
      <path d="M11 15V6h10v9M14 10h4" />
    </>
  ),
  diferencia: (
    <>
      <path d="M5 27h22" />
      <path d="M10 27V15M16 27V8M22 27v-6" />
    </>
  ),
  entidad: (
    <>
      <path d="M16 28s8-7.5 8-14a8 8 0 0 0-16 0c0 6.5 8 14 8 14z" />
      <circle cx="16" cy="14" r="3" />
    </>
  ),
  municipio: (
    <>
      <path d="m5 15 11-9 11 9" />
      <path d="M8 13v14h16V13M14 27v-6h4v6" />
    </>
  ),
  eleccion: (
    <>
      <rect x="5" y="7" width="22" height="20" rx="2" />
      <path d="M5 13h22M11 4v6M21 4v6" />
    </>
  ),
  zona: (
    <>
      <path d="M4 27h24M9 27v-9" />
      <circle cx="9" cy="14" r="4" />
      <path d="M17 27V9h9v18M20 13h3M20 17h3M20 21h3" />
    </>
  ),
  sinDato: (
    <>
      <rect x="6" y="6" width="20" height="20" rx="3" />
      <path d="M6 16 16 6M6 26 26 6M16 26 26 16" />
    </>
  ),
};

// Ejemplo fijo y redondo para explicar la idea; no es un dato de ninguna elección.
const VOTARON = 60;

const PALABRAS: { icono: keyof typeof ICONOS; termino: string; definicion: string }[] = [
  {
    icono: "lista",
    termino: "Lista nominal",
    definicion:
      "La lista de todas las personas que pueden votar porque tienen su credencial para votar y no ha vencido. Cada casilla tiene su parte de la lista.",
  },
  {
    icono: "casilla",
    termino: "Casilla",
    definicion: "El lugar donde votas el día de la elección, con su mesa y sus urnas. Te toca la de la zona donde vives, según tu credencial.",
  },
  {
    icono: "conteo",
    termino: "Conteos censales",
    definicion:
      "El INE revisó la lista de cada casilla del país y contó quién votó y quién no. No es una encuesta: cuenta a todas las personas, no a unas cuantas.",
  },
  {
    icono: "diferencia",
    termino: "Diferencia",
    definicion:
      "Cuántas personas de cada 100 separan a dos grupos. Si en un grupo votan 60 de cada 100 y en otro 50 de cada 100, la diferencia es de 10.",
  },
  {
    icono: "entidad",
    termino: "Entidad",
    definicion: "Cada una de las 32 partes de México: los 31 estados y la Ciudad de México.",
  },
  {
    icono: "municipio",
    termino: "Municipio",
    definicion:
      "Una parte de la entidad con su propio gobierno, como tu ciudad o tu pueblo. En la Ciudad de México se llaman alcaldías.",
  },
  {
    icono: "eleccion",
    termino: "Presidencial, intermedia y judicial",
    definicion:
      "En la presidencial se elige a quien gobierna el país (2012, 2018 y 2024). En la intermedia, solo a diputadas y diputados (2009, 2015 y 2021). En la judicial de 2025 se votó por primera vez por juezas, jueces, ministras y ministros.",
  },
  {
    icono: "zona",
    termino: "Rural y urbana",
    definicion: "Dice si la zona donde te toca votar está en el campo (rural) o en la ciudad (urbana).",
  },
  {
    icono: "sinDato",
    termino: "Sin dato",
    definicion:
      "Las rayas grises marcan que no hay número: en ese grupo hay menos de 30 personas y cuidamos su privacidad, o esa información no existe.",
  },
];

/** Glosario visible para todo público: cada palabra difícil del sitio, explicada en una o dos frases. */
export function Glosario() {
  return (
    <section className={estilos.seccion} id="palabras" aria-labelledby="palabras-titulo">
      <div className={`contenedor ${estilos.glosario}`}>
        <div className={estilos.intro}>
          <h2 id="palabras-titulo">Palabras para entender los números</h2>
          <p>Si una palabra no te queda clara, aquí está explicada.</p>
        </div>
        <figure className={estilos.cien}>
          <svg
            viewBox="0 0 200 200"
            role="img"
            aria-label="Cien círculos: 60 en rosa son las personas que votaron y 40 claros son las que no votaron."
          >
            {Array.from({ length: 100 }, (_, i) => (
              <circle
                key={i}
                cx={10 + (i % 10) * 20}
                cy={10 + Math.floor(i / 10) * 20}
                r="7.5"
                className={i < VOTARON ? estilos.voto : estilos.noVoto}
              />
            ))}
          </svg>
          <figcaption>
            <strong>«De cada 100»</strong>
            <span>
              Imagina a 100 personas que pueden votar. Si decimos «{VOTARON} de cada 100», votaron {VOTARON} (en rosa) y no
              votaron {100 - VOTARON} (en claro). Así se leen todos los números de esta página.
            </span>
          </figcaption>
        </figure>
        <dl className={estilos.palabras}>
          {PALABRAS.map((p) => (
            <div key={p.termino}>
              <svg className={estilos.icono} viewBox="0 0 32 32" aria-hidden="true">
                {ICONOS[p.icono]}
              </svg>
              <dt>{p.termino}</dt>
              <dd>{p.definicion}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
