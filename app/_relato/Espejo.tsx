"use client";

import { Segmento } from "@/app/_ui/Segmento";
import type { RelatoDatos } from "@/lib/datos/tipos";
import { CIEN, deCada } from "@/lib/formato";
import estilos from "./relato.module.css";

/** Largo de la barra: su porcentaje del lado, descontando el espacio reservado para la cifra. */
const barra = (valor: number | null) => `calc((100% - 3.25rem) * ${(valor ?? 0) / 100})`;

export function Espejo({
  datos,
  eleccion,
  onEleccion,
}: {
  datos: RelatoDatos;
  eleccion: string;
  onEleccion: (slug: string) => void;
}) {
  const ev = datos.elecciones.find((e) => e.slug === eleccion)!;
  const mujeres = datos.mapa[eleccion].mujeres[0];
  const hombres = datos.mapa[eleccion].hombres[0];
  const brecha = mujeres != null && hombres != null ? Math.round((mujeres - hombres) * 100) / 100 : null;
  const volteo = datos.curvas[eleccion].momentos.volteo;
  const bandas = datos.bandas[eleccion];
  const cuando = ev.tipo === "judicial" ? `la elección judicial de ${ev.anio}` : ev.anio;
  const hayVolteo = bandas.some((b) => b.hombres != null && b.mujeres != null && b.hombres > b.mujeres);

  return (
    <section className={estilos.seccion} id="espejo" aria-labelledby="espejo-titulo">
      <div className={`contenedor ${estilos.espejo}`}>
        <div className={estilos.intro}>
          <h2 id="espejo-titulo">Mujeres y hombres: ¿quién vota más?</h2>
          <p>
            {brecha == null || mujeres == null || hombres == null
              ? `En ${cuando} no hay datos de mujeres y hombres por separado.`
              : `En ${cuando} votaron ${deCada(mujeres)} mujeres y ${deCada(hombres)} hombres. ${
                  brecha >= 0 ? "Ellas votaron más." : "Ellos votaron más."
                }`}{" "}
            {volteo
              ? `Desde los ${volteo.edad} años cambia: los hombres votan más (${deCada(volteo.hombres)} contra ${deCada(volteo.mujeres)}).`
              : "Las mujeres votan más en todas las edades."}
          </p>
          <p className={estilos.comoLeer}>
            Cada fila es una edad. A la izquierda, las mujeres; a la derecha, los hombres. Entre más larga la barra, más
            votaron.
          </p>
          <Segmento
            etiqueta="Año de la elección"
            opciones={datos.elecciones.map((e) => ({ id: e.slug, nombre: e.etiqueta }))}
            valor={eleccion}
            onCambio={onEleccion}
            columnasMovil={4}
          />
          <ul className={estilos.leyendaBarras} aria-label="Leyenda">
            <li data-serie="mujeres">Mujeres</li>
            <li data-serie="hombres">Hombres</li>
            {hayVolteo ? (
              <li data-serie="volteo">
                <span>
                  <strong>Edad en rosa</strong>: ahí los hombres votan más
                </span>
              </li>
            ) : null}
          </ul>
        </div>
        <table className={estilos.espejoTabla}>
          <caption className="sr-only">
            Votaron de cada 100 mujeres y hombres por edad, elección {ev.etiqueta}.
            {hayVolteo ? " Las edades en rosa marcan dónde los hombres votan más." : ""}
          </caption>
          <colgroup>
            <col />
            <col className={estilos.colEdad} />
            <col />
          </colgroup>
          <thead className="sr-only">
            <tr>
              <th scope="col">Mujeres</th>
              <th scope="col">Edad</th>
              <th scope="col">Hombres</th>
            </tr>
          </thead>
          <tbody>
            {bandas.map((b) => {
              const volteada = b.hombres != null && b.mujeres != null && b.hombres > b.mujeres;
              return (
                <tr key={b.etiqueta} data-volteo={volteada}>
                  <td>
                    <div className={estilos.ladoMujeres}>
                      <span>{b.mujeres == null ? "sin dato" : CIEN.format(b.mujeres)}</span>
                      <i style={{ width: barra(b.mujeres) }} />
                    </div>
                  </td>
                  <th scope="row">{b.etiqueta}</th>
                  <td>
                    <div className={estilos.ladoHombres}>
                      <i style={{ width: barra(b.hombres) }} />
                      <span>{b.hombres == null ? "sin dato" : CIEN.format(b.hombres)}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
