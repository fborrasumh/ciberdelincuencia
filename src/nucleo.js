/* ══ Núcleo: lógica pura (sin DOM). Se prueba en Node (tests/nucleo_test.js). Mismos eventos → mismo modelo → misma ruta. ══ */
const NU = (() => {
  const DIA = 864e5;
  const sigm = x => 1 / (1 + Math.exp(-x));
  const logit = p => Math.log(p / (1 - p));
  /* ── Fórmula literal de la guía: Nota = ((correctas − incorrectas / nº opciones) / nº preguntas) · 10; las blancas no descuentan ── */
  const notaTest = (c, i, n, k) => n > 0 ? ((c - i / k) / n) * 10 : 0;
  /* valor esperado de contestar una pregunta (en «preguntas», sobre 1) si la probabilidad de acertar es p; dejarla en blanco vale 0 */
  const valorContestar = (p, k) => p - (1 - p) / k;
  const umbralContestar = k => 1 / (k + 1);   // contestar compensa si p > 1/(k+1) (con 4 opciones, 20 %)
  /* evaluación continua: 70 % test + 30 % caso, solo si el test ≥ 5. Si el test < 5, la guía no dice cómo queda la nota: se marca. */
  function notaContinua(test, caso, ev = (typeof EVAL !== 'undefined' ? EVAL : {peso_test: .7, peso_caso: .3, min_test: 5})) {
    if (test == null || isNaN(test)) return {nota: null, estado: 'falta_test'};
    if (test < ev.min_test) return {nota: null, estado: 'test_bajo'};
    if (caso == null || isNaN(caso)) return {nota: null, estado: 'falta_caso'};
    return {nota: Math.round((ev.peso_test * test + ev.peso_caso * caso) * 100) / 100, estado: 'ok'};
  }
  /* ── Modelo de dominio por unidad (Elo simplificado, Pelánek 2016) con olvido exponencial ── */
  const B = {recordar: -0.8, comprender: -0.2, aplicar: 0.4, analizar: 0.9};   // dificultad de partida por nivel de Bloom
  const TAU = 21;                    // días: el dominio estimado decae hacia el punto de partida si no se practica
  const INTERVALO = [0, 1, 3, 7, 16, 35];   // días hasta repasar según la caja (Leitner); caja 0 = repetir tras 3 preguntas
  const DOMINADA = 0.8, OBJETIVO = 0.7;
  const nuevoModelo = () => ({th: {}, last: {}, nu: {}, it: {}, ev: [], seq: 0});
  const dif = it => (it.b != null ? it.b : (B[it.bloom] ?? 0));
  function thetaEf(M, u, now) { const th = M.th[u] || 0, l = M.last[u]; if (l == null) return th; const d = Math.max(0, (now - l) / DIA); return th * Math.exp(-d / TAU); }
  const dominio = (M, u, now) => sigm(thetaEf(M, u, now));
  const probAcierto = (M, it, now) => sigm(thetaEf(M, it.u, now) - dif(it));
  /* registra una respuesta: o = opción elegida (índice ORIGINAL) o null si la deja en blanco; cf = 'seguro'|'dudo'|'azar' */
  function registra(M, it, o, cf, now) {
    const blanco = o == null, r = !blanco && o === it.c ? 1 : 0;
    const P = probAcierto(M, it, now);
    M.seq++;
    const st = M.it[it.id] || (M.it[it.id] = {n: 0, ok: 0, box: 0, due: 0, dueSeq: 0, vista: 0});
    st.n++; st.ok += r; st.vista = now;
    if (!blanco) {   // en blanco: no hay evidencia sobre el dominio, pero la pregunta vuelve pronto
      const n = M.nu[it.u] || 0, K = 0.8 / (1 + 0.08 * n);
      M.th[it.u] = thetaEf(M, it.u, now) + K * (r - P); M.nu[it.u] = n + 1; M.last[it.u] = now;
    }
    if (r && cf === 'seguro') st.box = Math.min(INTERVALO.length - 1, st.box + 1);
    else if (r) st.box = Math.max(1, st.box);
    else st.box = 0;
    st.due = now + INTERVALO[st.box] * DIA; st.dueSeq = M.seq + 3;
    const e = {i: it.id, u: it.u, o: blanco ? null : o, c: r, cf: blanco ? 'blanco' : cf, p: Math.round(P * 1000) / 1000, t: now};
    M.ev.push(e); return {r, P, e};
  }
  /* ── Siguiente actividad: reglas deterministas y explicables ── */
  function siguiente(M, items, now, {unidades = null, excluir = null} = {}) {
    const pool = items.filter(it => (!unidades || unidades.includes(it.u)) && it.id !== excluir);
    if (!pool.length) return null;
    const lastU = M.ev.length ? M.ev[M.ev.length - 1].u : null;
    const variadas = new Set(pool.map(it => it.u)).size > 1;
    const intercala = arr => { const o = variadas ? arr.filter(it => it.u !== lastU) : arr; return o.length ? o : arr; };
    const porId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    const dom = u => dominio(M, u, now);
    // 1) fallos recientes: vuelven tras 3 preguntas
    let c = intercala(pool.filter(it => M.it[it.id] && M.it[it.id].box === 0 && M.it[it.id].dueSeq <= M.seq));
    if (c.length) { c.sort((a, b) => M.it[a.id].dueSeq - M.it[b.id].dueSeq || porId(a, b)); return {it: c[0], tipo: 'fallo', u: c[0].u, dom: dom(c[0].u)}; }
    // 2) repaso espaciado vencido (la más atrasada primero)
    c = intercala(pool.filter(it => M.it[it.id] && M.it[it.id].box > 0 && M.it[it.id].due <= now));
    if (c.length) { c.sort((a, b) => M.it[a.id].due - M.it[b.id].due || porId(a, b)); return {it: c[0], tipo: 'repaso', u: c[0].u, dom: dom(c[0].u)}; }
    // 3) pregunta nueva en la unidad con menos dominio, con dificultad cercana a un 70 % de acierto esperado
    const nuevas = intercala(pool.filter(it => !M.it[it.id]));
    if (nuevas.length) {
      const us = [...new Set(nuevas.map(it => it.u))].sort((a, b) => dom(a) - dom(b) || a - b), u = us[0];
      const objetivo = thetaEf(M, u, now) - logit(OBJETIVO);
      const cu = nuevas.filter(it => it.u === u).sort((a, b) => Math.abs(dif(a) - objetivo) - Math.abs(dif(b) - objetivo) || porId(a, b));
      return {it: cu[0], tipo: M.nu[u] ? 'debil' : 'diagnostico', u, dom: dom(u)};
    }
    // 4) todo visto y nada vencido: refuerzo de la caja más baja en la unidad menos dominada
    c = intercala(pool.slice()).sort((a, b) => dom(a.u) - dom(b.u) || M.it[a.id].box - M.it[b.id].box || M.it[a.id].vista - M.it[b.id].vista || porId(a, b));
    return {it: c[0], tipo: 'refuerzo', u: c[0].u, dom: dom(c[0].u)};
  }
  /* ── Calibración: ¿acierta más cuando dice estar seguro? ── */
  function calibracion(ev) {
    const o = {seguro: {n: 0, ok: 0}, dudo: {n: 0, ok: 0}, azar: {n: 0, ok: 0}, blanco: {n: 0, ok: 0}};
    for (const e of ev) if (o[e.cf]) { o[e.cf].n++; o[e.cf].ok += e.c; }
    return o;
  }
  /* ── Aleatoriedad reproducible (semilla → misma secuencia) ── */
  function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function baraja(n, semilla) { const r = mulberry32(hashStr(String(semilla))), a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  /* simulacro: N preguntas repartidas por unidades (reparto proporcional y estable para una semilla) */
  function eligeSimulacro(items, N, semilla) {
    const porU = {}; for (const it of items) (porU[it.u] = porU[it.u] || []).push(it);
    const us = Object.keys(porU).map(Number).sort((a, b) => a - b);
    us.forEach(u => { const p = baraja(porU[u].length, semilla + '|' + u); porU[u] = p.map(i => porU[u][i]); });
    const out = []; let k = 0;
    while (out.length < Math.min(N, items.length)) { const u = us[k % us.length]; if (porU[u].length) out.push(porU[u].shift()); k++; }
    const p = baraja(out.length, semilla + '|orden'); return p.map(i => out[i]);
  }
  function corrigeSimulacro(resp, k) {   // resp: [{c:índice correcto, o:índice elegido|null}]
    let c = 0, i = 0, b = 0; for (const r of resp) { if (r.o == null) b++; else if (r.o === r.c) c++; else i++; }
    return {c, i, b, n: resp.length, nota: notaTest(c, i, resp.length, k), sinPenalizar: resp.length ? c / resp.length * 10 : 0};
  }
  /* ── Analítica de ítems a partir de los ficheros anónimos del alumnado (primera respuesta de cada estudiante a cada ítem) ── */
  function analitica(ficheros, items) {
    const est = ficheros.map(f => { const pr = {}; for (const e of (f.ev || [])) if (!(e.i in pr)) pr[e.i] = e; return pr; });
    const res = {};
    for (const it of items) {
      const filas = []; const dis = new Array(4).fill(0); let blanco = 0;
      est.forEach(pr => {
        const e = pr[it.id]; if (!e) return;
        if (e.o == null) { blanco++; return; }
        dis[e.o] = (dis[e.o] || 0) + 1;
        const otros = Object.values(pr).filter(x => x.i !== it.id && x.o != null), resto = otros.length ? otros.reduce((s, x) => s + x.c, 0) / otros.length : null;
        filas.push({x: e.c, y: resto});
      });
      const n = filas.length, p = n ? filas.reduce((s, f) => s + f.x, 0) / n : null;
      let disc = null; const fv = filas.filter(f => f.y != null);
      if (fv.length >= 5) {   // correlación punto-biserial corregida (ítem frente al resto)
        const my = fv.reduce((s, f) => s + f.y, 0) / fv.length, mx = fv.reduce((s, f) => s + f.x, 0) / fv.length;
        let sxy = 0, sxx = 0, syy = 0; for (const f of fv) { sxy += (f.x - mx) * (f.y - my); sxx += (f.x - mx) ** 2; syy += (f.y - my) ** 2; }
        disc = sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : null;
      }
      const avisos = [];
      if (n >= 5 && p < 0.3) avisos.push('muy_dificil'); if (n >= 5 && p > 0.95) avisos.push('muy_facil');
      if (disc != null && disc < 0.2) avisos.push('discrimina_poco');
      if (n >= 10) dis.forEach((v, j) => { if (j !== it.c && v / n < 0.05) avisos.push('distractor_' + j); });
      res[it.id] = {n, p, disc, dis, blanco, avisos};
    }
    return {est: est.length, items: res};
  }
  /* aviso de redacción comprobable por código: la opción correcta es claramente la más larga (pista involuntaria) */
  function correctaMasLarga(o, c) { const L = o.map(x => x.length), m = Math.max(...L.filter((_, j) => j !== c)); return L[c] > 1.3 * m && L[c] - m >= 15; }
  /* ── Exportación del banco ── */
  const giftEsc = s => String(s).replace(/([~=#{}:\\])/g, '\\$1');
  function aGift(items, lang, nombreU) {
    return items.map(it => { const x = it.tx[lang] || it.tx.es; return `// ${it.id} · U${it.u} · ${it.bloom}\n$CATEGORY: $course$/${giftEsc(nombreU(it.u))}\n::${it.id}::${giftEsc(x[0])} {\n${x.slice(1, 5).map((o, j) => `  ${j === it.c ? '=' : '~'}${giftEsc(o)}`).join('\n')}\n  ####${giftEsc(x[5])}\n}\n`; }).join('\n');
  }
  const xe = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  function aMoodleXml(items, lang, nombreU, k = 4) {
    const pen = -Math.round(100 / k * 1e5) / 1e5;   // misma penalización que la guía: −1/k de pregunta por error
    const cats = [...new Set(items.map(it => it.u))].sort((a, b) => a - b);
    let x = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n';
    for (const u of cats) {
      x += `  <question type="category"><category><text>$course$/${xe(nombreU(u))}</text></category></question>\n`;
      for (const it of items.filter(i => i.u === u)) {
        const t = it.tx[lang] || it.tx.es;
        x += `  <question type="multichoice"><name><text>${xe(it.id)}</text></name><questiontext format="html"><text><![CDATA[<p>${xe(t[0])}</p>]]></text></questiontext><generalfeedback format="html"><text><![CDATA[<p>${xe(t[5])}</p>]]></text></generalfeedback><defaultgrade>1</defaultgrade><penalty>0</penalty><single>true</single><shuffleanswers>true</shuffleanswers><answernumbering>abc</answernumbering>\n`;
        t.slice(1, 5).forEach((o, j) => { x += `    <answer fraction="${j === it.c ? 100 : pen}" format="html"><text><![CDATA[${xe(o)}]]></text></answer>\n`; });
        x += `    <tags><tag><text>U${u}</text></tag><tag><text>${xe(it.bloom)}</text></tag></tags></question>\n`;
      }
    }
    return x + '</quiz>\n';
  }
  /* ── Caso práctico: lo que el código puede contar por sí solo ── */
  function bibliografia(txt) {
    const s = String(txt || '');
    const citas = (s.match(/\(([A-ZÁÉÍÓÚÑ][\p{L}'’-]+(?:\s+(?:y|e|and|&)\s+[A-ZÁÉÍÓÚÑ][\p{L}'’-]+|\s+et\s+al\.)?),?\s+(?:19|20)\d{2}[a-z]?(?:[,:]\s*(?:p{1,2}\.\s*)?\d+(?:[-–]\d+)?)?\)|[A-ZÁÉÍÓÚÑ][\p{L}'’-]+(?:\s+et\s+al\.)?\s+\((?:19|20)\d{2}[a-z]?\)/gu) || []);
    const doi = (s.match(/\b10\.\d{4,9}\/[^\s"<>]+/g) || []);
    const cab = s.match(/^\s*(?:#+\s*)?(bibliograf[ií]a|referencias(?: bibliogr[aá]ficas)?|references|bibliography|refer[eê]ncias(?: bibliogr[aá]ficas)?)\s*:?\s*$/im);
    let refs = 0; if (cab) { const tras = s.slice(cab.index + cab[0].length).split(/\n+/).map(l => l.trim()).filter(Boolean); refs = tras.filter(l => /(?:19|20)\d{2}/.test(l) && l.length > 25).length; }
    return {citas: [...new Set(citas)], doi: [...new Set(doi.map(d => d.replace(/[.,;)]+$/, '')))], seccion: !!cab, refs};
  }
  /* el feedback no puede poner notas: se detecta por código (patrón 2) */
  const NOTAS_RX = /\b\d{1,2}(?:[.,]\d+)?\s?(?:\/\s?10|sobre\s+10|out\s+of\s+10|em\s+10|puntos|points|pontos)\b|\b\d{1,3}\s?%|\b(?:aprobad[oa]|suspens[oa]|sobresaliente|notable|matr[ií]cula de honor|pass(?:ed)?|fail(?:ed)?|aprovad[oa]|reprovad[oa])\b/i;
  const tieneNota = s => NOTAS_RX.test(String(s || ''));
  return {sigm, logit, notaTest, valorContestar, umbralContestar, notaContinua, B, TAU, INTERVALO, DOMINADA, OBJETIVO, nuevoModelo, dif, thetaEf, dominio, probAcierto, registra, siguiente, calibracion, mulberry32, hashStr, baraja, eligeSimulacro, corrigeSimulacro, analitica, correctaMasLarga, aGift, aMoodleXml, bibliografia, tieneNota, DIA};
})();
if (typeof module !== 'undefined') module.exports = NU;
