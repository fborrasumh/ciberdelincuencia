/* ══ CiberdelincuencIA · interfaz. Lógica pura en nucleo.js (NU); currículo en curriculum.js. ══ */
const STEPS = ['Inicio', 'Practicar', 'Simulacro', 'Caso práctico', 'Progreso'];
const HUBS = ['Profesorado'];
const NAV = [['Empezar a practicar', 'La práctica no necesita clave de IA.'], ['Siguiente: simulacro', 'Responde, indica tu seguridad y sigue con la siguiente.'], ['Siguiente: caso práctico', 'Corrige el simulacro para ver tu nota con la fórmula de la guía.'], ['Siguiente: progreso', 'Si aún no tienes tu caso, prueba con el ejemplo.'], ['Volver al inicio', 'Tu progreso se guarda en este navegador.']];
const RENDER = {0: pintaInicio, 1: pintaPractica, 2: pintaSimulacro, 3: pintaCaso, 4: pintaProgreso, 5: pintaProf};
const GLOS = [
  ['¿Qué es?', 'El sistema de práctica de la asignatura 8059 Cibercrimen y Ciberseguridad (UMH), construido a partir de su Guía Docente 2026-2027. No sustituye a las clases, a la bibliografía ni a la corrección del profesorado.'],
  ['Las preguntas', 'Hay 36 preguntas propias (4 por unidad), redactadas para esta app y pendientes de revisión por el profesorado de la asignatura. No son preguntas de examen. Si detectas un error, coméntalo en clase.'],
  ['Por qué te toca cada pregunta', 'La app estima tu dominio de cada unidad (un modelo Elo simplificado: sube al acertar y baja al fallar, más cuanto menos esperado era) y lo hace decaer si dejas de practicar. Primero vuelven las preguntas falladas (tras otras tres), luego los repasos vencidos y después preguntas nuevas de la unidad que menos dominas, con una dificultad que te dé un 70 % de acierto esperado. Nunca repite dos seguidas de la misma unidad si hay otras.'],
  ['Base científica', 'Práctica de recuperación: Roediger y Karpicke (2006), doi:10.1111/j.1467-9280.2006.01693.x. Práctica espaciada: Cepeda et al. (2006), doi:10.1037/0033-2909.132.3.354. Revisión de técnicas de estudio (recuperación, espaciado e intercalado): Dunlosky et al. (2013), doi:10.1177/1529100612453266. Modelo Elo en sistemas adaptativos: Pelánek (2016), doi:10.1016/j.compedu.2016.03.017. Que estas técnicas funcionen en general no demuestra que esta app mejore tu nota: eso no se ha medido.'],
  ['La fórmula del examen', 'Según la guía: Nota = ((correctas − incorrectas / nº de opciones) / nº de preguntas) · 10, y las respuestas en blanco no descuentan. Con esa fórmula, contestar compensa si tu probabilidad de acertar supera 1/(opciones + 1): con 4 opciones, un 20 %.'],
  ['El caso práctico', 'El código cuenta palabras, citas en el texto, referencias y DOI. La IA comenta tu trabajo según los ocho criterios de corrección de la guía y cada comentario debe apoyarse en una frase literal de tu texto, que el código comprueba. La IA no pone notas: si escribe una, el código la quita y te avisa.'],
  ['Privacidad', 'Todo se guarda en este navegador. Solo sale hacia tu proveedor de IA el texto que tú decides enviar (caso práctico, respuestas de defensa o apuntes), con correos, teléfonos y DNI enmascarados, y antes del primer envío ves la muestra. La práctica y el simulacro no envían nada.'],
  ['Tu clave de IA', 'Solo hace falta para el caso práctico y para crear preguntas desde tus apuntes. Funciona con OpenAI, Google Gemini o Anthropic Claude; la clave se guarda solo en este navegador y cada persona paga su propio uso.'],
  ['Investigar con la app', 'El fichero anónimo de respuestas y el panel del profesorado sirven para mejorar las preguntas. Usarlos para publicar resultados exige la aprobación previa del comité de ética de investigación de la universidad, consentimiento informado y cumplir el RGPD.'],
  ['Accesibilidad', 'Se puede usar entero con teclado, no hay límites de tiempo y el texto tiene alto contraste. Si encuentras una barrera, avisa al profesorado.']
];
const TIPO_MOTIVO = {
  diagnostico: 'Primera pregunta de la unidad {0}: sirve para estimar desde dónde partes.',
  debil: 'La unidad {0} es la que menos dominas ahora ({1} %): pregunta con la dificultad ajustada a tu nivel.',
  fallo: 'La fallaste hace poco: vuelve tras otras tres preguntas para consolidarla.',
  repaso: 'Toca repasarla: ha vencido su intervalo de repaso espaciado.',
  refuerzo: 'Ya has visto todo el banco y no hay repasos pendientes: refuerzo en la unidad que menos dominas ({0}).'
};
const CONF = [['seguro', 'Seguro'], ['dudo', 'Dudo'], ['azar', 'Lo adivino']];
const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F'];
let S = {M: NU.nuevoModelo(), cur: null, filtro: [], extra: [], sim: null, caso: {tit: '', txt: '', fb: null, def: null, resp: {}, val: null, esEjemplo: false}, seud: null, prof: {files: [], demo: false}, calc: {test: null, caso: null}};
let ENVIO_OK = false;
const ahora = () => Date.now();
const nombreU = u => { const x = UNIDADES[u - 1]; return x ? (x[LANG] || x.es) : 'U' + u; };
const nombreUlang = l => u => { const x = UNIDADES[u - 1]; return `U${u}. ${x ? (x[l] || x.es) : ''}`; };
const txOf = it => it.tx[LANG] || it.tx.es || Object.values(it.tx)[0];
const banco = () => [...ITEMS, ...(S.extra || [])];
const itemPorId = id => banco().find(i => i.id === id);
const pct = x => Math.round(x * 100);

/* ── 0 · inicio ── */
function pintaInicio() {
  const n = S.M.ev.length;
  if (n) { const us = UNIDADES.map(x => x.u).sort((a, b) => NU.dominio(S.M, a, ahora()) - NU.dominio(S.M, b, ahora()))[0]; $('inicioProj').innerHTML = `${esc(t('Llevas {0} respuestas. La unidad que menos dominas ahora es la {1}.', n, us))} <button class="btn btn-ghost btn-sm" id="btnCont" type="button">${esc(t('Seguir practicando'))}</button>`; }
  else $('inicioProj').innerHTML = '';
  const fila = (k, v) => `<tr><th scope="row">${esc(t(k))}</th><td>${v}</td></tr>`;
  $('fichaGuia').innerHTML = `<p class="help" style="margin-top:0">${esc(t('Datos copiados literalmente de la guía (validada el {0}, curso {1}). Lo que la guía no dice se indica como «no consta».', CURSO.guia_validada, CURSO.curso_acad))}</p>
  <div class="table-wrap"><table class="fa-ficha"><tbody>
  ${fila('Asignatura', `${esc(CURSO.codigo)} · ${esc(CURSO.nombre.es)}`)}${fila('Titulación', esc(CURSO.titulacion.es))}
  ${fila('Curso y semestre', esc(t('{0}.º curso, semestre {1}', CURSO.curso, CURSO.semestre)))}${fila('Créditos', esc(t('{0} ECTS ({1} de teoría y {2} de práctica)', String(CURSO.ects).replace('.', ','), CURSO.ects_teoria, String(CURSO.ects_practica).replace('.', ','))))}
  ${fila('Carácter e idioma', esc(CURSO.tipo + ' · ' + CURSO.idioma))}${fila('Profesorado', esc(CURSO.profesorado.join(' · ')) + '<br><small class="muted">' + esc(t('Colaboración en actividades docentes')) + ': ' + esc(CURSO.colaboracion.join(' · ')) + '</small>')}
  ${fila('Objetivos (resultados de aprendizaje)', CURSO.ra_guia.map(r => '«' + esc(r) + '»').join('<br>'))}
  ${fila('Evaluación continua', esc(t('70 % examen tipo test + 30 % entrega y defensa oral de un caso práctico; hace falta un 5 en el test para sumar las prácticas.')))}
  ${fila('Fórmula del test', '<code class="fa-code">' + esc(EVAL.formula) + '</code><br><small class="muted">' + esc(t('Las respuestas en blanco no descuentan. Nº de opciones por pregunta: no consta.')) + '</small>')}
  </tbody></table></div>`;
}
document.addEventListener('click', e => { if (e.target.id === 'btnCont') go(1); });
$('btnStart').onclick = () => go(1);
$('btnEjemplo').onclick = () => { aplicaEjemploCaso(); guarda(); go(3); toast(t('Caso práctico de ejemplo (ficticio), sin usar la IA')); };
$('btnProf').onclick = () => go(STEPS.length);

/* ── 1 · practicar ── */
function pintaFiltro() {
  const f = S.filtro || [];
  $('filtroU').innerHTML = `<button type="button" data-u="0" aria-pressed="${!f.length}">${esc(t('Todas'))}</button>` + UNIDADES.map(x => `<button type="button" data-u="${x.u}" aria-pressed="${f.includes(x.u)}" title="${esc(nombreU(x.u))}">U${x.u}</button>`).join('');
  $$('#filtroU button').forEach(b => b.onclick = () => {
    const u = +b.dataset.u; if (!u) S.filtro = []; else { const s = new Set(S.filtro); s.has(u) ? s.delete(u) : s.add(u); S.filtro = [...s].sort((a, b) => a - b); }
    if (S.cur && !S.cur.resp && S.filtro.length && !S.filtro.includes(S.cur.u)) S.cur = null;
    guarda(); pintaPractica();
  });
}
function nuevaPregunta() {
  const s = NU.siguiente(S.M, banco(), ahora(), {unidades: S.filtro.length ? S.filtro : null, excluir: S.cur ? S.cur.id : null});
  if (!s) { S.cur = null; return; }
  const st = S.M.it[s.it.id]; S.cur = {id: s.it.id, tipo: s.tipo, u: s.u, dom: s.dom, orden: [...NU.baraja(4, s.it.id + '|' + (st ? st.n : 0))], resp: null};
}
function pintaPractica() {
  pintaFiltro(); pintaGenU();
  if (!S.cur || (S.cur && !itemPorId(S.cur.id))) nuevaPregunta();
  const c = S.cur; if (!c) { $('preg').innerHTML = `<p class="empty">${esc(t('No hay preguntas para las unidades elegidas.'))}</p>`; return; }
  const it = itemPorId(c.id), x = txOf(it), r = c.resp;
  const motivo = t(TIPO_MOTIVO[c.tipo], c.tipo === 'refuerzo' ? 'U' + c.u : c.u, pct(c.dom));
  const marca = it.origen === 'ia' ? `<span class="fa-chip aviso">${esc(t('Creada con IA desde tus apuntes, sin revisar'))}</span>` : `<span class="fa-chip">${esc(t('Pendiente de revisión por el profesorado'))}</span>`;
  const opc = c.orden.map((o, j) => {
    const cls = r ? (o === it.c ? ' ok' : (o === r.o ? ' mal' : '')) : '';
    return `<label class="fa-opc${cls}"><input type="radio" name="op" value="${o}" ${r ? 'disabled' : ''} ${r && r.o === o ? 'checked' : ''}><span class="fa-let">${LETRAS[j]}</span><span>${esc(x[1 + o])}</span>${r && o === it.c ? `<span class="fa-vh">${esc(t('(respuesta correcta)'))}</span>` : ''}</label>`;
  }).join('');
  const conf = CONF.map(([k, l]) => `<label class="fa-seg"><input type="radio" name="cf" value="${k}" ${r ? 'disabled' : ''} ${r && r.cf === k ? 'checked' : ''}><span>${esc(t(l))}</span></label>`).join('');
  let fb = '';
  if (r) {
    const ok = r.o === it.c, blanco = r.o == null;
    fb = `<div class="${ok ? 'okbox' : 'aviso'} fa-fb"><b>${esc(blanco ? t('La has dejado en blanco.') : ok ? t('Correcto.') : t('No es correcta.'))}</b> ${blanco || !ok ? esc(t('La respuesta correcta es la {0}.', LETRAS[c.orden.indexOf(it.c)])) : ''}<p>${esc(x[5])}</p>${it.cita ? `<p class="help">${esc(t('Base en tus apuntes:'))} «${esc(it.cita)}»</p>` : ''}${!blanco && !ok && r.cf === 'seguro' ? `<p class="help">${esc(t('Estabas seguro y has fallado: es justo lo que más conviene repasar.'))}</p>` : ''}</div>
    <div class="actions"><button class="btn btn-primary" id="btnSig" type="button">${ico('right')}<span>${esc(t('Siguiente pregunta'))}</span></button></div>`;
  }
  $('preg').innerHTML = `<p class="fa-motivo">${ico('compass')}<span><b>${esc(t('Por qué te toca:'))}</b> ${esc(motivo)}</span></p>
    <div class="fa-meta">${esc(t('Unidad {0}', c.u))} · ${esc(nombreU(c.u))} · <span class="fa-chip">${esc(t(BLOOM[it.bloom] || it.bloom))}</span> ${marca}</div>
    <fieldset class="fa-fs"><legend class="fa-enun">${esc(x[0])}</legend>${opc}</fieldset>
    <fieldset class="fa-fs fa-conf"><legend>${esc(t('¿Qué seguridad tienes?'))}</legend><div class="fa-segs">${conf}</div></fieldset>
    ${r ? '' : `<div class="actions"><button class="btn btn-primary" id="btnResp" type="button">${ico('check')}<span>${esc(t('Responder'))}</span></button><button class="btn btn-ghost" id="btnBlanco" type="button">${esc(t('Dejar en blanco'))}</button></div>`}
    <div id="fbPreg" aria-live="polite">${fb}</div>`;
  if (!r) { $('btnResp').onclick = () => responde(false); $('btnBlanco').onclick = () => responde(true); }
  else $('btnSig').onclick = () => { nuevaPregunta(); guarda(); pintaPractica(); $('preg').querySelector('input')?.focus(); };
}
function responde(blanco) {
  const it = itemPorId(S.cur.id), sel = document.querySelector('#preg input[name=op]:checked'), cf = document.querySelector('#preg input[name=cf]:checked');
  if (!blanco && !sel) return toast(t('Elige una opción o déjala en blanco'));
  if (!blanco && !cf) return toast(t('Indica tu seguridad antes de responder'));
  const o = blanco ? null : +sel.value, conf = blanco ? 'blanco' : cf.value;
  const {r} = NU.registra(S.M, it, o, conf, ahora());
  S.cur.resp = {o, cf: conf, r}; guarda(); pintaPractica(); $('btnSig')?.focus();
}

/* crear preguntas desde los apuntes: la IA propone, el código comprueba la cita y la estructura */
function pintaGenU() { if ($('genU').options.length !== UNIDADES.length || $('genU').dataset.l !== LANG) { const v = $('genU').value; $('genU').innerHTML = UNIDADES.map(x => `<option value="${x.u}">U${x.u}. ${esc(x[LANG] || x.es)}</option>`).join(''); $('genU').dataset.l = LANG; if (v) $('genU').value = v; } pintaGen(); }
const PROMPT_GEN = (ap, u, n) => `Eres profesor/a de la asignatura universitaria «Cibercrimen y Ciberseguridad». A partir SOLO de los apuntes del estudiante, redacta ${n} preguntas de opción múltiple de la unidad «${UNIDADES[u - 1].es}».
Reglas:
- 4 opciones por pregunta, una sola correcta, distractores plausibles y de longitud parecida a la correcta (la correcta no debe ser la más larga).
- "cita": fragmento LITERAL de los apuntes (de 8 a 30 palabras), copiado sin cambiar nada, que justifique la respuesta correcta.
- "bloom": uno de recordar, comprender, aplicar, analizar. Incluye al menos una pregunta de aplicar o analizar (un caso breve).
- No uses información que no esté en los apuntes.
Devuelve SOLO este JSON: {"preguntas":[{"enunciado":"…","opciones":["…","…","…","…"],"correcta":0,"explicacion":"…","cita":"…","bloom":"aplicar"}]}
${INSTR_IDIOMA()}

APUNTES:
${ap}`;
function procesaGen(raw, apuntes, u) {
  return (raw.preguntas || []).map((q, k) => {
    const op = (q.opciones || []).map(o => String(o || '').trim()), c = Number(q.correcta), cita = String(q.cita || '').trim();
    const motivos = [];
    if (op.length !== 4 || op.some(o => !o) || new Set(op.map(norm)).size !== 4) motivos.push('opciones');
    if (!(c >= 0 && c < 4 && Number.isInteger(c))) motivos.push('correcta');
    if (!String(q.enunciado || '').trim()) motivos.push('enunciado');
    const citaOk = esFiel(apuntes, cita); if (!citaOk) motivos.push('cita');
    const bloom = BLOOM[q.bloom] ? q.bloom : 'comprender';
    const avisos = []; if (!motivos.length && NU.correctaMasLarga(op, c)) avisos.push('larga');
    const nuevos = numerosNuevos(JSON.stringify(q), apuntes); if (nuevos.length) avisos.push('cifras');
    return {k, u, bloom, c, cita, citaOk, motivos, avisos, nuevos, tx: [String(q.enunciado || '').trim(), ...op.slice(0, 4), String(q.explicacion || '').trim()], lang: LANG, añadida: false};
  });
}
const MOTIVO_GEN = {opciones: 'no trae cuatro opciones distintas', correcta: 'no indica bien la opción correcta', enunciado: 'no tiene enunciado', cita: 'su cita no aparece literalmente en tus apuntes'};
function pintaGen() {
  const g = S.gen; if (!g || !g.length) { $('genRes').innerHTML = ''; return; }
  const v = g.filter(q => !q.motivos.length);
  $('genRes').innerHTML = `<p><span class="fa-chip ${v.length ? 'ok' : 'aviso'}">${esc(t('{0} de {1} superan las comprobaciones del código', v.length, g.length))}</span></p>` + g.map(q => `<div class="fa-gen ${q.motivos.length ? 'mal' : ''}"><b>${esc(q.tx[0] || '—')}</b>
    <ol type="A">${q.tx.slice(1, 5).map((o, j) => `<li>${esc(o)}${j === q.c ? ' ✓' : ''}</li>`).join('')}</ol>
    ${q.motivos.length ? `<p class="aviso">${esc(t('Descartada por el código: {0}.', q.motivos.map(m => t(MOTIVO_GEN[m])).join('; ')))}</p>` : `<p class="help">✓ ${esc(t('Cita verificada en tus apuntes:'))} «${esc(q.cita)}»</p>`}
    ${q.avisos.includes('larga') ? `<p class="help">⚠ ${esc(t('La opción correcta es claramente la más larga: es una pista involuntaria.'))}</p>` : ''}
    ${q.avisos.includes('cifras') ? `<p class="help">⚠ ${esc(t('Cifras que no están en tus apuntes: {0}.', q.nuevos.join(', ')))}</p>` : ''}
    ${!q.motivos.length ? (q.añadida ? `<p class="help">${esc(t('Añadida a tu práctica.'))}</p>` : `<button class="btn btn-ghost btn-sm" type="button" data-add="${q.k}">${ico('plus')}<span>${esc(t('Añadir a mi práctica'))}</span></button>`) : ''}</div>`).join('');
  $$('#genRes [data-add]').forEach(b => b.onclick = () => {
    const q = S.gen.find(x => x.k === +b.dataset.add); if (!q || q.añadida) return;
    S.extra.push({id: 'ia-' + uid(), u: q.u, bloom: q.bloom, c: q.c, tx: {[q.lang]: q.tx}, rev: false, origen: 'ia', cita: q.cita}); q.añadida = true; guarda(); pintaGen(); toast(t('Pregunta añadida a tu práctica'));
  });
}
let busy = false;
$('btnGen').onclick = async () => {
  if (busy) return; const ap = $('apuntes').value; if (wc(ap) < 60) return toast(t('Pega al menos unas 60 palabras de tus apuntes'));
  if (!pideClave()) return;
  const {t: tx, n} = scrub(ap); if (!(await pideEnvio(tx, n))) return;
  busy = true; $('btnGen').disabled = true; $('genEstado').innerHTML = '<span class="spin"></span> ' + esc(t('Redactando preguntas…'));
  try {
    const u = +$('genU').value, raw = await llmJSON([{role: 'system', content: 'Eres un profesor riguroso. Respondes SOLO con JSON válido.'}, {role: 'user', content: PROMPT_GEN(tx, u, +$('genN').value)}], {max: 3500});
    S.gen = procesaGen(raw, ap, u); await guardaYa(); $('genEstado').textContent = ''; pintaGen();
  } catch (e) { $('genEstado').textContent = e.message; toast(e.message, 8000); }
  finally { busy = false; $('btnGen').disabled = false; }
};

/* ── 2 · simulacro ── */
function nuevoSim() {
  const N = +$('simN').value, k = Math.min(6, Math.max(2, +$('simK').value || 4)), semilla = Date.now().toString(36);
  S.sim = {N, k, semilla, ids: NU.eligeSimulacro(ITEMS, N, semilla).map(i => i.id), resp: {}, corr: null}; guarda(); pintaSimulacro();
}
$('btnSimNuevo').onclick = () => { nuevoSim(); $('simPreg').querySelector('input')?.focus(); };
$('simK').onchange = () => { if (S.sim) { S.sim.k = Math.min(6, Math.max(2, +$('simK').value || 4)); if (S.sim.corr) S.sim.corr = corrige(); guarda(); pintaSimulacro(); } };
const corrige = () => NU.corrigeSimulacro(S.sim.ids.map(id => ({c: itemPorId(id).c, o: S.sim.resp[id] ?? null})), S.sim.k);
function pintaSimulacro() {
  const s = S.sim;
  if (!s) { $('simInfo').textContent = t('Pulsa «Nuevo simulacro» para empezar.'); $('simPreg').innerHTML = ''; $('simRes').innerHTML = `<p class="empty">${esc(t('Aún no has corregido ningún simulacro.'))}</p>`; pintaCalc(); return; }
  $('simN').value = String(s.N); $('simK').value = String(s.k);
  $('simInfo').textContent = t('Simulacro {0} · {1} preguntas · semilla {2}', new Date(parseInt(s.semilla, 36)).toLocaleDateString(locale()), s.ids.length, s.semilla);
  $('simPreg').innerHTML = `<div class="card">${s.ids.map((id, n) => {
    const it = itemPorId(id), x = txOf(it), ord = NU.baraja(4, s.semilla + id), o = s.resp[id] ?? null, corr = !!s.corr;
    const est = corr ? (o == null ? 'blanco' : o === it.c ? 'ok' : 'mal') : '';
    return `<fieldset class="fa-fs fa-simq ${est}"><legend class="fa-enun"><span class="fa-n">${n + 1}</span> ${esc(x[0])}</legend>
      ${ord.map((oo, j) => `<label class="fa-opc${corr ? (oo === it.c ? ' ok' : oo === o ? ' mal' : '') : ''}"><input type="radio" name="s_${id}" value="${oo}" ${o === oo ? 'checked' : ''} ${corr ? 'disabled' : ''}><span class="fa-let">${LETRAS[j]}</span><span>${esc(x[1 + oo])}</span></label>`).join('')}
      <label class="fa-opc fa-blank"><input type="radio" name="s_${id}" value="" ${o == null ? 'checked' : ''} ${corr ? 'disabled' : ''}><span class="fa-let">–</span><span>${esc(t('En blanco'))}</span></label>
      ${corr ? `<details class="fa-exp"><summary>${esc(est === 'ok' ? t('Correcta · ver explicación') : est === 'mal' ? t('Incorrecta · ver explicación') : t('En blanco · ver explicación'))}</summary><p>${esc(x[5])}</p></details>` : ''}</fieldset>`;
  }).join('')}${s.corr ? `<div class="actions"><button class="btn btn-primary" id="btnSimOtra" type="button">${ico('refresh')}<span>${esc(t('Nuevo simulacro'))}</span></button></div>` : `<div class="actions"><button class="btn btn-primary" id="btnSimCorr" type="button">${ico('check')}<span>${esc(t('Corregir'))}</span></button></div>`}</div>`;
  $$('#simPreg input[type=radio]').forEach(i => i.onchange = () => { const id = i.name.slice(2); s.resp[id] = i.value === '' ? null : +i.value; guarda(); });
  if ($('btnSimCorr')) $('btnSimCorr').onclick = () => { s.corr = corrige(); if (S.calc.test == null) S.calc.test = Math.round(s.corr.nota * 100) / 100; guarda(); pintaSimulacro(); $('simRes').scrollIntoView({behavior: 'smooth'}); };
  if ($('btnSimOtra')) $('btnSimOtra').onclick = () => { nuevoSim(); window.scrollTo({top: 0}); };
  pintaRes(); pintaCalc();
}
function pintaRes() {
  const s = S.sim; if (!s || !s.corr) { $('simRes').innerHTML = `<p class="empty">${esc(t('Contesta y pulsa «Corregir» para ver tu nota con la fórmula de la guía.'))}</p>`; return; }
  const r = s.corr, k = s.k, um = NU.umbralContestar(k), vAzar = NU.valorContestar(1 / k, k), nf2 = x => x.toLocaleString(locale(), {maximumFractionDigits: 2, minimumFractionDigits: 2});
  const cal = NU.calibracion(S.M.ev), duda = cal.dudo.n >= 5 ? cal.dudo.ok / cal.dudo.n : null;
  $('simRes').innerHTML = `<h3>${esc(t('Tu resultado'))}</h3>
    <div class="fa-stats"><div><b>${r.c}</b><span>${esc(t('correctas'))}</span></div><div><b>${r.i}</b><span>${esc(t('incorrectas'))}</span></div><div><b>${r.b}</b><span>${esc(t('en blanco'))}</span></div><div class="fa-nota"><b>${nf2(r.nota)}</b><span>${esc(t('nota sobre 10'))}</span></div></div>
    <p class="fa-formula"><code class="fa-code">((${r.c} − ${r.i} / ${k}) / ${r.n}) · 10 = ${nf2(r.nota)}</code></p>
    <p class="help">${esc(t('Sin descontar los errores habrías sacado {0}: los errores te han restado {1}.', nf2(r.sinPenalizar), nf2(r.sinPenalizar - r.nota)))}</p>
    <h3>${esc(t('¿Contestar o dejar en blanco?'))}</h3>
    <p>${esc(t('Con {0} opciones, cada error resta 1/{0} de pregunta. Contestar compensa si tu probabilidad de acertar supera el {1} %.', k, Math.round(um * 1000) / 10))} ${esc(t('Incluso contestar al azar tiene un valor esperado ligeramente positivo con esta fórmula (+{0} de pregunta), aunque hace tu nota más variable. Si puedes descartar una opción, contestar compensa claramente.', nf2(vAzar)))}</p>
    ${duda != null ? `<p class="${duda > um ? 'okbox' : 'aviso'}">${esc(duda > um ? t('En tu práctica, cuando dices «Dudo» aciertas un {0} % ({1} respuestas): por encima del umbral, te conviene contestar esas preguntas.', pct(duda), cal.dudo.n) : t('En tu práctica, cuando dices «Dudo» aciertas solo un {0} % ({1} respuestas): por debajo del umbral, esas preguntas te conviene dejarlas en blanco o repasarlas antes.', pct(duda), cal.dudo.n))}</p>` : `<p class="help">${esc(t('Cuando tengas al menos 5 respuestas marcadas como «Dudo» en la práctica, aquí verás si te conviene contestarlas.'))}</p>`}`;
}
function pintaCalc() {
  if (document.activeElement !== $('calcTest')) $('calcTest').value = S.calc.test ?? ''; if (document.activeElement !== $('calcCaso')) $('calcCaso').value = S.calc.caso ?? '';
  const num = v => (v === '' || v == null || isNaN(+v)) ? null : Math.min(10, Math.max(0, +v));
  const r = NU.notaContinua(num(S.calc.test), num(S.calc.caso), EVAL);
  const M = {ok: () => t('Nota de la evaluación continua: {0} (0,7 × test + 0,3 × caso).', r.nota.toLocaleString(locale())), test_bajo: () => t('Con menos de un 5 en el test no se suma la nota del caso práctico. La guía no especifica cómo queda entonces la calificación: consúltalo con el profesorado.'), falta_test: () => t('Escribe la nota del test.'), falta_caso: () => t('Escribe la nota del caso práctico.')};
  $('calcRes').innerHTML = `<span class="${r.estado === 'ok' ? 'fa-chip ok' : r.estado === 'test_bajo' ? 'fa-chip aviso' : 'help'}">${esc(M[r.estado]())}</span>`;
}
['calcTest', 'calcCaso'].forEach(id => $(id).addEventListener('input', () => { S.calc[id === 'calcTest' ? 'test' : 'caso'] = $(id).value === '' ? null : +$(id).value; guarda(); pintaCalc(); }));

/* ── 3 · caso práctico ── */
function pideEnvio(textoEnviado, masks) {
  if (ENVIO_OK) return Promise.resolve(true);
  $('envioInfo').innerHTML = `<p class="sub" style="margin-top:0">${esc(t('Se enviarán unos {0} caracteres a {1}. Se han enmascarado {2} dato(s) personales.', nf(textoEnviado.length), PROV[getProv()].n, masks))}</p><p class="help">${esc(t('Muestra del envío:'))}</p>`;
  $('envioTxt').textContent = textoEnviado.slice(0, 3000) + (textoEnviado.length > 3000 ? '\n…' : '');
  $('envioOk').checked = false; $('envioSi').disabled = true; $('mEnvio').classList.add('on'); $('envioOk').focus();
  return new Promise(r => { envioRes = r; });
}
let envioRes = null;
function cierraEnvio(v) { $('mEnvio').classList.remove('on'); if (envioRes) { const r = envioRes; envioRes = null; if (v) ENVIO_OK = true; r(v); } }
_cierres.mEnvio = () => cierraEnvio(false);
$('envioOk').onchange = () => { $('envioSi').disabled = !$('envioOk').checked; };
$('envioSi').onclick = () => cierraEnvio(true); $('envioNo').onclick = () => cierraEnvio(false);

const datosCodigo = txt => { const b = NU.bibliografia(txt); return {palabras: wc(txt), citas: b.citas.length, refs: b.refs, doi: b.doi.length, seccion: b.seccion, listaCitas: b.citas}; };
function pintaCasoCod() {
  const d = datosCodigo(S.caso.txt);
  if (!S.caso.txt.trim()) { $('casoCod').innerHTML = ''; return; }
  $('casoCod').innerHTML = `<div class="fa-cod"><b>${esc(t('Lo que cuenta el código'))}</b>
    <span class="fa-chip">${esc(t('{0} palabras', nf(d.palabras)))}</span>
    <span class="fa-chip ${d.citas ? 'ok' : 'aviso'}">${esc(t('{0} citas en el texto', d.citas))}</span>
    <span class="fa-chip ${d.seccion ? 'ok' : 'aviso'}">${esc(d.seccion ? t('{0} referencias en la bibliografía', d.refs) : t('Sin apartado de bibliografía'))}</span>
    <span class="fa-chip">${esc(t('{0} DOI', d.doi))}</span>
    <p class="help">${esc(t('La guía no fija extensión ni enumera los «elementos estipulados» del caso: pregunta al profesorado cuáles son.'))}</p></div>`;
}
const CRIT_TXT = () => EVAL.criterios.map(c => `${c.id}: ${c.es}`).join('\n');
const UNID_TXT = () => UNIDADES.map(x => `U${x.u}. ${x.es}`).join('\n');
const PROMPT_FB = (txt, d) => `Eres profesor/a de la asignatura universitaria «Cibercrimen y Ciberseguridad» (Grado en Seguridad Pública y Privada, Universidad Miguel Hernández). Un estudiante prepara el caso práctico de la evaluación continua, que según la guía docente consiste en «la presentación de una problemática relacionada con la asignatura por parte del alumno, plasmada por escrito y defendida oralmente ante el profesor».
Da feedback FORMATIVO según los criterios de corrección de la guía:
${CRIT_TXT()}
Unidades de la asignatura:
${UNID_TXT()}
Reglas:
- NO pongas nota, puntuación, porcentaje ni calificación de ningún tipo (nada de «aprobado», «7/10» ni «80 %»).
- En cada criterio, "evidencia" es un fragmento LITERAL del trabajo (de 8 a 30 palabras), copiado sin cambiar nada, que justifique tu comentario. Si el comentario trata de algo que falta, deja "evidencia" vacía.
- Comenta solo lo que está en el trabajo. No inventes datos, autores ni referencias. Si recomiendas lecturas, remite a la bibliografía de la guía: Miró Llinares, «El cibercrimen»; Clough, «Principles of cybercrime»; Barrio Andrés, «Ciberdelitos».
- El código ya ha contado: ${d.palabras} palabras, ${d.citas} citas en el texto, ${d.refs} referencias en la bibliografía, ${d.doi} DOI. Usa esos datos para C7 y C8 en lugar de contar tú.
Devuelve SOLO este JSON con los 8 criterios: {"resumen":"dos o tres frases","criterios":[{"id":"C1","fortalezas":"…","mejoras":"…","evidencia":"…"}]}
${INSTR_IDIOMA()}

TRABAJO DEL ESTUDIANTE:
${txt}`;
const PROMPT_DEF = txt => `Eres profesor/a de «Cibercrimen y Ciberseguridad» y vas a escuchar la defensa oral del caso práctico de un estudiante. Formula 5 preguntas exigentes pero justas que le harías, que comprueben dominio de los conceptos de la asignatura, coherencia y opinión crítica. Cada pregunta debe referirse a un fragmento concreto del trabajo.
Unidades de la asignatura:
${UNID_TXT()}
Reglas: "cita" es un fragmento LITERAL del trabajo (de 5 a 25 palabras) copiado sin cambiar nada; "motivo" dice qué comprueba la pregunta (un criterio o una unidad). No des las respuestas.
Devuelve SOLO este JSON: {"preguntas":[{"pregunta":"…","motivo":"…","cita":"…"}]}
${INSTR_IDIOMA()}

TRABAJO DEL ESTUDIANTE:
${txt}`;
const PROMPT_VAL = (txt, qa) => `Eres profesor/a de «Cibercrimen y Ciberseguridad». Un estudiante ensaya la defensa oral de su caso práctico. Comenta cada respuesta de forma formativa: qué está bien defendido y qué le faltaría (conceptos de la asignatura, precisión, argumentos). NO pongas nota, puntuación ni calificación. No inventes datos ni referencias.
Devuelve SOLO este JSON: {"valoraciones":[{"n":1,"comentario":"…","sugerencia":"…"}]}
${INSTR_IDIOMA()}

TRABAJO (contexto):
${txt.slice(0, 6000)}

PREGUNTAS Y RESPUESTAS:
${qa}`;
/* el feedback no pone notas: se quitan por código las frases que las contengan (y se cuenta cuántas) */
function quitaNotas(s) { const fr = String(s || '').split(/(?<=[.!?])\s+/); const ok = fr.filter(f => !NU.tieneNota(f)); return {txt: ok.join(' '), quitadas: fr.length - ok.length}; }
function procesaFb(raw, txt) {
  let quitadas = 0; const limpia = s => { const r = quitaNotas(s); quitadas += r.quitadas; return r.txt; };
  const crit = EVAL.criterios.map(c => {
    const x = (raw.criterios || []).find(y => String(y.id).trim().toUpperCase() === c.id) || null;
    const ev = x ? String(x.evidencia || '').trim() : '';
    return {id: c.id, falta: !x, fort: limpia(x?.fortalezas), mej: limpia(x?.mejoras), ev, evOk: ev ? esFiel(txt, ev) : null};
  });
  return {resumen: limpia(raw.resumen), crit, quitadas, cod: datosCodigo(txt), h: NU.hashStr(txt)};
}
function procesaDef(raw, txt) { return (raw.preguntas || []).slice(0, 6).map(p => ({q: String(p.pregunta || '').trim(), m: String(p.motivo || '').trim(), cita: String(p.cita || '').trim(), ok: esFiel(txt, p.cita || '')})).filter(p => p.q); }
function procesaVal(raw) { let quitadas = 0; const v = (raw.valoraciones || []).map(x => { const a = quitaNotas(x.comentario), b = quitaNotas(x.sugerencia); quitadas += a.quitadas + b.quitadas; return {n: Number(x.n), com: a.txt, sug: b.txt}; }); return {v, quitadas}; }
const critNombre = c => (EVAL.criterios.find(x => x.id === c) || {})[LANG] || (EVAL.criterios.find(x => x.id === c) || {}).es;
function pintaCaso() {
  if (document.activeElement !== $('casoTit')) $('casoTit').value = S.caso.tit; if (document.activeElement !== $('casoTxt')) $('casoTxt').value = S.caso.txt;
  pintaCasoCod();
  const f = S.caso.fb;
  if (!f) $('casoFb').innerHTML = `<h3>${esc(t('Comentarios según los criterios de la guía'))}</h3><p class="empty">${esc(t('Aún no hay comentarios. Escribe tu caso y pulsa «Pedir comentarios según los criterios», o carga el ejemplo.'))}</p>`;
  else {
    const v = f.crit.filter(c => c.evOk).length, conEv = f.crit.filter(c => c.ev).length;
    $('casoFb').innerHTML = `<h3>${esc(t('Comentarios según los criterios de la guía'))} ${S.caso.esEjemplo ? `<span class="fa-chip aviso">${esc(t('Ejemplo precalculado, sin IA'))}</span>` : ''}</h3>
      <p>${esc(f.resumen)}</p><p><span class="fa-chip ${v === conEv ? 'ok' : 'aviso'}">${esc(t('{0} de {1} evidencias verificadas en tu texto', v, conEv))}</span></p>
      ${f.h != null && f.h !== NU.hashStr(S.caso.txt) ? `<div class="aviso">${esc(t('Has cambiado el texto desde estos comentarios: vuelve a pedirlos para que correspondan a la versión actual.'))}</div>` : ''}
      ${f.quitadas ? `<div class="aviso">${esc(t('La IA incluyó {0} frase(s) con una nota o calificación; el código las ha quitado. La nota la pone el profesorado.', f.quitadas))}</div>` : ''}
      <div class="fa-crits">${f.crit.map(c => `<div class="fa-crit"><h4><span class="fa-chip">${c.id}</span> ${esc(critNombre(c.id))}</h4>
        ${LANG !== 'es' ? `<p class="help">${esc(t('Texto literal de la guía:'))} «${esc(EVAL.criterios.find(x => x.id === c.id).es)}»</p>` : ''}
        ${c.falta ? `<p class="aviso">${esc(t('La IA no comentó este criterio.'))}</p>` : `${c.fort ? `<p><b>${esc(t('Lo que funciona:'))}</b> ${esc(c.fort)}</p>` : ''}${c.mej ? `<p><b>${esc(t('Para mejorar:'))}</b> ${esc(c.mej)}</p>` : ''}
        ${c.ev ? (c.evOk ? `<p class="help">✓ «${esc(c.ev)}»</p>` : `<p class="help">⚠ ${esc(t('La cita que aportó la IA no aparece en tu texto: no tomes este comentario como respaldado.'))}</p>`) : ''}`}
        ${c.id === 'C7' || c.id === 'C8' ? `<p class="help">${esc(t('Recuento del código: {0} citas en el texto, {1} referencias en la bibliografía, {2} DOI.', f.cod.citas, f.cod.refs, f.cod.doi))}</p>` : ''}</div>`).join('')}</div>`;
  }
  pintaDef();
}
function pintaDef() {
  const d = S.caso.def; if (!d) { $('defPreg').innerHTML = ''; return; }
  const val = S.caso.val;
  $('defPreg').innerHTML = `${S.caso.esEjemplo ? `<p><span class="fa-chip aviso">${esc(t('Ejemplo precalculado, sin IA'))}</span></p>` : ''}${d.map((p, i) => { const v = val && val.v.find(x => x.n === i + 1);
    return `<div class="fa-defq"><p class="fa-enun"><span class="fa-n">${i + 1}</span> ${esc(p.q)}</p><p class="help">${esc(p.m)}${p.cita ? (p.ok ? ` · ✓ «${esc(p.cita)}»` : ` · ⚠ ${esc(t('referencia a tu texto no verificada'))}`) : ''}</p>
      <div class="field"><label for="dr${i}">${esc(t('Tu respuesta'))}</label><textarea id="dr${i}" rows="3" data-dr="${i}">${esc(S.caso.resp[i] || '')}</textarea></div>
      ${v ? `<div class="fa-val"><p><b>${esc(t('Comentario:'))}</b> ${esc(v.com)}</p>${v.sug ? `<p><b>${esc(t('Sugerencia:'))}</b> ${esc(v.sug)}</p>` : ''}</div>` : ''}</div>`; }).join('')}
    ${val && val.quitadas ? `<div class="aviso">${esc(t('La IA incluyó {0} frase(s) con una nota o calificación; el código las ha quitado. La nota la pone el profesorado.', val.quitadas))}</div>` : ''}
    <div class="actions"><button class="btn btn-ghost" id="btnValora" type="button">${ico('sparkles')}<span>${esc(t('Pedir comentarios a mis respuestas'))}</span></button></div><p class="help" id="valEstado" role="status"></p>`;
  $$('#defPreg [data-dr]').forEach(a => a.oninput = () => { S.caso.resp[a.dataset.dr] = a.value; guarda(); });
  $('btnValora').onclick = valora;
}
let _rc;
$('casoTit').addEventListener('input', e => { S.caso.tit = e.target.value; S.caso.esEjemplo = false; guarda(); });
$('casoTxt').addEventListener('input', e => { S.caso.txt = e.target.value; S.caso.esEjemplo = false; guarda(); pintaCasoCod(); clearTimeout(_rc); _rc = setTimeout(() => { if (S.caso.fb) pintaCaso(); }, 600); });
async function llamaIA(prompt, max) { return llmJSON([{role: 'system', content: 'Eres un profesor universitario riguroso y respetuoso. Respondes SOLO con JSON válido.'}, {role: 'user', content: prompt}], {max}); }
$('btnFb').onclick = async () => {
  if (busy) return; if (wc(S.caso.txt) < 150) return toast(t('Tu caso necesita al menos unas 150 palabras para comentarlo'));
  if (!pideClave()) return; const {t: tx, n} = scrub(S.caso.txt); if (!(await pideEnvio(tx, n))) return;
  busy = true; $('btnFb').disabled = true; $('fbEstado').innerHTML = '<span class="spin"></span> ' + esc(t('Leyendo tu caso con los criterios de la guía…'));
  try { let raw = await llamaIA(PROMPT_FB(tx, datosCodigo(S.caso.txt)), 4000); if (NU.tieneNota(JSON.stringify(raw))) raw = await llamaIA(PROMPT_FB(tx, datosCodigo(S.caso.txt)) + '\n\nIMPORTANTE: tu respuesta anterior incluía una nota o calificación. Repite el feedback SIN ninguna nota, puntuación ni porcentaje.', 4000);
    S.caso.fb = procesaFb(raw, S.caso.txt); S.caso.esEjemplo = false; await guardaYa(); $('fbEstado').textContent = ''; pintaCaso(); $('casoFb').scrollIntoView({behavior: 'smooth'});
  } catch (e) { $('fbEstado').textContent = e.message; toast(e.message, 8000); } finally { busy = false; $('btnFb').disabled = false; }
};
$('btnDef').onclick = async () => {
  if (busy) return; if (wc(S.caso.txt) < 150) return toast(t('Tu caso necesita al menos unas 150 palabras para comentarlo'));
  if (!pideClave()) return; const {t: tx, n} = scrub(S.caso.txt); if (!(await pideEnvio(tx, n))) return;
  busy = true; $('btnDef').disabled = true; $('defEstado').innerHTML = '<span class="spin"></span> ' + esc(t('Preparando preguntas de defensa…'));
  try { const raw = await llamaIA(PROMPT_DEF(tx), 2500); S.caso.def = procesaDef(raw, S.caso.txt); S.caso.resp = {}; S.caso.val = null; S.caso.esEjemplo = false; await guardaYa(); $('defEstado').textContent = ''; pintaDef(); }
  catch (e) { $('defEstado').textContent = e.message; toast(e.message, 8000); } finally { busy = false; $('btnDef').disabled = false; }
};
async function valora() {
  if (busy) return; const d = S.caso.def || []; const qa = d.map((p, i) => ({n: i + 1, q: p.q, a: String(S.caso.resp[i] || '').trim()})).filter(x => wc(x.a) >= 5);
  if (!qa.length) return toast(t('Escribe al menos una respuesta (unas pocas frases)'));
  if (!pideClave()) return; const {t: tx, n} = scrub(S.caso.txt + '\n\n' + qa.map(x => `${x.n}. ${x.q}\n${x.a}`).join('\n\n'));
  if (!(await pideEnvio(tx, n))) return;
  const ctx = scrub(S.caso.txt).t, qaTxt = qa.map(x => `${x.n}. PREGUNTA: ${x.q}\nRESPUESTA: ${scrub(x.a).t}`).join('\n\n');
  busy = true; $('valEstado').innerHTML = '<span class="spin"></span> ' + esc(t('Leyendo tus respuestas…'));
  try { const raw = await llamaIA(PROMPT_VAL(ctx, qaTxt), 2500); S.caso.val = procesaVal(raw); await guardaYa(); pintaDef(); }
  catch (e) { $('valEstado').textContent = e.message; toast(e.message, 8000); } finally { busy = false; }
}
$('btnCasoEj').onclick = () => { aplicaEjemploCaso(); guarda(); pintaCaso(); toast(t('Caso práctico de ejemplo (ficticio), sin usar la IA')); };
function aplicaEjemploCaso() { const e = EJ_CASO[LANG] || EJ_CASO.es; S.caso = {tit: e.tit, txt: e.txt, fb: procesaFb(e.fb, e.txt), def: procesaDef(e.def, e.txt), resp: {}, val: null, esEjemplo: true}; }
window.addEventListener('langchange', () => { if (S.caso && S.caso.esEjemplo) { aplicaEjemploCaso(); guarda(); } });
$('btnCasoWord').onclick = async () => {
  const c = S.caso; if (!c.txt.trim()) return toast(t('Aún no hay caso práctico'));
  let m = `## ${t('Datos del código')}\n- ${t('{0} palabras', nf(wc(c.txt)))} · ${t('{0} citas en el texto', datosCodigo(c.txt).citas)} · ${t('{0} referencias en la bibliografía', datosCodigo(c.txt).refs)}\n\n`;
  if (c.fb) m += `## ${t('Comentarios según los criterios de la guía')}\n${c.fb.resumen}\n\n` + c.fb.crit.map(x => `### ${x.id}. ${critNombre(x.id)}\n${x.falta ? t('La IA no comentó este criterio.') : `**${t('Lo que funciona:')}** ${x.fort}\n\n**${t('Para mejorar:')}** ${x.mej}${x.ev ? `\n\n${x.evOk ? '✓' : '⚠ ' + t('[cita no verificada]')} «${x.ev}»` : ''}`}`).join('\n\n') + '\n\n';
  if (c.def) m += `## ${t('Ensayo de la defensa oral')}\n` + c.def.map((p, i) => { const v = c.val && c.val.v.find(x => x.n === i + 1); return `### ${i + 1}. ${p.q}\n${p.m}\n\n**${t('Tu respuesta')}:** ${c.resp[i] || '—'}${v ? `\n\n**${t('Comentario:')}** ${v.com}\n\n**${t('Sugerencia:')}** ${v.sug}` : ''}`; }).join('\n\n');
  try { dl('caso_practico.docx', await wordDeMarkdown(m, {titulo: c.tit || t('Caso práctico'), subtitulo: `${CURSO.codigo} ${CURSO.nombre[LANG] || CURSO.nombre.es} · ${new Date().toLocaleDateString(locale())}`, pie: t('Generado con {0}. Comentarios orientativos: no sustituyen la corrección del profesorado. La IA propone; el código verifica las citas y quita las notas.', APP_NAME)})); } catch (e) { toast(e.message, 7000); }
};

/* ── 4 · progreso ── */
function pintaProgreso() {
  const now = ahora(), pend = u => banco().filter(it => it.u === u && S.M.it[it.id] && ((S.M.it[it.id].box === 0) || S.M.it[it.id].due <= now)).length;
  $('progU').innerHTML = `<h3>${esc(t('Dominio estimado por unidad'))}</h3><p class="help">${esc(t('Los resultados de aprendizaje de cada unidad son una propuesta de reescritura medible: la guía solo declara dos objetivos generales.'))}</p>` + UNIDADES.map(x => {
    const d = NU.dominio(S.M, x.u, now), n = S.M.nu[x.u] || 0, l = S.M.last[x.u], p = pend(x.u);
    const est = !n ? t('Sin datos') : d >= NU.DOMINADA ? t('Dominada') : t('En progreso');
    return `<div class="fa-unit"><div class="fa-unit-h"><b>U${x.u}. ${esc(x[LANG] || x.es)}</b><span class="fa-chip ${!n ? '' : d >= NU.DOMINADA ? 'ok' : 'aviso'}">${esc(est)}</span></div>
      <div class="fa-bar" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct(d)}" aria-label="${esc(t('Dominio de la unidad {0}', x.u))}"><span style="width:${pct(d)}%"></span></div>
      <p class="help">${esc(t('{0} % · {1} respuestas', pct(d), n))}${l ? ' · ' + esc(t('última práctica: {0}', new Date(l).toLocaleDateString(locale()))) : ''}${p ? ' · ' + esc(t('{0} pendientes de repaso', p)) : ''}</p>
      <p class="help fa-ra">${esc(t('Resultado de aprendizaje propuesto:'))} ${esc(x.ra[LANG] || x.ra.es)}</p>
      <button class="btn btn-ghost btn-sm" type="button" data-pu="${x.u}">${esc(t('Practicar esta unidad'))}</button></div>`;
  }).join('');
  $$('#progU [data-pu]').forEach(b => b.onclick = () => { S.filtro = [+b.dataset.pu]; S.cur = null; guarda(); go(1); });
  const c = NU.calibracion(S.M.ev), fila = (k, l) => `<tr><td>${esc(t(l))}</td><td>${c[k].n}</td><td>${c[k].n && k !== 'blanco' ? pct(c[k].ok / c[k].n) + ' %' : '—'}</td></tr>`;
  const cal = c.seguro.n >= 5 && c.dudo.n >= 5 ? (c.seguro.ok / c.seguro.n > c.dudo.ok / c.dudo.n ? t('Bien: aciertas más cuando dices estar seguro que cuando dudas. Tu sensación de seguridad es una buena guía en el examen.') : t('Atención: aciertas lo mismo o menos cuando dices estar seguro que cuando dudas. En el examen, no te fíes solo de tu sensación de seguridad.')) : t('Cuando tengas al menos 5 respuestas «Seguro» y 5 «Dudo», aquí verás si tu sensación de seguridad es fiable.');
  $('progCal').innerHTML = `<h3>${esc(t('¿Aciertas cuando dices estar seguro?'))}</h3><div class="table-wrap"><table><thead><tr><th>${esc(t('Seguridad'))}</th><th>${esc(t('Respuestas'))}</th><th>${esc(t('Aciertos'))}</th></tr></thead><tbody>${fila('seguro', 'Seguro')}${fila('dudo', 'Dudo')}${fila('azar', 'Lo adivino')}${fila('blanco', 'En blanco')}</tbody></table></div><p class="help">${esc(cal)}</p>`;
}
$('btnBackup').onclick = () => dl('ciberdelincuencia_copia.json', JSON.stringify({formato: 'ciberdelincuencia/copia/1', fecha: new Date().toISOString(), estado: {...S, gen: undefined}}, null, 1), 'application/json');
$('impBackup').onchange = async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  try { const j = JSON.parse(await f.text()); if (j.formato !== 'ciberdelincuencia/copia/1' || !j.estado || !j.estado.M) throw new Error(); S = {...S, ...j.estado}; await guardaYa(); go(step); toast(t('Copia recuperada')); }
  catch { toast(t('Ese fichero no es una copia de {0}', APP_NAME), 6000); }
};
let _reset = 0;
$('btnReset').onclick = async () => {
  if (Date.now() - _reset > 4000) { _reset = Date.now(); toast(t('Pulsa otra vez en 4 segundos para borrar tu progreso de práctica')); return; }
  S.M = NU.nuevoModelo(); S.cur = null; S.sim = null; await guardaYa(); go(step); toast(t('Progreso borrado'));
};
$('anonOk').onchange = () => { $('btnAnon').disabled = !$('anonOk').checked; };
$('btnAnon').onclick = () => {
  const ids = new Set(ITEMS.map(i => i.id)), ev = S.M.ev.filter(e => ids.has(e.i)); if (!ev.length) return toast(t('Aún no tienes respuestas de práctica'));
  if (!S.seud) { S.seud = 'E-' + Math.random().toString(36).slice(2, 8).toUpperCase(); guarda(); }
  const t0 = Math.floor(ev[0].t / NU.DIA);
  const out = {formato: 'ciberdelincuencia/eventos/1', app: APP_NAME, curso: CURSO.codigo, seud: S.seud, n: ev.length, ev: ev.map(e => ({i: e.i, u: e.u, o: e.o, c: e.c, cf: e.cf, d: Math.floor(e.t / NU.DIA) - t0}))};
  dl(`respuestas_${S.seud}.json`, JSON.stringify(out), 'application/json');
};

/* ── 5 · profesorado ── */
const AVISO_TXT = {muy_dificil: 'muy difícil (menos del 30 % de aciertos)', muy_facil: 'muy fácil (más del 95 % de aciertos)', discrimina_poco: 'discrimina poco (correlación con el resto < 0,2)'};
function pintaProf() {
  const P = S.prof, n = P.files.length;
  $('profInfo').textContent = n ? t('{0} ficheros de estudiantes cargados ({1} respuestas).', n, P.files.reduce((s, f) => s + (f.ev || []).length, 0)) + (P.demo ? ' ' + t('Son datos SIMULADOS para probar el panel: no proceden de estudiantes reales.') : '') : t('Aún no hay ficheros. Cada estudiante los descarga en «Progreso → Descargar mis respuestas anónimas».');
  if (!n) { $('profTabla').innerHTML = `<h3>${esc(t('Analítica de las preguntas'))}</h3><p class="empty">${esc(t('Carga ficheros o prueba con datos simulados.'))}</p>`; }
  else {
    const A = NU.analitica(P.files, ITEMS), r2 = x => x == null ? '—' : x.toLocaleString(locale(), {maximumFractionDigits: 2});
    const porU = UNIDADES.map(x => { const v = ITEMS.filter(i => i.u === x.u).map(i => A.items[i.id]).filter(a => a.n); return {u: x.u, p: v.length ? v.reduce((s, a) => s + a.p, 0) / v.length : null}; });
    $('profTabla').innerHTML = `<h3>${esc(t('Analítica de las preguntas'))}</h3><p class="help">${esc(t('Primera respuesta de cada estudiante a cada pregunta. La discriminación (correlación del ítem con el resto) solo se calcula con 5 o más respuestas y los distractores, con 10 o más. Son señales para revisar, no veredictos.'))}</p>
      <div class="fa-umed">${porU.map(x => `<span class="fa-chip ${x.p == null ? '' : x.p < 0.5 ? 'aviso' : 'ok'}">U${x.u}: ${x.p == null ? '—' : pct(x.p) + ' %'}</span>`).join(' ')}</div>
      <div class="table-wrap fa-tw" tabindex="0" role="region" aria-label="${esc(t('Analítica de las preguntas'))}"><table><thead><tr><th>${esc(t('Pregunta'))}</th><th>n</th><th>${esc(t('Aciertos'))}</th><th>${esc(t('Discriminación'))}</th><th>${esc(t('Opciones elegidas'))}</th><th>${esc(t('Revisar'))}</th></tr></thead><tbody>
      ${ITEMS.map(it => { const a = A.items[it.id], x = txOf(it), tot = a.dis.reduce((s, v) => s + v, 0) || 1;
        const av = a.avisos.map(k => k.startsWith('distractor_') ? t('la opción «{0}» casi nadie la elige', x[1 + +k.split('_')[1]].slice(0, 40) + '…') : t(AVISO_TXT[k]));
        return `<tr class="${av.length ? 'fa-rev' : ''}"><td><b>${esc(it.id)}</b> <small class="muted">U${it.u} · ${esc(t(BLOOM[it.bloom]))}</small><br><span class="fa-qs">${esc(x[0])}</span></td><td>${a.n}</td><td>${a.p == null ? '—' : pct(a.p) + ' %'}</td><td>${r2(a.disc)}</td>
          <td><div class="fa-dis" aria-label="${esc(t('Opciones elegidas'))}">${a.dis.map((v, j) => `<span class="${j === it.c ? 'ok' : ''}" title="${esc(x[1 + j])}"><i style="height:${Math.round(v / tot * 100)}%"></i><b>${LETRAS[j]}${j === it.c ? '✓' : ''}</b><small>${v}</small></span>`).join('')}</div></td>
          <td>${av.length ? av.map(s => `<span class="fa-chip aviso">${esc(s)}</span>`).join(' ') : '—'}</td></tr>`; }).join('')}</tbody></table></div>`;
  }
  const notas = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'];
  $('profGuia').innerHTML = `<h3>${esc(t('Qué propone revisar el análisis de la guía docente'))}</h3><ul class="fa-ul">${notas.map(k => `<li>${esc(t('guia.' + k))}</li>`).join('')}</ul>`;
}
$('impAlu').onchange = async e => {
  const fs = [...e.target.files]; e.target.value = ''; let ok = 0, mal = 0, rep = 0;
  if (S.prof.demo) { S.prof = {files: [], demo: false}; }
  for (const f of fs) { try { const j = JSON.parse(await f.text()); if (j.formato !== 'ciberdelincuencia/eventos/1' || !Array.isArray(j.ev)) throw 0; if (S.prof.files.some(x => x.seud === j.seud)) { rep++; continue; } S.prof.files.push({seud: String(j.seud || uid('E-')), ev: j.ev.map(x => ({i: String(x.i), u: +x.u, o: x.o == null ? null : +x.o, c: x.c ? 1 : 0, cf: String(x.cf || ''), d: +x.d || 0}))}); ok++; } catch { mal++; } }
  await guardaYa(); pintaProf(); toast(t('{0} añadidos · {1} repetidos · {2} no válidos', ok, rep, mal), 6000);
};
$('btnProfLimpia').onclick = async () => { S.prof = {files: [], demo: false}; await guardaYa(); pintaProf(); };
/* datos simulados: 40 estudiantes con un modelo logístico; u3-2 se responde al azar y una opción de u5-2 no la elige nadie, para ver los avisos */
$('btnProfEj').onclick = async () => {
  const R = NU.mulberry32(2026), gauss = () => Math.sqrt(-2 * Math.log(R() + 1e-12)) * Math.cos(2 * Math.PI * R());
  const files = [];
  for (let s = 0; s < 40; s++) {
    const th = gauss() * 1.1 + 0.4, ev = [];
    ITEMS.forEach((it, d) => { if (R() < 0.15) return; let ok = R() < NU.sigm(th - NU.dif(it) * 1.2); if (it.id === 'u3-2') ok = R() < 0.3;
      const ds = [0, 1, 2, 3].filter(j => j !== it.c && !(it.id === 'u5-2' && j === 3)); const o = ok ? it.c : ds[Math.floor(R() * ds.length)];
      ev.push({i: it.id, u: it.u, o, c: ok ? 1 : 0, cf: ok ? 'seguro' : 'dudo', d: Math.floor(d / 4)}); });
    files.push({seud: 'SIM-' + String(s + 1).padStart(2, '0'), ev});
  }
  S.prof = {files, demo: true}; await guardaYa(); pintaProf(); toast(t('Datos simulados cargados: no son de estudiantes reales'));
};
const expK = () => Math.min(6, Math.max(2, +$('expK').value || 4));
$('btnXml').onclick = () => { const l = $('expLang').value; dl(`banco_8059_${l}.xml`, NU.aMoodleXml(ITEMS, l, nombreUlang(l), expK()), 'application/xml'); };
$('btnGift').onclick = () => { const l = $('expLang').value; dl(`banco_8059_${l}.gift.txt`, NU.aGift(ITEMS, l, nombreUlang(l)), 'text/plain;charset=utf-8'); };
$('btnCsvBanco').onclick = () => { const l = $('expLang').value; dl(`banco_8059_${l}.csv`, csvDe(['id', t('unidad'), 'bloom', t('enunciado'), 'A', 'B', 'C', 'D', t('correcta'), t('explicación'), t('revisada')], ITEMS.map(it => { const x = it.tx[l]; return [it.id, it.u, it.bloom, x[0], x[1], x[2], x[3], x[4], LETRAS[it.c], x[5], it.rev ? t('sí') : t('no')]; })), 'text/csv;charset=utf-8'); };

/* ── arranque ── */
(async () => {
  const p = await cargaEstado(); if (p) S = {...S, ...p, caso: {...S.caso, ...(p.caso || {})}, prof: {...S.prof, ...(p.prof || {})}, calc: {...S.calc, ...(p.calc || {})}};
  iniciaUI(); if (S.caso.esEjemplo) aplicaEjemploCaso(); go(0);
})();
