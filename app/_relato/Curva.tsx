"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import { Segmento } from "@/app/_ui/Segmento";
import { useAncha } from "@/app/_ui/useAngosta";
import type { Momentos, PuntoCurva, RelatoDatos } from "@/lib/datos/tipos";
import { CIEN, deCada, diferencia } from "@/lib/formato";
import estilos from "./relato.module.css";

// Dos lienzos, para que la letra de la gráfica se lea igual: uno para teléfono y tableta, y uno más alto para computadora (D60, D63).
const LIENZOS = {
  angosto: { ancho: 420, alto: 320, letra: 10.6, edades: [18, 40, 60, 100] },
  amplio: { ancho: 760, alto: 520, letra: 11.7, edades: [18, 30, 40, 50, 60, 70, 80, 100] },
};
// Margen izquierdo para las etiquetas del eje: así las líneas no las tachan a los 18 años.
const MARGEN = 40;

// En cada parada el punto se queda quieto un rato, para leer la tarjeta, y luego viaja a la siguiente.
const QUIETO = 0.2;
const suave = (t: number) => t * t * (3 - 2 * t);

type Momento = { edad: number; titulo: string };
type ConDato = PuntoCurva & { todos: number };

function momentosTexto(m: Momentos, puntos: PuntoCurva[], ultimo: ConDato): Momento[] {
  const esCumbre = m.cumbre.todos >= Math.max(...puntos.map((p) => p.todos ?? 0));
  const lista: Momento[] = [
    { edad: 18, titulo: `A los 18 votaron ${deCada(m.estreno.todos)}` },
    { edad: 19, titulo: `A los 19 votaron ${deCada(m.alAnio.todos)}` },
    {
      edad: m.piso.edad,
      titulo: `A los ${m.piso.edad} votan menos hombres que a cualquier otra edad antes de los 40: ${deCada(m.piso.hombres)}`,
    },
    {
      edad: m.cumbre.edad,
      titulo: esCumbre
        ? `A los ${m.cumbre.edad} se vota más que a cualquier otra edad: ${deCada(m.cumbre.todos)}`
        : `A los ${m.cumbre.edad} se vota más que a cualquier otra edad entre los 50 y los 80: ${deCada(m.cumbre.todos)}`,
    },
    { edad: ultimo.edad, titulo: `A los ${ultimo.edad === 100 ? "100 años o más" : ultimo.edad} votaron ${deCada(ultimo.todos)}` },
  ];
  if (m.volteo) {
    lista.push({ edad: m.volteo.edad, titulo: `A los ${m.volteo.edad} los hombres empiezan a votar más que las mujeres` });
  }
  // El punto solo avanza: las tarjetas van de menor a mayor edad.
  return lista.sort((a, b) => a.edad - b.edad);
}

/** Convierte el avance de la página (0 a 1) en la edad del punto y la parada en la que va. */
function recorrer(paradas: number[], avance: number) {
  const ultima = paradas.length - 1;
  // El último rato quieto deja leer la última tarjeta antes de que la gráfica se suelte.
  const posicion = avance * (ultima + QUIETO);
  const tramo = Math.floor(posicion);
  if (tramo >= ultima) return { edad: paradas[ultima], parada: ultima };
  const viaje = Math.max(0, (posicion - tramo - QUIETO) / (1 - QUIETO));
  return {
    edad: paradas[tramo] + (paradas[tramo + 1] - paradas[tramo]) * suave(viaje),
    // La tarjeta cambia justo antes de que el punto llegue a su edad.
    parada: viaje > 0.75 ? tramo + 1 : tramo,
  };
}

/** Altura de la línea en una edad con decimales: el punto se desliza sobre ella, sin saltos. */
function valorEn(conDato: ConDato[], edad: number) {
  const i = conDato.findIndex((p) => p.edad >= edad);
  if (i < 0) return conDato[conDato.length - 1].todos;
  if (i === 0) return conDato[0].todos;
  const [a, b] = [conDato[i - 1], conDato[i]];
  return a.todos + ((b.todos - a.todos) * (edad - a.edad)) / (b.edad - a.edad);
}

/** Cuánto se ha recorrido la pista (0 a 1): la escena queda fija y la página sigue bajando. Sin escena fija, 1. */
function useAvance(pista: RefObject<HTMLElement | null>, escena: RefObject<HTMLElement | null>, llave: number) {
  const [avance, setAvance] = useState(0);
  useEffect(() => {
    let cuadro = 0;
    const medir = () => {
      cuadro = 0;
      if (!pista.current || !escena.current) return;
      const recorrido = pista.current.offsetHeight - escena.current.offsetHeight;
      const tope = parseFloat(getComputedStyle(escena.current).top) || 0;
      const avanzado = (tope - pista.current.getBoundingClientRect().top) / recorrido;
      setAvance(recorrido > 0 ? Math.min(Math.max(avanzado, 0), 1) : 1);
    };
    const pedir = () => {
      if (!cuadro) cuadro = requestAnimationFrame(medir);
    };
    pedir();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
    };
  }, [pista, escena, llave]);
  return avance;
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
  const [verDatos, setVerDatos] = useState(false);
  const titulo = useId();
  const pista = useRef<HTMLDivElement>(null);
  const escena = useRef<HTMLDivElement>(null);
  const conDato = useMemo(() => puntos.filter((p): p is ConDato => p.todos != null), [puntos]);
  const lista = useMemo(() => momentosTexto(momentos, puntos, conDato[conDato.length - 1]), [momentos, puntos, conDato]);
  const paradas = useMemo(() => lista.map((m) => m.edad), [lista]);
  const avance = useAvance(pista, escena, paradas.length);

  const lienzo = useAncha() ? LIENZOS.amplio : LIENZOS.angosto;
  const { ancho, alto } = lienzo;
  const maximo = Math.max(...puntos.flatMap((p) => [p.todos ?? 0, p.hombres ?? 0, p.mujeres ?? 0]));
  const tope = Math.ceil(maximo / 10) * 10 + 10;
  const x = (edad: number) => MARGEN + ((edad - 18) / 82) * (ancho - MARGEN - 8);
  const y = (valor: number) => alto - (Math.min(valor, tope) / tope) * (alto - 16) - 8;
  const trazos = useMemo(() => {
    const xDe = (edad: number) => MARGEN + ((edad - 18) / 82) * (ancho - MARGEN - 8);
    const yDe = (valor: number) => alto - (Math.min(valor, tope) / tope) * (alto - 16) - 8;
    const trazo = (llave: "todos" | "hombres" | "mujeres") =>
      puntos
        .filter((p) => p[llave] != null)
        .map((p, i) => `${i === 0 ? "M" : "L"}${xDe(p.edad).toFixed(1)},${yDe(p[llave] as number).toFixed(1)}`)
        .join("");
    return (
      <>
        <path className={estilos.lineaMujeres} d={trazo("mujeres")} />
        <path className={estilos.lineaHombres} d={trazo("hombres")} />
        <path className={estilos.lineaTodos} d={trazo("todos")} />
      </>
    );
  }, [puntos, ancho, alto, tope]);
  // Desde el 0: sin esa línea de base, la franja de abajo de la gráfica se ve vacía.
  const niveles = Array.from({ length: tope / 10 }, (_, i) => i * 10).filter((n) => n % 20 === 0 || tope <= 40);

  const { edad, parada } = recorrer(paradas, avance);
  const xMarca = x(edad);
  const yMarca = y(valorEn(conDato, edad));
  // La etiqueta dice el dato real de esa edad; el punto solo se desliza entre un año y el siguiente.
  const edadEntera = Math.round(edad);
  const real = conDato.find((p) => p.edad === edadEntera);
  const etiqueta = real ? `${edadEntera === 100 ? "100+ años" : `${edadEntera} años`}: ${deCada(real.todos)}` : "";
  // Centrada sobre el punto, sin pisar los números del eje ni salirse por la derecha.
  const medioEtiqueta = (etiqueta.length * lienzo.letra) / 2;
  const xEtiqueta = Math.min(Math.max(xMarca, MARGEN + 4 + medioEtiqueta), ancho - medioEtiqueta);
  // Arriba de las líneas que tiene debajo. Si eso la aleja mucho del punto (la línea ya va cayendo), va abajo de ellas.
  const edadEn = (px: number) => 18 + ((px - MARGEN) / (ancho - MARGEN - 8)) * 82;
  const alturas = puntos
    .filter((p) => p.edad >= edadEn(xEtiqueta - medioEtiqueta) && p.edad <= edadEn(xEtiqueta + medioEtiqueta))
    .flatMap((p) => [p.todos, p.hombres, p.mujeres])
    .filter((v): v is number => v != null)
    .map(y);
  const arriba = Math.min(...alturas) - 12;
  const abajo = Math.max(...alturas) + 26;
  const yEtiqueta = yMarca - arriba > 90 && abajo <= alto - 8 ? abajo : Math.max(arriba, 40);

  return (
    <section className={`${estilos.seccion} ${estilos.curva}`} id="curva" aria-labelledby={titulo}>
      <div className={`contenedor ${estilos.curvaTexto}`}>
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
      </div>

      {/* La pista es alta y la escena queda fija dentro: la página sigue bajando y lo único que se mueve es el punto. */}
      <div
        ref={pista}
        className={estilos.curvaPista}
        style={{ "--pasos": paradas.length - 1, "--avance": avance } as CSSProperties}
      >
        <div ref={escena} className={`contenedor ${estilos.curvaEscena}`}>
          <div className={estilos.curvaGrafica}>
            <ul className={estilos.leyendaLineas} aria-label="Leyenda">
              <li data-serie="todos">
                <span>
                  Todas<span className={estilos.leyendaResto}> las personas</span>
                </span>
              </li>
              <li data-serie="mujeres">Mujeres</li>
              <li data-serie="hombres">Hombres</li>
            </ul>
            <svg
              className={estilos.curvaLienzo}
              viewBox={`0 0 ${ancho} ${alto + 30}`}
              role="img"
              aria-label={`Participación por edad, elección ${vista.etiqueta}. La tabla de abajo tiene los números.`}
            >
              <clipPath id="curva-recorrida">
                <rect x="0" y="0" width={xMarca} height={alto + 30} />
              </clipPath>
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
              {/* Lo que falta por recorrer se ve tenue; lo recorrido, con todo su color. */}
              <g className={estilos.lineasPorRecorrer}>{trazos}</g>
              <g className={estilos.lineasRecorridas} clipPath="url(#curva-recorrida)">
                {trazos}
              </g>
              {lienzo.edades.map((e) => (
                <text
                  key={e}
                  className={estilos.eje}
                  x={e === 100 ? ancho : x(e)}
                  y={alto + 24}
                  textAnchor={e === 100 ? "end" : "middle"}
                >
                  {e === 100 ? "100+ años" : e}
                </text>
              ))}
              <g className={estilos.marca}>
                <g style={{ transform: `translate(${xMarca}px, ${yMarca}px)` }}>
                  <circle r="11" />
                  <circle r="5" />
                </g>
                <text x={xEtiqueta} y={yEtiqueta} textAnchor="middle">
                  {etiqueta}
                </text>
              </g>
            </svg>
            {/* Se llena con cada movimiento de la página: así nunca parece que se quedó congelada. */}
            <div className={estilos.barraAvance} aria-hidden="true" />
          </div>
          <div className={estilos.momentosCaja}>
            <ol className={estilos.momentos}>
              {lista.map((m, i) => (
                <li key={`${eleccion}-${m.edad}-${i}`} aria-current={i === parada ? "step" : undefined}>
                  {m.titulo}
                </li>
              ))}
            </ol>
            <p className={estilos.ayudaMomentos} data-fin={avance >= 1}>
              Sigue bajando
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </p>
          </div>
        </div>
      </div>

      <div className={`contenedor ${estilos.curvaDatos}`}>
        <button type="button" className="btn btn-contorno" aria-expanded={verDatos} onClick={() => setVerDatos((v) => !v)}>
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
