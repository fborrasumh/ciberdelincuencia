#!/usr/bin/env python3
"""Prueba completa de CiberdelincuencIA con IA simulada (y mentirosa).  Uso:  python3 tests/app_test.py [ruta a axe.min.js]"""
import asyncio, json, sys, pathlib, re, csv, io, time, xml.etree.ElementTree as ET
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from forja_test import Harness
R = pathlib.Path(__file__).resolve().parent.parent; IDX = R / 'index.html'; OUT = pathlib.Path('/tmp/cdi'); OUT.mkdir(exist_ok=True)
AXE = sys.argv[1] if len(sys.argv) > 1 else None
ok = 0
def chk(c, m):
    global ok
    if not c: raise AssertionError(m)
    ok += 1; print('✓', m)

CASO = """Mi caso analiza las estafas románticas en aplicaciones de citas. Escribidme a alumna.prueba@umh.es o al 612 345 678 si tenéis dudas.
Las víctimas conocen a una persona en una aplicación y, tras semanas de conversación, reciben peticiones de dinero por supuestas urgencias médicas.
Desde la teoría de las actividades cotidianas, el ciberlugar es la propia aplicación, donde convergen agresor y víctima sin guardián capaz.
Se trata de un cibercrimen réplica y económico, porque reproduce la estafa tradicional usando las TIC para el engaño y la captación.
""" * 3 + "\nBibliografía\nMiró Llinares, F. (2012). El cibercrimen. Marcial Pons.\nClough, J. (2015). Principles of cybercrime. Cambridge University Press.\n"
LLAMADAS = []
async def reply(prov, system, user, info):
    LLAMADAS.append(user[:80])
    if '429' in user: return ('err', 429, '{"error":{"message":"You exceeded your current quota"}}')
    if 'redacta' in user and 'preguntas de opción múltiple' in user:
        return ('j', {'preguntas': [
            {'enunciado': '¿Dónde convergen agresor y víctima?', 'opciones': ['En el ciberlugar', 'En la comisaría', 'En el juzgado', 'En el banco'], 'correcta': 0, 'explicacion': 'Lo dicen tus apuntes.', 'cita': 'el ciberlugar es la propia aplicación, donde convergen agresor y víctima', 'bloom': 'comprender'},
            {'enunciado': 'Pregunta con cita inventada', 'opciones': ['a', 'b', 'c', 'd'], 'correcta': 1, 'explicacion': 'x', 'cita': 'una frase que no está en ningún apunte del estudiante', 'bloom': 'recordar'},
            {'enunciado': 'Pregunta con opciones repetidas', 'opciones': ['igual', 'igual', 'otra', 'más'], 'correcta': 2, 'explicacion': 'x', 'cita': 'reproduce la estafa tradicional usando las TIC', 'bloom': 'aplicar'}]})
    if 'Da feedback FORMATIVO' in user:
        crit = [{'id': f'C{i}', 'fortalezas': f'Fortaleza {i}.', 'mejoras': f'Mejora {i}.', 'evidencia': 'el ciberlugar es la propia aplicación, donde convergen agresor y víctima'} for i in range(1, 8)]
        crit[1]['evidencia'] = 'Esta frase la ha inventado la IA y no aparece en el trabajo del estudiante'
        crit[2]['mejoras'] = 'Buen análisis. Te pondría un 7/10. Revisa la unidad 4.'
        return ('j', {'resumen': 'Trabajo correcto que merece un aprobado. Falta citar en el texto.', 'criterios': crit})   # sin C8 y con notas
    if 'defensa oral del caso práctico' in user and 'Formula 5 preguntas' in user:
        return ('j', {'preguntas': [{'pregunta': '¿Por qué es réplica?', 'motivo': 'U4', 'cita': 'Se trata de un cibercrimen réplica y económico'}, {'pregunta': '¿Y el guardián?', 'motivo': 'U2', 'cita': 'frase inventada que no está en el texto del caso'}]})
    if 'ensaya la defensa oral' in user:
        return ('j', {'valoraciones': [{'n': 1, 'comentario': 'Bien defendido. Sería un sobresaliente.', 'sugerencia': 'Cita a Miró Llinares.'}]})
    return ('j', {})

async def axe(h, etiqueta):
    if not AXE: return
    await h.page.add_script_tag(path=AXE)
    r = await h.page.evaluate("axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}}).then(r=>r.violations.map(v=>v.id+': '+v.nodes.length+' · '+v.nodes.slice(0,2).map(n=>n.target.join(' ')).join(' | ')))")
    chk(r == [], f'axe sin infracciones AA · {etiqueta} {r if r else ""}')

async def main():
    init = ["localStorage.setItem('ia_openai_key','sk-test-clave-larga-de-prueba-123')"]
    async with Harness(IDX, reply, init_scripts=init) as h:
        p = h.page
        chk(h.errors == [], 'arranca sin errores'); chk(await h.csp_bloquea(), 'la CSP bloquea otros orígenes')
        chk(await h.faltan_traducciones() == [], 'sin huecos de traducción (i18nFaltan)')
        chk('MIRO LLINARES' in await p.inner_text('#fichaGuia') and '8059' in await p.inner_text('#fichaGuia'), 'ficha literal de la guía en portada')
        await axe(h, 'portada')
        # ── práctica por la interfaz ──
        await p.click('#btnStart'); await h.esp('step===1')
        chk('Por qué te toca' in await p.inner_text('#preg'), 'la pregunta explica por qué toca')
        await p.click('#btnResp'); chk(await p.evaluate('S.M.ev.length') == 0, 'sin opción elegida no registra')
        await axe(h, 'práctica')
        unidades = []; fallada = None
        for k in range(10):
            cur = await p.evaluate('S.cur'); it = await p.evaluate(f'itemPorId("{cur["id"]}")'); unidades.append(cur['u'])
            o = it['c'] if k != 2 else (it['c'] + 1) % 4
            if k == 2: fallada = cur['id']
            await p.check(f'#preg input[name=op][value="{o}"]'); await p.check('#preg input[name=cf][value="seguro"]'); await p.click('#btnResp')
            await h.esp("!!document.querySelector('#btnSig')")
            fb = await p.inner_text('#fbPreg'); chk(('Correcto' in fb) == (k != 2), f'feedback inmediato correcto (respuesta {k+1})') if k in (0, 2) else None
            if k == 6: chk(cur['id'] == fallada and cur['tipo'] == 'fallo', 'la pregunta fallada vuelve tras otras tres')
            await p.click('#btnSig')
        chk(len(set(unidades[:2])) == 2 and all(unidades[i] != unidades[i+1] for i in range(len(unidades)-1)), 'intercalado: nunca dos seguidas de la misma unidad')
        await p.click('#btnBlanco'); chk(await p.evaluate("S.M.ev.at(-1).cf") == 'blanco', 'dejar en blanco se registra sin tocar el dominio')
        await p.click('#btnSig')
        await p.click('#filtroU button[data-u="9"]'); chk(await p.evaluate('S.cur.u') == 9, 'el filtro por unidad cambia la pregunta pendiente')
        await p.click('#filtroU button[data-u="0"]')
        # ── crear preguntas con IA desde apuntes ──
        await p.click('#genBox summary'); await p.fill('#apuntes', CASO[:900]); await p.click('#btnGen')
        await p.wait_for_selector('#mEnvio.on'); txt = await p.inner_text('#envioTxt')
        chk('alumna.prueba@umh.es' not in txt and '612 345 678' not in txt, 'aviso previo: la muestra va enmascarada')
        await p.press('#envioOk', 'Escape'); chk(not await p.evaluate("$('mEnvio').classList.contains('on')"), 'Escape cierra y cancela el envío')
        chk(len(h.seen) == 0, 'cancelar no envía nada')
        await p.click('#btnGen'); await p.wait_for_selector('#mEnvio.on'); await p.check('#envioOk'); await p.click('#envioSi')
        await h.esp('S.gen && S.gen.length===3')
        chk(await p.evaluate('S.gen.filter(q=>!q.motivos.length).length') == 1, 'de 3 preguntas generadas solo pasa 1 (cita inventada y opciones repetidas descartadas)')
        chk('alumna.prueba' not in h.seen[-1]['user'] and '612 345' not in h.seen[-1]['user'], 'privacidad: el envío no lleva correo ni teléfono')
        chk(h.seen[-1]['json'] and h.seen[-1]['auth'].startswith('Bearer'), 'OpenAI: clave en cabecera y JSON pedido')
        await p.click('#genRes [data-add]'); chk(await p.evaluate('S.extra.length') == 1, 'la pregunta aceptada se añade a la práctica')
        # ── simulacro ──
        await p.click('#navNext'); await h.esp('step===2'); await p.click('#btnSimNuevo'); await h.esp('S.sim && S.sim.ids.length===18')
        ids = await p.evaluate('S.sim.ids'); corr = {i: (await p.evaluate(f'itemPorId("{i}").c')) for i in ids}
        for n, i in enumerate(ids[:14]):
            o = corr[i] if n < 10 else (corr[i] + 1) % 4
            await p.check(f'#simPreg input[name="s_{i}"][value="{o}"]')
        await axe(h, 'simulacro')
        await p.click('#btnSimCorr'); await h.esp('!!S.sim.corr')
        c, i_, n = 10, 4, 18; esperado = ((c - i_ / 4) / n) * 10
        chk(abs(await p.evaluate('S.sim.corr.nota') - esperado) < 1e-9 and await p.evaluate('S.sim.corr.b') == 4, f'nota del simulacro = fórmula de la guía ({esperado:.4f})')
        chk('((10 − 4 / 4) / 18) · 10' in await p.inner_text('#simRes'), 'se enseña la fórmula con los números')
        await p.fill('#simK', '3'); await p.dispatch_event('#simK', 'change'); chk(abs(await p.evaluate('S.sim.corr.nota') - ((10 - 4 / 3) / 18) * 10) < 1e-9, 'cambiar el nº de opciones recalcula la penalización')
        await p.fill('#calcTest', '4.5'); await p.fill('#calcCaso', '9'); chk('no se suma' in await p.inner_text('#calcRes'), 'calculadora: con test < 5 no suma el caso y avisa de que la guía no lo concreta')
        await p.fill('#calcTest', '6'); chk('6,9' in await p.inner_text('#calcRes'), 'calculadora: 0,7·6 + 0,3·9 = 6,9')
        # ── caso práctico: ejemplo sin clave ──
        await p.click('#navNext'); await h.esp('step===3'); await p.click('#btnCasoEj')
        for l in ['es', 'en', 'pt']:
            await h.idioma(l); await h.esp('S.caso.esEjemplo && S.caso.fb')
            r = await p.evaluate('[S.caso.fb.crit.filter(c=>c.ev).length, S.caso.fb.crit.filter(c=>c.evOk).length, S.caso.def.every(d=>d.ok), S.caso.fb.cod.citas, S.caso.fb.cod.refs]')
            chk(r[0] == r[1] == 6 and r[2] and r[3] == 0 and r[4] == 1, f'ejemplo del caso ({l}): 6/6 evidencias y 4 preguntas verificadas; el código cuenta 0 citas y 1 referencia')
        await h.idioma('es'); await axe(h, 'caso (ejemplo)')
        # ── caso práctico con IA que miente ──
        await p.fill('#casoTxt', CASO); await p.fill('#casoTit', 'Estafas románticas'); n0 = len(h.seen)
        await p.click('#btnFb'); await h.esp("!S.caso.esEjemplo && S.caso.fb && S.caso.fb.crit[1].ev.includes('inventado')")
        fb = await p.evaluate('S.caso.fb')
        chk(len(h.seen) - n0 == 2, 'si la IA pone una nota se le pide repetir sin nota (2 llamadas)')
        chk(fb['crit'][1]['evOk'] is False and fb['crit'][0]['evOk'] is True, 'evidencia inventada por la IA → marcada como no verificada')
        chk(fb['crit'][7]['falta'] is True, 'criterio que la IA no comentó → marcado, no inventado')
        chk(fb['quitadas'] >= 2 and '7/10' not in json.dumps(fb) and 'aprobado' not in json.dumps(fb), 'las frases con nota («7/10», «aprobado») se quitan por código')
        chk(fb['cod']['citas'] == 0 and fb['cod']['refs'] == 2, 'el código cuenta 0 citas en el texto y 2 referencias')
        chk('0 citas en el texto, 2 referencias' in h.seen[-1]['user'], 'el prompt lleva los recuentos del código')
        await p.click('#btnDef'); await h.esp('S.caso.def && S.caso.def.length===2')
        chk(await p.evaluate('S.caso.def.map(d=>d.ok)') == [True, False], 'pregunta de defensa con cita inventada → marcada')
        await p.fill('#dr0', 'Porque reproduce la estafa tradicional en el ciberespacio y el engaño usa las TIC.'); await p.click('#btnValora'); await h.esp('!!S.caso.val')
        chk('sobresaliente' not in json.dumps(await p.evaluate('S.caso.val')), 'comentario a la defensa sin calificación')
        nm = await h.descarga('#btnCasoWord', str(OUT / 'caso.docx')); import docx
        dtxt = '\n'.join(x.text for x in docx.Document(str(OUT / 'caso.docx')).paragraphs)
        chk('C2' in dtxt and 'no verificada' in dtxt and 'Estafas románticas' in dtxt, 'Word del caso: se abre y marca la cita no verificada')
        h.sin_cdn = True; await h.descarga('#btnCasoWord', str(OUT / 'caso2.docx')); h.sin_cdn = False; chk(docx.Document(str(OUT / 'caso2.docx')) is not None, 'Word sin CDN')
        # ── progreso y datos anónimos ──
        await p.click('#navNext'); await h.esp('step===4'); chk('Dominio estimado' in await p.inner_text('#progU'), 'progreso por unidad'); await axe(h, 'progreso')
        chk(await p.is_disabled('#btnAnon'), 'la descarga anónima exige marcar el consentimiento'); await p.check('#anonOk')
        await h.descarga('#btnAnon', str(OUT / 'anon.json')); A = json.loads((OUT / 'anon.json').read_text())
        claves = {k for e in A['ev'] for k in e}; chk(A['formato'] == 'ciberdelincuencia/eventos/1' and claves <= {'i', 'u', 'o', 'c', 'cf', 'd'} and not any(e['i'].startswith('ia-') for e in A['ev']), 'fichero anónimo: solo id, unidad, opción, acierto, seguridad y día relativo')
        chk('alumna' not in (OUT / 'anon.json').read_text() and 'romántic' not in (OUT / 'anon.json').read_text(), 'el fichero anónimo no lleva textos')
        await h.descarga('#btnBackup', str(OUT / 'copia.json'))
        # ── persistencia ──
        nev = await p.evaluate('S.M.ev.length'); await p.reload(); await p.wait_for_timeout(600)
        chk(await p.evaluate('S.M.ev.length') == nev and await p.evaluate('S.caso.fb.crit.length') == 8, 'recargar conserva la práctica y el feedback')
        # ── profesorado ──
        await p.evaluate('go(5)'); await p.click('#btnProfEj'); await h.esp('S.prof.files.length===40')
        t = await p.inner_text('#profTabla'); chk('SIMULADOS' in await p.inner_text('#profInfo'), 'los datos simulados se declaran como tales')
        A2 = await p.evaluate("NU.analitica(S.prof.files, ITEMS).items")
        chk('discrimina_poco' in A2['u3-2']['avisos'] and any(a.startswith('distractor_') for a in A2['u5-2']['avisos']), 'la analítica detecta el ítem al azar (u3-2) y el distractor que nadie elige (u5-2)')
        await axe(h, 'profesorado')
        await p.set_input_files('#impAlu', [str(OUT / 'anon.json'), str(OUT / 'anon.json'), str(OUT / 'copia.json')]); await p.wait_for_timeout(500)
        chk(await p.evaluate('S.prof.files.length') == 1 and not await p.evaluate('S.prof.demo'), 'importar: 1 válido, el repetido y la copia se rechazan (y se retiran los simulados)')
        await h.descarga('#btnXml', str(OUT / 'b.xml')); x = ET.parse(str(OUT / 'b.xml')).getroot()
        chk(len(x.findall("question[@type='multichoice']")) == 36 and len(x.findall("question[@type='category']")) == 9, 'Moodle XML válido: 36 preguntas en 9 categorías')
        await h.descarga('#btnGift', str(OUT / 'b.gift')); chk((OUT / 'b.gift').read_text().count('::u') == 36, 'GIFT con 36 preguntas')
        await h.descarga('#btnCsvBanco', str(OUT / 'b.csv')); raw = (OUT / 'b.csv').read_bytes(); chk(raw.startswith(b'\xef\xbb\xbf') and len(list(csv.reader(io.StringIO(raw.decode('utf-8-sig')), delimiter=';'))) == 37, 'CSV del banco con BOM y ;')
        # ── idiomas ──
        for l, pal in [('en', 'Teacher panel'), ('pt', 'Painel dos docentes'), ('es', 'Panel del profesorado')]:
            await h.idioma(l); chk(pal in await p.inner_text('section[data-step="5"]'), f'idioma {l}: el panel se repinta')
        await h.idioma('en'); await p.evaluate('go(1)'); chk('Why this one' in await p.inner_text('#preg'), 'en: la pregunta y el motivo en inglés')
        await p.evaluate('go(3)'); await p.click('#btnDef'); await p.wait_for_selector('#mEnvio.on'); await p.check('#envioOk'); await p.click('#envioSi'); await h.esp("S.caso.def && S.caso.def.length===2 && !S.caso.esEjemplo")
        chk('English' in h.seen[-1]['user'], 'el prompt pide responder en inglés')
        await p.fill('#casoTxt', CASO + ' 429'); await p.click('#btnFb'); await p.wait_for_timeout(1200)
        est = await p.inner_text('#fbEstado'); chk(est and 'cuota' not in est.lower() and est.strip() != '', f'error 429 legible en inglés: «{est[:70]}»')
        await h.idioma('es')
        await p.reload(); await p.wait_for_timeout(500)
        # ── modelos ──
        for pv in ['openai', 'gemini', 'anthropic']:
            ops = await h.modelos(pv); chk(len(ops) >= 3 and '__otro' in ops and 'whisper-1' not in ops, f'desplegable de modelos ({pv}): {len(ops)-1} modelos')
        await p.keyboard.press('Escape')
        chk(h.errors == [], f'sin errores de página {h.errors[:2]}')
        await p.evaluate('go(0)'); await h.shot(str(OUT / 'portada.png'), full=False)
        for st in [1, 2, 3, 4, 5]: await p.evaluate(f'go({st})'); await h.shot(str(OUT / f'pantalla{st}.png'))
    # ── teclado ──
    async with Harness(IDX, reply) as h:
        p = h.page; await p.focus('#btnStart'); await p.keyboard.press('Enter'); await h.esp('step===1')
        await p.focus('#preg input[name=op]'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Tab'); await p.keyboard.press('Space')
        await p.keyboard.press('Tab'); await p.keyboard.press('Enter'); await h.esp("!!document.querySelector('#btnSig')")
        chk(await p.evaluate('S.M.ev.length') == 1, 'se puede responder solo con teclado (flechas, espacio, Intro)')
        foc = await p.evaluate('document.activeElement.id'); chk(foc == 'btnSig', 'tras responder, el foco va a «Siguiente pregunta»')
    # ── sin red ──
    async with Harness(IDX, reply) as h:
        p = h.page; await h.ctx.set_offline(True); await p.reload(); await p.wait_for_timeout(500)
        await p.click('#btnStart'); await p.check('#preg input[name=op]'); await p.check('#preg input[name=cf][value="dudo"]'); await p.click('#btnResp')
        await p.evaluate('go(2)'); await p.click('#btnSimNuevo'); await p.click('#btnSimCorr'); await p.evaluate('go(4)')
        chk(await p.evaluate('S.M.ev.length') == 1 and await p.evaluate('!!S.sim.corr') and h.errors == [], 'sin conexión: práctica, simulacro y progreso funcionan')
    # ── gama baja: CPU ×4 y móvil ──
    async with Harness(IDX, reply, viewport=(390, 800)) as h:
        cdp = await h.ctx.new_cdp_session(h.page); await cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
        t0 = time.time(); await h.page.reload(); await h.page.wait_for_function("typeof step!=='undefined' && document.querySelector('.screen.on') && document.querySelector('#fichaGuia').textContent.length>50"); dt = time.time() - t0
        chk(dt < 3, f'primera pantalla útil con CPU ×4 en móvil: {dt:.2f} s')
        await h.page.click('#btnStart'); await h.page.wait_for_timeout(300); await h.shot(str(OUT / 'movil_practica.png'))
    # ── móvil sin desborde, en los tres idiomas ──
    async with Harness(IDX, reply) as h:
        for l in ['es', 'en', 'pt']:
            for st in range(6):
                acc = f"setLang('{l}'); aplicaEjemploCaso(); S.sim=null; go({st}); if({st}===2){{document.getElementById('btnSimNuevo').click();}} if({st}===5){{document.getElementById('btnProfEj').click();}}"
                chk(not await h.desborde_movil(acc), f'móvil 390 px sin desborde · {l} · pantalla {st}')
    print(f'\n{ok} comprobaciones superadas')

asyncio.run(main())
