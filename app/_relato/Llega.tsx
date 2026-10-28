import { fechaLarga } from "@/lib/catalogo";
import type { RelatoDatos } from "@/lib/datos/tipos";
import { ENTEROS, deCada } from "@/lib/formato";
import estilos from "./relato.module.css";

export function Llega({ datos }: { datos: RelatoDatos }) {
  const { prision, anticipado, noBinario, judicial } = datos.llega;
  const reciente = datos.elecciones.find((e) => e.slug === datos.reciente)!;
  return (
    <section className={`contenedor ${estilos.llega}`} id="llega" aria-labelledby="llega-titulo">
      <h2 id="llega-titulo">Otras formas de votar</h2>
      <p className={estilos.llegaEntrada}>
        En {reciente.anio} el voto llegó a personas que no podían ir a su casilla. Son modalidades de la misma elección federal,
        no otras elecciones, y cada registro es una persona que votó. Por eso aquí se cuentan personas, no porcentajes.
      </p>
      <div className={estilos.llegaRejilla}>
        <article>
          <h3>
            <span className="cifra">{ENTEROS.format(prision.total)}</span> personas votaron en prisión preventiva
          </h3>
          <p>
            {ENTEROS.format(prision.hombres)} hombres y {ENTEROS.format(prision.mujeres)} mujeres. Donde más votaron:
          </p>
          <ol className={estilos.lista}>
            {prision.top.map((f) => (
              <li key={f.nombre}>
                <span>{f.nombre}</span>
                <strong>{ENTEROS.format(f.n)}</strong>
              </li>
            ))}
          </ol>
        </article>
        <article>
          <h3>
            <span className="cifra">{ENTEROS.format(anticipado.total)}</span> personas votaron de forma anticipada
          </h3>
          <p>
            {ENTEROS.format(anticipado.mujeres)} mujeres y {ENTEROS.format(anticipado.hombres)} hombres votaron desde su casa
            antes de la jornada.
          </p>
        </article>
        <article>
          <h3>
            <span className="cifra">{ENTEROS.format(noBinario.ln)}</span> personas no binarias en la lista nominal
          </h3>
          <p>
            {noBinario.pct == null ? "" : `En todo el país votaron ${deCada(noBinario.pct)}. `}
            Solo {noBinario.entidades === 1 ? "una entidad tiene" : `${noBinario.entidades} entidades tienen`} 30 personas o
            más con este registro; en el resto no mostramos el dato para proteger su privacidad.
          </p>
        </article>
        {judicial ? (
          <article>
            <h3>
              El {fechaLarga(judicial.fecha)} se eligió al Poder Judicial: votaron <span className="cifra">{deCada(judicial.pct)}</span>
            </h3>
            <p>
              Es otra jornada, con otras reglas.
              {judicial.veinte == null ? "" : ` De 20 a 24 años votaron ${deCada(judicial.veinte)}.`}
              {judicial.faltantes.length
                ? ` Los datos abiertos de esa elección no incluyen ${judicial.faltantes.join(", ")}.`
                : ""}
            </p>
          </article>
        ) : null}
      </div>
    </section>
  );
}
