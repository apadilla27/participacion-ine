import type { Metadata } from "next";
import { Suspense } from "react";
import { Explorador } from "./Explorador";
import estilos from "./explorar.module.css";

export const metadata: Metadata = {
  title: "Busca tu municipio",
  description: "Cuántas personas votaron en tu entidad y en tu municipio, de 2009 a 2025: mujeres, hombres y por edad.",
};

export default function PaginaExplorar() {
  return (
    <>
      <div className={estilos.cabeceraBanda}>
        <header className={`contenedor ${estilos.cabecera}`}>
          <h1>Busca tu entidad y tu municipio</h1>
          <p>
            Elige un año de elección y tu entidad. Si quieres, mira solo a las mujeres, solo a los hombres o una edad.
            Luego comparte lo que encontraste.
          </p>
        </header>
      </div>
      <div className={`contenedor ${estilos.pagina}`}>
        <Suspense
          fallback={
            <p className="estado" data-tono="espera">
              Cargando…
            </p>
          }
        >
          <Explorador />
        </Suspense>
      </div>
    </>
  );
}
