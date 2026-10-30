import { Pastel } from "@/app/_ui/Pastel";
import type { RelatoDatos } from "@/lib/datos/tipos";
import { REDONDO, deCada, millones } from "@/lib/formato";
import estilos from "./relato.module.css";

export function Hero({ datos }: { datos: RelatoDatos }) {
  const { hero } = datos;
  const reciente = datos.elecciones.find((e) => e.slug === datos.reciente)!;
  return (
    <section className={`${estilos.seccion} ${estilos.bandaRubor}`} aria-labelledby="hero-titulo">
      <div className={`contenedor ${estilos.hero}`}>
        <div className={estilos.heroTexto}>
          {/* Cada oración en su propia línea (sin "A" suelta) y "58 de cada 100" nunca se parte. */}
          <h1 id="hero-titulo">
            <span className={estilos.oracion}>
              A los 18 años votaron <em>{REDONDO.format(hero.estreno)}</em>&nbsp;de&nbsp;cada&nbsp;100 jóvenes.
            </span>{" "}
            <span className={estilos.oracion}>
              A los {hero.piso.edad} años, solo votaron <em>{REDONDO.format(hero.piso.hombres)}</em>&nbsp;de&nbsp;cada&nbsp;100 hombres.
            </span>
          </h1>
          <p className={estilos.entradilla}>Tu voto cuenta. Aquí puedes ver quién vota, dónde y cómo ha cambiado desde 2009.</p>
          <p>
            En la elección de {reciente.anio} podían votar {millones(hero.ln)} de personas y votaron {deCada(hero.pct)}. Las
            mujeres votaron más que los hombres: {REDONDO.format(hero.mujeres)} contra {REDONDO.format(hero.hombres)} de cada
            100.
          </p>
          <div className="acciones">
            <a className="btn btn-primario" href="#huella">
              Ver cuántos como tú votaron
            </a>
            <a className="btn btn-contorno" href="#palabras">
              Entender los números
            </a>
          </div>
        </div>
        <div className={estilos.heroPasteles}>
          <figure>
            <Pastel tamano="min(180px, 36vw)" valor={hero.estreno} titulo={`A los 18 años votaron ${deCada(hero.estreno)}`} />
            <figcaption>
              <span className="cifra">{REDONDO.format(hero.estreno)}</span> de cada 100 jóvenes de 18 años votaron
            </figcaption>
          </figure>
          <figure>
            <Pastel
              tamano="min(180px, 36vw)"
              valor={hero.piso.hombres}
              titulo={`Hombres de ${hero.piso.edad} años: votaron ${deCada(hero.piso.hombres)}`}
            />
            <figcaption>
              <span className="cifra">{REDONDO.format(hero.piso.hombres)}</span> de cada 100 hombres de {hero.piso.edad} años
              votaron
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
