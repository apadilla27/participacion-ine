"use client";

import Link from "next/link";

export default function ErrorDePagina({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="contenedor" role="alert" style={{ display: "grid", gap: 20, paddingTop: 64, maxWidth: "48rem" }}>
      <h1>Algo falló al mostrar esta sección</h1>
      <p>Vuelve a intentarlo. Si sigue fallando, regresa al inicio.</p>
      <div className="acciones">
        <button type="button" className="btn btn-primario" onClick={() => reset()}>
          Reintentar
        </button>
        <Link className="btn btn-contorno" href="/">
          Ir al inicio
        </Link>
      </div>
    </section>
  );
}
