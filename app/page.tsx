import { Relato } from "./_relato/Relato";
import { datosRelato } from "@/lib/datos/relato";

export default function Portada() {
  return <Relato datos={datosRelato()} />;
}
