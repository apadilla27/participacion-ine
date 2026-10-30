import Image from "next/image";
import { GEO, META, versionDatos } from "@/lib/datos/sitio";
import estilos from "./sitio.module.css";

export function Pie() {
  const version = versionDatos();
  return (
    <footer className={estilos.pie}>
      <div className={`contenedor ${estilos.pieRejilla}`}>
        <div className={estilos.pieMarca}>
          <Image src="/marca/logo-ine.png" alt="Instituto Nacional Electoral" width={449} height={111} />
        </div>
        <div>
          <h2 className={estilos.pieTitulo}>De dónde salen los números</h2>
          <p>
            {META.fuente.nombre}: el INE contó, casilla por casilla, quién votó y quién no. No incluye el voto desde el
            extranjero ni las casillas especiales. Datos actualizados al {version.fecha}.{" "}
            <a href={META.fuente.url} rel="noopener">
              Ver los datos abiertos del INE
            </a>
            .
          </p>
          <p>
            Mapa de las entidades: INEGI (2024), publicado por{" "}
            <a href={GEO.fuente.url} rel="noopener">
              CONABIO
            </a>
            ; el equipo lo simplificó para la web. Licencia{" "}
            <a href={GEO.fuente.licencia_url} rel="noopener license">
              {GEO.fuente.licencia}
            </a>
            .
          </p>
        </div>
        <div>
          <h2 className={estilos.pieTitulo}>Equipo</h2>
          <p>
            Marianna Itandehui Ramírez Figueroa, Ana Fernanda Padilla Ruiz, Kevin Osvaldo Barajas Anaya y Eduardo Michel
            Magaña.
          </p>
        </div>
      </div>
    </footer>
  );
}
