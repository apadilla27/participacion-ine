# Plan 2: cumplir el Reto 3 con identidad INE y un micrositio interactivo

> **Plan vigente del sitio** (aprobado el 2026-10-27). Reemplaza a `docs/plan-proyecto.md`.
>
> Ajustes de ejecución, registrados en `docs/decision-log.md`:
> - Mapa: capa estatal del INEGI publicada por CONABIO (CC BY-NC 2.5 MX), no el Marco Geoestadístico completo (D40).
> - Sin `'use cache'`: los JSON importados en módulos de servidor ya quedan prerenderados (D37).
> - Logotipo INE: versión gris oficial; el logotipo móvil de ine.mx no se usa (D38).
> - Tailwind procesa solo `app/globals.css` (D54).
> - La geometría del mapa se descarga solo al mostrar el mapa (D55).
> - La geometría la genera `etl/geo/entidades.mjs` (Node + mapshaper), no un script de Python.

Revisión 2 del plan (2026-10-27). Rehecho después de leer el código de cada pantalla, medir los datos del ETL y verificar versiones, licencias y fuentes.

## Context

La usuaria preguntó si hoy cumplimos los requerimientos del Reto 3 y pidió un plan con dos condiciones: usar el logotipo y la paleta del INE, y mantener una interfaz interactiva y fácil de entender, como el mapa ya implementado.

**Fecha límite:** `/guion` dice "Colima, 31 de octubre de 2026" (Hackatón INE 2026). Hoy es 27 de octubre, así que quedan 4 días. El plan marca un **corte mínimo** (fases 0-4) que debe estar listo antes; lo demás mejora la entrega.

Estado verificado:
- **A, el repositorio** (`C:\Users\anafe\Desktop\Proyecto GOB`, GitHub `apadilla27/participacion-ine`, commit `817e7d0`):
  - ETL validado (19/19) con Chiapas 2018 reasignado y 21 nombres corregidos. Su base de trabajo vive en `%USERPROFILE%\participacion-ine-etl\conteos.duckdb` (1.18 GB, tablas `out_*` presentes).
  - Plantilla vacía de Next 16.4.3, esquema Supabase y documentación.
- **B, la interfaz real** (`C:\Users\anafe\OneDrive\Desktop\Proyecto GOB`, sin Git):
  - Portada narrativa con hero, curva por edad, calculadora "Tu huella cívica", mapa coroplético, espejo por sexo y "Otras formas de votar".
  - Explorador `/lectura` y documento `/guion`.
  - Next 15.5, datos JSON de 55 MB fuera de Git, sin Supabase.

Decisiones de la usuaria en esta ronda:
1. Las bases del reto permiten usar la identidad del INE.
2. Este plan cubre **solo el sitio**; el PDF y el video quedan fuera.
3. Se unifica en A y GitHub.
4. **Sin Supabase.**
5. **El INE es el emisor; "Make the Change" es el nombre de la campaña.**
6. Se quita la portada "abanico".

---

## 1. ¿Cumplimos hoy? No todavía

| Requisito | Estado hoy | Este plan |
|---|---|---|
| Mensaje central y público | **Parcial.** Hay dos mensajes distintos: `docs/mensaje-central.md` en A y el H1 de B | Un solo mensaje (D44) en portada, difusión, metadatos e imagen para compartir |
| Narrativa clara, veraz y atractiva | **Parcial.** Expone celdas privadas, cruza Chiapas 2018, no corrige nombres, tiene frases con cifras fijas y muestra 0 % sin aviso | Datos del ETL validado, frases calculadas y build que falla si faltan datos |
| Prototipo visual funcional | **Parcial.** Solo corre en tu PC | Repositorio único, compila y queda listo para Vercel |
| Propuesta de difusión | **Parcial.** `/guion` existe, pero no hay imagen OG ni favicon | `/difusion` imprimible, imagen OG y compartir nativo |
| Por qué participar | **Sí.** "¿Qué pasaría si votara tu generación?" | Se conserva |
| Variación por grupos y regiones | **Sí**, pero las lecturas solo existen en 2024 y la CDMX mide 4 px en móvil | Todas las lecturas en las 7 elecciones, vista Mosaico (§5.3) |
| Comparaciones temporales y territoriales | **Sí**, pero sin la judicial 2025 en el mapa | 7 elecciones en mapa, explorador y fichas |
| Claridad antes que efecto | **Parcial.** "No votaron" y "voto contado" se mezclan, hay enteros contra decimales, la leyenda es fija y el azul falla AA | Glosario único (D45), escala por clases, AA |
| Material educativo del INE | **Parcial.** Sin identidad INE | Identidad INE y aviso de prototipo |
| **Logo y colores INE** (tu condición) | **No** | §4 |
| **Interfaz interactiva y fácil** (tu condición) | **Sí** | Se conserva y se mejora (§5) |
| Guion PDF y video pitch | No existen | **Fuera de alcance.** `/difusion` imprime como PDF y trae el guion del video |

---

## 2. Registro de decisiones nuevas

Se agregan a `docs/decision-log.md` en la fase 6. Las anteriores se marcan como reemplazadas en el mismo cambio.

| # | Decisión | Por qué | Reemplaza |
|---|---|---|---|
| D37 | Sin Supabase: el sitio lee JSON estáticos exportados del ETL validado | Datos históricos fijos, demo sin pausas ni red, decisión de la usuaria | D1 (parcial), D2, D7, D15, D25, D26, D34, D35 |
| D38 | Identidad del INE con logotipo oficial, permitida por las bases del reto. Aviso fijo: "Prototipo para el Reto 3 del Hackatón INE 2026. No es un sitio oficial del INE." | El INE pidió no usar su logo sin autorización (ACQyD-INE-131/2024); el aviso evita confusión | Confirma D36 |
| D39 | El INE es el emisor y "Make the Change" la campaña; la "M" se redibuja en SVG con la paleta INE | Decisión de la usuaria | — |
| D40 | Geometría del Marco Geoestadístico del INEGI, simplificada y atribuida con "Fuente: INEGI, Marco Geoestadístico (versión). Geometría simplificada por el equipo." | Los términos del INEGI permiten adaptar si se cita y se avisa la transformación | D13 |
| D41 | Gráficas en SVG propio (las de B); se retira Recharts | Ya existen y funcionan | D19 |
| D42 | Se abandona el contrato "fichero" de Impeccable; la portada mantiene la estructura actual del relato | La usuaria pidió conservar esta interacción; el abanico no mostraba datos | D23 |
| D43 | Impeccable sin ronda de dirección: marca y composición quedan fijadas por la usuaria. Flujo: `shape` → construir → `critique`/`audit`/`polish` → revisión final → `DESIGN.md` | Una ronda de dados sobre una dirección ya fijada no aporta y gasta 1 de 4 días | D21 (ajuste) |
| D44 | Mensaje central: H1 calculado ("A los 18, X de cada 100 votaron. Entre los hombres de N, Y.") y una entradilla fija ("Descubre quién participa, dónde y cuánto ha cambiado desde 2009.") | El dato concreto engancha y la entradilla da el marco | Mensaje de `docs/mensaje-central.md` |
| D45 | Glosario: "votaron" = SV / LN con 2 decimales en todo el sitio. "No votaron" = NV / LN. "Sin dato" = NS / LN, nombrado aparte. Nunca "no votaron" para NV + NS | Hoy `/lectura` redondea a enteros y mezcla NV con NS | — |
| D46 | Privacidad única: toda celda desagregada por sexo o edad con `ln < 30` se exporta sin SV, NV ni NS | Hoy se exponen 15,776 celdas municipales por sexo, 2,767 por edad y 176 celdas de entidad × edad | Amplía D12/D30 |
| D47 | Datos del explorador en archivos estáticos por elección y entidad (`public/datos/m/{eleccion}/{entidad}.json`) | Oaxaca tiene 119,556 filas; partido por elección pesa unos 90 KB gzip y se sirve por CDN sin función | Elimina `app/api/conteos` (`force-dynamic` no es compatible con Cache Components) |
| D48 | Tipografía: Advent Pro para títulos y cifras (voz de campaña, OFL, local); pila Arial para el texto | El manual del INE usa Arial; mejor lectura y nada que descargar | Farro como texto |
| D49 | Colores: rosa INE para el dato principal y escala secuencial de rosa a vino. Mujeres en vino y línea continua; hombres en gris oscuro y línea discontinua; etiquetas directas | Sin estereotipo rosa/azul y legible con daltonismo | Violeta y azul de B |
| D50 | La imagen para compartir lleva la marca de campaña, la fuente y el aviso, no el logotipo del INE | Una tarjeta suelta con el logo del INE parecería oficial | — |
| D51 | Versiones: Next 16.4.3 (último parche), React y React DOM 19.3.1 (parche), TypeScript 5.9.3 (7.0 es salto mayor), mapshaper 0.7.100 fijado para el ETL | Versiones vigentes sin cambiar de versión mayor | D33 (ajuste) |
| D52 | Un dueño por tema:<br>- `lib/datos/` lee los datos.<br>- `lib/catalogo.ts` sale del catálogo exportado (`data/web/catalogo.json`) en lugar de una lista escrita a mano.<br>- `lib/formato.ts` formatea números y textos del glosario.<br>- `app/_ui/` guarda los primitivos (Pastel, Segmento, Selector, Ficha, Estado, Tabla). | Hoy el catálogo está duplicado en tres lugares y el pastel redondea distinto en cada página | — |
| D53 | Sin consola de administración: la "torre de control" es `data/web/meta.json` (versión y fecha) en el pie y en `/metodologia`, el reporte del ETL y la verificación previa al build | El sitio es de solo lectura | Ajusta D16 |

---

## 3. Arquitectura

### 3.1 Datos (una sola tubería)

```
CSV del INE → npm run etl (run_etl.py, 19 validaciones) → conteos.duckdb (out_*)
            → npm run datos (etl/export_web.py) → data/web/*.json + public/datos/m/**
            → npm run build (prebuild: scripts/verificar-datos.mjs) → sitio estático
```

| Archivo | Contenido | Lo usa |
|---|---|---|
| `data/web/meta.json` | `version_datos`, fecha, URL de la fuente, versión de la geometría, nacional por elección | Pie, `/metodologia`, verificación |
| `data/web/catalogo.json` | Elecciones, entidades y grupos (del seed del ETL) y los 2,477 municipios | Todas las pantallas |
| `data/web/entidad.json` | `out_agg_entidad` compacto | Mapa, fichas, serie, explorador |
| `data/web/edad.json` | `out_agg_entidad_edad`, las 7 elecciones | Curva, calculadora, espejo |
| `data/web/tipo.json` | `out_agg_tipo_seccion` | Rural/urbana en mapa y explorador |
| `data/web/modalidad.json` | `out_agg_modalidad_voto` | "Otras formas de votar" |
| `public/datos/m/{eleccion}/{entidad}.json` | Municipios de una entidad × sexo (0, 1, 9) × grupo | Explorador |
| `public/geo/entidades.json` | 32 trazos SVG (viewBox 1000×640) | Mapa |

Reglas:
- `lib/datos/*.ts` lleva `import 'server-only'` e importa los JSON, que quedan empaquetados en el build. No usa `fs` ni `process.cwd()`.
- Las funciones de agregación llevan `'use cache'` con `cacheLife('max')`.
- Los componentes cliente reciben solo el fragmento que pintan. El cubo de edad completo ya no viaja al navegador:
  - La calculadora recibe FED2024: 33 entidades × 3 sexos × 83 edades.
  - La curva y el espejo reciben solo los datos nacionales por edad de las 7 elecciones.
- `scripts/verificar-datos.mjs` hace fallar el build si:
  - falta un archivo o la versión no coincide;
  - la participación nacional no coincide con el reporte del ETL (FED2024 55.83 %, PJ2025 12.84 %);
  - alguna celda con `ln < 30` trae votos;
  - Chiapas 2018 no está reasignado;
  - no hay 32 trazos;
  - un municipio citado no existe en el catálogo.
- `.gitignore` deja de excluir `data/`. El tamaño comprometido estimado es de unos 12 MB.

### 3.2 Rutas (todas estáticas)

| Ruta | Viene de | Para qué sirve |
|---|---|---|
| `/` | `app/page.tsx` + `app/relato/*` de B | Relato principal |
| `/explorar` | `app/lectura/lectura.tsx` de B, sin el abanico | Encontrar tu entidad y tu municipio |
| `/difusion` | `app/guion` de B | Propuesta de difusión imprimible y guion del video |
| `/metodologia` | El pie de B, ampliado | Fuentes, definiciones, correcciones, versión de datos, avisos |
| `not-found`, `error` | Nuevos | Salida a portada o al explorador |
| `opengraph-image`, `icon.svg` | Nuevos | Compartir y pestaña |

- **Estilos:** tokens en `app/globals.css` (Tailwind 4 `@theme`) y estilos de componente en CSS Modules. Así se acaban los choques de `.marca` y `.ficha` entre hojas.
- **Navegación:** `next/link`. Al cambiar de página no queda CSS de otra ruta aplicado.

---

## 4. Identidad

- **Encabezado:** logotipo INE (no es enlace) + "M" de Make the Change, que lleva a `/`.
  - Aviso en texto de 14 px: "Prototipo para el Reto 3 · No es un sitio oficial del INE".
  - El aviso se repite completo en el pie.
- **Logotipo INE:**
  - Se usa `logo_ine_2026.png` y `logo_movil_2026.png` de ine.mx, o el kit de los organizadores si lo entregan. Se descarga con tu confirmación.
  - Se respeta su área de protección y no se altera.
- **Paleta:** el manual del OIC del INE fija Pantone 233 (rosa mexicano), Process Black y Cool Gray 7. El rosa de pantalla se mide en el logotipo oficial descargado.
  - Valor de partida: `#D5007F`, que da 7.0:1 sobre blanco.
  - Gris `#97999B` solo para líneas y fondos.
  - Texto en `#1D1D1B`, con texto secundario de al menos 4.5:1.
  - Una escala secuencial de 6 clases de rosa a vino para mapa y gráficas, con la clase más clara distinta del fondo.
- **Make the Change:** la "M" se redibuja en SVG con la paleta INE. Reemplaza `marca-make.png` (256 KB) y se usa como favicon.
- **Tipografía (D48):** Advent Pro para títulos y cifras; Arial para el texto. Texto base de 16 px y metadatos de 14 px; no hay texto de lectura más pequeño.
- **Neutralidad y tono:**
  - Se elimina la cita del pie "No venimos a decirles que deberían votar… despertar", porque contradice "No es un regaño".
  - Se elimina "licencia MIT", porque no hay licencia definida.
  - Sin partidos ni candidaturas.

---

## 5. Pantallas, controles y estados

Convención:
- **Dorado:** acción principal, una por tarea.
- **Contorno:** ruta hermana.
- **Espera:** la máquina trabaja.
- **Oculto:** la acción no es posible.

Medidas de diseño en móvil primero, de 375 a 430 de ancho:
- Objetivos táctiles de 44 pt o más.
- `env(safe-area-inset-*)` en el encabezado y en el pie.
- Sin `maximum-scale`.
- Las tablas largas se desplazan dentro de su caja, con la primera columna fija.

### 5.1 Encabezado y pie (todas las páginas)

- **Saltar al contenido:** enlace visible al recibir el foco.
- **Navegación:** Relato, Explorar, Difusión y Metodología.
  - En móvil se reúne en un botón "Menú" de 44 pt que abre una lista. Es un menú de navegación, sin acción dorada.
  - La página actual se marca con `aria-current`.
- **Pie:**
  - Logotipo INE y aviso completo.
  - "Fuente: INE, Conteos Censales de Participación Ciudadana (DECEyEC). Datos versión {version} del {fecha}", leído de `meta.json`.
  - Crédito del INEGI para el mapa.
  - Equipo: los cuatro nombres de B, Colima, 31 de octubre de 2026.
  - Enlaces a Metodología y Difusión.

### 5.2 `/` Relato

1. **Hero**
   - H1 calculado (D44) y entradilla.
   - Tres cifras: lista nominal 2024, participación del país y brecha entre mujeres y hombres.
   - **Dorado "Calcula tu caso"** lleva a `#huella`, que es la tarea personal.
   - Contorno "Ver el mapa" lleva a `#mapa`.
   - Los dos pasteles de B se conservan con texto alternativo.
2. **Curva** ("La montaña rusa de tu generación")
   - Selector de elección (Segmento).
     - Por defecto 2024; todas las elecciones tienen datos por edad.
     - Si cambia la elección, los cinco momentos de la curva se recalculan. Ya no hay textos fijos como "la más alta de toda la juventud" o "a partir de los 70".
   - En escritorio el gráfico queda fijo mientras pasan los momentos. En móvil queda arriba y los momentos debajo.
   - Leyenda con muestra de línea y patrón, sin depender solo del color.
   - Contorno "Ver datos" abre una tabla por bandas de edad (las 10 bandas del espejo) con todas las personas, mujeres y hombres.
   - Con `prefers-reduced-motion`, el marcador no se anima.
   - Debajo, la tabla de serie 2009-2024 de B y una fila para la judicial 2025 marcada como "otra jornada".
3. **Tu huella cívica** (elección federal 2024, la más reciente; el título lo dice)
   - Tres selectores en este orden: Lugar, Edad, Sexo. No hay botón de enviar; el resultado se actualiza al elegir.
   - Estados (región `aria-live`):
     - **Vacío:** "Elige lugar, edad y sexo para ver tu caso."
     - **Resultado:** pastel, frase, lista nominal y votantes, contraste con el otro sexo y escenario "como 60-69".
     - **Menos de 30 personas:** "Hay menos de 30 personas en este corte." Botón de contorno "Ver todas las personas", que cambia el sexo a todas. Si aun así no alcanza, "Ver el país".
     - **Sin personas en lista:** "No hay personas de esa edad en {lugar}." Botón de contorno "Ver el país".
   - Acciones del resultado:
     - **Dorado "Compartir"** cuando `navigator.canShare({ files })` existe: comparte la imagen (D50) y la frase.
     - Sin esa API, el dorado es "Descargar imagen".
     - Contorno "Copiar frase".
     - Mensajes de éxito y error en la línea de estado. Si falla al copiar: "Selecciona la frase y cópiala".
   - Escenario "¿Qué pasaría si votara tu generación?"
     - Deslizador nativo con un pulgar de 44 pt y valor visible.
     - Si la tasa de 18 a 29 ya iguala a la de 60 a 69, el deslizador se oculta y se muestra el hecho.
     - La comparación con la lista nominal de otra entidad se conserva.
4. **Mapa** ("Los dos Méxicos")
   - Controles, de arriba abajo:
     - **Elección:** Segmento con flechas de teclado, 2009 a 2024 y "Judicial 2025". En móvil cabe en dos filas.
     - **Quién:** Segmento con Todas, Mujeres, Hombres, 18 a 29, Rural y Urbana. Funciona en las 7 elecciones; ya no salta a 2024.
     - **Vista:** "Mapa / Mosaico". Mosaico por defecto con menos de 768 px.
       - Cuadrícula geográfica de 7 columnas: casillas de 46 px con 2 px de separación, lo que da 334 px y cabe en los 343 px útiles de 375.
       - Cada casilla muestra la abreviatura de la entidad y el valor.
     - **"Elige tu entidad":** selector nativo, siempre visible y sincronizado con el mapa. Es la ruta principal con teclado y lector de pantalla.
   - Mapa:
     - Es una sola parada de tabulación, y las flechas recorren las entidades en orden alfabético.
     - Clic o toque selecciona; Esc o "Quitar selección" en la ficha la quitan.
     - Etiqueta al pasar el cursor o enfocar: nombre, valor y diferencia con el país.
     - La entidad activa se dibuja al final.
   - Leyenda por clases fijas comparables entre años: < 45, 45-50, 50-55, 55-60, 60-65, ≥ 65. La judicial usa sus propias clases: < 8, 8-11, 11-14, 14-17, 17-20, ≥ 20.
     - Muestra de "sin dato" con trama.
   - Ficha (`aria-live`; en móvil se desplaza a la vista):
     - Nombre o "Todo el país", pastel y frase.
     - "{±x} puntos frente al país".
     - Desglose de la elección elegida.
     - Serie de las 7 elecciones.
     - **Dorado "Ver municipios de {entidad}"** lleva a `/explorar?e={eleccion}&ent={clave}` y solo aparece con una entidad elegida.
   - **"Sin dato" con razón**, mostrado en etiqueta y ficha con la entidad visible en trama:
     - Campeche 2025: "no está en los datos abiertos".
     - Rural o urbana con menos de 30 personas: "menos de 30 personas en ese tipo de sección".
   - Contorno "Ver tabla de las 32 entidades": tabla ordenable por nombre, valor y diferencia, con la misma elección y lectura.
5. **Espejo**
   - Barras de mujeres y hombres por banda de edad, con la paleta D49 y etiquetas numéricas.
   - Mismo selector de elección que la curva, compartido en el estado de la página. El texto del volteo se calcula.
6. **Otras formas de votar**
   - Prisión preventiva, voto anticipado, personas no binarias (solo nacional y por entidad con 30 o más) y judicial 2025.
   - Todas las cifras y la mención de Campeche se calculan.
7. **Cierre**
   - **Dorado "Explora tu municipio"** lleva a `/explorar`.
   - Contorno "Ver la propuesta de difusión".

### 5.3 `/explorar`

- **Filtros**, reflejados en la URL (`?e=&ent=&s=&g=&m=`) para poder compartir el enlace. Se leen con `useSearchParams` dentro de `<Suspense>`, como exige Cache Components; la estructura de la página sigue siendo estática.
  - Elección (7), Entidad (Nacional + 32), Sexo (Todas, Mujeres, Hombres), Edad (Todas + 9 grupos).
  - Municipio: cuadro de búsqueda con lista, visible solo con una entidad elegida.
- **Resultado:**
  - Pastel y frase para el lugar.
  - Comparación con la entidad y con el país.
  - 9 mini-pasteles por grupo de edad. Son botones que cambian el filtro Edad.
  - Tabla de municipios de la entidad, ordenable, con "sin dato" en las celdas protegidas. Va en una caja con desplazamiento y encabezado fijo; Oaxaca tiene 570 filas.
- **Estados:**
  - **Cargando municipios:** esqueleto y "Cargando municipios de {entidad}…", sin dorado.
  - **Falló la carga:** se ocultan los resultados municipales y aparece "No pudimos cargar los municipios de {entidad}". **Dorado "Reintentar"**; contorno "Ver la entidad", que quita el municipio.
  - **Búsqueda sin coincidencias:** "No hay municipios con ese nombre en {entidad}". Contorno "Limpiar búsqueda".
  - **Celda protegida (< 30):** "Hay menos de 30 personas en este corte". Contorno "Ver todas las personas" o "Ver todas las edades".
  - **Entidad fuera de la elección** (Campeche en la judicial): "Campeche no está en los datos abiertos de 2025". Contorno "Ver la federal 2024".
  - **Parámetro de URL inválido:** se ignora, se usan los valores por defecto y se avisa "El enlace traía un filtro que no existe; mostramos el país".
- **Límites de uso:** no aplican, porque los archivos son estáticos y van por CDN.

### 5.4 `/difusion`

- Contenido de B con las cifras calculadas: mensaje y público, narrativa, prototipo, canales y guion del video de 3 minutos.
  - El guion del video queda como apoyo para el equipo, que lo producirá.
- **Dorado "Guardar como PDF"** llama a `window.print()`. La hoja de impresión oculta la navegación y el botón, y pone la fuente y el aviso al pie.
- Contorno "Volver al relato".

### 5.5 `/metodologia`

- Tabla de las 7 elecciones: fecha, cargos, marco cartográfico y cobertura.
- Definiciones del glosario D45.
- Qué no incluye la fuente: casillas especiales, voto en el extranjero y Campeche 2025.
- Privacidad (D46).
- Correcciones: Chiapas 2018 y los 21 nombres de municipio.
- Versión y fecha de los datos.
- Fuentes con URL (INE y INEGI, con la nota de transformación).
- Aviso de prototipo.
- No tiene acciones, solo enlaces.

### 5.6 `not-found` y `error`

- **`not-found`:** "Esta página no existe". **Dorado "Ir al relato"**; contorno "Explorar".
- **`error`** (error de cliente inesperado): "Algo falló al mostrar esta sección". **Dorado "Reintentar"** (`reset`); contorno "Ir al relato".

---

## 6. Fases y tareas

Se trabaja en la rama `feat/sitio-ine` de A, con un commit por fase. Al final se abre un PR y se integra a `main`.

**Corte mínimo para el 31 de octubre: fases 0 a 4 y la tarea 30.**

**Fase 0 · Unificar**
1. Crear `feat/sitio-ine`.
2. Copiar de B: `app/relato/{relato,curva,huella,territorio,pastel,formato}.*`, `app/lectura/lectura.*`, `app/guion/*`, `lib/{paquete,tasas}.ts`, `assets/fonts/AdventPro.ttf`.
   - No copiar: `data/`, `fan-cover.tsx`, `lib/conteos.ts`, `lib/catalogo.ts` (se reescriben), `.impeccable/mocks|build`, `assets/plates`, `marca-make.png`, `etl/export_*.py`, Farro.
3. Subir React y React DOM a 19.3.1.
4. Montar las rutas de §3.2 y pasar los estilos a CSS Modules y tokens.
5. Retirar `app/api/conteos`.
6. `npm run check` sin advertencias.
6b. Crear `.claude/launch.json` con `npm run start` en el puerto 3000 para el panel del navegador.

**Fase 1 · Datos**
7. Mover `supabase/seed/*.csv` a `etl/seed/` y actualizar `SEED_DIR` en `etl/run_etl.py`.
   - Correr `npm run etl` de nuevo; la huella cambia porque cambia la ruta.
   - Escribir `etl/export_web.py` (§3.1, D46, D47) y agregar los scripts `datos` (exportar) y `datos:todo` (ETL + exportar).
8. Escribir `lib/datos/*` y reescribir `lib/paquete.ts` para leer `data/web`. Las lecturas por sexo, edad y tipo existen ya en las 7 elecciones.
9. `lib/catalogo.ts` desde `catalogo.json` y `lib/formato.ts` con el glosario D45.
10. Escribir `scripts/verificar-datos.mjs` y conectarlo como `prebuild`. Valida la forma de cada JSON con `zod`, que ya está instalado.
11. Quitar `data/` del `.gitignore` y versionar los JSON.

**Fase 2 · Mapa**
12. Agregar `mapshaper@0.7.100` como dependencia de desarrollo.
13. Descargar la capa estatal del Marco Geoestadístico del INEGI (con tu confirmación de archivo, origen y tamaño).
14. `etl/geo/entidades.py`: simplificar y llevar al viewBox 1000×640, generar `public/geo/entidades.json` y registrar la versión en `meta.json`.
15. `lib/mosaico.ts`: cuadrícula fija de 32 casillas.
16. Aplicar la §5.2 punto 4 en `territorio.tsx` con los primitivos `Segmento`, `Ficha` y `Tabla`.

**Fase 3 · Identidad**
17. Descargar el logotipo oficial del INE (con tu confirmación), medir el rosa y fijar los tokens (§4).
18. Redibujar "Make the Change" en SVG para `icon.svg` y el encabezado.
19. Aviso en encabezado y pie; Advent Pro y pila Arial.
20. `opengraph-image.tsx` e imagen para compartir de la calculadora (D50).

**Fase 4 · Pantallas y copy** (Impeccable: `context`, actualizar `PRODUCT.md`, `shape` de portada con marca y estructura fijas)
21. Aplicar §5.1 y §5.2 completos, con todas las frases calculadas.
22. Aplicar §5.3: explorador con filtros en la URL, todos los estados, tabla municipal y búsqueda.
23. Aplicar §5.4, §5.5 y §5.6.
24. Pasada `clarify` de Impeccable: glosario D45 en todo el sitio y tono "no es un regaño".

**Fase 5 · Calidad**
25. Accesibilidad:
    - Foco visible en fondos oscuros.
    - Contraste AA (el `#1f8cff` de B sale).
    - Ningún `aria-label` en `div` sin rol.
    - `<main>` en todas las páginas.
    - Jerarquía h1, h2, h3.
    - Tabla alternativa en cada gráfica.
26. Pasadas de Impeccable:
    - `critique` y `audit` de portada y explorador.
    - `harden`: Oaxaca 570 municipios, "Heroica Villa Tezoatlán… de Oaxaca", celdas < 30, Campeche 2025 y URL inválida.
    - `adapt`: 375, 390, 430, 768, 1280 y 1440.
    - `polish`.
27. Revisión de cierre:
    - Capturas validadas en `.impeccable/review/` (1440 y 390).
    - `impeccable detect --json`.
    - `impeccable-finish-reviewer` fresco y correcciones.
    - `impeccable-documenter` escribe `DESIGN.md` y `.impeccable/design.json`.

**Fase 6 · Documentación y limpieza**
28. Eliminaciones de §7.
29. Actualizar documentación:
    - `docs/decision-log.md`: D37-D53 y marcas de "reemplazada".
    - `README.md`: tubería de datos.
    - `AGENTS.md`: reglas sin Supabase.
    - `PRODUCT.md`: marca, stack y aviso.
    - `docs/mensaje-central.md` y `docs/mapa-historias.md`: cifras actuales.
    - Memoria del proyecto: se acaba "BD en Supabase vía Cursor".
    - Copiar este plan a `docs/plan-sitio.md` y marcar `docs/plan-proyecto.md` como "Reemplazado por plan-sitio".

**Fase 7 · Entrega**
30. Recorridos de §8, PR de `feat/sitio-ine` hacia `main`, integrar y subir.
31. Con tu visto bueno, conectar Vercel desde GitHub, sin variables de entorno, siguiendo las autorizaciones ya explicadas. Revisar la vista previa y luego producción.

---

## 7. Eliminaciones (se aprueban con este plan)

Todo queda en el historial de Git (`817e7d0`). OneDrive no se toca.

| En A | Destino |
|---|---|
| `supabase/migrations`, `supabase/config.toml`, `supabase/.gitignore` | Se eliminan |
| `supabase/seed/*.csv` | Se mueven a `etl/seed/` (el ETL los usa) |
| `etl/load.py`, `etl/.env.example`, `.env.example` | Se eliminan |
| `scripts/test-db-local.mjs`, `lib/supabase/` | Se eliminan |
| Dependencias `@supabase/supabase-js`, `supabase`, `@electric-sql/pglite` y `recharts`; scripts `db:*` | Se retiran. `server-only` y `zod` se quedan porque se usan |
| `docs/handoff-supabase-cursor.md` | Se mueve a `docs/archivo/` con la nota "Obsoleto por D37" |
| Plantilla de Next (`public/*.svg`, `app/page.tsx` actual) | Se reemplaza |

---

## 8. Verificación y recorridos de cierre (todos son tareas)

**Automático** (en local y en cada build de Vercel):
- `npm run check`.
- `npm run build`, que corre `verificar-datos` y debe dejar todas las rutas como `○ (Static)`.

**Recorridos** en el panel del navegador (`.claude/launch.json` con `npm run start`):
1. **Matriz de pantallas:** 375, 390, 430, 768, 1280 y 1440, sin desplazamiento horizontal de página.
2. **Recorrido de estados:** cada estado de §5 alcanzable y con su siguiente acción.
3. **Teclado:** todo el sitio sin ratón; el mapa con flechas y Esc.
4. **Lector de pantalla:** Narrador de Windows en el mapa y en la calculadora.
5. **Datos:** 5 municipios al azar cotejados contra los CSV del INE con DuckDB, y las cifras del relato iguales a las del explorador.
6. **Compartir e imprimir:**
   - Descarga de la imagen y copia de la frase en escritorio.
   - Vista de impresión de `/difusion`.
   - **Tú pruebas "Compartir" en tu teléfono** en la vista previa de Vercel.
7. **Revisión final de Impeccable** con veredicto `ship` y `DESIGN.md` escrito.

---

## 9. ¿Listos para Build?

**Sí.** No falta nada por decidir en el plan:
- Cada pantalla, control y estado tiene su función definida.
- Los datos tienen un solo dueño.
- Las versiones están verificadas.
- Las decisiones quedan registradas (D37-D53).

Durante la construcción te pediré tres confirmaciones que exigen las reglas, no el plan:
1. Descargar el logotipo oficial del INE de ine.mx.
2. Descargar la capa estatal del Marco Geoestadístico del INEGI.
3. Conectar Vercel.

Riesgo de calendario: el corte mínimo (fases 0 a 4 y la tarea 30) es lo que debe estar el 31 de octubre. La calidad (fase 5) y la limpieza (fase 6) mejoran la entrega, pero no la bloquean.
