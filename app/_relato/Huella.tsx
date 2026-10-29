"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Pastel } from "@/app/_ui/Pastel";
import { ENTIDADES, fechaLarga, nombreLugar } from "@/lib/catalogo";
import type { RelatoDatos } from "@/lib/datos/tipos";
import { CIEN, ENTEROS, TERMINOS, deCada } from "@/lib/formato";
import { sumar, tasa } from "@/lib/tasas";
import estilos from "./relato.module.css";

const EDADES = Array.from({ length: 83 }, (_, i) => i + 18);
const QUIEN: Record<number, string> = { 0: "hombres", 1: "mujeres", 9: "personas" };

const sinSuscripcion = () => () => {};
function puedeCompartirArchivos() {
  try {
    return (
      typeof navigator !== "undefined" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [new File([new Blob()], "prueba.png", { type: "image/png" })] })
    );
  } catch {
    return false;
  }
}

function lineas(contexto: CanvasRenderingContext2D, texto: string, maximo: number) {
  const salida: string[] = [];
  let actual = "";
  for (const palabra of texto.split(" ")) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (contexto.measureText(prueba).width > maximo && actual) {
      salida.push(actual);
      actual = palabra;
    } else actual = prueba;
  }
  if (actual) salida.push(actual);
  return salida;
}

async function imagenCompartible(pct: number, frase: string): Promise<File | null> {
  await document.fonts.ready;
  const lienzo = document.createElement("canvas");
  lienzo.width = 1080;
  lienzo.height = 1350;
  const c = lienzo.getContext("2d");
  if (!c) return null;
  const display = getComputedStyle(document.documentElement).getPropertyValue("--font-advent").trim() || "sans-serif";
  c.fillStyle = "#ffffff";
  c.fillRect(0, 0, 1080, 1350);
  c.fillStyle = "#d5007f";
  c.fillRect(0, 0, 1080, 24);
  // Marca Make the Change
  c.lineCap = "round";
  c.lineJoin = "round";
  c.lineWidth = 12;
  c.save();
  c.translate(72, 92);
  c.scale(1.5, 1.5);
  const trazo = (color: string, pasos: [number, number][]) => {
    c.strokeStyle = color;
    c.beginPath();
    pasos.forEach(([px, py], i) => (i === 0 ? c.moveTo(px, py) : c.lineTo(px, py)));
    c.stroke();
  };
  c.lineWidth = 8;
  trazo("#1d1d1b", [[11, 54], [11, 12], [32, 36]]);
  trazo("#d5007f", [[32, 36], [49, 16]]);
  trazo("#d5007f", [[41, 11], [55, 11], [55, 25]]);
  trazo("#1d1d1b", [[53, 33], [53, 54]]);
  c.restore();
  c.fillStyle = "#1d1d1b";
  c.font = `700 52px ${display}`;
  c.fillText("Make the Change", 190, 160);
  c.fillStyle = "#d5007f";
  c.font = `700 210px ${display}`;
  c.fillText(CIEN.format(pct), 72, 470);
  c.fillStyle = "#1d1d1b";
  c.font = `700 46px ${display}`;
  c.fillText("de cada 100 votaron", 72, 545);
  c.font = "400 44px Arial, sans-serif";
  lineas(c, frase, 936).forEach((linea, i) => c.fillText(linea, 72, 680 + i * 60));
  c.fillStyle = "#4a4a48";
  c.font = "400 30px Arial, sans-serif";
  c.fillText("Fuente: INE, Conteos Censales de Participación Ciudadana 2024.", 72, 1180);
  c.fillText("Prototipo para el Reto 3 · No es un sitio oficial del INE.", 72, 1224);
  c.fillText(window.location.host, 72, 1268);
  const blob = await new Promise<Blob | null>((resolver) => lienzo.toBlob(resolver, "image/png"));
  return blob ? new File([blob], "mi-caso-make-the-change.png", { type: "image/png" }) : null;
}

export function Huella({ datos }: { datos: RelatoDatos }) {
  const reciente = datos.elecciones.find((e) => e.slug === datos.reciente)!;
  const [lugar, setLugar] = useState("");
  const [edad, setEdad] = useState("");
  const [sexo, setSexo] = useState("");
  const [meta, setMeta] = useState<number | null>(null);
  const [aviso, setAviso] = useState("");
  const [trabajando, setTrabajando] = useState(false);
  const compartible = useSyncExternalStore(sinSuscripcion, puedeCompartirArchivos, () => false);

  const ent = lugar === "" ? null : Number(lugar);
  const anios = edad === "" ? null : Number(edad);
  const s = sexo === "" ? null : Number(sexo);
  const nombre = ent == null ? "" : ent === 0 ? "todo el país" : nombreLugar(ent);

  const caso = useMemo(() => {
    if (ent == null || anios == null || s == null) return { tipo: "vacio" as const };
    const celda = datos.huella.edades[ent][s][anios - 18];
    if (!celda || celda[0] === 0) return { tipo: "sinPersonas" as const };
    const pct = tasa(celda);
    if (pct == null) return { tipo: "protegido" as const };
    const edadTexto = anios === 100 ? "100 años o más" : `${anios} años`;
    const frase = `En ${nombre}, votaron ${deCada(pct)} ${QUIEN[s]} de ${edadTexto} en la elección federal de ${reciente.anio}.`;
    let contraste: string | null = null;
    if (s !== 9) {
      const otro = s === 0 ? 1 : 0;
      const pctOtro = tasa(datos.huella.edades[ent][otro][anios - 18]);
      if (pctOtro != null) {
        contraste = `${otro === 1 ? "Las mujeres" : "Los hombres"} de la misma edad en el mismo lugar: ${deCada(pctOtro)}.`;
      }
    }
    const ritmo = tasa(datos.huella.grupos[ent][s][7]);
    const escenario =
      ritmo != null && ritmo > pct
        ? `Si este grupo votara como las personas de 60 a 69 años del mismo lugar (${deCada(ritmo)}), habría ${ENTEROS.format(
            Math.round((celda[0] * (ritmo - pct)) / 100),
          )} votos más. Es un escenario, no un resultado.`
        : null;
    return { tipo: "resultado" as const, pct, ln: celda[0], sv: celda[1] as number, frase, contraste, escenario };
  }, [anios, datos.huella, ent, nombre, reciente.anio, s]);

  const lugarEscenario = ent ?? 0;
  const generacion = useMemo(() => {
    const grupos = datos.huella.grupos[lugarEscenario][9];
    const joven = sumar([grupos[1], grupos[2], grupos[3]]);
    const actual = tasa(joven);
    const ritmo = tasa(grupos[7]);
    const total = grupos[0];
    if (actual == null || ritmo == null || joven[1] == null || total[1] == null) return null;
    return { joven, actual, ritmo, total: total as [number, number] };
  }, [datos.huella.grupos, lugarEscenario]);

  const objetivo = generacion ? Math.min(generacion.ritmo, Math.max(generacion.actual, meta ?? generacion.ritmo)) : 0;
  const extra = generacion ? Math.round((generacion.joven[0] * (objetivo - generacion.actual)) / 100) : 0;
  const comparable = useMemo(() => {
    if (extra <= 0) return null;
    const candidatas = datos.listaReciente
      .map((ln, clave) => ({ clave, ln }))
      .filter((x) => x.clave > 0 && x.ln > 0 && x.ln <= extra)
      .sort((a, b) => b.ln - a.ln);
    return candidatas[0] ?? null;
  }, [datos.listaReciente, extra]);

  async function compartir() {
    if (caso.tipo !== "resultado") return;
    setTrabajando(true);
    setAviso("Preparando la imagen…");
    const archivo = await imagenCompartible(caso.pct, caso.frase);
    setTrabajando(false);
    if (!archivo) {
      setAviso("No se pudo preparar la imagen. Copia la frase y compártela.");
      return;
    }
    if (compartible) {
      try {
        await navigator.share({ files: [archivo], text: `${caso.frase} #MakeTheChange` });
        setAviso("");
        return;
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") {
          setAviso("");
          return;
        }
      }
    }
    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = archivo.name;
    enlace.click();
    URL.revokeObjectURL(url);
    setAviso("Imagen descargada.");
  }

  async function copiar() {
    if (caso.tipo !== "resultado") return;
    try {
      await navigator.clipboard.writeText(`${caso.frase} #MakeTheChange`);
      setAviso("Frase copiada.");
    } catch {
      setAviso("No se pudo copiar. Selecciona la frase y cópiala.");
    }
  }

  return (
    <section className={`contenedor ${estilos.huella}`} id="huella" aria-labelledby="huella-titulo">
      <div className={estilos.huellaIntro}>
        <h2 id="huella-titulo">Tu huella cívica</h2>
        <p>
          Elige tu lugar, tu edad y tu sexo. La respuesta usa la elección federal del {fechaLarga(reciente.fecha)}.
        </p>
      </div>
      <form className={estilos.huellaForma} onSubmit={(e) => e.preventDefault()}>
        <label className="campo">
          Lugar
          <select value={lugar} onChange={(e) => setLugar(e.target.value)}>
            <option value="">Elige un lugar</option>
            {ENTIDADES.map((x) => (
              <option key={x.clave} value={x.clave}>
                {x.clave === 0 ? "Todo el país" : x.corto}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          Edad
          <select value={edad} onChange={(e) => setEdad(e.target.value)}>
            <option value="">Elige tu edad</option>
            {EDADES.map((x) => (
              <option key={x} value={x}>
                {x === 100 ? "100 o más" : `${x} años`}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          Sexo
          <select value={sexo} onChange={(e) => setSexo(e.target.value)}>
            <option value="">Elige</option>
            <option value="1">Mujeres</option>
            <option value="0">Hombres</option>
            <option value="9">Todas las personas</option>
          </select>
        </label>
      </form>

      <div className={estilos.huellaResultado} aria-live="polite">
        {caso.tipo === "vacio" ? (
          <p className="estado">Elige lugar, edad y sexo para ver tu caso.</p>
        ) : caso.tipo === "sinPersonas" ? (
          <div className="estado">
            <p>
              No hay personas de {anios === 100 ? "100 años o más" : `${anios} años`} en la lista nominal de {nombre}.
            </p>
            <div className="acciones">
              <button type="button" className="btn btn-contorno" onClick={() => setLugar("0")}>
                Ver el país
              </button>
            </div>
          </div>
        ) : caso.tipo === "protegido" ? (
          <div className="estado">
            <p>{TERMINOS.umbral}</p>
            <div className="acciones">
              {s !== 9 ? (
                <button type="button" className="btn btn-contorno" onClick={() => setSexo("9")}>
                  Ver todas las personas
                </button>
              ) : (
                <button type="button" className="btn btn-contorno" onClick={() => setLugar("0")}>
                  Ver el país
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={estilos.caso}>
            <Pastel tamano={168} valor={caso.pct} titulo={caso.frase} />
            <div className={estilos.casoTexto}>
              <p className={estilos.casoFrase}>{caso.frase}</p>
              <p>
                Hay {ENTEROS.format(caso.ln)} {QUIEN[s ?? 9]} así en la lista nominal; votaron {ENTEROS.format(caso.sv)}.
              </p>
              {caso.contraste ? <p>{caso.contraste}</p> : null}
              {caso.escenario ? <p>{caso.escenario}</p> : null}
              <div className="acciones">
                <button type="button" className="btn btn-primario" onClick={compartir} disabled={trabajando}>
                  {compartible ? "Compartir" : "Descargar imagen"}
                </button>
                <button type="button" className="btn btn-contorno" onClick={copiar}>
                  Copiar frase
                </button>
              </div>
            </div>
          </div>
        )}
        {aviso ? (
          <p className="nota" role="status">
            {aviso}
          </p>
        ) : null}
      </div>

      {generacion ? (
        <div className={estilos.escenario}>
          <h3>¿Qué pasaría si votara tu generación en {lugarEscenario === 0 ? "el país" : nombreLugar(lugarEscenario)}?</h3>
          {generacion.actual >= generacion.ritmo ? (
            <p>
              Ahí las personas de 18 a 29 años ya votan igual o más que las de 60 a 69: {deCada(generacion.actual)} frente a{" "}
              {deCada(generacion.ritmo)}.
            </p>
          ) : (
            <>
              <p>
                Hoy votan {deCada(generacion.actual)} personas de 18 a 29 años. Las de 60 a 69, {deCada(generacion.ritmo)}.
                Mueve la barra para ver el escenario.
              </p>
              <label className={estilos.deslizador}>
                <span>
                  Llevar a las personas de 18 a 29 a <strong>{CIEN.format(objetivo)}</strong> de cada 100
                </span>
                <input
                  type="range"
                  min={generacion.actual}
                  max={generacion.ritmo}
                  step={0.01}
                  value={objetivo}
                  onChange={(e) => setMeta(Number(e.target.value))}
                />
              </label>
              <p className={estilos.escenarioCifra}>
                <span className="cifra">{ENTEROS.format(extra)}</span> votos más
              </p>
              <p>
                Hoy ese grupo aporta {CIEN.format((100 * generacion.joven[1]!) / generacion.total[1])} de cada 100 votos;
                en el escenario aportaría {CIEN.format((100 * (generacion.joven[1]! + extra)) / (generacion.total[1] + extra))}.
                {comparable
                  ? ` Son más personas que toda la lista nominal de ${nombreLugar(comparable.clave)} (${ENTEROS.format(comparable.ln)}).`
                  : ""}
              </p>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
