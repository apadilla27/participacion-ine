import type { Metadata, Viewport } from "next";
import { advent } from "./fonts";
import { Encabezado } from "./_sitio/Encabezado";
import { Pie } from "./_sitio/Pie";
import "./globals.css";

// En Vercel la imagen para compartir apunta al dominio de producción; en local, a localhost.
const dominio = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const metadata: Metadata = {
  metadataBase: new URL(dominio ? `https://${dominio}` : "http://localhost:3000"),
  title: { default: "Make the Change · Participación ciudadana", template: "%s · Make the Change" },
  description:
    "Cuánto, quién y dónde se vota en México, de 2009 a 2025, con los Conteos Censales de Participación Ciudadana del INE. Prototipo para el Reto 3 del Hackatón INE 2026.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" className={advent.variable}>
      <body>
        <Encabezado />
        <main id="contenido">{children}</main>
        <Pie />
      </body>
    </html>
  );
}
