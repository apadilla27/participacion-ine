---
name: Make the Change
description: Micrositio de datos del INE sobre participación ciudadana; cada cifra se lee "de cada 100" y lleva a tu propio caso.
colors:
  rosa: "#d5007f"
  rosa-700: "#a00062"
  rosa-50: "#fdf0f6"
  vino: "#7a1240"
  vino-900: "#5c0c30"
  mujeres: "#7a1240"
  hombres: "#4d4f53"
  c1: "#f9d4e6"
  c2: "#f2a3c8"
  c3: "#e65fa3"
  c4: "#d5007f"
  c5: "#a00062"
  c6: "#5c0c30"
  sin-dato: "#cfcdc9"
  trama: "#f1efec"
  tinta: "#1d1d1b"
  tinta-2: "#4a4a48"
  gris: "#97999b"
  linea: "#dddad5"
  fondo: "#ffffff"
  fondo-2: "#f6f4f1"
typography:
  display:
    fontFamily: '"Advent Pro", Arial, "Helvetica Neue", Helvetica, sans-serif'
    fontSize: "clamp(2rem, 1.3rem + 3.2vw, 3.75rem)"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: '"Advent Pro", Arial, "Helvetica Neue", Helvetica, sans-serif'
    fontSize: "clamp(1.75rem, 1.3rem + 2vw, 2.75rem)"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: '"Advent Pro", Arial, "Helvetica Neue", Helvetica, sans-serif'
    fontSize: "clamp(1.25rem, 1.1rem + 0.7vw, 1.5rem)"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  destacado:
    fontFamily: '"Advent Pro", Arial, "Helvetica Neue", Helvetica, sans-serif'
    fontSize: "1.5rem"
    fontWeight: 650
    lineHeight: 1.25
  cifra:
    fontFamily: '"Advent Pro", Arial, "Helvetica Neue", Helvetica, sans-serif'
    fontWeight: 650
    fontFeature: '"tnum"'
  entradilla:
    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.55
  body:
    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: '"tnum"'
  boton:
    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.2
  label:
    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
    fontSize: "0.875rem"
    fontWeight: 700
  meta:
    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
    fontSize: "0.875rem"
    fontWeight: 400
rounded:
  pildora: "999px"
  tarjeta: "16px"
  radio: "10px"
  campo: "8px"
  casilla: "6px"
  barra: "4px"
  circulo: "50%"
spacing:
  toque: "44px"
  gutter: "clamp(16px, 4vw, 40px)"
  ancho: "72rem"
  lectura: "62ch"
  capitulo: "clamp(72px, 10vw, 128px)"
  paso-1: "8px"
  paso-2: "12px"
  paso-3: "16px"
  paso-4: "24px"
  paso-5: "32px"
  paso-6: "40px"
  paso-7: "48px"
components:
  button-primario:
    backgroundColor: "{colors.rosa}"
    textColor: "{colors.fondo}"
    typography: "{typography.boton}"
    rounded: "{rounded.pildora}"
    padding: "10px 20px"
    height: "{spacing.toque}"
  button-primario-hover:
    backgroundColor: "{colors.rosa-700}"
  button-contorno:
    backgroundColor: "transparent"
    textColor: "{colors.rosa-700}"
    typography: "{typography.boton}"
    rounded: "{rounded.pildora}"
    padding: "10px 20px"
    height: "{spacing.toque}"
  button-contorno-hover:
    backgroundColor: "{colors.rosa-50}"
  segmento-opcion:
    backgroundColor: "{colors.fondo}"
    textColor: "{colors.tinta}"
    typography: "{typography.label}"
    rounded: "{rounded.pildora}"
    padding: "8px 14px"
    height: "{spacing.toque}"
  segmento-opcion-elegida:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.fondo}"
  boton-menu:
    backgroundColor: "{colors.fondo}"
    textColor: "{colors.tinta}"
    typography: "{typography.label}"
    rounded: "{rounded.pildora}"
    padding: "0 16px"
    height: "{spacing.toque}"
  campo:
    backgroundColor: "{colors.fondo}"
    textColor: "{colors.tinta}"
    typography: "{typography.body}"
    rounded: "{rounded.campo}"
    padding: "8px 12px"
    height: "{spacing.toque}"
  estado:
    backgroundColor: "{colors.fondo-2}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.radio}"
    padding: "16px 18px"
  estado-espera:
    textColor: "{colors.tinta-2}"
  estado-error:
    backgroundColor: "{colors.rosa-50}"
  panel:
    backgroundColor: "{colors.fondo-2}"
    rounded: "{rounded.tarjeta}"
    padding: "{spacing.paso-4}"
  tarjeta-caso:
    backgroundColor: "{colors.fondo}"
    rounded: "{rounded.tarjeta}"
    padding: "{spacing.paso-4}"
  momento:
    backgroundColor: "{colors.fondo-2}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.radio}"
    padding: "20px"
  momento-activo:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.fondo}"
  etiqueta-mapa:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.fondo}"
    typography: "{typography.meta}"
    rounded: "{rounded.campo}"
    padding: "8px 12px"
  pastel:
    backgroundColor: "{colors.rosa-50}"
    rounded: "{rounded.circulo}"
    size: "160px"
  pastel-rebanada:
    backgroundColor: "{colors.rosa}"
  tabla-caja:
    backgroundColor: "{colors.fondo}"
    rounded: "{rounded.radio}"
  tabla-encabezado:
    backgroundColor: "{colors.fondo-2}"
    textColor: "{colors.tinta}"
    typography: "{typography.label}"
    padding: "10px 14px"
  encabezado:
    backgroundColor: "{colors.fondo}"
    height: "64px"
  nav-enlace:
    textColor: "{colors.tinta}"
    padding: "0 12px"
    height: "{spacing.toque}"
  nav-enlace-actual:
    textColor: "{colors.rosa-700}"
---

# Design System: Make the Change

## Overview

**Creative North Star: "De cada 100, tú"**

El sistema es papel blanco con una sola voz de color. Todo lo que aparece en pantalla trabaja para que una cifra se lea como "X de cada 100" y para que, en el siguiente gesto, la persona encuentre su propio caso. El rosa mexicano del INE no decora: es el dato. Llena la rebanada del pastel, traza la línea de "todas las personas", tiñe la cifra del titular y viste la única acción primaria de cada tarea. Lo demás se resuelve con tinta casi negra, un gris cálido muy claro y filetes de un píxel.

La densidad es de relato, no de tablero. Los capítulos se separan con aire generoso (de 72 a 128 px) y el texto corrido nunca pasa de 62 caracteres de ancho. Las superficies son planas: la profundidad viene de paneles en papel cálido y de filetes, no de sombras. Las formas tienen dos registros: píldoras para lo que se pulsa y tarjetas de esquina suave para lo que se lee. Dos tipos de letra conviven sin mezclarse: Advent Pro, geométrica y algo técnica, para títulos y cifras; Arial para todo lo que se lee de corrido, como pide el manual del INE.

El movimiento es escaso y funcional. El pastel llena su rebanada en 600 ms con una curva que frena al final, el marcador de la curva viaja 500 ms entre momentos, y los cambios de estado de botones y opciones duran 150 ms. Con `prefers-reduced-motion` todas las duraciones se anulan y el desplazamiento suave se apaga.

**Key Characteristics:**
- Un solo acento, el rosa INE, reservado para el dato, la acción primaria y el foco.
- Escala secuencial de seis clases de rosa a vino para mapa y gráficas; trama diagonal para "sin dato".
- Mujeres en vino con línea continua y hombres en gris pizarra con línea discontinua.
- Advent Pro (650) para títulos y cifras; Arial para leer; numerales tabulares en todo el sitio.
- Plano: paneles en papel cálido y filetes de 1 px en lugar de sombras.
- Píldoras para actuar, tarjetas de 10 a 16 px para leer, círculos para el pastel.
- Móvil primero: objetivos táctiles de 44 px, márgenes con área segura, mosaico en lugar de mapa en pantallas angostas.

## Colors

Una paleta institucional sobria: blanco, papel cálido y tinta, con el rosa mexicano del INE como única voz y su familia rosa-vino como escala de datos.

### Primary
- **Rosa Mexicano INE** (#d5007f, Pantone 233): el dato principal y la acción principal. Rebanada del pastel, línea "Todas las personas" de la curva (4 px), cifras destacadas del titular, fondo del botón primario, anillo de foco (3 px) y selección de texto. Con texto blanco encima da 5.1:1.
- **Rosa Profundo** (#a00062): el rosa cuando es texto o estado de reposo intenso. Enlaces, enlace de navegación actual, texto del botón de contorno, hover del botón primario, cifras dentro de frases ("votos más", `.destacado`) y la edad donde se invierte la brecha en el espejo. Da 7.9:1 sobre blanco.
- **Rubor** (#fdf0f6): la parte no votante del pastel, hover del botón de contorno y de las coincidencias del buscador, fila del municipio actual y fondo del estado de error.

### Secondary
- **Vino** (#7a1240), expuesto también como `mujeres`: la serie de mujeres en curvas (2.5 px, continua), barras del espejo y leyendas.
- **Gris Pizarra** (#4d4f53), token `hombres`: la serie de hombres (2.5 px, discontinua 7/6) y sus barras. Nunca rosa contra azul.

### Tertiary
- **Escala Rosa a Vino** (`c1` #f9d4e6, `c2` #f2a3c8, `c3` #e65fa3, `c4` #d5007f, `c5` #a00062, `c6` #5c0c30): seis clases secuenciales, de menos a más participación, para el mapa coroplético, el mosaico y su leyenda. `c4`, `c5` y `c6` coinciden con Rosa Mexicano, Rosa Profundo y Vino Noche. Sobre `c4` a `c6` el texto va en blanco; sobre `c1` a `c3`, en tinta.
- **Vino Noche** (#5c0c30): el extremo oscuro de la escala.
- **Trama sin dato** (`sin-dato` #cfcdc9 sobre `trama` #f1efec): rayado a 45° que marca celdas protegidas o ausentes en el mapa, el mosaico y su leyenda. El pastel vacío usa la misma trama en Papel Cálido y Hilo Cálido (franjas de 8 y 2 px).

### Neutral
- **Tinta Proceso** (#1d1d1b, Process Black): texto, títulos, estados seleccionados (opción elegida, momento activo, entidad activa, casilla pulsada), fondo de la etiqueta flotante del mapa y del enlace "Saltar al contenido".
- **Tinta Suave** (#4a4a48): texto secundario, metadatos de 14 px, pies de figura, ejes y etiquetas de gráficas, pie de página.
- **Gris Frío 7** (#97999b, Cool Gray 7): solo trazos. Borde de selectores, campos, opciones de segmento y botón de menú; barra de desplazamiento. Nunca texto.
- **Hilo Cálido** (#dddad5): filetes de 1 px. Borde del encabezado y del pie, separadores de tabla, líneas guía de las gráficas, contorno de la tarjeta de resultado.
- **Blanco Papel** (#ffffff): fondo de página, de tablas, del lienzo del mapa y de las fichas; texto sobre rosa y tinta.
- **Papel Cálido** (#f6f4f1): paneles y bandas. Fondo del capítulo del mapa (a sangre), de los filtros, del escenario, de los mensajes de estado, de los momentos de la curva, del encabezado de tabla y del pie. Las filas pares de tabla usan un blanco aún más tenue (#fbfaf8).

### Named Rules
**The Rosa Is the Datum Rule.** El rosa pleno marca el dato, la única acción primaria de la tarea y el foco. En texto de tamaño de lectura se usa Rosa Profundo; el rosa pleno como texto solo aparece en cifras de tamaño de título.

**The Ink Selects Rule.** Lo elegido se marca en tinta, nunca en rosa: opción de segmento elegida, momento activo, entidad activa del mapa (trazo de 3 px), casilla pulsada del mosaico (contorno de 3 px) y tarjeta de edad elegida. El rosa queda libre para significar participación.

**The Wine and Slate Rule.** Mujeres en vino con línea continua, hombres en gris pizarra con línea discontinua. La diferencia se lee por tono y por patrón, también con daltonismo.

## Typography

**Display Font:** Advent Pro (archivo local OFL, eje variable 100–900, cargado con `next/font/local` como `--font-advent`), con Arial de respaldo.
**Body Font:** Arial (con "Helvetica Neue", Helvetica, sans-serif).

**Character:** Advent Pro aporta la voz de campaña, geométrica y ligeramente técnica, en peso 650; Arial la pone el manual del INE y garantiza que leer no requiera descargar nada. Las dos nunca se mezclan dentro de un párrafo.

### Hierarchy
- **Display** (Advent Pro 650, clamp(2rem, 1.3rem + 3.2vw, 3.75rem), 1.1, -0.01em): el H1 calculado de cada página. Las cifras dentro del titular van en rosa sin cursiva.
- **Headline** (Advent Pro 650, clamp(1.75rem, 1.3rem + 2vw, 2.75rem), 1.1): título de capítulo.
- **Title** (Advent Pro 650, clamp(1.25rem, 1.1rem + 0.7vw, 1.5rem), 1.1): títulos de momentos, de bloques y de las cuatro "otras formas de votar".
- **Destacado** (Advent Pro 650, 1.5rem, 1.25): una frase corta que resume un resultado, en Rosa Profundo en las páginas de lectura. La frase del caso en la huella usa la misma voz a 1.375rem en tinta.
- **Cifra** (Advent Pro 650, numerales tabulares, tamaño según contexto: 2rem bajo los pasteles, 2.25rem en el escenario): toda cifra que protagoniza un bloque se envuelve en `.cifra`.
- **Entradilla** (Arial 700, 1.25rem): la línea fija que sigue al H1 en la portada.
- **Body** (Arial 400, 1rem, 1.55, numerales tabulares): texto corrido, con `text-wrap: pretty` y ancho máximo de 62ch.
- **Label** (Arial 700, 0.875rem): etiquetas de campo, de segmento, botón de menú y encabezados de tabla.
- **Meta** (Arial 400, 0.875rem, tinta suave): pies de figura, leyendas, notas, aviso de prototipo y celdas de tabla.

Los títulos usan `text-wrap: balance` y `scroll-margin-top: 120px` para no quedar bajo el encabezado fijo. Los enlaces van en Rosa Profundo con subrayado de 1px separado 0.18em, que se engrosa a 2px en hover.

### Named Rules
**The Two Voices Rule.** Advent Pro para títulos, cifras y una frase destacada de una sola idea; Arial para párrafos, etiquetas, controles y tablas. Si un bloque se lee de corrido, va en Arial.

**The Tabular Figures Rule.** Todo el sitio usa numerales tabulares, para que las cifras de tablas, leyendas y pasteles se alineen y no bailen al cambiar.

## Layout

Relato vertical por capítulos dentro de un contenedor de 72rem con márgenes laterales de clamp(16px, 4vw, 40px) que respetan el área segura. Los capítulos se separan con clamp(72px, 10vw, 128px) y la página arranca con clamp(32px, 6vw, 72px) de aire superior (64px máximo en `/explorar` y en las páginas de lectura). Todo bloque de texto se limita a 62ch. Las páginas de lectura larga (`/difusion`, `/metodologia`) son una sola columna de 62ch más los márgenes.

El ritmo interno se mueve en pasos de 8, 12, 16, 24, 32, 40 y 48 px; aparecen también 6, 10, 14 y 20 px en ajustes finos de componentes. Las tarjetas y paneles llevan 24 px de relleno (20 px en filtros y momentos).

Comportamiento responsivo, móvil primero:
- **420 px**: las casillas del mosaico pasan de 46 a 52 px.
- **480 px**: aparece el nombre "Make the Change" junto a la M.
- **720 px**: formularios de tres columnas, tarjeta de resultado con pastel a la izquierda.
- **768 px** (`useAngosta`): por debajo, la curva usa un lienzo de 420 de ancho y el mapa abre como mosaico sin descargar geometría; los segmentos en rejilla pasan a fila con salto.
- **860 px**: "Otras formas de votar" a dos columnas.
- **900 px**: navegación en línea, encabezado de 72 px y pie de tres columnas.
- **960 px**: héroe a dos columnas (1.35fr texto, 1fr pasteles) y curva con columna fija pegada a 120 px mientras los momentos pasan, separados 40vh.
- **1024 px**: mapa y ficha lado a lado (1.7fr / 1fr).

El encabezado es fijo, blanco, con filete inferior; debajo lleva siempre el aviso de prototipo. El capítulo del mapa es una banda a sangre en papel cálido. El pie, también en papel cálido, deja 96 px de aire antes.

### Named Rules
**The 44 Rule.** Todo control mide al menos 44 px de alto. La única excepción son los botones de orden dentro de las filas de tabla con puntero fino, que bajan a 32 px.

**The Reading Column Rule.** Ningún párrafo pasa de 62ch, ni siquiera dentro de una rejilla ancha.

## Elevation & Depth

El sistema es plano. La profundidad se construye con capas tonales (papel cálido bajo tarjetas blancas, como en la ficha del mapa) y con filetes de 1 px en Hilo Cálido. Las únicas sombras son cantos internos de 1 px que definen una forma clara sobre blanco, y una sombra proyectada para el menú móvil abierto, que sí flota sobre el contenido.

### Shadow Vocabulary
- **Menú desplegado** (`box-shadow: 0 12px 24px -12px rgba(29, 29, 27, 0.25)`): solo el panel de navegación móvil abierto; desaparece en escritorio.
- **Canto del pastel** (`box-shadow: inset 0 0 0 1px rgba(160, 0, 98, 0.18)`): dibuja el borde del disco cuando la rebanada es pequeña y el rubor casi se funde con el blanco.
- **Canto de muestra** (`box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08)`): bordes de las muestras de color de la leyenda del mapa.
- **Doble trazo de selección** (`box-shadow: inset 0 0 0 1px var(--tinta)`): engrosa a 2 px el borde de la tarjeta de edad elegida en el explorador.

### Named Rules
**The Flat Paper Rule.** Tarjetas, paneles, botones y tablas no proyectan sombra. Para separar, se usa papel cálido o un filete; solo el menú móvil abierto flota.

## Shapes

Dos familias de forma. Lo que se pulsa con texto es una píldora (999px): botones, opciones de segmento, botón de menú. Lo que contiene lectura es un rectángulo de esquina suave: 10px (`--radio`) para mensajes de estado, cajas de tabla, momentos, listas de coincidencias y el enlace de salto; 16px para tarjetas y paneles grandes (resultado del caso, escenario, ficha y lienzo del mapa, filtros del explorador); 12px para las tarjetas de edad del explorador. Los campos de formulario y la etiqueta flotante del mapa usan 8px; las casillas del mosaico, 6px; el anillo de foco y los extremos de barra, 4px; las muestras de leyenda, 3px. El pastel es un círculo perfecto.

Las barras del espejo solo redondean el extremo exterior (4px), así ambas pistas nacen rectas desde la columna de edad. Los artículos de "Otras formas de votar" se abren con un filete superior de 2px en tinta en lugar de caja. El "sin dato" se dibuja siempre con trama diagonal a 45°.

La marca de campaña es una M de trazo grueso (8 en una rejilla de 64) con remates redondos: patas y primera diagonal en tinta, la diagonal derecha convertida en flecha que sube en rosa.

## Components

### Buttons
Una acción primaria por tarea, en rosa; la ruta hermana, en contorno.
- **Shape:** píldora (999px), alto mínimo de 44px, relleno de 10px 20px, borde de 2px en rosa en ambas variantes, Arial 700 a 1rem.
- **Primary (`.btn-primario`):** fondo rosa INE, texto blanco. Ejemplos: "Calcula tu caso", "Compartir", "Explora tu municipio", "Reintentar".
- **Hover / Focus:** el primario pasa a Rosa Profundo en fondo y borde; el contorno toma fondo Rubor. Transición de 150ms ease-out en fondo, color y borde. Foco con anillo rosa de 3px separado 2px.
- **Contorno (`.btn-contorno`):** fondo transparente, texto Rosa Profundo. Ejemplos: "Ver el mapa", "Copiar frase", "Ver datos".
- **Deshabilitado:** opacidad 0.55 y cursor no permitido.
- Los botones se agrupan en `.acciones`: fila flexible con salto y 12px de separación.

### Chips
El segmento (`Segmento`) es un grupo de opciones excluyentes con una sola parada de tabulación; las flechas mueven la elección.
- **Style:** píldoras blancas con borde de 1px en Gris Frío 7, Arial 700 a 0.875rem, relleno de 8px 14px, 44px de alto, 6px entre opciones. La etiqueta del grupo va encima en Label.
- **State:** hover cambia el borde a rosa; la opción elegida se rellena de tinta con texto blanco. En móvil puede ir en rejilla de N columnas (las etiquetas largas parten en dos líneas) o en una fila con desplazamiento horizontal.

### Cards / Containers
- **Corner Style:** 16px en tarjetas y paneles grandes, 10px en estados y momentos.
- **Background:** blanco con filete de 1px en Hilo Cálido para la tarjeta de resultado; Papel Cálido para paneles (escenario, filtros, estados). Dentro de la banda en papel cálido del mapa, la ficha y el lienzo vuelven a blanco.
- **Shadow Strategy:** ninguna (ver Elevation & Depth).
- **Internal Padding:** 24px en tarjetas, 20px en filtros y momentos, 16px 18px en mensajes de estado.
- **Mensajes de estado (`.estado`):** vacío, protegido, espera y error comparten caja; espera pasa el texto a tinta suave y error toma fondo Rubor. Siempre ofrecen una salida con botón de contorno.
- **Momentos de la curva:** tarjetas en papel cálido que se vuelven tinta con texto blanco cuando su momento está activo, con transición de 200ms.

### Inputs / Fields
- **Style:** selectores y campos nativos, 44px de alto, relleno de 8px 12px, borde de 1px en Gris Frío 7, esquina de 8px, fondo blanco, Arial 400 a 1rem. La etiqueta envuelve al campo, encima, en Arial 700 a 0.875rem con 6px de separación.
- **Focus:** el anillo global de 3px en rosa con 2px de separación.
- **Deslizador:** `input[type=range]` de 44px de alto con `accent-color` rosa.

### Navigation
- **Encabezado:** fijo, blanco, filete inferior, 64px de alto (72px desde 900px). A la izquierda, logotipo INE (30px, 36px en escritorio), un filete vertical y la M de campaña (34px) con "Make the Change" en Advent Pro 700 a 1.125rem.
- **Enlaces:** Arial 700, tinta, 44px de alto. El actual va en Rosa Profundo con subrayado de 3px separado 0.4em.
- **Móvil:** botón "Menú"/"Cerrar" en píldora con borde gris; abre un panel blanco a todo el ancho con la sombra de menú. Escape lo cierra y devuelve el foco.
- **Aviso:** bajo la barra, en Meta, siempre visible.

### Pastel "de cada 100"
La firma del sistema: un disco cuya rebanada rosa son quienes votaron, sobre el resto en Rubor, con canto interno rosa al 18%. Crece en 600ms con `cubic-bezier(0.16, 1, 0.3, 1)` animando la propiedad registrada `--voto`. Sin dato, el disco se rellena con trama diagonal en Papel Cálido y Hilo Cálido. Tamaños en uso: min(180px, 36vw) en el héroe, 168px en el resultado del caso, 160px por omisión. Siempre va con su cifra en Advent Pro y un pie en Meta.

### Gráficas y mapa
- **Curva:** líneas con grosor en píxeles de pantalla (`vector-effect: non-scaling-stroke`), uniones redondas; guías horizontales en Hilo Cálido y etiquetas de eje en tinta suave a 16px. El marcador es un punto rosa de 5 con borde blanco de 2 dentro de un halo rosa al 18% de radio 11, y se desplaza 500ms con la misma curva del pastel.
- **Mapa:** entidades con trazo blanco de 1px; hover en tinta a 1.5px; activa en tinta a 3px. Relleno con la escala `c1`–`c6`, transición de 200ms. Etiqueta flotante en tinta con texto blanco.
- **Mosaico:** casillas cuadradas con abreviatura en Arial 700 y cifra en 400, separadas 2px.
- **Espejo:** barras de 22px de alto, mujeres a la izquierda y hombres a la derecha de una columna de edad centrada.
- Toda gráfica tiene su tabla alternativa detrás de un botón de contorno "Ver datos".

### Tablas de datos
Caja blanca con filete de 1px y esquina de 10px que se desplaza por dentro en móvil (`contain: inline-size`). Celdas en Meta, cifras alineadas a la derecha, primera columna fija a la izquierda y encabezado fijo arriba en papel cálido. Filas pares en #fbfaf8. Los encabezados que ordenan son botones subrayados con puntos y una flecha SVG de trazo 1.6.

### Marca Make the Change
La M con flecha es el favicon (sobre fondo blanco con esquina de 14 en la rejilla de 64), acompaña al logotipo INE en el encabezado y firma las imágenes para compartir. Las imágenes para compartir son blancas con una franja superior rosa, la M, la cifra en rosa en Advent Pro, la fuente y el aviso en tinta suave, y no llevan el logotipo del INE.

## Do's and Don'ts

### Do:
- **Do** reservar el rosa INE (#d5007f) para el dato, una sola acción primaria por tarea y el foco; usar Rosa Profundo (#a00062) cuando el rosa es texto de lectura.
- **Do** marcar lo elegido en tinta (#1d1d1b): opción de segmento, momento activo, entidad activa, casilla pulsada.
- **Do** dibujar mujeres en vino con línea continua y hombres en gris pizarra (#4d4f53) con línea discontinua 7/6.
- **Do** usar la escala `c1`–`c6` para cualquier mapa o gráfica secuencial, con texto blanco desde `c4` y tinta hasta `c3`.
- **Do** representar el "sin dato" con trama diagonal a 45° (en mapa y mosaico, #cfcdc9 sobre #f1efec) y explicarlo en la leyenda.
- **Do** acompañar cada pastel con su cifra en Advent Pro y un pie en Meta, y cada gráfica con su tabla "Ver datos".
- **Do** mantener 44px de alto mínimo en todo control y 62ch de ancho máximo en todo párrafo.
- **Do** mostrar el logotipo INE solo sobre fondos claros, sin alterar, con el aviso de prototipo debajo.

### Don't:
- **Don't** usar rosa contra azul para distinguir sexo.
- **Don't** introducir un segundo color de acento; vino y la escala de datos son la misma familia del rosa.
- **Don't** usar rosa para estados de selección; compite con el dato.
- **Don't** poner sombras proyectadas en tarjetas, paneles o botones; la profundidad es tonal.
- **Don't** componer párrafos, etiquetas, tablas ni controles en Advent Pro.
- **Don't** usar Gris Frío 7 (#97999b) para texto; es solo para trazos.
- **Don't** poner el logotipo del INE en las imágenes para compartir ni sobre fondos oscuros.
- **Don't** representar una celda protegida o ausente con un tono de la escala: se confundiría con participación baja.
