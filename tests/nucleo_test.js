// Pruebas de la lógica pura en Node:  node tests/nucleo_test.js
const fs = require('fs'), vm = require('vm'), path = require('path'), assert = require('assert');
const ctx = {console}; vm.createContext(ctx);
for (const f of ['curriculum.js', 'nucleo.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8') + '\n;this.ITEMS=typeof ITEMS!=="undefined"?ITEMS:this.ITEMS;this.NU=typeof NU!=="undefined"?NU:this.NU;this.EVAL=typeof EVAL!=="undefined"?EVAL:this.EVAL;this.UNIDADES=typeof UNIDADES!=="undefined"?UNIDADES:this.UNIDADES;', ctx);
const {NU, ITEMS, EVAL, UNIDADES} = ctx; let ok = 0; const t = (n, f) => { f(); ok++; console.log('✓', n); };
const close = (a, b, e = 1e-9) => assert.ok(Math.abs(a - b) < e, `${a} ≠ ${b}`);

t('banco: 36 ítems, 4 por unidad, ids únicos, 3 idiomas, 4 opciones + explicación, correcta en rango', () => {
  assert.strictEqual(ITEMS.length, 36); assert.strictEqual(new Set(ITEMS.map(i => i.id)).size, 36);
  for (let u = 1; u <= 9; u++) assert.strictEqual(ITEMS.filter(i => i.u === u).length, 4);
  for (const it of ITEMS) { for (const l of ['es', 'en', 'pt']) { assert.strictEqual(it.tx[l].length, 6, it.id + l); assert.ok(it.tx[l].every(s => s && s.length > 2), it.id + l); assert.strictEqual(new Set(it.tx[l].slice(1, 5)).size, 4, 'opciones repetidas ' + it.id + l); } assert.ok(it.c >= 0 && it.c < 4); assert.ok(NU.B[it.bloom] != null); }
  assert.strictEqual(UNIDADES.length, 9);
});
t('fórmula literal de la guía', () => {
  close(NU.notaTest(30, 8, 40, 4), ((30 - 8 / 4) / 40) * 10);   // 7
  close(NU.notaTest(30, 8, 40, 4), 7); close(NU.notaTest(0, 0, 10, 4), 0); close(NU.notaTest(10, 0, 10, 3), 10);
  const s = NU.corrigeSimulacro([{c: 0, o: 0}, {c: 1, o: 2}, {c: 2, o: null}, {c: 3, o: 3}], 4); assert.strictEqual([s.c, s.i, s.b].join(), '2,1,1'); close(s.nota, ((2 - 0.25) / 4) * 10);
});
t('estrategia: con 4 opciones contestar compensa por encima del 20 % y el azar puro tiene valor positivo', () => {
  close(NU.umbralContestar(4), 0.2); close(NU.valorContestar(0.2, 4), 0); assert.ok(NU.valorContestar(0.25, 4) > 0); close(NU.valorContestar(0.25, 4), 0.0625); assert.ok(NU.valorContestar(0.15, 4) < 0);
});
t('evaluación continua: 70/30 solo si test ≥ 5', () => {
  assert.strictEqual(JSON.stringify(NU.notaContinua(6, 8, EVAL)), JSON.stringify({nota: 6.6, estado: 'ok'})); assert.strictEqual(NU.notaContinua(4.9, 10, EVAL).estado, 'test_bajo'); assert.strictEqual(NU.notaContinua(7, null, EVAL).estado, 'falta_caso');
});
t('modelo: acertar sube el dominio, fallar lo baja, en blanco no lo toca; el olvido lo acerca al punto de partida', () => {
  const now = Date.UTC(2026, 9, 1); const M = NU.nuevoModelo(); const it = ITEMS[0];
  const d0 = NU.dominio(M, 1, now); NU.registra(M, it, it.c, 'seguro', now); const d1 = NU.dominio(M, 1, now); assert.ok(d1 > d0);
  NU.registra(M, ITEMS[1], (ITEMS[1].c + 1) % 4, 'dudo', now); assert.ok(NU.dominio(M, 1, now) < d1);
  const th = M.th[1]; NU.registra(M, ITEMS[2], null, 'seguro', now); assert.strictEqual(M.th[1], th); assert.strictEqual(M.ev[M.ev.length - 1].cf, 'blanco');
  const tarde = NU.dominio(M, 1, now + 60 * NU.DIA); assert.ok(Math.abs(tarde - 0.5) < Math.abs(NU.dominio(M, 1, now) - 0.5));
});
t('ruta: diagnóstico intercalado, un fallo vuelve tras 3 preguntas, repaso espaciado al vencer', () => {
  const now = Date.UTC(2026, 9, 1); const M = NU.nuevoModelo();
  let s = NU.siguiente(M, ITEMS, now); assert.strictEqual(s.tipo, 'diagnostico');
  const vistos = [];
  for (let k = 0; k < 9; k++) { s = NU.siguiente(M, ITEMS, now); vistos.push(s.it.u); NU.registra(M, s.it, s.it.c, 'seguro', now); }
  assert.strictEqual(new Set(vistos).size, 9, 'las 9 primeras recorren las 9 unidades: ' + vistos);
  const f = NU.siguiente(M, ITEMS, now); NU.registra(M, f.it, (f.it.c + 1) % 4, 'seguro', now);
  const sig = []; for (let k = 0; k < 4; k++) { s = NU.siguiente(M, ITEMS, now); sig.push(s); NU.registra(M, s.it, s.it.c, 'seguro', now); }
  assert.ok(sig.slice(0, 3).every(x => x.it.id !== f.it.id)); assert.strictEqual(sig[3].it.id, f.it.id); assert.strictEqual(sig[3].tipo, 'fallo');
  const M2 = NU.nuevoModelo(); NU.registra(M2, ITEMS[0], ITEMS[0].c, 'seguro', now);
  for (const it of ITEMS.slice(1)) NU.registra(M2, it, it.c, 'seguro', now);
  const r = NU.siguiente(M2, ITEMS, now + 1.5 * NU.DIA); assert.strictEqual(r.tipo, 'repaso');
});
t('determinismo: mismos eventos → misma ruta', () => {
  const run = () => { const now = Date.UTC(2026, 9, 1); const M = NU.nuevoModelo(); const ids = []; const R = NU.mulberry32(7); for (let k = 0; k < 60; k++) { const s = NU.siguiente(M, ITEMS, now + k * 3600e3); ids.push(s.it.id + s.tipo); NU.registra(M, s.it, R() < 0.6 ? s.it.c : (s.it.c + 1) % 4, R() < .5 ? 'seguro' : 'dudo', now + k * 3600e3); } return ids.join(','); };
  assert.strictEqual(run(), run());
});
t('simulacro: reproducible, sin repetidas, reparto entre unidades', () => {
  const a = NU.eligeSimulacro(ITEMS, 18, 'x').map(i => i.id), b = NU.eligeSimulacro(ITEMS, 18, 'x').map(i => i.id), c = NU.eligeSimulacro(ITEMS, 18, 'y').map(i => i.id);
  assert.deepStrictEqual(a, b); assert.notDeepStrictEqual(a, c); assert.strictEqual(new Set(a).size, 18);
  const us = {}; NU.eligeSimulacro(ITEMS, 18, 'x').forEach(i => us[i.u] = (us[i.u] || 0) + 1); assert.ok(Object.values(us).every(v => v === 2));
  assert.strictEqual([...NU.baraja(4, 's')].sort().join(), '0,1,2,3');
});
t('analítica: p, discriminación y distractores', () => {
  const it = ITEMS[0]; const fs_ = [];
  for (let k = 0; k < 20; k++) { const bueno = k < 10; const ev = ITEMS.slice(0, 10).map((x, j) => ({i: x.id, u: x.u, o: (bueno || (j % 3 === 0)) ? x.c : (x.c + 1) % 4, c: (bueno || (j % 3 === 0)) ? 1 : 0})); fs_.push({ev}); }
  const a = NU.analitica(fs_, ITEMS).items;
  close(a[ITEMS[1].id].p, 0.5); assert.ok(a[ITEMS[1].id].disc > 0.8); assert.strictEqual(a[it.id].p, 1); assert.ok(a[it.id].avisos.includes('muy_facil'));
  assert.ok(a[ITEMS[1].id].avisos.some(x => x.startsWith('distractor_')));
  assert.strictEqual(a[ITEMS[20].id].n, 0);
});
t('exportación GIFT y Moodle XML', () => {
  const g = NU.aGift(ITEMS.slice(0, 2), 'es', u => 'U' + u); assert.ok(g.includes('::u1-1::')); assert.strictEqual((g.match(/\n  =/g) || []).length, 2);
  const x = NU.aMoodleXml(ITEMS, 'en', u => 'Unit ' + u); assert.strictEqual((x.match(/type="multichoice"/g) || []).length, 36); assert.strictEqual((x.match(/fraction="100"/g) || []).length, 36); assert.ok(x.includes('fraction="-25"'));
});
t('caso: detección de citas y referencias; el feedback no puede poner notas', () => {
  const b = NU.bibliografia('Como señala Miró Llinares (2012), y otros (Clough, 2015; ...) y (Yar y Steinmetz, 2019) doi 10.1111/j.1467-9280.2006.01693.x.\n\nBibliografía\nClough, J. (2015). Principles of cybercrime. Cambridge University Press.\nMiró Llinares, F. (2012). El cibercrimen. Marcial Pons.');
  assert.ok(b.citas.length >= 2, JSON.stringify(b)); assert.strictEqual(b.doi[0], '10.1111/j.1467-9280.2006.01693.x'); assert.ok(b.seccion); assert.strictEqual(b.refs, 2);
  assert.ok(NU.tieneNota('Te pondría un 7/10')); assert.ok(NU.tieneNota('estaría aprobado')); assert.ok(NU.tieneNota('cubre el 80 %')); assert.ok(!NU.tieneNota('Añade dos referencias de 2019 y revisa la unidad 8.'));
});
t('aviso de redacción: correcta más larga', () => {
  const n = ITEMS.filter(it => ['es', 'en', 'pt'].some(l => NU.correctaMasLarga(it.tx[l].slice(1, 5), it.c))).length; assert.strictEqual(n, 0, n + ' ítems con la correcta claramente más larga');
});
console.log(`\n${ok} pruebas superadas`);
