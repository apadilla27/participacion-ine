# Mapa de historias (capítulos del relato en `/`)

> Cada capítulo tiene un ancla compartible, una pregunta, un hallazgo, el dato que lo alimenta y su
> advertencia metodológica. Cifras: ETL `20261027-21f4e10f04fc`, en "X de cada 100" con dos decimales.
> Todas salen de `lib/datos/relato.ts`; las frases del sitio se calculan, no se escriben a mano.

## 1. Portada · `/`

- **Hallazgo:** a los 18 años votaron 57.51 de cada 100 en 2024; entre los hombres de 28, 37.47 (el punto más bajo).
- **Datos:** `data/web/edad.json` (entidad 0, edad simple).
- **Acciones:** "Calcula tu caso" (`#huella`) y "Ver el mapa" (`#mapa`).

## 2. La montaña rusa de tu generación · `#curva`

- **Pregunta:** ¿a qué edad se vota más?
- **Hallazgo:** en 2024 quienes votan por primera vez a los 18 (57.51) participan más que los de 25 (43.85); el máximo llega a los 65 (71.97) y baja después: a los 80, 62.85. Desde los 68 los hombres votan más que las mujeres.
- **Serie nacional (todas las personas):**

| Elección | 2009 | 2012 | 2015 | 2018 | 2021 | 2024 | Judicial 2025 |
|---|---|---|---|---|---|---|---|
| Votaron de cada 100 | 43.00 | 61.95 | 44.19 | 58.10 | 49.60 | 55.83 | 12.84 |

- **Datos:** `data/web/edad.json` para las 7 elecciones; los cinco momentos se recalculan al cambiar de elección.
- **Advertencia:** edades de 100 o más se agrupan; la judicial 2025 no incluye Campeche.

## 3. Tu huella cívica · `#huella`

- **Pregunta:** ¿cómo votó la gente como tú (lugar, edad y sexo) en la federal 2024?
- **Hallazgo:** de 18 a 29 años votaron 45.83 de cada 100; de 60 a 69, 69.90. Si los jóvenes votaran como sus abuelos serían 6,261,987 votos más.
- **Datos:** cubo de edad de FED2024 por entidad y sexo.
- **Advertencia:** cortes con menos de 30 personas no se muestran (D46).

## 4. Los dos Méxicos · `#mapa`

- **Pregunta:** ¿dónde se vota más y dónde menos?
- **Hallazgo:** en 2024 Ciudad de México (67.98), Yucatán (66.00) y Tlaxcala (65.63) lideran; Sonora (44.44), Chihuahua (44.12) y Baja California (43.67) cierran. En la judicial el orden cambia: Coahuila (23.75) arriba y Guanajuato (6.55) abajo. En 2024 las secciones urbanas (56.17) alcanzan a las rurales (55.69).
- **Datos:** `public/datos/entidad.json` (seis lecturas en las 7 elecciones) y `data/web/tipo.json`; geometría en `public/geo/entidades.json`, pedida solo al mostrar el mapa.
- **Advertencia:** distritos y secciones no son comparables entre elecciones (marcos cartográficos distintos).

## 5. Las dos caras del espejo · `#espejo`

- **Pregunta:** ¿hombres y mujeres participan igual?
- **Hallazgo:** las mujeres superan a los hombres en todas las federales. En 2024: 60.10 contra 51.21 (8.89 puntos). La brecha más amplia está en Guanajuato (11.95 puntos) y la más corta en Chihuahua (5.03).
- **Datos:** bandas de edad por sexo, con el mismo selector de elección que la curva.
- **Advertencia:** desde 2024 existe el registro no binario; se publica solo donde hay 30 personas o más.

## 6. Otras formas de votar · `#llega`

- **Pregunta:** ¿quién pudo votar sin ir a la casilla en 2024?
- **Hallazgo:** 26,563 personas votaron en prisión preventiva (24,232 hombres) y 3,449 votaron de forma anticipada (2,143 mujeres).
- **Datos:** `data/web/modalidad.json`.
- **Advertencia:** no hay denominador; se muestran personas, nunca porcentajes.

## 7. Tu municipio también tiene su historia · cierre

- **Acción:** "Explora tu municipio" → `/explorar?e=&ent=&s=&g=&m=` con filtros en la dirección para compartir.
- **Datos:** `public/datos/m/{eleccion}/{entidad}.json`, un archivo por elección y entidad.
