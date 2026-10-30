---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/explorar/page.tsx"]
---

## Alcance y modo

Portada `/` del micrositio Make the Change (emisor: INE). Modo **Read**: la persona viene a entender cuánto, quién y dónde se vota, y a encontrar su caso. Construcción code-led. Superficie hermana que hereda este mundo: `/explorar` (Operate). `/difusion` y `/metodologia` se retiraron el 2026-10-29 por decisión de la usuaria (D56).

## Público, tarea y prueba

Todo público, de niñas y niños a personas mayores con poca experiencia en dispositivos (2026-10-29, D58-D60); el núcleo sigue siendo la ciudadanía de 18 a 35 años en el teléfono. Tarea: entender un hallazgo en segundos, calcular su caso y compartirlo. Prueba: cifras censales del INE (Conteos Censales 2009-2025), siempre calculadas desde `lib/datos`.

## Dirección elegida

Marca y composición fijadas por la usuaria en el plan aprobado (docs/plan-sitio.md, D42-D43). No hubo ronda de dados. El 2026-10-29 la usuaria pidió más color dentro de la paleta INE, lenguaje sencillo y quitar el aviso de prototipo (D57-D60).

## Direction contract

THESIS: La participación se lee como "X de cada 100" y siempre lleva a tu propio caso; se niega el tablero de cifras sueltas sin pregunta, sin fuente y sin un siguiente paso.

OWN-WORLD: Identidad del INE. Capítulos en franjas que alternan blanco, rosa claro #FDF0F6, vino noche #5C0C30 (la calculadora) y rosa mexicano #D5007F (el cierre), con el glosario y el mapa sobre gris cálido; toda la paleta sale de la familia rosa-vino del INE. El rosa mexicano #D5007F es el dato y la acción principal; escala secuencial de rosa a vino #5C0C30 para mapa y gráficas; tinta #1D1D1B. Mujeres en vino con línea continua y hombres en gris #4D4F53 con línea discontinua. Advent Pro para títulos y cifras grandes; Arial para leer. Firma: el pastel "de cada 100" y la "M" de Make the Change con la flecha que sube.

STORY: Aprende a leer "de cada 100" y las palabras difíciles en el glosario; ve que a los 18 votan más que a los 25 y que las mujeres votan más; calcula su caso por lugar, edad y sexo; encuentra su entidad en el mapa; explora su municipio y comparte su resultado.

FIRST VIEWPORT: Encabezado con logotipo INE, "M" de campaña y las dos secciones siempre visibles ("Inicio", "Busca tu municipio"). Franja rosa claro. H1 calculado con cifras redondas ("A los 18 años votaron X de cada 100 jóvenes. A los N años, solo votaron Y de cada 100 hombres.", reescrito el 2026-10-30 porque la usuaria encontró confusos los decimales, D61) a la izquierda en Advent Pro; dos pasteles grandes (18 años y hombres de N) a la derecha en escritorio y debajo del texto en móvil; una entradilla que invita a votar y un párrafo corto con lista nominal, participación y mujeres contra hombres de 2024; botón rosa (primario) "Ver cuántos como tú votaron" y contorno "Entender los números".

FORM: Relato vertical por capítulos (hero, glosario con la figura de cien círculos, curva, huella, mapa, espejo, otras formas, cierre), estructura heredada de la versión anterior y conservada por decisión de la usuaria. seed: none (dirección fijada por la usuaria; no se tiró el dado, D43).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
