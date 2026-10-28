"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Segmento } from "@/app/_ui/Segmento";
import { useAngosta } from "@/app/_ui/useAngosta";
import type { Momentos, PuntoCurva, RelatoDatos } from "@/lib/datos/tipos";
import { CIEN, deCada, firmado } from "@/lib/formato";
import estilos from "./relato.module.css";

// En móvil el lienzo es más angosto para que la curva tenga altura y el texto del eje se lea.
const LIENZO = { ancho: 760, angosto: 420 };
const ALTO = 320;

type Momento = { edad: number; titulo: string; cuerpo: string };

function momentosTexto(m: Momentos, puntos: PuntoCurva[]): Momento[] {
  const juventud = puntos.filter((p) => p.edad <= 29 && p.todos != null).map((p) => p.todos as number);
  const esMaxima = m.estreno.todos >= Math.max(...juventud);
  const cambio = Math.round((m.alAnio.todos - m.estreno.todos) * 100) / 100;
  const lista: Momento[] = [
    {
      edad: 18,
      titulo: `A los 18 votaron ${deCada(m.estreno.todos)}`,
      cuerpo: esMaxima
        ? "Es la primera elección para muchas personas, y la participación más alta entre los 18 y los 29 años."
        : "Es la primera elección para muchas personas.",
    },
    {
      edad: 19,
      titulo: `A los 19, ${deCada(m.alAnio.todos)}`,
      cuerpo:
        cambio === 0
          ? "En un año de vida la participación no cambia."
          : `En un solo año de vida la participación ${cambio < 0 ? "baja" : "sube"} ${CIEN.format(Math.abs(cambio))} puntos.`,
    },
    {
      edad: m.piso.edad,
      titulo: `El punto más bajo de los hombres: ${m.piso.edad} años`,
      cuerpo: `Votaron ${deCada(m.piso.hombres)} hombres de ${m.piso.edad} años. Las mujeres de esa edad, ${deCada(m.piso.mujeres)}.`,
    },
    {
      edad: m.cumbre.edad,
      titulo: `A los ${m.cumbre.edad}, el punto más alto: ${deCada(m.cumbre.todos)}`,
      cuerpo: `Entre el punto más bajo de los hombres y este hay ${CIEN.format(m.cumbre.todos - m.piso.hombres)} puntos. La participación sube con la edad, despacio, durante décadas.`,
    },
  ];
  if (m.volteo) {
    lista.push({
      edad: m.volteo.edad,
      titulo: `A los ${m.volteo.edad}, los hombres votan más`,
      cuerpo: `Hombres ${deCada(m.volteo.hombres)}; mujeres ${deCada(m.volteo.mujeres)}. Desde esa edad la diferencia se invierte. Los datos muestran el cambio, no su causa.`,
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
  const x = (edad: number) => ((edad - 18) / 82) * ancho;
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
    <section className={estilos.curva} id="curva" aria-labelledby={titulo}>
      <div className={`contenedor ${estilos.curvaRejilla}`}>
        <div className={estilos.curvaFijo}>
          <h2 id={titulo}>La montaña rusa de tu generación</h2>
          <p>
            Cada punto es un año de edad en la lista nominal. Cambia la elección para comparar.
          </p>
          <Segmento
            etiqueta="Elección"
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
                <line x1="0" x2={ancho} y1={y(n)} y2={y(n)} />
                <text x="0" y={y(n) - 6}>
                  {n}
                </text>
              </g>
            ))}
            <path className={estilos.lineaMujeres} d={trazo("mujeres")} />
            <path className={estilos.lineaHombres} d={trazo("hombres")} />
            <path className={estilos.lineaTodos} d={trazo("todos")} />
            {puntoMarca?.todos != null ? (
              <g className={estilos.marca} style={{ transform: `translate(${x(marca.edad)}px, ${y(puntoMarca.todos)}px)` }}>
                <circle r="11" />
                <circle r="5" />
              </g>
            ) : null}
            {(ancho === LIENZO.angosto ? [18, 40, 60, 80, 100] : [18, 30, 40, 50, 60, 70, 80, 100]).map((edad) => (
              <text key={edad} className={estilos.eje} x={x(edad)} y={ALTO + 24} textAnchor="middle">
                {edad === 100 ? "100+" : edad}
              </text>
            ))}
          </svg>
          <button
            type="button"
            className="btn btn-contorno"
            aria-expanded={verDatos}
            onClick={() => setVerDatos((v) => !v)}
          >
            {verDatos ? "Ocultar datos" : "Ver datos"}
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
        <h3 className={estilos.subtitulo}>La distancia entre los 18-29 años y el país, elección por elección</h3>
        <div className="tabla-caja">
          <table className="tabla">
            <caption>Votaron de cada 100 en el país y entre las personas de 18 a 29 años.</caption>
            <thead>
              <tr>
                <th scope="col">Elección</th>
                <th scope="col">Tipo</th>
                <th scope="col">País</th>
                <th scope="col">18 a 29</th>
                <th scope="col">Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {datos.serie.map((f) => (
                <tr key={f.slug}>
                  <th scope="row">{f.etiqueta}</th>
                  <td>{f.tipo === "judicial" ? "Judicial, otra jornada" : f.presidencial ? "Presidencial" : "Intermedia"}</td>
                  <td>{CIEN.format(f.pct)}</td>
                  <td>{f.joven == null ? "sin dato" : CIEN.format(f.joven)}</td>
                  <td>{f.joven == null ? "—" : `${firmado(Math.round((f.joven - f.pct) * 100) / 100)} puntos`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
