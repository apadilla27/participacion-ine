import Image from "next/image";
import Link from "next/link";
import { GEO, META, versionDatos } from "@/lib/datos/sitio";
import estilos from "./sitio.module.css";

export function Pie() {
  const version = versionDatos();
  return (
    <footer className={estilos.pie}>
      <div className={`contenedor ${estilos.pieRejilla}`}>
        <div className={estilos.pieMarca}>
          <Image src="/marca/logo-ine.png" alt="Instituto Nacional Electoral" width={449} height={111} />
          <p>
            <strong>Prototipo para el Reto 3 del Hackatón INE 2026. No es un sitio oficial del INE.</strong>
          </p>
        </div>
        <div>
          <h2 className={estilos.pieTitulo}>Fuente</h2>
          <p>
            {META.fuente.nombre}. Datos procesados el {version.fecha} (versión {version.corta}).{" "}
            <a href={META.fuente.url} rel="noopener">
              Datos abiertos del INE
            </a>
            .
          </p>
          <p>
            Mapa: {GEO.fuente.cita} {GEO.fuente.transformacion} Licencia{" "}
            <a href={GEO.fuente.licencia_url} rel="noopener license">
              {GEO.fuente.licencia}
            </a>
            .
          </p>
        </div>
        <div>
          <h2 className={estilos.pieTitulo}>Equipo</h2>
          <p>
            Marianna Itandehui Ramírez Figueroa, Ana Fernanda Padilla Ruiz, Kevin Osvaldo Barajas Anaya y Eduardo
            Michel Magaña. Colima, 31 de octubre de 2026.
          </p>
          <ul className={estilos.pieEnlaces}>
            <li>
              <Link href="/metodologia">Metodología</Link>
            </li>
            <li>
              <Link href="/difusion">Propuesta de difusión</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
