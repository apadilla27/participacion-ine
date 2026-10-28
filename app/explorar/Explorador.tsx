"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pastel } from "@/app/_ui/Pastel";
import { ELECCIONES, ENTIDADES, GRUPOS, RECIENTE, SEXOS, eleccionPorSlug, etiquetaEleccion, nombreLugar } from "@/lib/catalogo";
import {
  leerCuboEntidad,
  leerCuboMunicipios,
  rutaMunicipios,
  type ArchivoMunicipios,
  type Compacto,
  type CuboEntidad,
  type CuboMunicipios,
} from "@/lib/datos/cubo";
import { CIEN, ENTEROS, TERMINOS, deCada, firmado, frente, frenteAlPais } from "@/lib/formato";
import { tasa } from "@/lib/tasas";
import estilos from "./explorar.module.css";

type Filtros = { e: string; ent: number; s: number; g: number; m: number | null };
type Carga<T> = { estado: "cargando" } | { estado: "error" } | { estado: "listo"; datos: T };

const SEXOS_VALIDOS = new Set<number>(SEXOS.map((x) => x.id));
const ENTIDADES_ORDEN = ENTIDADES.filter((x) => x.clave > 0).sort((a, b) => a.corto.localeCompare(b.corto, "es-MX"));

let cuboEntidadPromesa: Promise<CuboEntidad> | null = null;
function cargarCuboEntidad() {
  cuboEntidadPromesa ??= fetch("/datos/entidad.json")
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<Compacto>;
    })
    .then(leerCuboEntidad)
    .catch((error) => {
      cuboEntidadPromesa = null;
      throw error;
    });
  return cuboEntidadPromesa;
}

function leerFiltros(params: URLSearchParams): { filtros: Filtros; invalido: boolean } {
  let invalido = false;
  const e = params.get("e");
  const eleccion = e == null ? RECIENTE : eleccionPorSlug(e);
  if (e != null && !eleccion) invalido = true;
  const num = (llave: string, valido: (n: number) => boolean, defecto: number) => {
    const crudo = params.get(llave);
    if (crudo == null) return defecto;
    const n = Number(crudo);
    if (!Number.isInteger(n) || !valido(n)) {
      invalido = true;
      return defecto;
    }
    return n;
  };
  const ent = num("ent", (n) => n >= 0 && n <= 32, 0);
  const s = num("s", (n) => SEXOS_VALIDOS.has(n), 9);
  const g = num("g", (n) => n >= 0 && n <= 9, 0);
  const mCrudo = params.get("m");
  const m = mCrudo == null || ent === 0 ? null : Number.isInteger(Number(mCrudo)) ? Number(mCrudo) : null;
  if (mCrudo != null && m == null) invalido = true;
  return { filtros: { e: (eleccion ?? RECIENTE).slug, ent, s, g, m }, invalido };
}

function escribirFiltros(f: Filtros) {
  const p = new URLSearchParams();
  p.set("e", f.e);
  if (f.ent) p.set("ent", String(f.ent));
  if (f.s !== 9) p.set("s", String(f.s));
  if (f.g) p.set("g", String(f.g));
  if (f.m != null) p.set("m", String(f.m));
  window.history.replaceState(null, "", `?${p.toString()}`);
}

export function Explorador() {
  const params = useSearchParams();
  const inicial = useMemo(() => leerFiltros(new URLSearchParams(params.toString())), [params]);
  const [filtros, setFiltrosEstado] = useState<Filtros>(inicial.filtros);
  const [avisoEnlace, setAvisoEnlace] = useState(inicial.invalido);
  const [cubo, setCubo] = useState<Carga<CuboEntidad>>({ estado: "cargando" });
  const [municipios, setMunicipios] = useState<Carga<CuboMunicipios> | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [intento, setIntento] = useState(0);
  const [orden, setOrden] = useState<{ por: "nombre" | "valor"; asc: boolean }>({ por: "valor", asc: false });

  const eleccion = eleccionPorSlug(filtros.e) ?? RECIENTE;
  const fueraDeEleccion = cubo.estado === "listo" && filtros.ent > 0 && !cubo.datos.entidades(eleccion.id).includes(filtros.ent);

  const setFiltros = useCallback((cambio: Partial<Filtros>) => {
    setFiltrosEstado((actual) => {
      const siguiente = { ...actual, ...cambio };
      if ("ent" in cambio || "e" in cambio) {
        if (cambio.m === undefined) siguiente.m = null;
      }
      escribirFiltros(siguiente);
      return siguiente;
    });
    setAvisoEnlace(false);
  }, []);

  // El municipio se elige desde la lista o la tabla, debajo del resultado: lo llevamos a la vista y le damos el foco.
  const titulo = useRef<HTMLHeadingElement>(null);
  const buscador = useRef<HTMLInputElement>(null);
  const elegirMunicipio = (clave: number) => {
    setFiltros({ m: clave });
    setBusqueda("");
    requestAnimationFrame(() => {
      titulo.current?.scrollIntoView({ block: "start" });
      titulo.current?.focus({ preventScroll: true });
    });
  };

  // Un enlace con filtros inválidos se corrige en la dirección para no volver a compartirlo roto.
  useEffect(() => {
    if (inicial.invalido) escribirFiltros(inicial.filtros);
  }, [inicial]);

  useEffect(() => {
    let vivo = true;
    cargarCuboEntidad().then(
      (datos) => vivo && setCubo({ estado: "listo", datos }),
      () => vivo && setCubo({ estado: "error" }),
    );
    return () => {
      vivo = false;
    };
  }, [intento]);

  useEffect(() => {
    if (filtros.ent === 0 || fueraDeEleccion) return;
    let vivo = true;
    const control = new AbortController();
    queueMicrotask(() => vivo && setMunicipios({ estado: "cargando" }));
    fetch(rutaMunicipios(filtros.e, filtros.ent), { signal: control.signal })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<ArchivoMunicipios>;
      })
      .then((json) => vivo && setMunicipios({ estado: "listo", datos: leerCuboMunicipios(json) }))
      .catch((error: { name?: string }) => {
        if (vivo && error.name !== "AbortError") setMunicipios({ estado: "error" });
      });
    return () => {
      vivo = false;
      control.abort();
    };
  }, [filtros.e, filtros.ent, fueraDeEleccion, intento]);

  const nombreEntidad = filtros.ent === 0 ? "Todo el país" : nombreLugar(filtros.ent);
  const muni = municipios?.estado === "listo" && filtros.ent > 0 ? municipios.datos : null;
  const nombreMunicipio = filtros.m != null ? muni?.municipios.find((x) => x.clave === filtros.m)?.nombre ?? null : null;
  const municipioInvalido = filtros.m != null && muni != null && nombreMunicipio == null;

  const celdaDe = useCallback(
    (ent: number, m: number | null, g: number) => {
      if (cubo.estado !== "listo") return null;
      if (m != null) return muni?.celda(m, filtros.s, g) ?? null;
      return cubo.datos.celda(eleccion.id, ent, filtros.s, g);
    },
    [cubo, muni, eleccion.id, filtros.s],
  );

  const celda = celdaDe(filtros.ent, filtros.m, filtros.g);
  const valor = tasa(celda);
  const valorEntidad = filtros.m != null ? tasa(celdaDe(filtros.ent, null, filtros.g)) : null;
  const valorPais = filtros.ent !== 0 ? tasa(celdaDe(0, null, filtros.g)) : null;
  const lugar = nombreMunicipio ?? nombreEntidad;
  const sexoTexto = SEXOS.find((x) => x.id === filtros.s)!.etiqueta.toLowerCase();
  const grupoTexto = GRUPOS.find((x) => x.id === filtros.g)!.etiqueta;

  const coincidencias = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es-MX").normalize("NFD").replace(/\p{Diacritic}/gu, "");
    if (!texto || !muni) return [];
    return muni.municipios
      .filter((x) => x.nombre.toLocaleLowerCase("es-MX").normalize("NFD").replace(/\p{Diacritic}/gu, "").includes(texto))
      .slice(0, 8);
  }, [busqueda, muni]);

  const filasMunicipios = useMemo(() => {
    if (!muni) return [];
    const filas = muni.municipios.map((x) => ({ ...x, v: tasa(muni.celda(x.clave, filtros.s, filtros.g)) }));
    const signo = orden.asc ? 1 : -1;
    return filas.sort((a, b) => {
      if (orden.por === "nombre") return signo * a.nombre.localeCompare(b.nombre, "es-MX");
      if (a.v == null) return 1;
      if (b.v == null) return -1;
      return signo * (a.v - b.v);
    });
  }, [muni, filtros.s, filtros.g, orden]);

  return (
    <div className={estilos.explorador}>
      {avisoEnlace ? (
        <p className="estado" role="status">
          El enlace traía un filtro que no existe; mostramos los valores por defecto.
        </p>
      ) : null}

      <form className={estilos.filtros} onSubmit={(e) => e.preventDefault()} aria-label="Filtros">
        <label className="campo">
          Elección
          <select value={filtros.e} onChange={(e) => setFiltros({ e: e.target.value })}>
            {ELECCIONES.map((x) => (
              <option key={x.slug} value={x.slug}>
                {etiquetaEleccion(x)}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          Entidad
          <select value={filtros.ent} onChange={(e) => setFiltros({ ent: Number(e.target.value) })}>
            <option value={0}>Todo el país</option>
            {ENTIDADES_ORDEN.map((x) => (
              <option key={x.clave} value={x.clave}>
                {x.corto}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          Sexo
          <select value={filtros.s} onChange={(e) => setFiltros({ s: Number(e.target.value) })}>
            {SEXOS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.etiqueta}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          Edad
          <select value={filtros.g} onChange={(e) => setFiltros({ g: Number(e.target.value) })}>
            {GRUPOS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.id === 0 ? "Todas las edades" : `${x.etiqueta} años`}
              </option>
            ))}
          </select>
        </label>
      </form>

      {cubo.estado === "cargando" ? (
        <div className={estilos.esqueleto} aria-busy="true">
          <p className="estado" data-tono="espera" role="status">
            Cargando los datos…
          </p>
        </div>
      ) : cubo.estado === "error" ? (
        <div className="estado" data-tono="error" role="alert">
          <p>No pudimos cargar los datos. Revisa tu conexión.</p>
          <div className="acciones">
            <button type="button" className="btn btn-dorado" onClick={() => setIntento((n) => n + 1)}>
              Reintentar
            </button>
          </div>
        </div>
      ) : fueraDeEleccion ? (
        <div className="estado">
          <p>
            {nombreEntidad} no está en los datos abiertos de la elección {etiquetaEleccion(eleccion)}.
          </p>
          <div className="acciones">
            <button type="button" className="btn btn-contorno" onClick={() => setFiltros({ e: RECIENTE.slug })}>
              Ver la federal {RECIENTE.anio}
            </button>
          </div>
        </div>
      ) : (
        <>
          <section className={estilos.resultado} aria-live="polite" aria-labelledby="resultado-titulo">
            <h2 id="resultado-titulo" ref={titulo} tabIndex={-1}>
              {lugar}
            </h2>
            {filtros.m != null && municipios?.estado !== "listo" ? (
              <p className="estado" data-tono="espera">
                Cargando municipios de {nombreEntidad}…
              </p>
            ) : municipioInvalido ? (
              <div className="estado">
                <p>Ese municipio no está en {nombreEntidad} en esta elección.</p>
                <div className="acciones">
                  <button type="button" className="btn btn-contorno" onClick={() => setFiltros({ m: null })}>
                    Ver la entidad completa
                  </button>
                </div>
              </div>
            ) : valor == null ? (
              <div className="estado">
                <p>{celda && celda[0] > 0 ? TERMINOS.umbral : "No hay personas en este corte."}</p>
                <div className="acciones">
                  {filtros.s !== 9 ? (
                    <button type="button" className="btn btn-contorno" onClick={() => setFiltros({ s: 9 })}>
                      Ver todas las personas
                    </button>
                  ) : null}
                  {filtros.g !== 0 ? (
                    <button type="button" className="btn btn-contorno" onClick={() => setFiltros({ g: 0 })}>
                      Ver todas las edades
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className={estilos.dato}>
                <Pastel tamano={168} valor={valor} titulo={`${lugar}: votaron ${deCada(valor)}`} />
                <div className={estilos.datoTexto}>
                  <p className={estilos.frase}>
                    En {lugar}, votaron {deCada(valor)} ({sexoTexto}, {filtros.g === 0 ? "todas las edades" : `${grupoTexto} años`}) en la
                    elección {etiquetaEleccion(eleccion)}.
                  </p>
                  {celda ? <p>Lista nominal: {ENTEROS.format(celda[0])} personas.</p> : null}
                  {valorEntidad != null ? <p>Votaron {frente(valor, valorEntidad, nombreEntidad)}.</p> : null}
                  {valorPais != null ? <p>Votaron {frenteAlPais(valor, valorPais)}.</p> : null}
                </div>
              </div>
            )}
          </section>

          <section aria-labelledby="edades-titulo">
            <h2 id="edades-titulo" className={estilos.titulo3}>
              Por edad en {lugar}
            </h2>
            <div className={estilos.edades}>
              {GRUPOS.filter((x) => x.id > 0).map((x) => {
                const v = tasa(celdaDe(filtros.ent, filtros.m, x.id));
                return (
                  <button
                    key={x.id}
                    type="button"
                    aria-pressed={filtros.g === x.id}
                    onClick={() => setFiltros({ g: filtros.g === x.id ? 0 : x.id })}
                  >
                    <Pastel tamano={56} valor={v} titulo={`${x.etiqueta} años: ${v == null ? "sin dato" : deCada(v)}`} />
                    <span>{x.etiqueta}</span>
                    <strong>{v == null ? "sin dato" : CIEN.format(v)}</strong>
                  </button>
                );
              })}
            </div>
          </section>

          {filtros.ent > 0 ? (
            <section aria-labelledby="municipios-titulo" className={estilos.municipios}>
              <h2 id="municipios-titulo" className={estilos.titulo3}>
                Municipios de {nombreEntidad}
              </h2>
              {municipios == null || municipios.estado === "cargando" ? (
                <p className="estado" data-tono="espera" role="status">
                  Cargando municipios de {nombreEntidad}…
                </p>
              ) : municipios.estado === "error" ? (
                <div className="estado" data-tono="error" role="alert">
                  <p>No pudimos cargar los municipios de {nombreEntidad}.</p>
                  <div className="acciones">
                    <button type="button" className="btn btn-dorado" onClick={() => setIntento((n) => n + 1)}>
                      Reintentar
                    </button>
                    {filtros.m != null ? (
                      <button type="button" className="btn btn-contorno" onClick={() => setFiltros({ m: null })}>
                        Ver la entidad
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <>
                  <div className={estilos.buscador}>
                    <label className="campo">
                      Busca un municipio
                      <input
                        ref={buscador}
                        type="search"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder={`Hay ${municipios.datos.municipios.length} en ${nombreEntidad}`}
                        autoComplete="off"
                      />
                    </label>
                    {busqueda.trim() ? (
                      coincidencias.length ? (
                        <ul className={estilos.coincidencias} aria-label="Municipios encontrados">
                          {coincidencias.map((x) => (
                            <li key={x.clave}>
                              <button
                                type="button"
                                onClick={() => elegirMunicipio(x.clave)}
                              >
                                {x.nombre}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="estado">
                          <p>No hay municipios con ese nombre en {nombreEntidad}.</p>
                          <div className="acciones">
                            <button
                              type="button"
                              className="btn btn-contorno"
                              onClick={() => {
                                setBusqueda("");
                                buscador.current?.focus();
                              }}
                            >
                              Limpiar búsqueda
                            </button>
                          </div>
                        </div>
                      )
                    ) : null}
                    {filtros.m != null ? (
                      <button type="button" className="btn btn-contorno" onClick={() => setFiltros({ m: null })}>
                        Ver la entidad completa
                      </button>
                    ) : null}
                  </div>
                  <div className={`tabla-caja ${estilos.tablaMunicipios}`}>
                    <table className="tabla">
                      <caption>
                        Votaron de cada 100: {sexoTexto}, {filtros.g === 0 ? "todas las edades" : `${grupoTexto} años`},{" "}
                        {etiquetaEleccion(eleccion)}.
                      </caption>
                      <thead>
                        <tr>
                          {(
                            [
                              ["nombre", "Municipio"],
                              ["valor", "Votaron"],
                            ] as ["nombre" | "valor", string][]
                          ).map(([por, texto]) => (
                            <th key={por} scope="col" aria-sort={orden.por === por ? (orden.asc ? "ascending" : "descending") : "none"}>
                              <button
                                type="button"
                                className="orden"
                                onClick={() => setOrden((o) => ({ por, asc: o.por === por ? !o.asc : por === "nombre" }))}
                              >
                                {texto}
                              </button>
                            </th>
                          ))}
                          <th scope="col">Frente a la entidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filasMunicipios.map((x) => {
                          const total = tasa(cubo.datos.celda(eleccion.id, filtros.ent, filtros.s, filtros.g));
                          return (
                            <tr key={x.clave} aria-current={filtros.m === x.clave ? "true" : undefined}>
                              <th scope="row">
                                <button type="button" className="orden" onClick={() => elegirMunicipio(x.clave)}>
                                  {x.nombre}
                                </button>
                              </th>
                              <td>{x.v == null ? "sin dato" : CIEN.format(x.v)}</td>
                              <td>{x.v == null || total == null ? "—" : firmado(Math.round((x.v - total) * 100) / 100)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
