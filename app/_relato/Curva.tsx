"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Segmento } from "@/app/_ui/Segmento";
import { useAngosta } from "@/app/_ui/useAngosta";
import type { Momentos, PuntoCurva, RelatoDatos } from "@/lib/datos/tipos";
import { CIEN, deCada, diferencia } from "@/lib/formato";
import estilos from "./relato.module.css";

// En móvil el lienzo es más angosto para que la curva tenga altura y el texto del eje se lea.
const LIENZO = { ancho: 760, angosto: 420 };
const ALTO = 320;
// Margen izquierdo para las etiquetas del eje: así las líneas no las tachan a los 18 años.
const MARGEN = 40;

type Momento = { edad: number; titulo: string; cuerpo: string };

function momentosTexto(m: Momentos, puntos: PuntoCurva[]): Momento[] {
  const juventud = puntos.filter((p) => p.edad <= 29 && p.todos != null).map((p) => p.todos as number);
  const esMaxima = m.estreno.todos >= Math.max(...juventud);
  const cambio = Math.round((m.alAnio.todos - m.estreno.todos) * 100) / 100;
  const esCumbre = m.cumbre.todos >= Math.max(...puntos.map((p) => p.todos ?? 0));
  const todosEnPiso = puntos.find((p) => p.edad === m.piso.edad)?.todos ?? null;
  const lista: Momento[] = [
    {
      edad: 18,
      titulo: `A los 18 votaron ${deCada(m.estreno.todos)}`,
      cuerpo: esMaxima
        ? "Es la primera vez que pueden votar, y votan más que cualquier otra edad antes de los 30."
        : "Es la primera vez que pueden votar.",
    },
    {
      edad: 19,
      titulo: `A los 19, ${deCada(m.alAnio.todos)}`,
      cuerpo:
        cambio === 0
          ? "Un cumpleaños después, votan igual."
          : `Basta un cumpleaños de diferencia: a los 19 votan ${CIEN.format(Math.abs(cambio))} de cada 100 ${cambio < 0 ? "menos" : "más"} que a los 18.`,
    },
    {
      edad: m.piso.edad,
      titulo: `A los ${m.piso.edad} votan menos hombres que a cualquier otra edad antes de los 40`,
      cuerpo: `Votaron ${deCada(m.piso.hombres)} hombres de ${m.piso.edad} años. Las mujeres de esa edad, ${deCada(m.piso.mujeres)}.`,
    },
    {
      edad: m.cumbre.edad,
      titulo: esCumbre
        ? `A los ${m.cumbre.edad} se vota más que a cualquier otra edad: ${deCada(m.cumbre.todos)}`
        : `A los ${m.cumbre.edad} se vota más que a cualquier otra edad entre los 50 y los 80: ${deCada(m.cumbre.todos)}`,
      cuerpo:
        todosEnPiso == null
          ? "El voto crece con los años, poco a poco."
          : `Son ${CIEN.format(m.cumbre.todos - todosEnPiso)} de cada 100 más que a los ${m.piso.edad}. El voto crece con los años, poco a poco.`,
    },
  ];
  if (m.volteo) {
    lista.push({
      edad: m.volteo.edad,
      titulo: `Desde los ${m.volteo.edad}, los hombres votan más`,
      cuerpo: `Hombres ${deCada(m.volteo.hombres)}; mujeres ${deCada(m.volteo.mujeres)}. Antes de esa edad, ellas votan más. Los datos muestran el cambio, no su causa.`,
    });
  }
  return lista;
}

export function Curva({
  datos,
  eleccion,
  onEleccion,
}: {
  datos: RelatoDatos;
  eleccion: string;
  onEleccion: (slug: string) => void;
}) {
  const { puntos, momentos } = datos.curvas[eleccion];
  const vista = datos.elecciones.find((e) => e.slug === eleccion)!;
  const [activo, setActivo] = useState(0);
  const [verDatos, setVerDatos] = useState(false);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const titulo = useId();
  const lista = useMemo(() => momentosTexto(momentos, puntos), [momentos, puntos]);
  const ancho = useAngosta() ? LIENZO.angosto : LIENZO.ancho;

  const maximo = Math.max(...puntos.flatMap((p) => [p.todos ?? 0, p.hombres ?? 0, p.mujeres ?? 0]));
  const tope = Math.ceil(maximo / 10) * 10 + 10;
  const x = (edad: number) => MARGEN + ((edad - 18) / 82) * (ancho - MARGEN - 8);
  const y = (valor: number) => ALTO - (Math.min(valor, tope) / tope) * (ALTO - 16) - 8;
  const trazo = (llave: "todos" | "hombres" | "mujeres") =>
    puntos
      .filter((p) => p[llave] != null)
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.edad).toFixed(1)},${y(p[llave] as number).toFixed(1)}`)
      .join("");
  const marca = lista[Math.min(activo, lista.length - 1)];
  const puntoMarca = puntos.find((p) => p.edad === marca.edad);
  const niveles = Array.from({ length: tope / 10 - 1 }, (_, i) => (i + 1) * 10).filter((n) => n % 20 === 0 || tope <= 40);

  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        const visible = entradas.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActivo(Number((visible.target as HTMLElement).dataset.indice));
      },
      { rootMargin: "-30% 0px -40% 0px", threshold: [0.35, 0.7] },
    );
    refs.current.forEach((nodo) => nodo && observador.observe(nodo));
    return () => observador.disconnect();
  }, [lista.length]);

  return (
    <section className={`${estilos.seccion} ${estilos.curva}`} id="curva" aria-labelledby={titulo}>
      <div className={`contenedor ${estilos.curvaRejilla}`}>
        <div className={estilos.curvaFijo}>
          <h2 id={titulo}>La montaña rusa del voto, de los 18 a los 100 años</h2>
          <p>
            La línea va de los 18 a los 100 años: entre más alta, más personas de esa edad votaron. Elige otro año de
            elección para comparar.
          </p>
          <Segmento
            etiqueta="Año de la elección"
            opciones={datos.elecciones.map((e) => ({ id: e.slug, nombre: e.etiqueta }))}
            valor={eleccion}
            onCambio={onEleccion}
            columnasMovil={4}
          />
          <ul className={estilos.leyendaLineas} aria-label="Leyenda">
            <li data-serie="todos">Todas las personas</li>
            <li data-serie="mujeres">Mujeres</li>
            <li data-serie="hombres">Hombres</li>
          </ul>
          <svg
            className={estilos.curvaLienzo}
            viewBox={`0 0 ${ancho} ${ALTO + 30}`}
            role="img"
            aria-label={`Participación por edad, elección ${vista.etiqueta}. ${marca.titulo}.`}
          >
            {niveles.map((n) => (
              <g key={n} className={estilos.guia}>
                <line x1={MARGEN} x2={ancho} y1={y(n)} y2={y(n)} />
                <text x={MARGEN - 8} y={y(n) + 5} textAnchor="end">
                  {n}
                </text>
              </g>
            ))}
            <text className={estilos.eje} x="0" y="16">
              Votaron de cada 100
            </text>
            <path className={estilos.lineaMujeres} d={trazo("mujeres")} />
            <path className={estilos.lineaHombres} d={trazo("hombres")} />
            <path className={estilos.lineaTodos} d={trazo("todos")} />
            {puntoMarca?.todos != null ? (
              <g className={estilos.marca} style={{ transform: `translate(${x(marca.edad)}px, ${y(puntoMarca.todos)}px)` }}>
                <circle r="11" />
                <circle r="5" />
              </g>
            ) : null}
            {(ancho === LIENZO.angosto ? [18, 40, 60, 100] : [18, 30, 40, 50, 60, 70, 80, 100]).map((edad) => (
              <text
                key={edad}
                className={estilos.eje}
                x={edad === 100 ? ancho : x(edad)}
                y={ALTO + 24}
                textAnchor={edad === 100 ? "end" : "middle"}
              >
                {edad === 100 ? "100+ años" : edad}
              </text>
            ))}
          </svg>
          <button
            type="button"
            className="btn btn-contorno"
            aria-expanded={verDatos}
            onClick={() => setVerDatos((v) => !v)}
          >
            {verDatos ? "Ocultar la tabla" : "Ver los números en tabla"}
          </button>
          {verDatos ? (
            <div className="tabla-caja">
              <table className="tabla">
                <caption>Votaron de cada 100, por edad. Elección {vista.etiqueta}.</caption>
                <thead>
                  <tr>
                    <th scope="col">Edad</th>
                    <th scope="col">Todas</th>
                    <th scope="col">Mujeres</th>
                    <th scope="col">Hombres</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.bandas[eleccion].map((b) => (
                    <tr key={b.etiqueta}>
                      <th scope="row">{b.etiqueta}</th>
                      <td>{b.todos == null ? "sin dato" : CIEN.format(b.todos)}</td>
                      <td>{b.mujeres == null ? "sin dato" : CIEN.format(b.mujeres)}</td>
                      <td>{b.hombres == null ? "sin dato" : CIEN.format(b.hombres)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
        <ol className={estilos.momentos}>
          {lista.map((m, i) => (
            <li
              key={`${eleccion}-${m.edad}-${i}`}
              data-indice={i}
              data-activo={i === activo}
              ref={(nodo) => {
                refs.current[i] = nodo;
              }}
            >
              <h3>{m.titulo}</h3>
              <p>{m.cuerpo}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="contenedor">
        <h3 className={estilos.subtitulo}>¿Los jóvenes votan menos en todas las elecciones?</h3>
        <p className={estilos.subtituloTexto}>
          {datos.serie.every((f) => f.joven == null || f.joven < f.pct)
            ? "Sí. Desde 2009, en cada elección las personas de 18 a 29 años votaron menos que en todo el país."
            : "Casi siempre. Compara cada elección en la tabla."}
        </p>
        <div className="tabla-caja">
          <table className={`tabla ${estilos.tablaSerie}`}>
            <caption>
              Votaron de cada 100 en todo el país y entre las personas de 18 a 29 años. La diferencia dice cuántas personas
              de cada 100 votaron de más o de menos los jóvenes.
            </caption>
            <thead>
              <tr>
                <th scope="col">Elección</th>
                <th scope="col">País</th>
                <th scope="col">18{" "}a{" "}29</th>
                <th scope="col">Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {datos.serie.map((f) => (
                <tr key={f.slug}>
                  <th scope="row">
                    {f.etiqueta}
                    <span>{f.tipo === "judicial" ? "Primera vez" : f.presidencial ? "Presidencial" : "Intermedia"}</span>
                  </th>
                  <td>{CIEN.format(f.pct)}</td>
                  <td>{f.joven == null ? "sin dato" : CIEN.format(f.joven)}</td>
                  <td>{f.joven == null ? "—" : diferencia(f.joven, f.pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
