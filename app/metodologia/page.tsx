import type { Metadata } from "next";
import { ELECCIONES, etiquetaEleccion, fechaLarga, nombreLugar } from "@/lib/catalogo";
import { cubo } from "@/lib/datos/relato";
import { GEO, META, versionDatos } from "@/lib/datos/sitio";
import { CIEN, TERMINOS } from "@/lib/formato";
import estilos from "../documento.module.css";

export const metadata: Metadata = {
  title: "Metodología",
  description: "Fuentes, definiciones, cobertura, privacidad y correcciones de los datos del micrositio.",
};

export default function PaginaMetodologia() {
  const version = versionDatos();
  return (
    <article className={`contenedor ${estilos.documento}`}>
      <header className={estilos.cabecera}>
        <h1>Metodología</h1>
        <p>
          De dónde salen las cifras, qué significan y qué no dicen. Datos procesados el {version.fecha} (versión{" "}
          {version.completa}).
        </p>
      </header>

      <section>
        <h2>Fuente</h2>
        <p>
          {META.fuente.nombre}. Son conteos de todas las casillas, no estimaciones ni muestras: cada registro de la lista
          nominal de los cuadernillos dice si la persona tiene marca de voto. Descarga:{" "}
          <a href={META.fuente.url} rel="noopener">
            datos abiertos del INE
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Definiciones</h2>
        <dl className={estilos.definiciones}>
          <div>
            <dt>Lista nominal (LN)</dt>
            <dd>Personas en los cuadernillos de las casillas.</dd>
          </div>
          <div>
            <dt>Votaron</dt>
            <dd>{TERMINOS.definicionParticipacion} Se expresa como “de cada 100”, con dos decimales.</dd>
          </div>
          <div>
            <dt>No votaron</dt>
            <dd>Registros sin marca de voto (NV) entre la lista nominal.</dd>
          </div>
          <div>
            <dt>Sin dato</dt>
            <dd>{TERMINOS.definicionSinDato} No se cuentan como “no votaron”.</dd>
          </div>
          <div>
            <dt>Tipo de sección</dt>
            <dd>Urbana, mixta o rural, según el INE para cada elección.</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2>Elecciones</h2>
        <div className="tabla-caja">
          <table className="tabla">
            <caption>Jornadas incluidas y su cobertura.</caption>
            <thead>
              <tr>
                <th scope="col">Elección</th>
                <th scope="col">Fecha</th>
                <th scope="col">Cargos</th>
                <th scope="col">Marco cartográfico</th>
                <th scope="col">Votaron</th>
                <th scope="col">Entidades</th>
              </tr>
            </thead>
            <tbody>
              {ELECCIONES.map((e) => {
                const n = META.nacional.find((x) => x.e === e.id);
                const presentes = cubo.entidades(e.id).length;
                return (
                  <tr key={e.slug}>
                    <th scope="row">{etiquetaEleccion(e)}</th>
                    <td>{fechaLarga(e.fecha)}</td>
                    <td style={{ whiteSpace: "normal", minWidth: "14rem", textAlign: "left" }}>{e.cargos}</td>
                    <td>{e.marco}</td>
                    <td>{n ? CIEN.format(n.pct) : "—"}</td>
                    <td>{presentes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Qué no incluyen los datos</h2>
        <ul>
          <li>Votos en casillas especiales ni voto desde el extranjero.</li>
          <li>
            La sección es la del domicilio de la credencial; por eso las cifras no coinciden con los cómputos distritales.
          </li>
          <li>
            La elección judicial de 2025 no incluye{" "}
            {ELECCIONES.filter((e) => e.tipo === "judicial")
              .flatMap((e) =>
                Array.from({ length: 32 }, (_, i) => i + 1).filter((k) => !cubo.entidades(e.id).includes(k)),
              )
              .map(nombreLugar)
              .join(", ") || "ninguna entidad faltante"}
            .
          </li>
          <li>Prisión preventiva y voto anticipado no tienen lista nominal: solo se cuentan personas.</li>
          <li>Distritos y secciones cambian de marco cartográfico entre elecciones y no se comparan en el tiempo.</li>
        </ul>
      </section>

      <section>
        <h2>Privacidad</h2>
        <p>
          Toda celda por sexo o por edad con menos de {META.umbral} personas en la lista nominal se publica sin votos: el
          sitio dice “sin dato”. El registro no binario, que existe desde 2024, solo se muestra por entidad cuando hay{" "}
          {META.umbral} personas o más.
        </p>
      </section>

      <section>
        <h2>Correcciones al catálogo de municipios</h2>
        <ul>
          <li>
            {META.correcciones.nombres} nombres de municipio corregidos a mano (acentos, erratas y homónimos de Oaxaca). Para el
            resto se usa la grafía que aparece en más elecciones.
          </li>
          <li>
            En{" "}
            {[...new Set(META.correcciones.reasignaciones.map((r) => `${nombreLugar(r.entidad)} ${r.anio}`))].join(", ")} se
            reasignaron {META.correcciones.reasignaciones.length} claves de municipio que ese año correspondían a otros
            municipios.
          </li>
        </ul>
      </section>

      <section>
        <h2>Mapa</h2>
        <p>
          {GEO.fuente.cita} {GEO.fuente.transformacion} Licencia{" "}
          <a href={GEO.fuente.licencia_url} rel="noopener license">
            {GEO.fuente.licencia}
          </a>{" "}
          (uso no comercial). El INEGI y CONABIO no avalan este análisis. Las claves de municipio del INE no coinciden con las
          del INEGI; por eso no hay mapa municipal.
        </p>
      </section>

      <section>
        <h2>Aviso</h2>
        <p>
          Prototipo para el Reto 3 del Hackatón INE 2026. No es un sitio oficial del INE. El logotipo del INE se usa
          conforme a las bases del reto.
        </p>
      </section>
    </article>
  );
}
