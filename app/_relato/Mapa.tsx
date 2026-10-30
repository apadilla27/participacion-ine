"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pastel } from "@/app/_ui/Pastel";
import { Segmento } from "@/app/_ui/Segmento";
import { esAngosta, useAngosta } from "@/app/_ui/useAngosta";
import { ENTIDADES, nombreLugar } from "@/lib/catalogo";
import type { Trazo } from "@/lib/datos/tipos-geo";
import { LECTURAS, type Lectura, type RelatoDatos } from "@/lib/datos/tipos";
import { CIEN, REDONDO, cuanto, deCada, diferencia, frenteAlPais } from "@/lib/formato";
import { COLUMNAS, FILAS, MOSAICO } from "@/lib/mosaico";
import estilos from "./relato.module.css";

const CORTES_FEDERAL = [45, 50, 55, 60, 65];
const CORTES_JUDICIAL = [8, 11, 14, 17, 20];
const COLORES = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)", "var(--c6)"];
const ALFABETICO = ENTIDADES.filter((e) => e.clave > 0)
  .slice()
  .sort((a, b) => a.corto.localeCompare(b.corto, "es-MX"))
  .map((e) => e.clave);

function clase(valor: number, cortes: number[]) {
  const i = cortes.findIndex((c) => valor < c);
  return i === -1 ? cortes.length : i;
}

type Orden = "nombre" | "valor" | "diferencia";

// La geometría (176 KB) se pide solo cuando se muestra el mapa: en móvil la vista inicial son los cuadros y no la necesita.
type Geometria = { viewBox: number[]; trazos: Trazo[] };
type CargaGeo = { estado: "cargando" } | { estado: "error" } | { estado: "listo"; datos: Geometria };
const SIN_TRAZOS: Trazo[] = [];
let pedidoGeo: Promise<Geometria> | null = null;

function cargarGeometria() {
  pedidoGeo ??= fetch("/geo/entidades.json")
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<Geometria>;
    })
    .catch((error: unknown) => {
      pedidoGeo = null;
      throw error;
    });
  return pedidoGeo;
}

export function Mapa({ datos }: { datos: RelatoDatos }) {
  const [eleccion, setEleccion] = useState(datos.reciente);
  const [lectura, setLectura] = useState<Lectura>("todas");
  const [vista, setVista] = useState<"auto" | "mapa" | "mosaico">("auto");
  const [clave, setClave] = useState<number | null>(null);
  const [encima, setEncima] = useState<{ clave: number; x: number; y: number } | null>(null);
  const [verTabla, setVerTabla] = useState(false);
  const [orden, setOrden] = useState<{ por: Orden; asc: boolean }>({ por: "valor", asc: false });
  const [geo, setGeo] = useState<CargaGeo>({ estado: "cargando" });
  const [intentoGeo, setIntentoGeo] = useState(0);
  const angosta = useAngosta();
  const lienzo = useRef<HTMLDivElement>(null);
  const ficha = useRef<HTMLDivElement>(null);

  const ev = datos.elecciones.find((e) => e.slug === eleccion)!;
  const valores = datos.mapa[eleccion][lectura];
  const pais = valores[0];
  const cortes = ev.tipo === "judicial" ? CORTES_JUDICIAL : CORTES_FEDERAL;
  const vistaEfectiva = vista === "auto" ? (angosta ? "mosaico" : "mapa") : vista;
  const nombreLectura = LECTURAS.find((l) => l.id === lectura)!.nombre;
  const trazos = geo.estado === "listo" ? geo.datos.trazos : SIN_TRAZOS;

  useEffect(() => {
    // Al hidratar, el primer render asume escritorio: se consulta el ancho real para no pedir la geometría en móvil.
    if (vistaEfectiva !== "mapa" || (vista === "auto" && esAngosta())) return;
    let vivo = true;
    cargarGeometria().then(
      (datos) => vivo && setGeo({ estado: "listo", datos }),
      () => vivo && setGeo({ estado: "error" }),
    );
    return () => {
      vivo = false;
    };
  }, [vista, vistaEfectiva, intentoGeo]);

  const motivo = (k: number) =>
    ev.faltantes.includes(k)
      ? `${nombreLugar(k)} no está en los datos abiertos de esta elección`
      : "en este grupo hay menos de 30 personas y cuidamos su privacidad";
  const color = (k: number) => (valores[k] == null ? "url(#trama)" : COLORES[clase(valores[k] as number, cortes)]);
  const tintaSobre = (k: number) =>
    valores[k] != null && clase(valores[k] as number, cortes) >= 3 ? "#ffffff" : "var(--tinta)";

  const extremos = useMemo(() => {
    const lista = ALFABETICO.filter((k) => valores[k] != null).map((k) => ({ k, v: valores[k] as number }));
    if (!lista.length) return null;
    lista.sort((a, b) => b.v - a.v);
    return { alto: lista[0], bajo: lista[lista.length - 1] };
  }, [valores]);

  function elegir(k: number | null, desdeToque = false) {
    setClave(k);
    if (desdeToque && angosta && k != null) {
      requestAnimationFrame(() => ficha.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    }
  }

  function mover(paso: number) {
    const i = clave == null ? (paso > 0 ? -1 : 0) : ALFABETICO.indexOf(clave);
    const siguiente = ALFABETICO[(i + paso + ALFABETICO.length) % ALFABETICO.length];
    elegir(siguiente);
    const t = trazos.find((x) => x.clave === siguiente);
    const caja = lienzo.current?.getBoundingClientRect();
    if (t && caja && geo.estado === "listo") {
      const escala = caja.width / geo.datos.viewBox[2];
      setEncima({ clave: siguiente, x: t.centro[0] * escala, y: t.centro[1] * escala });
    }
  }

  const filasTabla = useMemo(() => {
    const filas = ALFABETICO.map((k) => ({ k, nombre: nombreLugar(k), v: valores[k] }));
    const signo = orden.asc ? 1 : -1;
    return filas.sort((a, b) => {
      if (orden.por === "nombre") return signo * a.nombre.localeCompare(b.nombre, "es-MX");
      if (a.v == null) return 1;
      if (b.v == null) return -1;
      return signo * ((a.v as number) - (b.v as number));
    });
  }, [valores, orden]);

  const elegido = clave;
  const valorFicha = elegido == null ? pais : valores[elegido];
  const lugarFicha = elegido == null ? "Todo el país" : nombreLugar(elegido);
  const trazosOrdenados = useMemo(
    () => (clave == null ? trazos : [...trazos.filter((t) => t.clave !== clave), trazos.find((t) => t.clave === clave)!]),
    [trazos, clave],
  );

  return (
    <section className={`${estilos.seccion} ${estilos.mapa}`} id="mapa" aria-labelledby="mapa-titulo">
      <div className="contenedor">
        <div className={estilos.mapaIntro}>
          <h2 id="mapa-titulo">¿Dónde se vota más?</h2>
          <p>
            {extremos
              ? `En ${ev.tipo === "judicial" ? "la elección judicial de " : ""}${ev.anio}${lectura === "todas" ? "" : ` (${nombreLectura.toLowerCase()})`}, donde más se votó fue ${nombreLugar(extremos.alto.k)}, con ${deCada(extremos.alto.v)}, y donde menos, ${nombreLugar(extremos.bajo.k)}, con ${deCada(extremos.bajo.v)}. Entre más oscuro el color, más personas votaron.`
              : "No hay datos para esta combinación."}
          </p>
        </div>
        <div className={estilos.mapaControles}>
          <Segmento
            etiqueta="Año de la elección"
            opciones={datos.elecciones.map((e) => ({ id: e.slug, nombre: e.etiqueta }))}
            valor={eleccion}
            onCambio={setEleccion}
            columnasMovil={4}
          />
          <Segmento etiqueta="¿Quiénes?" opciones={LECTURAS} valor={lectura} onCambio={setLectura} columnasMovil={3} />
          <div className={estilos.mapaFila}>
            <Segmento
              etiqueta="Ver como"
              opciones={[
                { id: "mapa", nombre: "Mapa" },
                { id: "mosaico", nombre: "Cuadros" },
              ]}
              valor={vistaEfectiva}
              onCambio={(v) => setVista(v as "mapa" | "mosaico")}
            />
            <label className="campo">
              Elige tu entidad
              <select value={clave ?? ""} onChange={(e) => elegir(e.target.value === "" ? null : Number(e.target.value))}>
                <option value="">Todo el país</option>
                {ALFABETICO.map((k) => (
                  <option key={k} value={k}>
                    {nombreLugar(k)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className={estilos.mapaCuerpo}>
          <div>
            {vistaEfectiva === "mapa" && geo.estado === "error" ? (
              <div className={`estado ${estilos.mapaEspera}`}>
                <p>No pudimos cargar el mapa. Puedes reintentar o ver las mismas cifras en los cuadros.</p>
                <div className="acciones">
                  <button
                    type="button"
                    className="btn btn-primario"
                    onClick={() => {
                      setGeo({ estado: "cargando" });
                      setIntentoGeo((n) => n + 1);
                    }}
                  >
                    Reintentar
                  </button>
                  <button type="button" className="btn btn-contorno" onClick={() => setVista("mosaico")}>
                    Ver los cuadros
                  </button>
                </div>
              </div>
            ) : vistaEfectiva === "mapa" && geo.estado === "cargando" ? (
              <div className={estilos.mapaEspera} role="status">
                <p>Cargando el mapa…</p>
              </div>
            ) : vistaEfectiva === "mapa" && geo.estado === "listo" ? (
              <div
                ref={lienzo}
                className={estilos.lienzoMapa}
                tabIndex={0}
                role="group"
                aria-label="Mapa de participación por entidad. Usa las flechas para recorrer las entidades y Escape para volver al país."
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                    e.preventDefault();
                    mover(1);
                  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                    e.preventDefault();
                    mover(-1);
                  } else if (e.key === "Escape") {
                    elegir(null);
                    setEncima(null);
                  }
                }}
                onBlur={() => setEncima(null)}
              >
                <svg viewBox={geo.datos.viewBox.join(" ")} aria-hidden="true">
                  <defs>
                    <pattern id="trama" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <rect width="6" height="6" fill="#f1efec" />
                      <line x1="0" y1="0" x2="0" y2="6" stroke="var(--sin-dato)" strokeWidth="3" />
                    </pattern>
                  </defs>
                  {trazosOrdenados.map((t) => (
                    <path
                      key={t.clave}
                      d={t.d}
                      fill={color(t.clave)}
                      className={t.clave === clave ? estilos.entidadActiva : estilos.entidad}
                      onPointerMove={(e) => {
                        const caja = lienzo.current?.getBoundingClientRect();
                        if (caja) setEncima({ clave: t.clave, x: e.clientX - caja.left, y: e.clientY - caja.top });
                      }}
                      onPointerLeave={() => setEncima(null)}
                      onClick={() => elegir(clave === t.clave ? null : t.clave, true)}
                    />
                  ))}
                </svg>
                {encima ? (
                  <div className={estilos.etiquetaMapa} style={{ left: encima.x, top: encima.y }} aria-hidden="true">
                    <strong>{nombreLugar(encima.clave)}</strong>
                    <span>
                      {valores[encima.clave] == null
                        ? `Sin dato: ${motivo(encima.clave)}`
                        : `${deCada(valores[encima.clave] as number)}${
                            pais == null ? "" : ` · ${cuanto(valores[encima.clave] as number, pais)} el país`
                          }`}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : (
              <div
                className={estilos.mosaico}
                role="group"
                aria-label="Cuadros de las entidades"
                style={{ ["--columnas" as string]: COLUMNAS, ["--filas" as string]: FILAS }}
              >
                {MOSAICO.map(([k, col, fila]) => (
                  <button
                    key={k}
                    type="button"
                    className={estilos.casilla}
                    aria-pressed={clave === k}
                    aria-label={`${nombreLugar(k)}: ${valores[k] == null ? "sin dato" : deCada(valores[k] as number)}`}
                    style={{
                      gridColumn: col + 1,
                      gridRow: fila + 1,
                      background: valores[k] == null ? undefined : color(k),
                      color: tintaSobre(k),
                    }}
                    data-vacio={valores[k] == null}
                    onClick={() => elegir(clave === k ? null : k, true)}
                  >
                    {/* Solo la abreviatura, a 16 px: el nombre completo y la cifra salen en la ficha al tocar. */}
                    <span aria-hidden="true">{ENTIDADES.find((e) => e.clave === k)!.abrev.slice(0, 4)}</span>
                  </button>
                ))}
              </div>
            )}
            <p className={estilos.leyendaTitulo}>Votaron de cada 100:</p>
            <ul className={estilos.leyenda} aria-label={`Leyenda: votaron de cada 100 (${ev.etiqueta})`}>
              {COLORES.map((c, i) => (
                <li key={c}>
                  <i style={{ background: c }} />
                  {i === 0 ? `menos de ${cortes[0]}` : i === COLORES.length - 1 ? `${cortes[i - 1]} o más` : `${cortes[i - 1]} a ${cortes[i]}`}
                </li>
              ))}
              <li>
                <i className={estilos.leyendaTrama} />
                sin dato
              </li>
            </ul>
            <p className={estilos.ayudaMapa}>
              {vistaEfectiva === "mosaico"
                ? "Cada cuadro es una entidad: tócalo o haz clic para ver su nombre y sus números."
                : "Toca o haz clic en una entidad del mapa para ver su nombre y sus números."}
            </p>
            <div className={estilos.tablaEntidades}>
              <button
                type="button"
                className="btn btn-contorno"
                aria-expanded={verTabla}
                onClick={() => setVerTabla((v) => !v)}
              >
                {verTabla ? "Ocultar la tabla" : "Ver las 32 entidades en tabla"}
              </button>
              {verTabla ? (
                <div className="tabla-caja">
                  <table className="tabla">
                    <caption>
                      Votaron de cada 100 por entidad: {nombreLectura.toLowerCase()}, {ev.etiqueta}. País: {pais == null ? "sin dato" : CIEN.format(pais)}.
                    </caption>
                    <thead>
                      <tr>
                        {(
                          [
                            ["nombre", "Entidad"],
                            ["valor", "Votaron"],
                            ["diferencia", "Diferencia con el país"],
                          ] as [Orden, string][]
                        ).map(([por, texto]) => (
                          <th
                            key={por}
                            scope="col"
                            aria-sort={orden.por === por ? (orden.asc ? "ascending" : "descending") : "none"}
                          >
                            <button
                              type="button"
                              className="orden"
                              onClick={() => setOrden((o) => ({ por, asc: o.por === por ? !o.asc : por === "nombre" }))}
                            >
                              {texto}
                              {orden.por === por ? (
                                <svg className="flecha" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                                  <path d={orden.asc ? "M1 7l4-4 4 4" : "M1 3l4 4 4-4"} />
                                </svg>
                              ) : null}
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filasTabla.map((f) => (
                        <tr key={f.k}>
                          <th scope="row">{f.nombre}</th>
                          <td>{f.v == null ? "sin dato" : CIEN.format(f.v)}</td>
                          <td>{f.v == null || pais == null ? "—" : diferencia(f.v, pais)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          </div>

          <div ref={ficha} className={estilos.ficha} aria-live="polite">
            <h3>{lugarFicha}</h3>
            {valorFicha == null ? (
              <p className="estado">Sin dato: {elegido == null ? "este grupo no aparece en los conteos" : motivo(elegido)}.</p>
            ) : (
              <div className={estilos.fichaDato}>
                <Pastel tamano={120} valor={valorFicha} titulo={`${lugarFicha}: votaron ${deCada(valorFicha)}`} />
                <p>
                  Votaron <strong>{deCada(valorFicha)}</strong>
                  {lectura === "todas" ? "" : ` (${nombreLectura.toLowerCase()})`} en{" "}
                  {ev.tipo === "judicial" ? `la elección judicial de ${ev.anio}` : ev.anio}.
                  {elegido != null && pais != null ? ` ${frenteAlPais(valorFicha, pais)[0].toUpperCase()}${frenteAlPais(valorFicha, pais).slice(1)}.` : ""}
                </p>
              </div>
            )}
            <dl className={estilos.desglose}>
              {LECTURAS.filter((l) => l.id !== "todas").map((l) => {
                const v = datos.mapa[eleccion][l.id][elegido ?? 0];
                return (
                  <div key={l.id}>
                    <dt>{l.nombre}</dt>
                    <dd>{v == null ? "sin dato" : REDONDO.format(v)}</dd>
                  </div>
                );
              })}
            </dl>
            <div className="tabla-caja">
              <table className="tabla">
                <caption>
                  Votaron de cada 100 en {elegido == null ? "todo el país" : lugarFicha}, todas las personas.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Elección</th>
                    <th scope="col">Votaron</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.elecciones.map((e) => {
                    const v = datos.mapa[e.slug].todas[elegido ?? 0];
                    return (
                      <tr key={e.slug}>
                        <th scope="row">{e.etiqueta}</th>
                        <td>{v == null ? "sin dato" : CIEN.format(v)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {elegido != null ? (
              <div className="acciones">
                <Link className="btn btn-primario" href={`/explorar?e=${eleccion}&ent=${elegido}`}>
                  Ver municipios de {nombreLugar(elegido)}
                </Link>
                <button type="button" className="btn btn-contorno" onClick={() => elegir(null)}>
                  Ver todo el país
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
