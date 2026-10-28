import type { Metadata } from "next";
import { Suspense } from "react";
import { Explorador } from "./Explorador";
import estilos from "./explorar.module.css";

export const metadata: Metadata = {
  title: "Explorar",
  description: "Participación por elección, entidad, municipio, sexo y edad, de 2009 a 2025.",
};

export default function PaginaExplorar() {
  return (
    <div className={`contenedor ${estilos.pagina}`}>
      <header className={estilos.cabecera}>
        <h1>Explora tu entidad y tu municipio</h1>
        <p>
          Elige elección, entidad, sexo y edad. Los filtros quedan en la dirección de la página, así que puedes compartir lo
          que estás viendo.
        </p>
      </header>
      <Suspense
        fallback={
          <p className="estado" data-tono="espera">
            Cargando el explorador…
          </p>
        }
      >
        <Explorador />
      </Suspense>
    </div>
  );
}
