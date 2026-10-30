import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Página no encontrada" };

export default function NoEncontrada() {
  return (
    <section className="contenedor" style={{ display: "grid", gap: 20, paddingTop: 64, maxWidth: "48rem" }}>
      <h1>Esta página no existe</h1>
      <p>Puede que el enlace esté incompleto. Vuelve al inicio o busca tu municipio.</p>
      <div className="acciones">
        <Link className="btn btn-primario" href="/">
          Ir al inicio
        </Link>
        <Link className="btn btn-contorno" href="/explorar">
          Busca tu municipio
        </Link>
      </div>
    </section>
  );
}
