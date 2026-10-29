<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Proyecto: participación ciudadana (INE, Reto 3)

- Lee `README.md`, `docs/decision-log.md` y `docs/plan-sitio.md`.
- Las decisiones del registro no se re-debaten; si algo cambia, se agrega una fila nueva.
- Sin base de datos (D37): el sitio lee JSON estáticos que exporta el ETL validado (`npm run datos`). No hay variables de entorno ni credenciales.
- Datos: `lib/datos/` es el único dueño de la lectura (D52). Los JSON de `data/web/` se importan en módulos de servidor; el explorador descarga `public/datos/`. Nunca leer con `fs` ni `process.cwd()`.
- Privacidad (D46): toda celda desagregada por sexo o edad con `ln < 30` se exporta sin votos; `scripts/verificar-datos.mjs` hace fallar el build si no.
- Cifras de la narrativa: siempre calculadas desde `lib/datos/`, nunca escritas a mano. Formato con `lib/formato.ts` ("X de cada 100", dos decimales, glosario D45).
- Estilos: tokens en `app/globals.css` (el único archivo que procesa Tailwind) y CSS Modules por componente. Las clases globales (`btn`, `tabla`, `orden`, `estado`…) se alcanzan desde un módulo con `:global(...)`.
- Interfaz: usar Impeccable (`.cursor/skills/impeccable`). `PRODUCT.md` y `.impeccable/surfaces/app-page-tsx.md` fijan marca y dirección.
- Identidad: logotipo INE oficial sin alterar y siempre con el aviso de prototipo; la imagen para compartir no lleva el logotipo del INE (D50).
