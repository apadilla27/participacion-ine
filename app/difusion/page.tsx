import type { Metadata } from "next";
import Link from "next/link";
import { fechaLarga } from "@/lib/catalogo";
import { datosRelato, rankingReciente } from "@/lib/datos/relato";
import { META } from "@/lib/datos/sitio";
import { CIEN, ENTEROS, deCada } from "@/lib/formato";
import { Imprimir } from "./Imprimir";
import estilos from "../documento.module.css";

export const metadata: Metadata = {
  title: "Propuesta de difusión",
  description: "Mensaje central, públicos, canales y guion para llevar la participación ciudadana a la gente.",
};

export default function PaginaDifusion() {
  const d = datosRelato();
  const ranking = rankingReciente();
  const alto = ranking[0];
  const bajo = ranking[ranking.length - 1];
  const reciente = d.elecciones.find((e) => e.slug === d.reciente)!;
  const serie2012 = d.serie.find((f) => f.slug === "fed2012");
  const serieReciente = d.serie.find((f) => f.slug === d.reciente)!;
  const brecha = Math.round((d.hero.mujeres - d.hero.hombres) * 100) / 100;

  return (
    <article className={`contenedor ${estilos.documento}`}>
      <header className={estilos.cabecera}>
        <h1>Propuesta de difusión</h1>
        <p>
          Make the Change · Hackatón INE 2026 · Reto 3, Storytelling y Comunicación Pública. Las cifras salen de los
          Conteos Censales de Participación Ciudadana del INE (versión de datos {META.v}).
        </p>
        <div className="acciones no-imprimir">
          <Imprimir />
          <Link className="btn btn-contorno" href="/">
            Volver al relato
          </Link>
        </div>
      </header>

      <section>
        <h2>Mensaje central</h2>
        <p className={estilos.destacado}>
          A los 18, {CIEN.format(d.hero.estreno)} de cada 100 votaron. Entre los hombres de {d.hero.piso.edad},{" "}
          {CIEN.format(d.hero.piso.hombres)}.
        </p>
        <p>
          Descubre quién participa, dónde y cuánto ha cambiado desde 2009. La participación se dice siempre como “de cada
          100” y se dibuja en un pastel con el mismo número. No es un regaño ni una encuesta: son los conteos de todas las
          casillas, y no explican causas que el conteo no trae.
        </p>
      </section>

      <section>
        <h2>Públicos</h2>
        <ol>
          <li>
            <strong>Ciudadanía de 18 a 35 años.</strong> Llega desde redes en el teléfono. Es el grupo que menos vota: en{" "}
            {reciente.anio} las personas de 18 a 29 votaron {serieReciente.joven == null ? "—" : deCada(serieReciente.joven)}, frente
            a {deCada(serieReciente.pct)} en el país.
          </li>
          <li>
            <strong>Docentes y periodistas.</strong> Necesitan cifras citables, la metodología y la tabla detrás de cada
            gráfica.
          </li>
          <li>
            <strong>Personal del INE y de los OPLE.</strong> Usa el explorador para preparar material de su entidad y su
            municipio.
          </li>
        </ol>
      </section>

      <section>
        <h2>La narrativa, con el dato</h2>
        <p>
          El {fechaLarga(reciente.fecha)} había {ENTEROS.format(d.hero.ln)} personas en la lista nominal y votaron{" "}
          {deCada(d.hero.pct)}. Las mujeres votaron {CIEN.format(brecha)} puntos más que los hombres.
          {serie2012 && serie2012.joven != null && serieReciente.joven != null
            ? ` En 2012 las personas de 18 a 29 votaron ${CIEN.format(serie2012.pct - serie2012.joven)} puntos debajo del país; en ${reciente.anio}, ${CIEN.format(serieReciente.pct - serieReciente.joven)}.`
            : ""}
        </p>
        <p>
          {alto.nombre} fue la entidad que más votó ({deCada(alto.pct)}) y {bajo.nombre} la que menos ({deCada(bajo.pct)}).{" "}
          {ENTEROS.format(d.llega.prision.total)} personas votaron en prisión preventiva y {ENTEROS.format(d.llega.anticipado.total)}{" "}
          de forma anticipada: son modalidades de la misma elección.
          {d.llega.judicial
            ? ` La elección judicial del ${fechaLarga(d.llega.judicial.fecha)} es otra jornada: votaron ${deCada(d.llega.judicial.pct)}.`
            : ""}
        </p>
      </section>

      <section>
        <h2>El prototipo</h2>
        <p>
          La pieza pública es este micrositio. El relato abre con dos pasteles (los 18 años y los hombres de {d.hero.piso.edad}),
          sigue con la curva por edad, la calculadora de tu caso, el mapa de las 32 entidades, el espejo de mujeres y hombres,
          y las otras formas de votar. El explorador abre municipio, sexo y edad en las siete elecciones. Toda gráfica tiene su
          tabla, y ningún dato de menos de 30 personas se muestra por sexo o edad.
        </p>
      </section>

      <section>
        <h2>Canales y piezas</h2>
        <p>Cada pieza lleva una sola cifra, la frase del micrositio, la fuente y el aviso de prototipo. No promete alcance.</p>
        <ol>
          <li>
            <strong>Historias y videos cortos.</strong> Una pieza por hallazgo: los 18 años contra los hombres de{" "}
            {d.hero.piso.edad}; mujeres y hombres de la misma edad; {alto.nombre} frente a {bajo.nombre}; las otras formas de
            votar. La imagen de “Tu huella cívica” se comparte desde el teléfono.
          </li>
          <li>
            <strong>Preparatorias y universidades.</strong> Cuarenta minutos sin registro: cada persona calcula su caso con la
            edad de la sala, se comparte la imagen y se busca el municipio en el explorador.
          </li>
          <li>
            <strong>Juntas locales del INE y OPLE.</strong> Cada junta usa el enlace del explorador con su entidad ya elegida,
            por ejemplo <code>/explorar?ent=6</code> para Colima.
          </li>
          <li>
            <strong>Medios.</strong> Tres frases verificables: los 18 años ({deCada(d.hero.estreno)}), los hombres de{" "}
            {d.hero.piso.edad} ({deCada(d.hero.piso.hombres)}) y {alto.nombre} frente a {bajo.nombre}.
          </li>
        </ol>
      </section>

      <section>
        <h2>Guion para el video de tres minutos</h2>
        <p className="nota">El equipo lo graba sobre el micrositio abierto.</p>
        <ol className={estilos.guion}>
          <li>
            <span>0:00</span>
            “A los 18, {deCada(d.hero.estreno)} votaron. Entre los hombres de {d.hero.piso.edad}, {deCada(d.hero.piso.hombres)}.”
            Se ven los dos pasteles.
          </li>
          <li>
            <span>0:30</span>
            La curva recorre la edad y se cambia de elección para ver el patrón.
          </li>
          <li>
            <span>1:05</span>
            Se calcula un caso en “Tu huella cívica” y se comparte la imagen.
          </li>
          <li>
            <span>1:45</span>
            El mapa: {alto.nombre}, {deCada(alto.pct)}; {bajo.nombre}, {deCada(bajo.pct)}. Se abre un municipio.
          </li>
          <li>
            <span>2:15</span>
            Prisión preventiva, voto anticipado y la elección judicial como otra jornada.
          </li>
          <li>
            <span>2:40</span>
            Cierre: “De cada 100 que podían votar en {reciente.anio}, votaron {CIEN.format(d.hero.pct)}.” Make the Change y la
            dirección del micrositio.
          </li>
        </ol>
      </section>

      <p className={estilos.aviso}>
        Fuente: {META.fuente.nombre}. Prototipo para el Reto 3 del Hackatón INE 2026. No es un sitio oficial del INE.
      </p>
    </article>
  );
}
