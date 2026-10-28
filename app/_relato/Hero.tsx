import { Pastel } from "@/app/_ui/Pastel";
import { fechaLarga } from "@/lib/catalogo";
import type { RelatoDatos } from "@/lib/datos/tipos";
import { CIEN, ENTEROS, deCada } from "@/lib/formato";
import estilos from "./relato.module.css";

export function Hero({ datos }: { datos: RelatoDatos }) {
  const { hero } = datos;
  const reciente = datos.elecciones.find((e) => e.slug === datos.reciente)!;
  const brecha = Math.round((hero.mujeres - hero.hombres) * 100) / 100;
  return (
    <section className={`contenedor ${estilos.hero}`} aria-labelledby="hero-titulo">
      <div className={estilos.heroTexto}>
        <h1 id="hero-titulo">
          A los 18, <em>{CIEN.format(hero.estreno)}</em> de cada 100 votaron. Entre los hombres de {hero.piso.edad},{" "}
          <em>{CIEN.format(hero.piso.hombres)}</em>.
        </h1>
        <p className={estilos.entradilla}>Descubre quién participa, dónde y cuánto ha cambiado desde 2009.</p>
        <p>
          En la elección federal del {fechaLarga(reciente.fecha)} había {ENTEROS.format(hero.ln)} personas en la lista
          nominal y votaron {deCada(hero.pct)}. Las mujeres votaron {CIEN.format(brecha)} puntos más que los hombres.
        </p>
        <div className="acciones">
          <a className="btn btn-dorado" href="#huella">
            Calcula tu caso
          </a>
          <a className="btn btn-contorno" href="#mapa">
            Ver el mapa
          </a>
        </div>
      </div>
      <div className={estilos.heroPasteles}>
        <figure>
          <Pastel tamano="min(180px, 36vw)" valor={hero.estreno} titulo={`A los 18 años votaron ${deCada(hero.estreno)}`} />
          <figcaption>
            <span className="cifra">{CIEN.format(hero.estreno)}</span> de cada 100 a los 18 años
          </figcaption>
        </figure>
        <figure>
          <Pastel
            tamano="min(180px, 36vw)"
            valor={hero.piso.hombres}
            titulo={`Hombres de ${hero.piso.edad} años: votaron ${deCada(hero.piso.hombres)}`}
          />
          <figcaption>
            <span className="cifra">{CIEN.format(hero.piso.hombres)}</span> de cada 100 hombres de {hero.piso.edad}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
