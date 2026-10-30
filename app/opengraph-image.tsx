import { ImageResponse } from "next/og";
import { datosRelato } from "@/lib/datos/relato";
import { CIEN } from "@/lib/formato";

export const alt = "Make the Change: a los 18 años, cuántas personas de cada 100 votaron en 2024";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen para compartir del sitio: marca de campaña, cifra y fuente; sin logotipo del INE (D50). */
export default function Imagen() {
  const d = datosRelato();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          borderTop: "18px solid #d5007f",
          padding: "56px 72px",
          color: "#1d1d1b",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, fontWeight: 700 }}>
          <svg width="72" height="72" viewBox="0 0 64 64">
            <path d="M11 54V12l21 24" fill="none" stroke="#1d1d1b" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M32 36l17-20" fill="none" stroke="#d5007f" strokeWidth="8" strokeLinecap="round" />
            <path d="M41 11h14v14" fill="none" stroke="#d5007f" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M53 33v21" fill="none" stroke="#1d1d1b" strokeWidth="8" strokeLinecap="round" />
          </svg>
          Make the Change
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 150, fontWeight: 700, color: "#d5007f", lineHeight: 1 }}>{CIEN.format(d.hero.estreno)}</div>
          <div style={{ fontSize: 48, fontWeight: 700 }}>de cada 100 votaron a los 18 años en 2024</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 26, color: "#4a4a48" }}>
          <span>Fuente: INE (DECEyEC), Conteos Censales de Participación Ciudadana.</span>
        </div>
      </div>
    ),
    size,
  );
}
