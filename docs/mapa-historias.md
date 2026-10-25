# Mapa de historias (capítulos del scrollytelling en `/`)

> Cada capítulo tiene un ancla compartible (`/#cuantos-votamos`, etc.), una pregunta, un hallazgo,
> la consulta que lo alimenta y su advertencia metodológica. Cifras: ETL `20261024-21f4e10f04fc`.

## 1. ¿Cuántos votamos? · `#cuantos-votamos`

- **Pregunta:** ¿qué tanto participa México y cómo ha cambiado?
- **Hallazgo:** la participación sube en elecciones presidenciales y baja en las intermedias; la judicial de 2025 rompe la escala.

| Elección | 2009 | 2012 | 2015 | 2018 | 2021 | 2024 | Judicial 2025 |
|---|---|---|---|---|---|---|---|
| Participación | 43.0% | 62.0% | 44.2% | 58.1% | 49.6% | 55.8% | 12.8% |

- **Datos:** `rpc_serie_entidad(0)` (sexo 9).
- **Advertencia:** la judicial 2025 no incluye Campeche; las intermedias solo eligen diputaciones.

## 2. Ellas votan más · `#ellas-votan-mas`

- **Pregunta:** ¿hombres y mujeres participan igual?
- **Hallazgo:** las mujeres superan a los hombres en todas las federales. En 2024: 60.1% contra 51.2%. La brecha más amplia está en Guanajuato (11.9 puntos) y la más corta en Chihuahua (5.0).
- **Datos:** `rpc_serie_entidad(0)` sexos 0 y 1; `v_participacion_entidad` por entidad.
- **Advertencia:** desde 2024 existe el registro no binario; se publica solo donde hay 30 personas o más.

## 3. La edad importa · `#la-edad-importa`

- **Pregunta:** ¿a qué edad se vota más?
- **Hallazgo:** curva en forma de U invertida. En 2024 quienes votan por primera vez a los 18 participan (57.5%) más que los de 25 (43.9%); el máximo llega a los 65 (72.0%) y baja después de los 80.
- **Datos:** `agg_entidad_edad` (entidad 0, sexo 9); grupos amplios 18-29 / 30-59 / 60+ desde `grupos_edad`.
- **Advertencia:** edades mayores a 100 se agrupan en "100 y más".

## 4. México no vota igual · `#mexico-no-vota-igual`

- **Pregunta:** ¿dónde se vota más y dónde menos?
- **Hallazgo:** en 2024 Ciudad de México (68.0%), Yucatán (66.0%) y Tlaxcala (65.6%) lideran; Baja California (43.7%), Chihuahua (44.1%) y Sonora (44.4%) cierran. En la judicial el orden cambia: Coahuila (23.8%) arriba, Guanajuato (6.6%) abajo. Las secciones rurales participan más en las intermedias; en 2024 las urbanas las alcanzan (56.2% contra 55.7%).
- **Datos:** `v_participacion_entidad`, `v_participacion_tipo_seccion`, `rpc_ranking_municipios`.
- **Advertencia:** distritos y secciones no son comparables entre elecciones (marcos cartográficos distintos).

## 5. Nuevas formas de votar · `#nuevas-formas`

- **Pregunta:** ¿quién pudo votar sin ir a la casilla en 2024?
- **Hallazgo:** 26,563 personas votaron en prisión preventiva (91% hombres) en 31 entidades y 3,449 votaron de forma anticipada (62% mujeres) en 32.
- **Datos:** `agg_modalidad_voto`.
- **Advertencia:** no hay denominador; se muestran personas, nunca porcentajes.

## 6. ¿Y tú? · `#y-tu`

- **Pregunta:** ¿cómo se vota en mi entidad y en mi municipio?
- **Acción:** selector de entidad → `/entidades/[clave]` → "Ver municipios" → tarjeta para compartir.
- **Datos:** todas las anteriores filtradas por entidad y municipio.
