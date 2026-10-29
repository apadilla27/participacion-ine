// Genera public/geo/entidades.json: 32 trazos SVG de las entidades federativas.
//
// Fuente: INEGI (2024). "AGEE Área Geoestadística Estatal", escala 1:250000, publicada por CONABIO como
// "División política estatal 1:250000. 2023" (dest23gw), licencia CC BY-NC 2.5 MX (uso no comercial, citar
// a INEGI y CONABIO). La geometría se proyecta a la cónica conforme de Lambert de México (EPSG:6372),
// se simplifica y se escala a un viewBox de 1000 × 640. Ver docs/decision-log.md (D40).
//
// Uso:  node etl/geo/entidades.mjs [ruta/al/dest23gw.shp]
//       (por defecto %USERPROFILE%\participacion-ine-etl\geo\dest23gw\dest23gw.shp)

import mapshaper from "mapshaper";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

const raiz = resolve(import.meta.dirname, "..", "..");
const shp = resolve(process.argv[2] ?? join(homedir(), "participacion-ine-etl", "geo", "dest23gw", "dest23gw.shp"));
const destino = join(raiz, "public", "geo", "entidades.json");
const ANCHO = 1000;
const ALTO = 640;
const MARGEN = 8;

if (!existsSync(shp)) {
  console.error(`No existe ${shp}. Descarga dest23gw.zip de CONABIO y descomprímelo (ver docs/decision-log.md, D40).`);
  process.exit(1);
}

const salida = await mapshaper.applyCommands(
  // Islas de menos de 400 km² (Guadalupe, Revillagigedo, Cedros…) se quitan: agrandan el lienzo y en
  // pantalla no se distinguen. Se conservan Cozumel, Tiburón y Ángel de la Guarda.
  `-i "${shp}" -proj EPSG:6372 -filter-islands min-area=400km2 remove-empty -simplify 1.2% weighted keep-shapes ` +
    `-filter-fields CVE_ENT,NOMGEO -o format=geojson precision=1 salida.json`,
);
const geo = JSON.parse(salida["salida.json"].toString());

let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;
const anillos = (geometria) =>
  geometria.type === "Polygon" ? [geometria.coordinates] : geometria.coordinates;
for (const f of geo.features) {
  for (const poligono of anillos(f.geometry)) {
    for (const anillo of poligono) {
      for (const [x, y] of anillo) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
}
const escala = Math.min((ANCHO - 2 * MARGEN) / (maxX - minX), (ALTO - 2 * MARGEN) / (maxY - minY));
const dx = (ANCHO - (maxX - minX) * escala) / 2;
const dy = (ALTO - (maxY - minY) * escala) / 2;
const px = (x) => Math.round(((x - minX) * escala + dx) * 10) / 10;
const py = (y) => Math.round(((maxY - y) * escala + dy) * 10) / 10;

const trazos = geo.features
  .map((f) => {
    const clave = Number(f.properties.CVE_ENT);
    let d = "";
    let cx = 0;
    let cy = 0;
    let n = 0;
    for (const poligono of anillos(f.geometry)) {
      for (const anillo of poligono) {
        anillo.forEach(([x, y], i) => {
          d += `${i === 0 ? "M" : "L"}${px(x)} ${py(y)}`;
          cx += px(x);
          cy += py(y);
          n += 1;
        });
        d += "Z";
      }
    }
    return { clave, nombre: f.properties.NOMGEO, d, centro: [Math.round(cx / n), Math.round(cy / n)] };
  })
  .sort((a, b) => a.clave - b.clave);

if (trazos.length !== 32 || trazos.some((t, i) => t.clave !== i + 1)) {
  console.error("La capa no trae las 32 entidades con clave 01-32.");
  process.exit(1);
}

mkdirSync(dirname(destino), { recursive: true });
const contenido = {
  viewBox: [0, 0, ANCHO, ALTO],
  fuente: {
    cita: "INEGI (2024). AGEE Área Geoestadística Estatal, escala 1:250000. Publicada por CONABIO como «División política estatal 1:250000. 2023».",
    licencia: "CC BY-NC 2.5 MX",
    licencia_url: "https://creativecommons.org/licenses/by-nc/2.5/mx/",
    url: "http://geoportal.conabio.gob.mx/metadatos/doc/html/dest23gw.html",
    transformacion: "Geometría proyectada (EPSG:6372), simplificada y escalada por el equipo.",
  },
  trazos,
};
writeFileSync(destino, JSON.stringify(contenido));
console.log(`public/geo/entidades.json · ${trazos.length} entidades · ${(JSON.stringify(contenido).length / 1024).toFixed(0)} KB`);
