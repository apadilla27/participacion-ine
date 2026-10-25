# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16.4 (App Router, Cache Components) + TypeScript + Tailwind CSS 4 + Recharts 3. Datos agregados en Supabase (PostgreSQL, plan Free) que se leen solo en el servidor; despliegue en Vercel. Decidido por la usuaria al planear el proyecto; versiones exactas en `docs/decision-log.md` (D33).

## Users

- **Primario: ciudadanía de 18 a 35 años.** Llega desde redes sociales en el teléfono, con poco tiempo y sin formación estadística. Quiere entender en segundos cómo vota su entidad y su municipio, y compartirlo. Es el grupo de edad que menos participa (44% a los 25 años en 2024).
- **Secundario: docentes y periodistas.** Necesitan cifras citables, definiciones claras, descargas y gráficas para proyectar o incrustar.
- **Secundario: personal del INE y de los OPLE.** Prepara material educativo y de difusión local; necesita explorar su entidad y municipio con precisión.

## Product Purpose

Micrositio de storytelling con datos para el Reto 3 (Storytelling y Comunicación Pública) del INE. Traduce los Conteos Censales de Participación Ciudadana (2009-2025) en una narrativa pública, veraz y atractiva que explique por qué importa participar, cuánto se participa y cómo varía entre grupos y regiones. Sirve al INE como material educativo y herramienta de divulgación. El éxito es que una persona sin formación técnica entienda un hallazgo, encuentre su propio lugar y lo comparta.

## Positioning

Usa conteos censales, no muestras: cada cifra sale de los cuadernillos de la lista nominal de todas las casillas, con detalle por sexo, edad simple, tipo de sección y municipio para siete elecciones (seis federales y la judicial de 2025). La plataforma oficial del INE ofrece filtros; este sitio cuenta la historia primero y deja explorar después.

## Operating Context

- Lectura en el teléfono, a menudo con una sola mano y en movimiento; también proyección en aula y consulta en escritorio de periodistas.
- La entrada típica es un enlace compartido a un capítulo o a una entidad.
- Los datos no cambian entre cargas del ETL; el sitio es de solo lectura y sin cuentas de usuario.

## Capabilities and Constraints

- **Cobertura de la fuente:** participación registrada en los cuadernillos de la lista nominal. No incluye casillas especiales ni voto desde el extranjero. La sección es la del domicilio de la credencial. No coincide con los cómputos distritales.
- **Métrica principal:** participación = votos marcados / lista nominal (`sv/ln`). También se publica la participación ajustada `sv/(ln − ns)` y el porcentaje no especificado `ns/ln`.
- **Huecos conocidos:** la elección judicial 2025 no incluye Campeche. Prisión preventiva y voto anticipado 2024 no tienen denominador: solo se cuentan personas.
- **Comparabilidad:** distritos y secciones cambian de marco cartográfico entre elecciones; no se comparan en el tiempo. Las claves de municipio del INE no coinciden con las del INEGI.
- **Privacidad:** el registro no binario (desde 2024) solo se muestra por entidad con 30 personas o más; porcentajes por sexo solo con 30 personas o más en lista nominal.
- **Neutralidad electoral:** sin partidos, candidaturas, resultados por fuerza política ni mensajes de promoción del voto por opción alguna.
- **Idioma:** español de México.
- **Abiertas:** nombre del micrositio (sin decidir).

## Brand Commitments

- **Identidad institucional del INE** (decisión de la usuaria, 2026-10-24). Condiciones antes de publicar: autorización por escrito de los organizadores del reto y archivos oficiales del logotipo y del manual de identidad. Mientras no existan, no se dibuja, recrea ni aproxima el logotipo: se reserva su espacio con un marcador visible.
- Voz cercana, en segunda persona, sin culpar a quien no vota.
- La fuente se cita siempre: "Conteos Censales de Participación Ciudadana, INE (DECEyEC)".

## Evidence on Hand

- Datos: 9 conjuntos de datos abiertos del INE en `C:\Users\anafe\Downloads\DatosAbiertos_DECEyEC_ConteosCensales`, procesados por `etl/` (64.7 M filas fuente, 19/19 validaciones). Agregados en `%USERPROFILE%\participacion-ine-etl\out`.
- Hallazgos verificados: `docs/mapa-historias.md`.
- Ausencias que no deben inventarse: testimonios, fotografías, citas de funcionarios, logotipos oficiales, cifras que no salgan del ETL.

## Product Principles

1. Claridad y precisión antes que efecto visual.
2. Cada número es rastreable: métrica definida, fuente y versión de datos visibles.
3. Primero la historia, luego la exploración.
4. Tu lugar importa: cada hallazgo lleva a la entidad y al municipio de quien lee.
5. Honestidad sobre los límites de los datos.

## Accessibility & Inclusion

WCAG 2.2 AA. Diseño móvil primero con objetivos táctiles de 44 pt y área segura; texto base de 16 px y metadatos de 14 px; tabla de datos alternativa en cada gráfica; paletas distinguibles con daltonismo; respeto a `prefers-reduced-motion`; navegación completa por teclado y lector de pantalla.
