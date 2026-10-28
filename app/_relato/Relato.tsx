"use client";

import Link from "next/link";
import { useState } from "react";
import type { RelatoDatos } from "@/lib/datos/tipos";
import { Curva } from "./Curva";
import { Espejo } from "./Espejo";
import { Hero } from "./Hero";
import { Huella } from "./Huella";
import { Llega } from "./Llega";
import { Mapa } from "./Mapa";
import estilos from "./relato.module.css";

/** Portada: el estado compartido es la elección que leen la curva y el espejo. */
export function Relato({ datos }: { datos: RelatoDatos }) {
  const [eleccion, setEleccion] = useState(datos.reciente);

  return (
    <div className={estilos.relato}>
      <Hero datos={datos} />
      <Curva datos={datos} eleccion={eleccion} onEleccion={setEleccion} />
      <Huella datos={datos} />
      <Mapa datos={datos} />
      <Espejo datos={datos} eleccion={eleccion} onEleccion={setEleccion} />
      <Llega datos={datos} />
      <section className={`contenedor ${estilos.cierre}`} aria-labelledby="cierre-titulo">
        <h2 id="cierre-titulo">Tu municipio también tiene su historia</h2>
        <p>Elige elección, entidad, sexo y edad, y compara tu municipio con tu entidad y con el país.</p>
        <div className="acciones">
          <Link className="btn btn-dorado" href="/explorar">
            Explora tu municipio
          </Link>
          <Link className="btn btn-contorno" href="/difusion">
            Ver la propuesta de difusión
          </Link>
        </div>
      </section>
    </div>
  );
}
