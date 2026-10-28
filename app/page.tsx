import { Relato } from "./_relato/Relato";
import { datosRelato } from "@/lib/datos/relato";
import { GEO } from "@/lib/datos/sitio";

export default function Portada() {
  return <Relato datos={datosRelato()} trazos={GEO.trazos} viewBox={GEO.viewBox} />;
}
