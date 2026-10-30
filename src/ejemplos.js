/* ══ Caso práctico de EJEMPLO (ficticio, con fines didácticos) en cada idioma, con la «respuesta de la IA» precalculada.
   Pasa por las mismas funciones que una respuesta real (procesaFb, procesaDef): las evidencias deben aparecer LITERALMENTE en su texto. ══ */
const EJ_CASO = {
  es: {
    tit: 'Smishing que suplanta a una empresa de paquetería: análisis criminológico y prevención',
    txt: `1. Problemática
Durante los últimos meses se han difundido mensajes SMS que suplantan a una empresa de paquetería y avisan de un envío retenido. El enlace lleva a una web falsa que pide los datos de la tarjeta para pagar una pequeña tasa. Este caso es ficticio y se ha construido con fines didácticos.

2. Clasificación
Se trata de un cibercrimen económico de tipo réplica: reproduce la estafa tradicional en el ciberespacio, aunque emplea técnicas propias como la suplantación de la identidad visual de la empresa.

3. Análisis de la oportunidad
Desde la teoría de las actividades cotidianas, el ciberlugar es la bandeja de mensajes del teléfono, donde el agresor llega a miles de víctimas a la vez y sin coincidir con ellas en el tiempo. El objetivo es adecuado porque muchas personas esperan paquetes y el importe es pequeño. No hay un guardián capaz en el momento del clic.

4. Prevención
Propongo tres medidas situacionales: filtros de los operadores para bloquear remitentes falsos (aumentar el esfuerzo), avisos en las aplicaciones de las empresas de paquetería que recuerden que nunca piden pagos por SMS (eliminar excusas) y una vía de denuncia sencilla que aumente el riesgo para los agresores.

5. Valoración crítica
Creo que la prevención depende sobre todo de actores privados y que la respuesta penal llega tarde, porque muchas víctimas no denuncian por la pequeña cuantía.

Bibliografía
Miró Llinares, F. (2012). El cibercrimen: fenomenología y criminología de la delincuencia en el ciberespacio. Marcial Pons.`,
    fb: {resumen: 'Caso bien estructurado que aplica conceptos centrales de la asignatura. Lo que más lo mejoraría: citar las fuentes dentro del texto, ampliar la bibliografía y argumentar mejor la valoración crítica.', criterios: [
      {id: 'C1', fortalezas: 'El trabajo está ordenado en apartados numerados con una lógica clara: problema, clasificación, análisis, prevención y valoración.', mejoras: 'Añade una breve introducción con el objetivo del caso y una conclusión final.', evidencia: 'Durante los últimos meses se han difundido mensajes SMS que suplantan a una empresa de paquetería'},
      {id: 'C2', fortalezas: 'Incluye la problemática, su clasificación, un análisis criminológico, propuestas de prevención y bibliografía.', mejoras: 'La guía no enumera los «elementos estipulados»: confirma con el profesorado si se espera también el análisis de la respuesta penal (unidad 9).', evidencia: ''},
      {id: 'C3', fortalezas: 'Usa con precisión conceptos de la asignatura como cibercrimen réplica, ciberlugar y guardián capaz.', mejoras: 'Justifica por qué es «réplica» y no «puro»: explica qué papel tienen las TIC en el engaño.', evidencia: 'Se trata de un cibercrimen económico de tipo réplica: reproduce la estafa tradicional en el ciberespacio'},
      {id: 'C4', fortalezas: 'Las medidas de prevención se conectan con el análisis de la oportunidad.', mejoras: 'Relaciona cada medida con el elemento concreto de la oportunidad que reduce: el objetivo, el guardián o el esfuerzo del agresor.', evidencia: 'filtros de los operadores para bloquear remitentes falsos (aumentar el esfuerzo)'},
      {id: 'C5', fortalezas: 'Sintetiza el mecanismo del fraude en pocas líneas.', mejoras: 'Profundiza en por qué la pequeña cuantía favorece a la vez el éxito del fraude y que no se denuncie.', evidencia: 'El objetivo es adecuado porque muchas personas esperan paquetes y el importe es pequeño'},
      {id: 'C6', fortalezas: 'Toma posición sobre los límites de la respuesta penal.', mejoras: 'Apoya tu opinión en datos o en un autor de la bibliografía y plantea alguna objeción a tu propia postura.', evidencia: 'Creo que la prevención depende sobre todo de actores privados y que la respuesta penal llega tarde'},
      {id: 'C7', fortalezas: 'Incluye una obra de la bibliografía básica de la asignatura.', mejoras: 'Una sola fuente es poco: incorpora también la bibliografía complementaria de la guía u otras fuentes académicas.', evidencia: 'Miró Llinares, F. (2012). El cibercrimen: fenomenología y criminología de la delincuencia en el ciberespacio'},
      {id: 'C8', fortalezas: 'La referencia final está completa: autor, año, título y editorial.', mejoras: 'No hay citas dentro del texto: cita la fuente allí donde usas sus conceptos, por ejemplo al hablar del ciberlugar.', evidencia: ''}]},
    def: {preguntas: [
      {pregunta: '¿Por qué lo clasificas como cibercrimen réplica y no como cibercrimen puro?', motivo: 'Dominio de la clasificación (unidad 4)', cita: 'Se trata de un cibercrimen económico de tipo réplica'},
      {pregunta: '¿Quién sería exactamente el guardián capaz en este ciberlugar y por qué no actúa a tiempo?', motivo: 'Oportunidad criminal (unidad 2)', cita: 'No hay un guardián capaz en el momento del clic'},
      {pregunta: '¿Qué datos o fuentes te permiten afirmar que muchas víctimas no denuncian?', motivo: 'Opinión crítica fundamentada (criterio C6)', cita: 'muchas víctimas no denuncian por la pequeña cuantía'},
      {pregunta: '¿Qué tipo penal aplicarías a estos hechos y qué dificultades tendría su persecución?', motivo: 'Regulación penal (unidad 9)', cita: 'la respuesta penal llega tarde'}]}
  },
  en: {
    tit: 'Smishing impersonating a parcel company: criminological analysis and prevention',
    txt: `1. The problem
In recent months, SMS messages have been circulating that impersonate a parcel company and warn of a held delivery. The link leads to a fake website that asks for card details to pay a small fee. This case is fictitious and was built for teaching purposes.

2. Classification
It is an economic replica cybercrime: it reproduces traditional fraud in cyberspace, although it uses its own techniques such as impersonating the company's visual identity.

3. Opportunity analysis
From routine activity theory, the cyber-place is the phone's message inbox, where the offender reaches thousands of victims at once and without coinciding with them in time. The target is suitable because many people are expecting parcels and the amount is small. There is no capable guardian at the moment of the click.

4. Prevention
I propose three situational measures: operator filters to block fake senders (increase the effort), notices in parcel companies' apps reminding users that they never ask for payments by SMS (remove excuses) and a simple reporting channel that increases the risk for offenders.

5. Critical assessment
I believe prevention depends above all on private actors and that the criminal-law response comes too late, because many victims do not report due to the small amount.

Bibliography
Miró Llinares, F. (2012). El cibercrimen: fenomenología y criminología de la delincuencia en el ciberespacio. Marcial Pons.`,
    fb: {resumen: 'A well-structured case that applies core concepts of the course. What would improve it most: citing sources in the text, widening the bibliography and arguing the critical assessment better.', criterios: [
      {id: 'C1', fortalezas: 'The work is organised in numbered sections with a clear logic: problem, classification, analysis, prevention and assessment.', mejoras: 'Add a short introduction with the aim of the case and a final conclusion.', evidencia: 'In recent months, SMS messages have been circulating that impersonate a parcel company'},
      {id: 'C2', fortalezas: 'It includes the problem, its classification, a criminological analysis, prevention proposals and a bibliography.', mejoras: 'The syllabus does not list the “stipulated elements”: check with the teaching staff whether an analysis of the criminal-law response (unit 9) is also expected.', evidencia: ''},
      {id: 'C3', fortalezas: 'It uses course concepts such as replica cybercrime, cyber-place and capable guardian precisely.', mejoras: 'Justify why it is “replica” and not “pure”: explain what role ICT plays in the deception.', evidencia: 'It is an economic replica cybercrime: it reproduces traditional fraud in cyberspace'},
      {id: 'C4', fortalezas: 'The prevention measures are linked to the opportunity analysis.', mejoras: 'Relate each measure to the specific element of opportunity it reduces: the target, the guardian or the offender’s effort.', evidencia: 'operator filters to block fake senders (increase the effort)'},
      {id: 'C5', fortalezas: 'It summarises the fraud mechanism in a few lines.', mejoras: 'Go deeper into why the small amount favours both the success of the fraud and the lack of reporting.', evidencia: 'The target is suitable because many people are expecting parcels and the amount is small'},
      {id: 'C6', fortalezas: 'It takes a position on the limits of the criminal-law response.', mejoras: 'Support your opinion with data or an author from the bibliography and raise an objection to your own position.', evidencia: 'I believe prevention depends above all on private actors and that the criminal-law response comes too late'},
      {id: 'C7', fortalezas: 'It includes a work from the course’s core bibliography.', mejoras: 'A single source is not enough: also include the syllabus’ complementary bibliography or other academic sources.', evidencia: 'Miró Llinares, F. (2012). El cibercrimen: fenomenología y criminología de la delincuencia en el ciberespacio'},
      {id: 'C8', fortalezas: 'The final reference is complete: author, year, title and publisher.', mejoras: 'There are no in-text citations: cite the source where you use its concepts, for example when discussing the cyber-place.', evidencia: ''}]},
    def: {preguntas: [
      {pregunta: 'Why do you classify it as a replica cybercrime and not as a pure cybercrime?', motivo: 'Command of the classification (unit 4)', cita: 'It is an economic replica cybercrime'},
      {pregunta: 'Who exactly would be the capable guardian in this cyber-place, and why do they not act in time?', motivo: 'Criminal opportunity (unit 2)', cita: 'There is no capable guardian at the moment of the click'},
      {pregunta: 'What data or sources allow you to say that many victims do not report?', motivo: 'Well-founded critical opinion (criterion C6)', cita: 'many victims do not report due to the small amount'},
      {pregunta: 'Which offence would you apply to these facts, and what difficulties would prosecuting it involve?', motivo: 'Criminal law (unit 9)', cita: 'the criminal-law response comes too late'}]}
  },
  pt: {
    tit: 'Smishing que se faz passar por uma empresa de encomendas: análise criminológica e prevenção',
    txt: `1. Problemática
Nos últimos meses têm circulado mensagens SMS que se fazem passar por uma empresa de encomendas e avisam de uma entrega retida. A ligação leva a um site falso que pede os dados do cartão para pagar uma pequena taxa. Este caso é fictício e foi construído com fins didáticos.

2. Classificação
Trata-se de um cibercrime económico do tipo réplica: reproduz a burla tradicional no ciberespaço, embora use técnicas próprias como a imitação da identidade visual da empresa.

3. Análise da oportunidade
A partir da teoria das atividades rotineiras, o ciberlugar é a caixa de mensagens do telemóvel, onde o agressor chega a milhares de vítimas ao mesmo tempo e sem coincidir com elas no tempo. O alvo é adequado porque muitas pessoas esperam encomendas e o montante é pequeno. Não há um guardião capaz no momento do clique.

4. Prevenção
Proponho três medidas situacionais: filtros dos operadores para bloquear remetentes falsos (aumentar o esforço), avisos nas aplicações das empresas de encomendas a lembrar que nunca pedem pagamentos por SMS (eliminar desculpas) e um canal de denúncia simples que aumente o risco para os agressores.

5. Apreciação crítica
Creio que a prevenção depende sobretudo de atores privados e que a resposta penal chega tarde, porque muitas vítimas não denunciam devido ao pequeno montante.

Bibliografia
Miró Llinares, F. (2012). El cibercrimen: fenomenología y criminología de la delincuencia en el ciberespacio. Marcial Pons.`,
    fb: {resumen: 'Caso bem estruturado que aplica conceitos centrais da unidade curricular. O que mais o melhoraria: citar as fontes no texto, alargar a bibliografia e argumentar melhor a apreciação crítica.', criterios: [
      {id: 'C1', fortalezas: 'O trabalho está organizado em secções numeradas com uma lógica clara: problema, classificação, análise, prevenção e apreciação.', mejoras: 'Acrescente uma breve introdução com o objetivo do caso e uma conclusão final.', evidencia: 'Nos últimos meses têm circulado mensagens SMS que se fazem passar por uma empresa de encomendas'},
      {id: 'C2', fortalezas: 'Inclui a problemática, a sua classificação, uma análise criminológica, propostas de prevenção e bibliografia.', mejoras: 'O programa não enumera os «elementos estipulados»: confirme com os docentes se se espera também a análise da resposta penal (unidade 9).', evidencia: ''},
      {id: 'C3', fortalezas: 'Usa com precisão conceitos da unidade curricular como cibercrime réplica, ciberlugar e guardião capaz.', mejoras: 'Justifique porque é «réplica» e não «puro»: explique que papel têm as TIC no engano.', evidencia: 'Trata-se de um cibercrime económico do tipo réplica: reproduz a burla tradicional no ciberespaço'},
      {id: 'C4', fortalezas: 'As medidas de prevenção ligam-se à análise da oportunidade.', mejoras: 'Relacione cada medida com o elemento concreto da oportunidade que reduz: o alvo, o guardião ou o esforço do agressor.', evidencia: 'filtros dos operadores para bloquear remetentes falsos (aumentar o esforço)'},
      {id: 'C5', fortalezas: 'Sintetiza o mecanismo da fraude em poucas linhas.', mejoras: 'Aprofunde porque é que o pequeno montante favorece ao mesmo tempo o êxito da fraude e a falta de denúncia.', evidencia: 'O alvo é adequado porque muitas pessoas esperam encomendas e o montante é pequeno'},
      {id: 'C6', fortalezas: 'Toma posição sobre os limites da resposta penal.', mejoras: 'Apoie a sua opinião em dados ou num autor da bibliografia e levante alguma objeção à sua própria posição.', evidencia: 'Creio que a prevenção depende sobretudo de atores privados e que a resposta penal chega tarde'},
      {id: 'C7', fortalezas: 'Inclui uma obra da bibliografia básica da unidade curricular.', mejoras: 'Uma só fonte é pouco: incorpore também a bibliografia complementar do programa ou outras fontes académicas.', evidencia: 'Miró Llinares, F. (2012). El cibercrimen: fenomenología y criminología de la delincuencia en el ciberespacio'},
      {id: 'C8', fortalezas: 'A referência final está completa: autor, ano, título e editora.', mejoras: 'Não há citações no texto: cite a fonte onde usa os seus conceitos, por exemplo ao falar do ciberlugar.', evidencia: ''}]},
    def: {preguntas: [
      {pregunta: 'Porque o classifica como cibercrime réplica e não como cibercrime puro?', motivo: 'Domínio da classificação (unidade 4)', cita: 'Trata-se de um cibercrime económico do tipo réplica'},
      {pregunta: 'Quem seria exatamente o guardião capaz neste ciberlugar e porque não atua a tempo?', motivo: 'Oportunidade criminal (unidade 2)', cita: 'Não há um guardião capaz no momento do clique'},
      {pregunta: 'Que dados ou fontes lhe permitem afirmar que muitas vítimas não denunciam?', motivo: 'Opinião crítica fundamentada (critério C6)', cita: 'muitas vítimas não denunciam devido ao pequeno montante'},
      {pregunta: 'Que tipo penal aplicaria a estes factos e que dificuldades teria a sua perseguição?', motivo: 'Regulação penal (unidade 9)', cita: 'a resposta penal chega tarde'}]}
  }
};
