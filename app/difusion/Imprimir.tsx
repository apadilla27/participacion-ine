"use client";

export function Imprimir() {
  return (
    <button type="button" className="btn btn-dorado" onClick={() => window.print()}>
      Guardar como PDF
    </button>
  );
}
