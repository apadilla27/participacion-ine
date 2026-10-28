---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/explorar/page.tsx","app/difusion/page.tsx","app/metodologia/page.tsx"]
---

## Alcance y modo

Portada `/` del micrositio Make the Change (emisor: INE). Modo **Read**: la persona viene a entender cuánto, quién y dónde se vota, y a encontrar su caso. Construcción code-led. Superficies hermanas que heredan este mundo: `/explorar` (Operate), `/difusion` y `/metodologia` (Read).

## Público, tarea y prueba

Ciudadanía de 18 a 35 años en el teléfono. Tarea: entender un hallazgo en segundos, calcular su caso y compartirlo. Prueba: cifras censales del INE (Conteos Censales 2009-2025), siempre calculadas desde `lib/datos`.

## Dirección elegida

Marca y composición fijadas por la usuaria en el plan aprobado (docs/plan-sitio.md, D42-D43). No hubo ronda de dados.

## Direction contract

THESIS: La participación se lee como "X de cada 100" y siempre lleva a tu propio caso; se niega el tablero de cifras sueltas sin pregunta, sin fuente y sin un siguiente paso.

OWN-WORLD: Identidad del INE. Fondo blanco y gris cálido muy claro; rosa mexicano #D5007F como único acento y como dato; escala secuencial de rosa a vino #5C0C30 para mapa y gráficas; tinta #1D1D1B. Mujeres en vino con línea continua y hombres en gris #4D4F53 con línea discontinua. Advent Pro para títulos y cifras grandes; Arial para leer. Firma: el pastel "de cada 100" y la "M" de Make the Change con la flecha que sube.

STORY: Ve que a los 18 votan más que a los 25 y que las mujeres votan más; calcula su caso por lugar, edad y sexo; encuentra su entidad en el mapa; explora su municipio y comparte su resultado.

FIRST VIEWPORT: Encabezado con logotipo INE, "M" de campaña y aviso de prototipo. H1 calculado ("A los 18, X de cada 100 votaron. Entre los hombres de N, Y.") a la izquierda en Advent Pro; dos pasteles grandes (18 años y hombres de N) a la derecha en escritorio y debajo del texto en móvil; tres cifras de 2024; botón dorado "Calcula tu caso" y contorno "Ver el mapa".

FORM: Relato vertical por capítulos (hero, curva, huella, mapa, espejo, otras formas, cierre), estructura heredada de la versión anterior y conservada por decisión de la usuaria. seed: none (dirección fijada por la usuaria; no se tiró el dado, D43).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
