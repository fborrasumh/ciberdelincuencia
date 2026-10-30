# CiberdelincuencIA

Práctica adaptativa, simulacro de examen y caso práctico de Cibercrimen y Ciberseguridad (UMH 8059). Aplicación web de un solo fichero.

**Usar la app:** https://fborrasumh.github.io/ciberdelincuencia/

**Idiomas:** español (por defecto), inglés, portugués; selector en la barra superior (o `?lang=en` / `?lang=pt` en la URL).

Sistema de aprendizaje de la asignatura **8059 Cibercrimen y Ciberseguridad** (3.º del Grado en Seguridad Pública y Privada, Universidad Miguel Hernández de Elche, 4,5 ECTS), construido a partir de su Guía Docente 2026-2027 (validada el 22/06/2026).

## Qué hace

- **Práctica adaptativa por unidad (sin clave, sin conexión).** 36 preguntas propias, 4 por cada una de las 9 unidades de la guía, en tres idiomas, etiquetadas por nivel de Bloom. Cada respuesta va acompañada de la seguridad declarada (seguro / dudo / lo adivino) y de una explicación inmediata.
- **Ruta explicable.** Un modelo Elo simplificado por unidad (Pelánek, 2016) con olvido exponencial (21 días) estima el dominio. La siguiente pregunta se elige con reglas deterministas: primero vuelve lo fallado (tras otras tres preguntas), luego los repasos espaciados vencidos (cajas de Leitner: 1, 3, 7, 16 y 35 días) y después preguntas nuevas de la unidad menos dominada, con dificultad ajustada a un 70 % de acierto esperado; nunca dos seguidas de la misma unidad si hay otras. El estudiante ve en cada pregunta **por qué le toca**.
- **Simulacro con la fórmula literal de la guía:** `Nota = ((correctas − incorrectas / nº de opciones) / nº de preguntas) · 10`, con preguntas en blanco que no descuentan. Muestra el cálculo con los números, cuánto han restado los errores y, con los datos de la propia práctica, si al estudiante le conviene contestar las preguntas en las que duda (umbral 1/(k+1)). El simulacro es reproducible por semilla.
- **Calculadora de la evaluación continua** (70 % test + 30 % caso, con el mínimo de 5 en el test).
- **Laboratorio del caso práctico.** El código cuenta palabras, citas en el texto, referencias y DOI. La IA comenta el trabajo según los **ocho criterios de corrección literales de la guía**; cada comentario debe apoyarse en una frase literal del trabajo, que el código verifica. **No pone notas**: si la IA escribe una calificación se le pide repetir y, si persiste, el código quita la frase y lo avisa.
- **Ensayo de la defensa oral.** La IA formula preguntas ancladas a frases literales del trabajo (verificadas) y comenta las respuestas del estudiante, sin calificación.
- **Preguntas desde los apuntes.** La IA propone preguntas a partir de un fragmento de apuntes; el código descarta las que no traen una cita literal de los apuntes, las que tienen opciones repetidas o una respuesta mal indicada, y avisa si la correcta es claramente la más larga o si aparecen cifras ajenas a los apuntes.
- **Progreso:** dominio por unidad, repasos pendientes, calibración de la seguridad (¿acierta más cuando dice estar seguro?) y resultados de aprendizaje medibles propuestos para cada unidad.
- **Panel del profesorado:** reúne los ficheros anónimos del alumnado y calcula, por pregunta, el índice de dificultad, la discriminación (correlación punto-biserial ítem-resto) y el uso de cada distractor, con avisos para revisar. Exporta el banco a **Moodle XML** (una categoría por unidad y la misma penalización que la guía), **GIFT** y CSV.
- **Ejemplos sin clave:** un caso práctico ficticio con comentarios precalculados (en los tres idiomas) y datos simulados para probar el panel del profesorado, declarados como simulados.
- Descargas en Word (escrito en el propio navegador, sin librerías externas), copia de seguridad en JSON y fichero de respuestas anónimas.

## Cómo se usa la IA

Solo para el caso práctico, la defensa oral y las preguntas desde los apuntes, con la propia clave de OpenAI, Google Gemini o Anthropic Claude. La clave se guarda solo en el navegador. No hace falta servidor. **La IA propone; el código comprueba:** citas literales verificadas, criterios buscados por identificador (si falta uno se marca, no se inventa), notas eliminadas, recuentos de citas y referencias hechos por código.

## Privacidad

Todo (respuestas, progreso, caso práctico, ficheros del profesorado) se guarda en el navegador (IndexedDB). La práctica, el simulacro, el progreso y el panel del profesorado no envían nada a ningún sitio. Al proveedor de IA solo sale el texto que la persona decide enviar, con correos, teléfonos y DNI/NIE enmascarados, y antes del primer envío de la sesión se muestra la muestra exacta y se pide confirmación. La política de seguridad del contenido (CSP) impide conexiones a cualquier otro origen.

**Fichero anónimo de respuestas** (`ciberdelincuencia/eventos/1`), descarga voluntaria con casilla de conformidad. Diccionario de datos:

| Campo | Contenido |
|---|---|
| `seud` | Seudónimo aleatorio generado en el navegador (`E-XXXXXX`) |
| `ev[].i` | Identificador de la pregunta del banco (`u3-2`…); las creadas con IA no se exportan |
| `ev[].u` | Unidad (1-9) |
| `ev[].o` | Opción elegida en el orden original (0-3) o `null` si se dejó en blanco |
| `ev[].c` | 1 si es correcta, 0 si no |
| `ev[].cf` | Seguridad declarada: `seguro`, `dudo`, `azar` o `blanco` |
| `ev[].d` | Día relativo desde la primera respuesta (no hay fechas ni horas) |

No contiene nombres, textos, claves ni fechas absolutas.

## Límites

- **Las 36 preguntas son una primera propuesta pendiente de revisión por el profesorado de la asignatura.** Se redactaron a partir de los títulos y descripciones de las unidades de la guía y de conocimiento general de la materia, no a partir de los materiales de clase. Las referencias a normas (art. 197 bis y 264 del Código Penal, Directiva NIS2, Esquema Nacional de Seguridad, Convenio de Budapest) deben comprobarse con la versión vigente.
- Los resultados de aprendizaje por unidad son una **propuesta** de reescritura; los oficiales son los dos objetivos de la guía.
- El dominio estimado es una señal para orientar el repaso, no una predicción de la nota. **No se ha medido** que la app mejore el rendimiento: las técnicas en que se basa (práctica de recuperación, espaciado, intercalado) tienen respaldo general en la literatura, pero el efecto de esta herramienta concreta está por evaluar.
- Los comentarios de la IA al caso práctico son orientativos y pueden equivocarse; la calificación es siempre del profesorado. El recuento de citas reconoce formatos de autor-año habituales; otros estilos pueden no detectarse.
- El número de opciones por pregunta del examen real no consta en la guía: la app usa 4 por defecto y es editable.
- Probado con IA simulada (incluidas respuestas que inventan citas y ponen notas) en Chromium; no se ha probado con claves reales de los tres proveedores.
- Investigar con los datos (publicar resultados) exige aprobación previa del comité de ética de investigación, consentimiento informado y cumplimiento del RGPD; la app produce el dataset, no la evidencia.

## Análisis de la guía docente (resumen)

Lo que la app propone revisar, con referencia al apartado de la guía:

1. **Objetivos (resultados de aprendizaje):** solo dos, con verbos no observables («Conocer el Cibercrimen como fenómeno», «Estudiar la Ciberseguridad») y sin vínculo con unidades ni instrumentos de evaluación.
2. **Criterios de corrección (fórmula del test):** la penalización es incorrectas / nº de opciones; la corrección clásica del azar usa nº de opciones − 1. Con la fórmula actual, contestar al azar tiene valor esperado positivo (+0,0625 por pregunta con 4 opciones). El nº de opciones no consta.
3. **Evaluación:** no consta la calificación si el test es inferior a 5 habiendo entregado el caso, ni la recuperación del caso práctico.
4. **Características de la prueba / criterios de las prácticas:** ocho criterios sin pesos ni niveles; los «elementos estipulados» no se enumeran.
5. **Bibliografía:** la básica no indica editorial ni año; la normativa de ciberseguridad (U9) ha cambiado después de la bibliografía complementaria (2015, 2017).
6. **Metodología y carga:** cinco metodologías declaradas y 4,5 ECTS sin reparto de horas ni práctica evaluable del test antes del examen. El banco de práctica de la app es la propuesta para ese hueco.

## Adoptar la app en otra asignatura o universidad

Todo el contenido de la asignatura está en un bloque de datos al principio del script de `index.html` (las constantes `CURSO`, `EVAL`, `UNIDADES` e `ITEMS`, que en el proyecto fuente es `src/curriculum.js`). Para adaptarla: sustituye ese bloque por los datos de tu guía (unidades, criterios, fórmula y preguntas en los idiomas que uses), revisa los ejemplos del caso práctico y publica el fichero. La lógica (modelo de dominio, ruta, simulacro, analítica, exportaciones) no depende de la asignatura.

## Fundamentos

- Roediger, H. L. y Karpicke, J. D. (2006). Test-enhanced learning. *Psychological Science*, 17(3), 249-255. https://doi.org/10.1111/j.1467-9280.2006.01693.x
- Cepeda, N. J. et al. (2006). Distributed practice in verbal recall tasks. *Psychological Bulletin*, 132(3), 354-380. https://doi.org/10.1037/0033-2909.132.3.354
- Dunlosky, J. et al. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest*, 14(1), 4-58. https://doi.org/10.1177/1529100612453266
- Pelánek, R. (2016). Applications of the Elo rating system in adaptive educational systems. *Computers & Education*. https://doi.org/10.1016/j.compedu.2016.03.017

## Autoría

Fernando Borrás Rocher (Universidad Miguel Hernández de Elche) y Fernando Miró Llinares (Universidad Miguel Hernández de Elche).

A partir de la Guía Docente 2026-2027 de la asignatura 8059 Cibercrimen y Ciberseguridad (Grado en Seguridad Pública y Privada, UMH), cuyo responsable es el profesor Fernando Miró Llinares.

Roles (CRediT): Fernando Borrás Rocher — conceptualización, software, metodología, validación (pruebas), redacción. Fernando Miró Llinares — recursos (asignatura y Guía Docente en la que se basa la app). Los roles pueden ajustarse en una versión posterior.

ORCID: Fernando Borrás Rocher [0000-0002-5519-4573](https://orcid.org/0000-0002-5519-4573) · Fernando Miró Llinares [0000-0001-6379-5857](https://orcid.org/0000-0001-6379-5857)

El resto del profesorado de la asignatura puede incorporarse como coautor en una versión posterior (con su ORCID y su conformidad con la licencia), lo que genera una nueva versión del registro en Zenodo con el mismo DOI de concepto.

## Cómo citar

Borrás Rocher, F. y Miró Llinares, F. (2026). *CiberdelincuencIA* (v1.0.0) [Software]. (DOI en trámite)

## Licencia

MIT. Véase [LICENSE](LICENSE).
