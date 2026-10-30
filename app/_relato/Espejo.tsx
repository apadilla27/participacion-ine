"use client";

import { Segmento } from "@/app/_ui/Segmento";
import type { RelatoDatos } from "@/lib/datos/tipos";
import { REDONDO, parDeCada } from "@/lib/formato";
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
  const general = mujeres != null && hombres != null ? parDeCada(mujeres, hombres) : null;
  const cruce = volteo ? parDeCada(volteo.hombres, volteo.mujeres) : null;

  return (
    <section className={estilos.seccion} id="espejo" aria-labelledby="espejo-titulo">
      <div className={`contenedor ${estilos.espejo}`}>
        <div className={estilos.intro}>
          <h2 id="espejo-titulo">Mujeres y hombres: ¿quién vota más?</h2>
          <p>
            {brecha == null || general == null
              ? `En ${cuando} no hay datos de mujeres y hombres por separado.`
              : general.empate
                ? `En ${cuando} mujeres y hombres votaron casi igual: unos ${general.a}.`
                : `En ${cuando} votaron ${general.a} mujeres y ${general.b} hombres. ${
                    brecha >= 0 ? "Ellas votaron más." : "Ellos votaron más."
                  }`}{" "}
            {volteo && cruce
              ? cruce.empate
                ? `Desde los ${volteo.edad} años cambia: los hombres votan apenas un poco más; casi igual, unos ${cruce.a}.`
                : `Desde los ${volteo.edad} años cambia: los hombres votan más (${cruce.a} contra ${cruce.b}).`
              : "Las mujeres votan más en todas las edades."}
          </p>
          <p className={estilos.comoLeer}>
            Cada fila es un grupo de edad. Entre más larga la barra, más personas votaron.
          </p>
          <Segmento
            etiqueta="Año de la elección"
            opciones={datos.elecciones.map((e) => ({ id: e.slug, nombre: e.etiqueta }))}
            valor={eleccion}
            onCambio={onEleccion}
            columnasMovil={4}
          />
          {hayVolteo ? (
            <p className={estilos.notaVolteo}>
              <strong>Edad en rosa</strong>: ahí los hombres votan más.
            </p>
          ) : null}
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
          {/* Encabezados visibles: cada lado dice de quién es, sin depender de una leyenda aparte. */}
          <thead className={estilos.espejoCabeza}>
            <tr>
              <th scope="col" data-lado="mujeres">
                <span>Mujeres</span>
              </th>
              <th scope="col">Edad</th>
              <th scope="col" data-lado="hombres">
                <span>Hombres</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {bandas.map((b) => {
              const volteada = b.hombres != null && b.mujeres != null && b.hombres > b.mujeres;
              return (
                <tr key={b.etiqueta} data-volteo={volteada}>
                  <td>
                    <div className={estilos.ladoMujeres}>
                      <span>{b.mujeres == null ? "sin dato" : REDONDO.format(b.mujeres)}</span>
                      <i style={{ width: barra(b.mujeres) }} />
                    </div>
                  </td>
                  <th scope="row">{b.etiqueta}</th>
                  <td>
                    <div className={estilos.ladoHombres}>
                      <i style={{ width: barra(b.hombres) }} />
                      <span>{b.hombres == null ? "sin dato" : REDONDO.format(b.hombres)}</span>
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
