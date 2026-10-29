import localFont from "next/font/local";

/** Advent Pro (OFL), voz de la campaña para títulos y cifras (D48). El texto usa Arial. */
export const advent = localFont({
  src: "../assets/fonts/AdventPro.ttf",
  variable: "--font-advent",
  weight: "100 900",
  display: "swap",
});
