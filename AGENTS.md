<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Proyecto: participación ciudadana (INE, Reto 3)

- Lee `README.md`, `docs/decision-log.md` y, para la base de datos, `docs/handoff-supabase-cursor.md`.
- Las decisiones del registro no se re-debaten; si algo cambia, se agrega una fila nueva.
- Base de datos: solo agregados. Todo `SUM` sobre tablas `agg_*` filtra los marginales (`sexo = 9`, `grupo_edad_id = 0`, `entidad_clave = 0`).
- Esquema: nunca editar una migración aplicada; crear una nueva en `supabase/migrations` y reflejar el cambio en `etl/` y en `scripts/test-db-local.mjs`.
- Supabase se lee solo en el servidor (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, sin `NEXT_PUBLIC_`).
- Credenciales solo en `.env.local` y `etl/.env`; nunca en archivos versionados.
- Interfaz: usar Impeccable (`.cursor/skills/impeccable`). `PRODUCT.md` ya existe; empezar cada superficie con `shape`.
- Cifras de la narrativa: siempre desde `lib/data/cifras.ts`, nunca escritas a mano.
