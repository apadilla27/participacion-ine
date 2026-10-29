"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useRef, useState } from "react";
import { MarcaMTC } from "./MarcaMTC";
import estilos from "./sitio.module.css";

const ENLACES = [
  { href: "/", nombre: "Relato" },
  { href: "/explorar", nombre: "Explorar" },
  { href: "/difusion", nombre: "Difusión" },
  { href: "/metodologia", nombre: "Metodología" },
] as const;

export function Encabezado() {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const idMenu = useId();
  const boton = useRef<HTMLButtonElement>(null);

  return (
    <header
      className={estilos.encabezado}
      onKeyDown={(e) => {
        // Escape cierra el menú móvil y regresa el foco al botón que lo abrió.
        if (abierto && e.key === "Escape") {
          setAbierto(false);
          boton.current?.focus();
        }
      }}
    >
      <a className="saltar" href="#contenido">
        Saltar al contenido
      </a>
      <div className={`contenedor ${estilos.barra}`}>
        <div className={estilos.marcas}>
          <Image
            className={estilos.logoIne}
            src="/marca/logo-ine.png"
            alt="Instituto Nacional Electoral"
            width={449}
            height={111}
            priority
          />
          <Link href="/" className={estilos.campana} aria-label="Make the Change, ir al relato">
            <MarcaMTC tamano={34} />
            <span>Make the Change</span>
          </Link>
        </div>
        <button
          ref={boton}
          type="button"
          className={estilos.botonMenu}
          aria-expanded={abierto}
          aria-controls={idMenu}
          onClick={() => setAbierto((v) => !v)}
        >
          {abierto ? "Cerrar" : "Menú"}
        </button>
        <nav id={idMenu} className={estilos.nav} data-abierto={abierto} aria-label="Principal">
          <ul>
            {ENLACES.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  aria-current={ruta === e.href ? "page" : undefined}
                  onClick={() => setAbierto(false)}
                >
                  {e.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className={`contenedor ${estilos.aviso}`}>Prototipo para el Reto 3 · No es un sitio oficial del INE</p>
    </header>
  );
}
