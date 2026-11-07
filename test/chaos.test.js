// Testes do Laboratório do Caos. Uso: node test/chaos.test.js
const assert = require('assert');
const C = require('../chaos.js');
let n = 0, fails = 0;
const t = (name, fn) => { try { fn(); n++; console.log('ok   ' + name); } catch (e) { fails++; console.log('FALHA ' + name + '\n     ' + e.message); } };
const near = (a, b, tol, msg) => assert(Math.abs(a - b) <= tol, (msg || '') + ' esperado ' + b + ', obtido ' + a);
const run = (sim, k, ctrl) => { for (let j = 0; j < k; j++) C.step(sim, ctrl); return sim; };

t('Cagan: com emissão constante, a inflação converge para ln(1+μ) e o saldo real para a demanda de moeda', () => {
  const sim = C.newSim('calmo', { mu: 0.05, i: 0, mode: 'emissao', l: 0.01 }); run(sim, 400);
  const h = sim.hist[sim.hist.length - 1];
  near(h.l, Math.log(1.05), 1e-5, 'inflação'); near(h.m, h.md, 1e-5, 'saldo real = demanda');
});
t('Curva de Laffer da senhoriagem: o pico fica em ℓ = ln(1 + 1/α) (varredura numérica)', () => {
  for (const alpha of [1, 2, 3, 5, 8]) {
    const p = Object.assign(C.PARAMS(), { alpha }), pk = C.lafferPeak(p), pts = C.laffer(p, 4, 4000);
    let best = pts[0]; pts.forEach(q => { if (q.S > best.S) best = q; });
    near(best.l, pk.l, 2e-3, 'α=' + alpha); near(best.S, pk.S, 1e-6, 'S máximo α=' + alpha);
  }
});
t('Cortar zeros é só mudança de unidade: variáveis reais idênticas, nível de preços em unidades originais idêntico', () => {
  const a = C.newSim('cronica'), b = C.newSim('cronica');
  run(a, 8); run(b, 8); C.event(b, 'cutZeros', { k: 3, name: 'Cruzado' });
  run(a, 24); run(b, 24);
  for (let k = 8; k < 32; k++) {
    for (const f of ['l', 'm', 'y', 'S', 'cred', 'b']) near(a.hist[k][f], b.hist[k][f], 1e-9, f + ' em t=' + k);
    near(a.hist[k].lnPTotal, b.hist[k].lnPTotal, 1e-9, 'nível de preços total');
  }
  assert(b.s.zeros === 3 && b.s.cur === 'Cruzado');
});
t('Contabilidade: Δb = b·(1+i)/e^ℓ + d − senhoriagem, todo mês (modo monetizar déficit, sem limites ativos)', () => {
  const sim = C.newSim('cronica', { mode: 'deficit', d: 0.03, i: 0.12 }); run(sim, 60);
  sim.hist.forEach(h => near(h.b, h.bPrev * (1 + h.i) / Math.exp(h.l) + h.d - h.S, 1e-9, 'b em t=' + h.t));
});
t('Monetizar o déficit: acima do pico da Laffer não há estado estacionário (a inflação acelera e a moeda desaba até o piso); abaixo, estabiliza', () => {
  const p = C.PARAMS(), cap = C.lafferPeak(p).S;
  const hi = C.newSim('cronica', { mode: 'deficit', d: cap * 1.2, i: 0, b: 0 }); run(hi, 300);
  assert(hi.hist[39].l > hi.hist[4].l, 'inflação deveria acelerar: ' + hi.hist[4].l + ' → ' + hi.hist[39].l);
  // Limite conhecido: depois que o saldo real chega ao piso (t ≈ 20) a monetização do déficit entra em espiral e a inflação encosta no teto de e^45 ao mês.
  const last = hi.hist[299]; assert(last.l > Math.log(100), 'hiperinflação extrema: ' + last.l); assert(hi.hist[24].m < p.mfloor * 3, 'saldo real no piso por volta de t=25: ' + hi.hist[24].m);
  const lo = C.newSim('cronica', { mode: 'deficit', d: cap * 0.3, i: 0, b: 0 }); run(lo, 200);
  const a = lo.hist[179].l, b = lo.hist[199].l; assert(Math.abs(b - a) < 1e-3 && b < Math.log(2), 'inflação deveria estabilizar: ' + a + ' → ' + b);
});
t('Congelamento: a inflação oficial cai, a escassez e o ágio crescem, e o descongelamento devolve inflação maior que a de antes', () => {
  const sim = C.newSim('cronica', { mu: 0.15, d: 0 }); run(sim, 10); const before = sim.hist[9].l;
  C.event(sim, 'freeze', { months: 10, rigor: 1 }); run(sim, 10);
  const during = sim.hist.slice(10, 20);
  assert(before > 0.05, 'antes do congelamento a inflação era ' + before);
  during.forEach(h => assert(h.l <= before * 0.2, 'inflação oficial durante o congelamento ' + h.l));
  assert(during[9].shortage > during[0].shortage && during[9].agio > during[0].agio, 'escassez e ágio crescem');
  assert(during[9].shortage > 0.3, 'escassez relevante: ' + during[9].shortage);
  run(sim, 6); const after = Math.max(...sim.hist.slice(20, 26).map(h => h.l)); assert(after > before, 'rebote ' + after + ' vs antes ' + before);
});
t('Âncora cambial: emissão acima da demanda drena reservas até romper; emissão compatível mantém a âncora', () => {
  const bad = C.newSim('cronica', { mu: 1.0, d: 0.02 }); C.event(bad, 'peg', { crawl: 0.003, reserves: 2 }); run(bad, 60);
  assert(bad.log.some(e => /rompeu/.test(e.text)), 'a âncora deveria romper'); assert(bad.hist.every(h => h.R >= 0), 'reservas negativas');
  const ok = C.newSim('calmo', { mu: 0.003, i: 0.01, d: 0 }); C.event(ok, 'peg', { crawl: 0.003, reserves: 3 }); run(ok, 60);
  assert(!ok.log.some(e => /rompeu/.test(e.text)) && ok.s.peg.on, 'a âncora deveria se manter');
});
t('Confisco: derruba a base na hora e devolve em 18 parcelas', () => {
  const sim = C.newSim('cronica'); run(sim, 5); const M0 = Math.exp(sim.s.lnM); C.event(sim, 'confiscate', { share: 0.8 });
  near(Math.exp(sim.s.lnM) / M0, 0.2, 1e-9); assert(sim.s.blocked.left === 18);
  run(sim, 18, { mode: 'emissao', mu: 0 }); assert(sim.s.blocked.left === 0);
});
t('URV: depois do prazo converte na nova moeda (zeros cortados) e liga a âncora cambial', () => {
  const sim = C.newSim('cronica', { d: 0.0, mu: 0.1 }); run(sim, 3); C.event(sim, 'urv', { months: 3, k: 3, name: 'Real' }); run(sim, 4);
  assert(sim.s.zeros === 3 && sim.s.cur === 'Real' && sim.s.peg.on, 'conversão: zeros=' + sim.s.zeros + ' moeda=' + sim.s.cur + ' âncora=' + sim.s.peg.on);
});
t('Valores absurdos (juros de 100.000.000% ao mês, emissão de 10^5, déficit enorme, todos os eventos): nada vira NaN ou Infinity', () => {
  for (const key of Object.keys(C.PRESETS)) for (const ctrl of [{ i: 1e6, mu: 1e5, d: 40, mode: 'emissao' }, { i: 1e6, mu: 0, d: 40, mode: 'deficit' }, { i: 0, mu: 0.9, d: -5, mode: 'emissao' }]) {
    const sim = C.newSim(key); C.event(sim, 'helicopter', { share: 1e5 }); run(sim, 30, ctrl);
    C.event(sim, 'freeze', { months: 5, rigor: 1 }); C.event(sim, 'confiscate', { share: 0.99 }); C.event(sim, 'peg', { crawl: 5, reserves: 0.1 }); run(sim, 30, ctrl);
    C.event(sim, 'cutZeros', { k: 12, name: 'X' }); C.event(sim, 'urv', { months: 2 }); run(sim, 120, ctrl);
    sim.hist.forEach(h => { for (const f of ['l', 'pct', 'lnPTotal', 'm', 'S', 'y', 'R', 'cred', 'b', 'lnE', 'rReal', 'tax', 'md']) assert(Number.isFinite(h[f]), key + ' ' + f + ' = ' + h[f] + ' em t=' + h.t); });
  }
});
t('Dolarização forçada: paga com reservas, derruba a inflação e a senhoriagem, e o déficit passa a engordar a dívida', () => {
  const sim = C.newSim('hiper', { mode: 'deficit', d: 0.04, i: 0.05, mu: 0.4, R: 3 }); run(sim, 6); const R0 = sim.s.R, lBefore = sim.hist[5].l, bBefore = sim.hist[5].b;
  C.event(sim, 'dollarize', { share: 0.95 }); assert(sim.s.dforced > 0.94 && sim.s.R < R0, 'reservas pagas: ' + R0 + ' → ' + sim.s.R);
  run(sim, 36); const h = sim.hist[sim.hist.length - 1];
  assert(h.l < lBefore * 0.1, 'inflação cai: ' + lBefore + ' → ' + h.l); assert(Math.abs(h.S) < 0.01, 'senhoriagem some: ' + h.S); assert(h.b > bBefore, 'dívida cresce: ' + bBefore + ' → ' + h.b);
});
t('Dolarização com reservas insuficientes: converte só o que dá e avisa', () => {
  const sim = C.newSim('hiper', { R: 0.001 }); run(sim, 3); C.event(sim, 'dollarize', { share: 0.95 });
  assert(sim.s.dforced < 0.5, 'conversão parcial: ' + sim.s.dforced); assert(sim.log.some(e => /insuficientes/.test(e.text)), 'aviso de reservas');
});
t('Indicador lúdico: S″ e ℓ″ (segundas diferenças) são calculados e comparados', () => {
  const sim = C.newSim('cronica'); run(sim, 6); const h = sim.hist[5];
  assert(Number.isFinite(h.S2) && Number.isFinite(h.l2) && typeof h.okLaffer === 'boolean');
  near(h.S2, sim.hist[5].S - 2 * sim.hist[4].S + sim.hist[3].S, 1e-12); near(h.l2, sim.hist[5].l - 2 * sim.hist[4].l + sim.hist[3].l, 1e-12);
});

console.log('\n' + n + ' testes ok, ' + fails + ' falhas');
process.exit(fails ? 1 : 0);
