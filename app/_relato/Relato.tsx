"use client";

import Link from "next/link";
import { useState } from "react";
import { MarcaMTC } from "@/app/_sitio/MarcaMTC";
import type { RelatoDatos } from "@/lib/datos/tipos";
import { Curva } from "./Curva";
import { Espejo } from "./Espejo";
import { Glosario } from "./Glosario";
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
      <Glosario />
      <Curva datos={datos} eleccion={eleccion} onEleccion={setEleccion} />
      <Huella datos={datos} />
      <Mapa datos={datos} />
      <Espejo datos={datos} eleccion={eleccion} onEleccion={setEleccion} />
      <Llega datos={datos} />
      <section className={`${estilos.seccion} ${estilos.bandaRosa} sobre-oscuro`} aria-labelledby="cierre-titulo">
        <div className={`contenedor ${estilos.cierre}`}>
          <div className={estilos.cierreFirma}>
            <MarcaMTC tamano={220} trazo="#ffffff" flecha="#5c0c30" />
          </div>
          <h2 id="cierre-titulo">Tu voto también cuenta</h2>
          <p>
            Cada número de esta página son personas como tú. Busca tu municipio, compártelo con tu familia y tus amistades,
            y en la próxima elección, vota.
          </p>
          <div className="acciones">
            <Link className="btn btn-primario" href="/explorar">
              Busca tu municipio
            </Link>
            <a className="btn btn-contorno" href="#huella">
              Calcula tu caso
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
