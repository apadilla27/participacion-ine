"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MarcaMTC } from "./MarcaMTC";
import estilos from "./sitio.module.css";

// Dos secciones, siempre visibles: sin menú escondido que haya que descubrir.
const ENLACES = [
  { href: "/", nombre: "Inicio" },
  { href: "/explorar", nombre: "Busca tu municipio" },
] as const;

export function Encabezado() {
  const ruta = usePathname();

  return (
    <header className={estilos.encabezado}>
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
          <Link href="/" className={estilos.campana} aria-label="Make the Change, ir al inicio">
            <MarcaMTC tamano={34} />
            <span>Make the Change</span>
          </Link>
        </div>
        <nav className={estilos.nav} aria-label="Principal">
          <ul>
            {ENLACES.map((e) => (
              <li key={e.href}>
                <Link href={e.href} aria-current={ruta === e.href ? "page" : undefined}>
                  {e.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
