# Mensaje central y públicos

> Fuente única de la estrategia narrativa. Las cifras citadas vienen del ETL validado
> (`data/web/meta.json`, versión `20261027-21f4e10f04fc`); en el sitio se calculan siempre desde
> `lib/datos/`, nunca se escriben a mano. Formato: "X de cada 100" con dos decimales (D45).

## Pregunta guía del reto

¿Cómo traducir los datos de participación en mensajes comprensibles para la ciudadanía?

## Mensaje central (D44)

**Titular calculado:** "A los 18, 57.51 de cada 100 votaron. Entre los hombres de 28, 37.47."

**Entradilla fija:** "Descubre quién participa, dónde y cuánto ha cambiado desde 2009."

El dato concreto engancha; la entradilla da el marco. El titular se recalcula con cada carga del ETL.

El mensaje se sostiene en tres hechos verificados en los datos:

| Hecho | Evidencia (votaron de cada 100 en la lista nominal de los cuadernillos) |
|---|---|
| Las mujeres votan más que los hombres en todas las elecciones federales | Federal 2024: mujeres 60.10, hombres 51.21 |
| La edad cambia todo: votan menos de 20 a 39 años y más de 60 a 79 | Federal 2024: 43.85 a los 25 años contra 71.97 a los 65 |
| El tipo de elección pesa más que el lugar | 55.83 en la federal 2024 contra 12.84 en la judicial 2025 |

## Públicos, en orden de prioridad

1. **Ciudadanía de 18 a 35 años.** Llega desde redes en el teléfono. Necesita entender en segundos y compartir algo sobre su lugar. Es justo el grupo que menos vota.
2. **Docentes y periodistas.** Necesitan cifras citables, metodología clara y gráficas con su tabla de datos.
3. **Personal del INE y de los OPLE.** Necesita explorar su entidad y municipio para material educativo local.

## Principios de comunicación

- **Claridad y precisión antes que efecto visual** (indicación del reto).
- Cada gráfica tiene un título que dice el hallazgo, la definición de la métrica, la fuente y una tabla alternativa.
- Glosario único (D45): "votaron" = SV / LN; "no votaron" = NV / LN; "sin dato" = NS / LN, nombrado aparte.
- Cobertura que siempre se aclara: no incluye casillas especiales ni voto desde el extranjero; la sección es la de la credencial; no coincide con los cómputos distritales.
- Tono: cercano, en segunda persona, sin culpar a quien no vota ("no es un regaño"); invita a mirar su propio lugar.
- Identidad: el INE es el emisor y "Make the Change" la campaña (D38, D39). Aviso fijo: "Prototipo para el Reto 3 del Hackatón INE 2026. No es un sitio oficial del INE."

## Llamado a la acción

"Calcula tu caso" (lugar, edad y sexo) → "Ver el mapa" → ficha de la entidad → "Ver municipios" en `/explorar` → compartir la imagen o el enlace.
