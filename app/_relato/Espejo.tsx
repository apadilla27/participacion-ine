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
  const hayVolteo = bandas.some((b) => b.hombres != null && b.mujeres != null && b.hombres > b.mujeres);

  return (
    <section className={`contenedor ${estilos.espejo}`} id="espejo" aria-labelledby="espejo-titulo">
      <div className={estilos.espejoIntro}>
        <h2 id="espejo-titulo">Las dos caras del espejo</h2>
        <p>
          {brecha == null
            ? `En ${ev.etiqueta} no hay datos por sexo.`
            : brecha >= 0
              ? `En ${ev.etiqueta} las mujeres votaron ${CIEN.format(brecha)} puntos más que los hombres.`
              : `En ${ev.etiqueta} los hombres votaron ${CIEN.format(-brecha)} puntos más que las mujeres.`}{" "}
          {volteo
            ? `A partir de los ${volteo.edad} años la diferencia se invierte: hombres ${deCada(volteo.hombres)}, mujeres ${deCada(volteo.mujeres)}. Los datos muestran el cambio, no su causa.`
            : "En esta elección las mujeres votan más en todas las edades."}
        </p>
        <Segmento
          etiqueta="Elección"
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
    </section>
  );
}
