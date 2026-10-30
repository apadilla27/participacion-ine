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
  termino:
    fontFamily: '"Advent Pro", Arial, "Helvetica Neue", Helvetica, sans-serif'
    fontSize: "1.375rem"
    fontWeight: 650
    lineHeight: 1.15
  destacado:
    fontFamily: '"Advent Pro", Arial, "Helvetica Neue", Helvetica, sans-serif'
    fontSize: "1.375rem"
    fontWeight: 650
    lineHeight: 1.25
  cifra:
    fontFamily: '"Advent Pro", Arial, "Helvetica Neue", Helvetica, sans-serif'
    fontWeight: 650
    fontFeature: '"tnum"'
  entradilla:
    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.6
  body:
    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: '"tnum"'
  boton:
    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.2
  label:
    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
    fontSize: "1rem"
    fontWeight: 700
  meta:
    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
    fontSize: "1rem"
    fontWeight: 400
rounded:
  pildora: "999px"
  tarjeta: "16px"
  radio: "10px"
  campo: "8px"
  casilla: "6px"
  barra: "4px"
  muestra: "3px"
  circulo: "50%"
spacing:
  toque: "48px"
  gutter: "clamp(16px, 4vw, 40px)"
  ancho: "72rem"
  lectura: "62ch"
  capitulo: "clamp(56px, 8vw, 104px)"
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
  button-primario-sobre-rosa:
    backgroundColor: "{colors.fondo}"
    textColor: "{colors.rosa-700}"
  button-primario-sobre-rosa-hover:
    backgroundColor: "{colors.rosa-50}"
  button-contorno-sobre-rosa:
    backgroundColor: "transparent"
    textColor: "{colors.fondo}"
  button-contorno-sobre-rosa-hover:
    backgroundColor: "{colors.rosa-700}"
  pestana:
    backgroundColor: "{colors.rosa-50}"
    textColor: "{colors.rosa-700}"
    rounded: "{rounded.pildora}"
    padding: "0 12px"
    height: "{spacing.toque}"
  pestana-hover:
    backgroundColor: "{colors.c1}"
  pestana-actual:
    backgroundColor: "{colors.rosa}"
    textColor: "{colors.fondo}"
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
  campo:
    backgroundColor: "{colors.fondo}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.campo}"
    padding: "8px 12px"
    height: "{spacing.toque}"
  deslizador-riel:
    backgroundColor: "{colors.c2}"
    rounded: "{rounded.pildora}"
    height: "10px"
  deslizador-avance:
    backgroundColor: "{colors.rosa}"
    rounded: "{rounded.pildora}"
    height: "10px"
  deslizador-perilla:
    backgroundColor: "{colors.rosa}"
    rounded: "{rounded.circulo}"
    size: "32px"
  banda-blanca:
    backgroundColor: "{colors.fondo}"
    textColor: "{colors.tinta}"
  banda-rubor:
    backgroundColor: "{colors.rosa-50}"
    textColor: "{colors.tinta}"
  banda-vino:
    backgroundColor: "{colors.vino-900}"
    textColor: "{colors.fondo}"
  banda-calida:
    backgroundColor: "{colors.fondo-2}"
    textColor: "{colors.tinta}"
  banda-rosa:
    backgroundColor: "{colors.rosa}"
    textColor: "{colors.fondo}"
  tarjeta-caso:
    backgroundColor: "{colors.fondo}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.tarjeta}"
    padding: "{spacing.paso-4}"
  escenario:
    backgroundColor: "{colors.rosa-50}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.tarjeta}"
    padding: "{spacing.paso-4}"
  figura-cien:
    backgroundColor: "{colors.rosa-50}"
    rounded: "{rounded.tarjeta}"
    padding: "{spacing.paso-4}"
  ficha:
    backgroundColor: "{colors.fondo}"
    rounded: "{rounded.tarjeta}"
    padding: "{spacing.paso-4}"
  filtros:
    backgroundColor: "{colors.fondo-2}"
    rounded: "{rounded.tarjeta}"
    padding: "20px"
  estado:
    backgroundColor: "{colors.fondo-2}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.radio}"
    padding: "16px 18px"
  estado-espera:
    textColor: "{colors.tinta-2}"
  estado-error:
    backgroundColor: "{colors.rosa-50}"
  estado-sobre-vino:
    backgroundColor: "{colors.rosa-50}"
  momento:
    backgroundColor: "{colors.rosa-50}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.radio}"
    padding: "20px"
  momento-activo:
    backgroundColor: "{colors.vino-900}"
    textColor: "{colors.fondo}"
  icono-termino:
    backgroundColor: "{colors.rosa}"
    textColor: "{colors.fondo}"
    rounded: "{rounded.circulo}"
    padding: "12px"
    size: "56px"
  icono-termino-vino:
    backgroundColor: "{colors.vino}"
  icono-termino-profundo:
    backgroundColor: "{colors.rosa-700}"
  pastel:
    backgroundColor: "{colors.rosa-50}"
    rounded: "{rounded.circulo}"
    size: "160px"
  pastel-rebanada:
    backgroundColor: "{colors.rosa}"
  pastel-sobre-rubor:
    backgroundColor: "{colors.fondo}"
  etiqueta-mapa:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.fondo}"
    typography: "{typography.meta}"
    rounded: "{rounded.campo}"
    padding: "8px 12px"
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
  pie:
    backgroundColor: "{colors.fondo-2}"
    textColor: "{colors.tinta-2}"
    typography: "{typography.meta}"
    padding: "48px 0"
---

# Design System: Make the Change

## Overview

**Creative North Star: "De cada 100, tú"**

El sistema es un relato en franjas de una sola familia de color. Cada capítulo ocupa todo el ancho de la pantalla y cambia de fondo sin salir de la paleta del INE: blanco, rubor, vino noche, gris cálido y, al final, rosa mexicano. El color da ritmo y dice en qué parte del relato estás, pero el rosa sigue siendo el dato: llena la rebanada del pastel y los puntos de la figura de cien, traza la línea de "todas las personas", tiñe las cifras del titular y viste la acción principal. Todo trabaja para que una cifra se lea como "X de cada 100" y para que, en el siguiente gesto, la persona encuentre su propio caso.

La lectura está pensada para cualquier edad, de niñas y niños a personas mayores con poca experiencia en dispositivos. El texto corrido mide 18 px, nada que se lea baja de 16 px, todo control mide al menos 48 px y la navegación son dos pestañas que siempre se ven. Las palabras difíciles se explican en un glosario visible con íconos propios, y las comparaciones se dicen con palabras junto a la cifra de referencia. Las superficies son planas: la profundidad sale de poner una tarjeta clara sobre una franja de color, o una tarjeta rubor sobre blanco. Advent Pro, geométrica y algo técnica, lleva títulos, términos y cifras; Arial, como pide el manual del INE, lleva todo lo que se lee de corrido.

El movimiento es escaso y funcional. El pastel llena su rebanada en 600 ms con una curva que frena al final, el marcador de la curva viaja 500 ms entre momentos, el momento activo y el relleno del mapa cambian en 200 ms, y botones, pestañas y opciones cambian de estado en 150 ms. Con `prefers-reduced-motion` todas las duraciones se anulan y el desplazamiento suave se apaga.

**Key Characteristics:**
- Franjas a todo lo ancho que alternan blanco, rubor, vino noche, gris cálido y rosa; ningún tono fuera de la familia rosa-vino y sus neutros.
- El rosa INE es el dato, la acción principal y el foco sobre fondo claro; sobre vino y rosa, el texto, el foco y los botones pasan a blanco.
- Escala secuencial de seis clases de rosa a vino para el mapa y los cuadros; trama diagonal para "sin dato".
- Mujeres en vino con línea continua y hombres en gris pizarra con línea discontinua.
- Advent Pro (650) para títulos, términos y cifras; Arial para leer; numerales tabulares en todo el sitio.
- Lectura para todas las edades: texto de 18 px, nada bajo 16 px, controles de 48 px y un glosario visible con íconos propios.
- Plano: una tarjeta de otro tono sobre la franja en lugar de sombras.
- Píldoras para actuar, tarjetas de 10 a 16 px para leer, círculos para pasteles, puntos e íconos.

## Colors

Una paleta institucional en franjas: la familia rosa-vino del INE da el color de los capítulos y del dato, y el blanco, el gris cálido y la tinta dan el descanso.

### Primary
- **Rosa Mexicano INE** (`rosa`, #d5007f, Pantone 233): el dato y la acción principal. Rebanada del pastel, puntos de "votaron" en la figura de cien, línea "Todas las personas" de la curva (4 px), cifras del H1 y de los títulos de "Otras formas de votar", filete superior de 4 px de esos artículos, fondo del botón primario, pestaña de la página actual, avance y perilla del deslizador, uno de cada tres círculos de ícono, anillo de foco sobre fondo claro, selección de texto, franja del cierre y franja superior de las imágenes para compartir. Con texto blanco encima da 5.08:1.
- **Rosa Profundo** (`rosa-700`, #a00062): el rosa cuando es texto de lectura. Enlaces, texto de las pestañas, texto del botón de contorno, hover del primario, entradilla del héroe, el «De cada 100» de la figura, cifra del escenario, cifra de la frase del explorador, nombres de municipio en la tabla y edad donde los hombres votan más en el espejo. También es el tercer tono de los círculos de ícono y el texto del botón primario blanco en la franja rosa. Da 7.86:1 sobre blanco y 7.1:1 sobre rubor.
- **Rubor** (`rosa-50`, #fdf0f6): franja del héroe, de "Otras formas de votar" y de la cabecera de `/explorar`. Fondo de las pestañas, de los momentos de la curva, de la figura de cien y del escenario; resto del pastel sobre blanco; estado de error y estados dentro de la franja vino; hover del botón de contorno, del primario blanco y de las coincidencias del buscador; fila del municipio actual.

### Secondary
- **Vino Noche** (`vino-900`, #5c0c30): franja de la calculadora, con títulos y etiquetas en blanco (13.55:1); momento activo de la curva; flecha de la M grande del cierre. Mismo valor que `c6`.
- **Vino** (`vino`, #7a1240), expuesto también como `mujeres`: la serie de mujeres (2.5 px, continua), sus barras del espejo y sus leyendas; segundo tono de los círculos de ícono.
- **Gris Pizarra** (`hombres`, #4d4f53): la serie de hombres (2.5 px, discontinua 7/6) y sus barras. Nunca rosa contra azul.

### Tertiary
- **Escala Rosa a Vino** (`c1` #f9d4e6, `c2` #f2a3c8, `c3` #e65fa3, `c4` #d5007f, `c5` #a00062, `c6` #5c0c30): seis clases secuenciales, de menos a más participación, para el mapa, los cuadros y su leyenda. Sobre `c4` a `c6` el texto va en blanco; sobre `c1` a `c3`, en tinta. Fuera del mapa, `c1` es el hover de las pestañas y el texto secundario sobre la franja vino (10.05:1); `c2` es el riel del deslizador y el trazo de los puntos de "no votaron"; `c3` es el canto del riel.
- **Trama sin dato** (`sin-dato` #cfcdc9 sobre `trama` #f1efec): rayado a 45° que marca las entidades protegidas o ausentes en el mapa, los cuadros y la leyenda. El pastel vacío usa la misma trama en Papel Cálido y Hilo Cálido (franjas de 8 y 2 px).

### Neutral
- **Tinta Proceso** (`tinta`, #1d1d1b, Process Black): texto y títulos sobre fondos claros; lo elegido en los controles de datos (opción de segmento, entidad activa, cuadro pulsado, tarjeta de edad); fondo de la etiqueta flotante del mapa y del enlace "Saltar al contenido"; patas de la M.
- **Tinta Suave** (`tinta-2`, #4a4a48): texto secundario, notas, pies de figura, títulos de tabla, ejes de la curva y pie de página. Da 8.09:1 sobre Papel Cálido.
- **Gris Frío 7** (`gris`, #97999b, Cool Gray 7): solo trazos. Borde de campos y de opciones de segmento; barra de desplazamiento. Nunca texto.
- **Hilo Cálido** (`linea`, #dddad5): filetes de 1 px. Borde del encabezado y del pie, separador vertical entre el logotipo INE y la M, separadores de tabla y de listas, guías de la curva, borde del buscador y de las tarjetas de edad.
- **Blanco Papel** (`fondo`, #ffffff): franjas del glosario, la curva y el espejo; encabezado; tarjetas sobre franjas de color (resultado del caso, lienzo y ficha del mapa); resto del pastel dentro de franjas rubor; texto sobre rosa y vino.
- **Papel Cálido** (`fondo-2`, #f6f4f1): franja del mapa, panel de filtros de `/explorar`, mensajes de estado, encabezado de tabla y pie. Las filas pares de tabla usan un blanco aún más tenue (#fbfaf8).

### Named Rules
**The Family Bands Rule.** Cada capítulo es una franja a todo lo ancho y toda franja sale de la familia rosa-vino del INE o de sus neutros: blanco, rubor, vino noche, gris cálido o rosa. En la portada el orden es héroe en rubor, glosario y curva en blanco, calculadora en vino noche, mapa en gris cálido, espejo en blanco, "Otras formas de votar" en rubor y cierre en rosa. Sobre vino noche y rosa, títulos, etiquetas, foco y botones van en blanco y el texto secundario sobre vino en `c1`; dentro de una tarjeta clara puesta sobre esas franjas, todo vuelve a tinta y el foco vuelve a rosa.

**The Rosa Is the Datum Rule.** El rosa pleno marca el dato, la acción principal y el foco sobre fondo claro. En texto de lectura se usa Rosa Profundo; el rosa pleno como texto solo aparece en cifras de tamaño de título. Cuando el rosa es la franja, cede su papel al blanco: botón primario blanco con texto Rosa Profundo, contorno blanco y foco blanco.

**The Ink Selects Rule.** Lo elegido dentro de un control de datos se marca en tinta, nunca en rosa: opción de segmento elegida, entidad activa del mapa (trazo de 3 px), cuadro pulsado (contorno de 3 px) y tarjeta de edad elegida. Fuera de los datos hay dos estados propios: la pestaña de la página actual se llena de rosa para que se vea desde lejos dónde estás, y el momento activo de la curva se enciende en vino noche.

**The Wine and Slate Rule.** Mujeres en vino con línea continua, hombres en gris pizarra con línea discontinua. La diferencia se lee por tono y por patrón, también con daltonismo.

## Typography

**Display Font:** Advent Pro (archivo local OFL, eje variable 100–900, cargado con `next/font/local` como `--font-advent`), con Arial de respaldo.
**Body Font:** Arial (con "Helvetica Neue", Helvetica, sans-serif).

**Character:** Advent Pro aporta la voz de campaña, geométrica y ligeramente técnica, en peso 650; Arial la pone el manual del INE y garantiza que leer no requiera descargar nada. Las dos nunca se mezclan dentro de un párrafo: dentro de una frase en Arial, solo la cifra cambia a Advent Pro.

### Hierarchy
- **Display** (Advent Pro 650, clamp(2rem, 1.3rem + 3.2vw, 3.75rem), 1.1, -0.01em): el H1 calculado de la portada y el H1 de `/explorar`. Las cifras del H1 de la portada van en rosa, sin cursiva.
- **Headline** (Advent Pro 650, clamp(1.75rem, 1.3rem + 2vw, 2.75rem), 1.1): título de capítulo; en blanco sobre vino noche y rosa.
- **Title** (Advent Pro 650, clamp(1.25rem, 1.1rem + 0.7vw, 1.5rem), 1.1): títulos de los momentos, de "Otras formas de votar", del escenario, de la ficha del mapa y de los bloques de `/explorar`.
- **Término** (Advent Pro 650, 1.375rem, 1.15): cada palabra del glosario. El título «De cada 100» de la figura de cien sube a 1.625rem en Rosa Profundo.
- **Destacado** (Advent Pro 650, 1.375rem, 1.25): la frase del resultado del caso en la calculadora.
- **Cifra** (Advent Pro 650, numerales tabulares, tamaño según contexto: 2rem bajo los pasteles del héroe, 2.25rem en el escenario, 1.375rem en la frase del explorador): toda cifra que protagoniza un bloque se envuelve en `.cifra`.
- **Entradilla** (Arial 700, 1.375rem, Rosa Profundo): la línea que sigue al H1 de la portada.
- **Body** (Arial 400, 1.125rem, 1.6, numerales tabulares): texto corrido, con `text-wrap: pretty` y ancho máximo de 62ch. El párrafo del cierre sube a 1.25rem; la frase del explorador usa 1.125rem con interlineado 1.45.
- **Botón** (Arial 700, 1.125rem, 1.2): texto de los botones primario y de contorno. Las pestañas de navegación usan Arial 700 al mismo tamaño de texto.
- **Label** (Arial 700, 1rem): etiquetas de campo y de segmento, título de la leyenda del mapa, encabezados de tabla y opciones de segmento (con interlineado 1.2).
- **Meta** (Arial 400, 1rem): pies de figura, leyendas, notas, celdas de tabla, etiqueta flotante del mapa y pie de página; en Tinta Suave cuando es secundario.

Los títulos usan `text-wrap: balance` y `scroll-margin-top: 120px` para no quedar bajo el encabezado fijo. Los enlaces van en Rosa Profundo con subrayado de 1 px separado 0.18em, que se engrosa a 2 px en hover.

### Named Rules
**The Two Voices Rule.** Advent Pro para títulos, términos del glosario, cifras y una frase destacada de una sola idea; Arial para párrafos, etiquetas, controles y tablas. Si un bloque se lee de corrido, va en Arial.

**The Tabular Figures Rule.** Todo el sitio usa numerales tabulares, para que las cifras de tablas, leyendas y pasteles se alineen y no bailen al cambiar.

**The Eighteen Floor Rule.** El texto corrido mide 18 px (`--texto`) y nada que se lea baja de 16 px (`--meta`): pies, leyendas, notas, celdas de tabla, etiquetas y la abreviatura de cada cuadro del mapa.

## Layout

Relato vertical por franjas. Cada capítulo es una `section` a todo lo ancho con relleno vertical de clamp(56px, 8vw, 104px); su contenido vive dentro de un contenedor de 72rem con márgenes laterales de clamp(16px, 4vw, 40px) que respetan el área segura. Todo bloque de texto se limita a 62ch. En `/explorar`, la cabecera es una franja rubor con relleno de clamp(40px, 6vw, 72px) y la herramienta sigue sobre blanco con clamp(32px, 5vw, 56px) arriba y clamp(56px, 8vw, 104px) abajo. El pie sigue sin espacio a la última franja.

El ritmo interno se mueve en pasos de 8, 12, 16, 24, 32, 40 y 48 px; aparecen también 4, 6, 10, 14 y 20 px en ajustes finos de componentes. Las tarjetas llevan 24 px de relleno (20 px en filtros y momentos).

Comportamiento responsivo, móvil primero:
- **480 px**: aparece el nombre "Make the Change" junto a la M.
- **640 px**: la figura de cien pasa a dos columnas (200 px de puntos y el texto).
- **720 px**: las tres preguntas de la calculadora en fila; resultado del caso y dato del explorador con el pastel a la izquierda; controles del mapa en fila; columna de edad del espejo de 4.75rem a 6rem.
- **768 px** (`useAngosta`, max-width 767px): por debajo, la curva usa un lienzo de 420 de ancho (760 arriba), el mapa abre como cuadros sin descargar la geometría y los segmentos con columnas fijas van en rejilla, partiendo en dos líneas las etiquetas largas.
- **860 px**: "Otras formas de votar" a dos columnas.
- **900 px**: encabezado en una sola fila de 76 px con las pestañas en línea; logotipo INE de 36 px; pie a tres columnas (0.8fr 1.6fr 1fr); aparece la M grande del cierre.
- **960 px**: héroe a dos columnas (1.35fr texto, 1fr pasteles) y curva a dos columnas (1.5fr / 1fr) con la columna de la gráfica pegada a 120 px mientras pasan los momentos, separados 40vh.
- **1024 px**: mapa y ficha lado a lado (1.7fr / 1fr).

Los cuadros del mapa forman una rejilla de 7 por 6 con casillas cuadradas que crecen con la pantalla hasta 56 px, separadas 2 px y centradas.

### Named Rules
**The 48 Rule.** Todo control mide al menos 48 px de alto (`--toque`): botones, pestañas, opciones, campos, coincidencias, tarjetas de edad y el área del deslizador. La única excepción son los botones de orden dentro de las filas de tabla con puntero fino, que bajan a 32 px.

**The Reading Column Rule.** Ningún párrafo pasa de 62ch, ni siquiera dentro de una franja o una rejilla ancha.

## Elevation & Depth

El sistema es plano y no proyecta ninguna sombra. La profundidad se construye por capas de tono: una tarjeta blanca sobre la franja vino noche o sobre la franja gris cálido, una tarjeta rubor sobre una franja blanca, un panel gris cálido sobre blanco. Los únicos `box-shadow` son anillos de 1 px que dibujan el borde de una forma.

### Shadow Vocabulary
- **Canto del pastel** (`box-shadow: inset 0 0 0 1px rgba(160, 0, 98, 0.18)`): dibuja el borde del disco cuando la rebanada es pequeña y el resto casi se funde con el fondo.
- **Canto del riel** (`box-shadow: inset 0 0 0 1px var(--c3)`): borde del riel del deslizador.
- **Anillo de la perilla** (`box-shadow: 0 0 0 1px var(--rosa-700)`): contorno exterior de la perilla del deslizador, por fuera de su borde blanco de 4 px.
- **Canto de muestra** (`box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08)`): bordes de las muestras de color de la leyenda del mapa.
- **Doble trazo de selección** (`box-shadow: inset 0 0 0 1px var(--tinta)`): engrosa a 2 px el borde de la tarjeta de edad elegida en el explorador.

### Named Rules
**The Flat Band Rule.** Tarjetas, paneles, botones y tablas no proyectan sombra. Para separar se cambia de tono (tarjeta clara sobre franja de color, tarjeta rubor sobre blanco) o se usa un filete de 1 px.

## Shapes

Tres familias de forma. Lo que se pulsa con texto es una píldora (999px): botones, pestañas de navegación, opciones de segmento y el riel del deslizador. Lo que contiene lectura es un rectángulo de esquina suave: 16px para tarjetas y paneles (resultado del caso, escenario, figura de cien, lienzo, espera y ficha del mapa, filtros del explorador), 10px (`--radio`) para mensajes de estado, momentos, cajas de tabla, lista de coincidencias y el enlace de salto, y 12px para las tarjetas de edad del explorador. Lo que representa a una persona o un dato completo es un círculo: el pastel, los cien puntos de la figura, los discos de los íconos del glosario y la perilla del deslizador.

Los campos de formulario y la etiqueta flotante del mapa usan 8px; las casillas de los cuadros, 6px; el anillo de foco y el extremo exterior de las barras del espejo, 4px; las muestras de leyenda, 3px. Las barras del espejo solo redondean el extremo exterior, así ambas pistas nacen rectas desde la columna de edad. Los artículos de "Otras formas de votar" no llevan caja: se abren con un filete superior de 4px en rosa. El "sin dato" se dibuja siempre con trama diagonal a 45°.

Los íconos del glosario se dibujan a mano en una rejilla de 32 con trazo de 2.25 y remates y uniones redondos, en blanco. La marca de campaña es una M de trazo 8 en una rejilla de 64 con remates redondos: patas y primera diagonal en tinta, y la diagonal derecha convertida en flecha que sube, en rosa.

## Components

### Buttons
Una acción principal por tarea; la ruta hermana, en contorno.
- **Shape:** píldora (999px), alto mínimo de 48px, relleno de 10px 20px, borde de 2px en rosa en ambas variantes, Arial 700 a 1.125rem, 8px entre ícono y texto.
- **Primary (`.btn-primario`):** fondo rosa INE, texto blanco. Ejemplos: "Calcula tu caso", "Compartir", "Busca tu municipio", "Ver municipios de…", "Reintentar".
- **Hover / Focus:** el primario pasa a Rosa Profundo en fondo y borde; el contorno toma fondo Rubor. Transición de 150ms ease-out en fondo, color y borde. Foco con anillo de 3px separado 2px, en rosa sobre fondo claro y en blanco sobre las franjas vino y rosa.
- **Contorno (`.btn-contorno`):** fondo transparente, texto Rosa Profundo. Ejemplos: "¿Qué significan las palabras?", "Copiar frase", "Ver los números en tabla", "Ver todo el país".
- **Sobre la franja rosa:** el primario se vuelve blanco con texto Rosa Profundo (hover en Rubor) y el contorno lleva borde y texto blancos (hover con fondo Rosa Profundo).
- **Deshabilitado:** opacidad 0.55 y cursor no permitido.
- Los botones se agrupan en `.acciones`: fila flexible con salto y 12px de separación.

### Chips
El segmento (`Segmento`) es un grupo de opciones excluyentes con una sola parada de tabulación; las flechas, Inicio y Fin mueven la elección.
- **Style:** píldoras blancas con borde de 1px en Gris Frío 7, Arial 700 a 1rem, relleno de 8px 14px, 48px de alto, 6px entre opciones. La etiqueta del grupo va encima en Label.
- **State:** hover cambia el borde a rosa; la opción elegida se rellena de tinta con texto blanco. En pantallas angostas puede ir en rejilla de N columnas (4 para los años, 3 para "¿Quiénes?"), donde las etiquetas largas parten en dos líneas, o en una fila con desplazamiento horizontal.

### Cards / Containers
- **Corner Style:** 16px en tarjetas y paneles, 10px en estados y momentos, 12px en tarjetas de edad.
- **Background:** siempre de otro tono que su franja. Sobre blanco, tarjetas rubor (figura de cien, momentos). Sobre vino noche, el resultado del caso en blanco, el escenario en rubor y los mensajes de estado en rubor. Sobre gris cálido, el lienzo y la ficha del mapa en blanco. En `/explorar`, el panel de filtros en gris cálido sobre blanco.
- **Shadow Strategy:** ninguna (ver Elevation & Depth).
- **Internal Padding:** 24px en tarjetas, 20px en filtros y momentos, 16px 18px en mensajes de estado.
- **Mensajes de estado (`.estado`):** vacío, protegido, espera y error comparten caja en Papel Cálido; espera pasa el texto a Tinta Suave y error toma fondo Rubor. Siempre ofrecen una salida con botón de contorno.
- **Momentos de la curva:** tarjetas rubor que se vuelven vino noche con texto blanco cuando su momento está activo, con transición de 200ms.
- **Otras formas de votar:** artículos sin caja con filete superior rosa de 4px, 20px de aire arriba, título con la cifra en rosa y listas con filetes de Hilo Cálido hasta 24rem de ancho.

### Inputs / Fields
- **Style:** selectores y campos nativos, 48px de alto, relleno de 8px 12px, borde de 1px en Gris Frío 7, esquina de 8px, fondo blanco, Arial 400 a 1.125rem. La etiqueta envuelve al campo, encima, en Arial 700 a 1rem con 6px de separación; sobre la franja vino la etiqueta va en blanco y el campo sigue blanco. Las preguntas de la calculadora van numeradas ("1. ¿Dónde vives?").
- **Focus:** el anillo global de 3px con 2px de separación (rosa sobre claro, blanco sobre vino y rosa).
- **Deslizador:** barra propia de 48px de área. El riel es una píldora de 10px en `c2` con canto `c3`; la parte recorrida se pinta en rosa y sigue a la perilla mediante `--avance`. La perilla es un círculo rosa de 32px con borde blanco de 4px y un anillo de 1px en Rosa Profundo.
- **Buscador de municipios:** campo con una lista de coincidencias en caja de 10px con borde de Hilo Cálido; cada fila es un botón de 48px en Arial 400 a 1.125rem, separado por filetes, con hover Rubor.

### Navigation
- **Encabezado:** fijo, blanco, filete inferior, con área segura arriba. En móvil, dos filas: arriba el logotipo INE (30px de alto), un filete vertical y la M de campaña (34px) con "Make the Change" en Advent Pro 700 a 1.125rem; abajo, las dos pestañas a todo lo ancho en dos columnas iguales con 8px de separación. Desde 900px, una sola fila de 76px con logotipo de 36px.
- **Pestañas:** "Inicio" y "Busca tu municipio", siempre visibles, sin menú escondido. Píldoras de 48px de alto en Rubor con texto Rosa Profundo, Arial 700, relleno de 0 12px (0 22px desde 900px); hover en `c1`; la página actual se llena de rosa con texto blanco. Transición de 150ms.
- **Saltar al contenido:** enlace en tinta con texto blanco, 12px 16px de relleno, esquina de 10px; aparece arriba al recibir el foco.
- **Pie:** Papel Cálido con filete superior, 48px de relleno más el área segura, texto en Meta y Tinta Suave. Logotipo INE de 40px, "De dónde salen los números" (fuente, cobertura, fecha de los datos, licencia del mapa) y "Equipo", con títulos en Advent Pro 650 a 1.25rem en tinta. Encabezado y pie no llevan avisos.

### Pastel "de cada 100"
La firma del sistema: un disco cuya rebanada rosa son quienes votaron, sobre el resto en Rubor, con canto interno rosa al 18%. Dentro de una franja rubor, el resto pasa a blanco con `--pastel-resto` para no desaparecer. Crece en 600ms con `cubic-bezier(0.16, 1, 0.3, 1)` animando la propiedad registrada `--voto`. Sin dato, el disco se rellena con trama diagonal en Papel Cálido y Hilo Cálido. Tamaños en uso: min(180px, 36vw) en el héroe, 168px en el resultado del caso y del explorador, 120px en la ficha del mapa, 56px en las tarjetas de edad y 160px por omisión. Siempre va con su cifra y un texto que la lee.

### Glosario
"Palabras para entender los números", visible en la portada después del héroe.
- **Figura de cien:** cien círculos en una rejilla de 10 por 10 (radio 7.5 cada 20 unidades): 60 rosa son quienes votaron y 40 blancos con trazo de 1.5 en `c2` son quienes no. Va en una tarjeta rubor de 16px con 24px de relleno, hasta 48rem de ancho, con el dibujo de hasta 200px y el título «De cada 100» en Advent Pro 650 a 1.625rem en Rosa Profundo. El 60 es un ejemplo fijo, no un dato.
- **Términos:** nueve palabras en una rejilla que se acomoda sola (columnas de al menos 19rem, 32px por 40px de separación). Cada término lleva a la izquierda un ícono propio en un disco de 56px con 12px de relleno; los discos alternan rosa, vino y Rosa Profundo, uno tras otro. El término va en Término y la definición en Body.

### Gráficas y mapa
- **Curva:** líneas con grosor en píxeles de pantalla (`vector-effect: non-scaling-stroke`) y uniones redondas; guías horizontales en Hilo Cálido y etiquetas de eje en Tinta Suave a 20 unidades del lienzo, unos 16 px en pantalla. El marcador es un punto rosa de radio 5 con borde blanco de 2 dentro de un halo rosa al 18% de radio 11, y se desplaza 500ms con la misma curva del pastel. La leyenda muestra cada serie con un trazo de 28px y 3px.
- **Mapa:** lienzo blanco de 16px con 8px de relleno dentro de la franja gris cálido. Entidades con trazo blanco de 1px; hover en tinta a 1.5px; activa en tinta a 3px. Relleno con la escala `c1`–`c6`, transición de 200ms. Etiqueta flotante en tinta con texto blanco, 14px por encima del puntero.
- **Cuadros:** cada entidad es una casilla cuadrada de hasta 56px con solo su abreviatura (hasta cuatro letras) en Arial 700 a 1rem, con interletrado de -0.03em; el nombre completo y la cifra salen en la ficha al tocar. Sin dato, la casilla lleva la trama; pulsada, un contorno de tinta de 3px separado 1px.
- **Leyenda:** "Votaron de cada 100:" en Label y muestras de 22 por 14px con esquina de 3px; la trama cierra la lista como "sin dato".
- **Ficha:** tarjeta blanca con el nombre, un pastel de 120px, el desglose con filetes de Hilo Cálido y una tabla que dentro de la ficha pierde su caja y solo conserva un filete superior.
- **Espejo:** barras de 22px de alto, mujeres a la izquierda y hombres a la derecha de una columna de edad centrada, con 6px entre filas; la edad donde los hombres votan más se marca en Rosa Profundo y la leyenda lo explica ("Edad en rosa").
- Toda gráfica tiene su tabla alternativa detrás de un botón de contorno ("Ver los números en tabla", "Ver las 32 entidades en tabla").

### Tablas de datos
Caja blanca con filete de 1px y esquina de 10px que se desplaza por dentro en móvil (`contain: inline-size`). Celdas en Meta con 10px 14px de relleno, cifras alineadas a la derecha, primera columna fija a la izquierda y encabezado fijo arriba en Papel Cálido; título de tabla en Tinta Suave. Filas pares en #fbfaf8. Los encabezados que ordenan son botones subrayados con puntos y una flecha SVG de 10px y trazo 1.6. En `/explorar`, los nombres de municipio son botones en Rosa Profundo con subrayado continuo de 2px, que parten en líneas, y la fila del municipio actual va en Rubor. Los vacíos se escriben con palabras ("sin dato") y la columna "Diferencia" dice cuánto con palabras ("7.92 menos", "23.10 más", "igual"), nunca con signos.

### Marca Make the Change
La M con flecha es el favicon (sobre fondo blanco con esquina de 14 en la rejilla de 64), acompaña al logotipo INE en el encabezado (34px) y firma el cierre: desde 900px aparece a 220px en blanco con la flecha en vino noche, a la derecha de la franja rosa. Las imágenes para compartir son blancas con una franja superior rosa, la M, la cifra en rosa y la fuente en Tinta Suave; no llevan el logotipo del INE ni avisos. La de la calculadora mide 1080 por 1350 y compone el nombre, la cifra (210px) y "de cada 100 votaron" en Advent Pro 700, y la frase en Arial.

## Do's and Don'ts

### Do:
- **Do** alternar franjas a todo lo ancho de la familia INE: blanco (#ffffff), rubor (#fdf0f6), vino noche (#5c0c30), gris cálido (#f6f4f1) y rosa (#d5007f).
- **Do** reservar el rosa INE (#d5007f) para el dato, la acción principal y el foco sobre fondo claro; usar Rosa Profundo (#a00062) cuando el rosa es texto de lectura.
- **Do** pasar a blanco el texto, el foco y los botones sobre vino noche y rosa (`.sobre-oscuro`), y devolverlos a tinta y rosa dentro de las tarjetas claras de esas franjas (`.sobre-claro`).
- **Do** pintar en blanco el resto del pastel (`--pastel-resto`) cuando el pastel vive en una franja rubor.
- **Do** marcar en tinta (#1d1d1b) lo elegido en los controles de datos: opción de segmento, entidad activa, cuadro pulsado, tarjeta de edad.
- **Do** dibujar mujeres en vino con línea continua y hombres en gris pizarra (#4d4f53) con línea discontinua 7/6.
- **Do** usar la escala `c1`–`c6` para cualquier mapa o gráfica secuencial, con texto blanco desde `c4` y tinta hasta `c3`.
- **Do** representar el "sin dato" con trama diagonal a 45° (en mapa y cuadros, #cfcdc9 sobre #f1efec) y explicarlo en la leyenda y en el glosario.
- **Do** mantener el texto corrido en 18px, nada que se lea bajo 16px, todo control en 48px y todo párrafo en 62ch.
- **Do** acompañar cada pastel con su cifra en Advent Pro y un texto que la lea, y cada gráfica con su tabla.
- **Do** decir las comparaciones con palabras y la cifra de referencia ("un poco menos que en Oaxaca (54.66 de cada 100)") y escribir las diferencias de tabla como "7.92 menos" o "23.10 más".
- **Do** dibujar los íconos a mano en una rejilla de 32 con trazo de 2.25 y remates redondos, en blanco sobre discos de 56px que alternan rosa, vino y Rosa Profundo.

### Don't:
- **Don't** usar rosa contra azul para distinguir sexo.
- **Don't** introducir un tono fuera de la familia rosa-vino y sus neutros, ni siquiera para dar más color.
- **Don't** usar rosa para lo elegido en un control de datos; compite con el dato.
- **Don't** poner sombras proyectadas en tarjetas, paneles o botones; la profundidad es de tono.
- **Don't** componer párrafos, etiquetas, tablas ni controles en Advent Pro.
- **Don't** usar Gris Frío 7 (#97999b) para texto; es solo para trazos.
- **Don't** poner el logotipo del INE en las imágenes para compartir ni sobre franjas de color; va solo en el encabezado blanco y en el pie.
- **Don't** representar una celda protegida o ausente con un tono de la escala: se confundiría con participación baja.
- **Don't** escribir "puntos" ni signos de más o menos en el texto: la diferencia se dice con palabras.
- **Don't** esconder la navegación detrás de un menú: las dos pestañas se ven siempre.
- **Don't** añadir avisos de prototipo en el encabezado, el pie o las imágenes para compartir.
