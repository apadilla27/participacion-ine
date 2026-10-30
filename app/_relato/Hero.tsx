import { Pastel } from "@/app/_ui/Pastel";
import type { RelatoDatos } from "@/lib/datos/tipos";
import { CIEN, ENTEROS, deCada } from "@/lib/formato";
import estilos from "./relato.module.css";

export function Hero({ datos }: { datos: RelatoDatos }) {
  const { hero } = datos;
  const reciente = datos.elecciones.find((e) => e.slug === datos.reciente)!;
  return (
    <section className={`${estilos.seccion} ${estilos.bandaRubor}`} aria-labelledby="hero-titulo">
      <div className={`contenedor ${estilos.hero}`}>
        <div className={estilos.heroTexto}>
          <h1 id="hero-titulo">
            A los 18, <em>{CIEN.format(hero.estreno)}</em> de cada 100 votaron. Entre los hombres de {hero.piso.edad},{" "}
            <em>{CIEN.format(hero.piso.hombres)}</em>.
          </h1>
          <p className={estilos.entradilla}>Tu voto cuenta. Mira quién vota, dónde y cómo ha cambiado desde 2009.</p>
          <p>
            En {reciente.anio} podían votar {ENTEROS.format(hero.ln)} personas y votaron {deCada(hero.pct)}. Las mujeres
            votaron más que los hombres: {CIEN.format(hero.mujeres)} contra {CIEN.format(hero.hombres)} de cada 100.
          </p>
          <div className="acciones">
            <a className="btn btn-primario" href="#huella">
              Calcula tu caso
            </a>
            <a className="btn btn-contorno" href="#palabras">
              ¿Qué significan las palabras?
            </a>
          </div>
        </div>
        <div className={estilos.heroPasteles}>
          <figure>
            <Pastel tamano="min(180px, 36vw)" valor={hero.estreno} titulo={`A los 18 años votaron ${deCada(hero.estreno)}`} />
            <figcaption>
              <span className="cifra">{CIEN.format(hero.estreno)}</span> de cada 100 jóvenes de 18 años votaron
            </figcaption>
          </figure>
          <figure>
            <Pastel
              tamano="min(180px, 36vw)"
              valor={hero.piso.hombres}
              titulo={`Hombres de ${hero.piso.edad} años: votaron ${deCada(hero.piso.hombres)}`}
            />
            <figcaption>
              <span className="cifra">{CIEN.format(hero.piso.hombres)}</span> de cada 100 hombres de {hero.piso.edad} años
              votaron
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
