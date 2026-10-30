import { fechaLarga } from "@/lib/catalogo";
import type { RelatoDatos } from "@/lib/datos/tipos";
import { ENTEROS, deCada } from "@/lib/formato";
import estilos from "./relato.module.css";

export function Llega({ datos }: { datos: RelatoDatos }) {
  const { prision, anticipado, noBinario, judicial } = datos.llega;
  const reciente = datos.elecciones.find((e) => e.slug === datos.reciente)!;
  return (
    <section className={`${estilos.seccion} ${estilos.bandaRubor}`} id="llega" aria-labelledby="llega-titulo">
      <div className={`contenedor ${estilos.llega}`}>
        <div className={estilos.intro}>
          <h2 id="llega-titulo">Otras formas de votar</h2>
          <p>
            No todas las personas votan en una casilla. En {reciente.anio} algunas votaron desde la cárcel o desde su casa.
            Aquí contamos personas, una por una.
          </p>
        </div>
        <div className={estilos.llegaRejilla}>
          <article>
            <h3>
              <span className="cifra">{ENTEROS.format(prision.total)}</span> personas votaron en prisión preventiva
            </h3>
            <p>
              Están en la cárcel esperando su sentencia, así que conservan su derecho a votar. Fueron{" "}
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
              <span className="cifra">{ENTEROS.format(anticipado.total)}</span> personas votaron antes del día de la elección
            </h3>
            <p>
              Por una enfermedad o una discapacidad no podían salir, así que votaron desde su casa:{" "}
              {ENTEROS.format(anticipado.mujeres)} mujeres y {ENTEROS.format(anticipado.hombres)} hombres.
            </p>
          </article>
          <article>
            <h3>
              <span className="cifra">{ENTEROS.format(noBinario.ln)}</span> personas no binarias podían votar
            </h3>
            <p>
              Son personas que no se registraron como mujer ni como hombre en su credencial.
              {noBinario.pct == null ? "" : ` En todo el país votaron ${deCada(noBinario.pct)}.`} Solo{" "}
              {noBinario.entidades === 1 ? "una entidad tiene" : `${noBinario.entidades} entidades tienen`} 30 personas o más
              así; en las demás no damos el número, para cuidar su privacidad.
            </p>
          </article>
          {judicial ? (
            <article>
              <h3>
                El {fechaLarga(judicial.fecha)} se votó por juezas y jueces: votaron{" "}
                <span className="cifra">{deCada(judicial.pct)}</span>
              </h3>
              <p>
                Fue la primera vez que se eligió así al Poder Judicial.
                {judicial.veinte == null ? "" : ` De 20 a 24 años votaron ${deCada(judicial.veinte)}.`}
                {judicial.faltantes.length ? ` En los datos de esa elección no está ${judicial.faltantes.join(", ")}.` : ""}
              </p>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}
