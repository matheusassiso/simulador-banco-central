/* Interface do Laboratório do Caos (usa chaos.js). */
(function () {
'use strict';
const $ = id => document.getElementById(id);
if (!$('cxStep') || !window.CHAOS) return;
const C = CHAOS;
const loc = () => (document.documentElement.lang === 'en' ? 'en-US' : 'pt-BR');
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#2b4e86';
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const num = (id, d) => { const v = parseFloat($(id).value); return Number.isFinite(v) ? v : d; };
const big = x => { // número legível de 0,001 até 10^300
  if (!Number.isFinite(x)) return '—'; const a = Math.abs(x);
  if (a >= 1e6 || (a > 0 && a < 1e-3)) return x.toExponential(2).replace('.', loc() === 'pt-BR' ? ',' : '.');
  return x.toLocaleString(loc(), { maximumFractionDigits: a < 10 ? 2 : a < 1000 ? 1 : 0 });
};
let sim = null, timer = null, key = 'cronica', okRun = 0;

Object.keys(C.PRESETS).forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = C.PRESETS[k].name; $('cxPreset').appendChild(o); });

const ctrl = () => ({ i: num('cxI', 0) / 100, d: num('cxD', 0) / 100, mu: num('cxMu', 0) / 100, mode: $('cxMode').value });
function start(k) {
  key = k; sim = C.newSim(k); okRun = 0; stopAuto();
  const c = sim.ctrl; $('cxI').value = +(c.i * 100).toPrecision(6); $('cxD').value = +(c.d * 100).toPrecision(6); $('cxMu').value = +(c.mu * 100).toPrecision(6); $('cxMode').value = c.mode;
  $('cxPreset').value = k; render();
}
function step(n) {
  for (let j = 0; j < n; j++) { const r = C.step(sim, ctrl()); okRun = r.okLaffer ? okRun + 1 : 0; }
  render();
}
const startAuto = () => { if (timer) return; timer = setInterval(() => step(1), 350); $('cxAuto').textContent = '❚❚ Pausar'; };
function stopAuto() { if (timer) { clearInterval(timer); timer = null; } $('cxAuto').textContent = '▶ Automático'; }

/* ---------- gráficos ---------- */
function chart(id, series, o) {
  o = o || {}; const cv = $(id); if (!cv) return; const W = cv.clientWidth, H = cv.clientHeight; if (!W) return;
  const dpr = window.devicePixelRatio || 1; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
  const L = 50, R = 8, T = 8, B = 18, pw = W - L - R, ph = H - T - B;
  let lo = o.zero ? 0 : Infinity, hi = o.zero ? 0 : -Infinity, x0 = Infinity, x1 = -Infinity;
  series.forEach(s => s.y.forEach((v, k) => { if (Number.isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); const x = s.x ? s.x[k] : k; x0 = Math.min(x0, x); x1 = Math.max(x1, x); } }));
  if (!Number.isFinite(lo)) { lo = 0; hi = 1; x0 = 0; x1 = 1; }
  if (hi - lo < 1e-12) { hi = lo + 1; } if (x1 - x0 < 1e-12) x1 = x0 + 1;
  const pad = (hi - lo) * 0.08; hi += pad; if (!o.zero || lo < 0) lo -= pad;
  const X = x => L + pw * (x - x0) / (x1 - x0), Y = v => T + ph * (1 - (v - lo) / (hi - lo));
  c.font = '10px "IBM Plex Mono", monospace'; c.fillStyle = css('--muted'); c.strokeStyle = css('--rule'); c.textAlign = 'right'; c.textBaseline = 'middle';
  for (let g = 0; g <= 4; g++) { const v = lo + (hi - lo) * g / 4, y = Y(v); c.beginPath(); c.moveTo(L, y); c.lineTo(W - R, y); c.stroke(); c.fillText(o.fmtY ? o.fmtY(v) : big(v), L - 5, y); }
  c.textAlign = 'center'; c.textBaseline = 'top';
  for (let g = 0; g <= 4; g++) { const x = x0 + (x1 - x0) * g / 4; c.fillText(o.fmtX ? o.fmtX(x) : String(Math.round(x)), X(x), H - B + 4); }
  series.forEach(s => {
    c.strokeStyle = c.fillStyle = css(s.c || '--s-r'); c.lineWidth = 2; c.setLineDash(s.dash ? [4, 3] : []);
    if (s.dots) { s.y.forEach((v, k) => { if (Number.isFinite(v)) { c.globalAlpha = 0.35 + 0.65 * k / s.y.length; c.beginPath(); c.arc(X(s.x ? s.x[k] : k), Y(v), 2.6, 0, 7); c.fill(); } }); c.globalAlpha = 1; return; }
    c.beginPath(); let on = false; s.y.forEach((v, k) => { if (!Number.isFinite(v)) { on = false; return; } const x = X(s.x ? s.x[k] : k), y = Y(v); if (on) c.lineTo(x, y); else { c.moveTo(x, y); on = true; } }); c.stroke(); c.setLineDash([]);
  });
}
const pow10Pct = v => big((Math.pow(10, v) - 1)) + '%';

function render() {
  const h = sim.hist, s = sim.s, last = h[h.length - 1];
  const g = f => h.map(r => r[f]);
  chart('cxC1', [{ y: g('lnPTotal').map(v => v / Math.LN10), c: '--s-inf' }], { fmtY: v => '10^' + (Math.abs(v) < 100 ? v.toFixed(1) : v.toFixed(0)) });
  chart('cxC2', [{ y: g('pct').map(v => Math.log10(1 + v * 100)), c: '--s-inf' }], { zero: true, fmtY: pow10Pct });
  chart('cxC3', [{ y: g('m').map(v => Math.log10(Math.max(v, 1e-12))), c: '--s-u' }, { y: g('md').map(v => Math.log10(Math.max(v, 1e-12))), c: '--s-ref', dash: 1 }], { fmtY: v => '10^' + v.toFixed(1) });
  chart('cxC4', [{ y: g('S'), c: '--s-r' }, { y: g('y'), c: '--s-u' }], { zero: true });
  const laf = C.laffer(sim.p, 3, 120);
  chart('cxC5', [{ x: laf.map(p => p.l * 100), y: laf.map(p => p.S), c: '--s-4' }, { x: h.map(r => Math.min(300, r.l * 100)), y: h.map(r => r.S), c: '--s-inf', dots: 1 }], { zero: true, fmtX: x => Math.round(x) + '%' });
  chart('cxC6', [{ y: g('S2').map(v => v * 100), c: '--s-r' }, { y: g('l2'), c: '--s-inf' }], { zero: true });
  const pk = C.lafferPeak(sim.p); $('cxLafLbl').textContent = 'pico: ' + big((Math.exp(pk.l) - 1) * 100) + '% ao mês, ' + big(pk.S) + ' mês de PIB';
  $('cxS2Lbl').textContent = last ? (last.okLaffer ? 'S″ > ℓ″ há ' + okRun + ' mês(es)' : 'S″ ≤ ℓ″: a senhoriagem não acompanha a aceleração') : 'S″ contra ℓ″';
  const l = last ? last.l : s.l, pct = Math.exp(l) - 1, ann = Math.exp(Math.min(700, 12 * l)) - 1;
  const cell = (lab, val, cls) => '<div class="cell"><span class="label">' + lab + '</span><span class="v ' + (cls || '') + '" style="font-size:1rem">' + val + '</span></div>';
  $('cxStats').innerHTML = cell('Moeda', esc(s.cur) + (s.zeros ? ' (−' + s.zeros + ' zeros)' : ''))
    + cell('Mês', String(s.t)) + cell('Inflação ao mês', big(pct * 100) + '%', pct > 0.5 ? 'bad' : pct > 0.05 ? 'warn' : 'good') + cell('Inflação anualizada', big(ann * 100) + '%')
    + cell('Saldo real (% do normal)', last ? big(100 * last.m / sim.p.m0) + '%' : '—') + cell('Senhoriagem (% do PIB mensal)', last ? big(last.S * 100) + '%' : '—')
    + cell('Credibilidade', Math.round(s.cred * 100) + '%') + cell('Reservas (meses de PIB)', big(s.R)) + cell('Produto', Math.round(s.y * 100) + '% do normal', s.y < 0.7 ? 'bad' : '')
    + cell('Dolarização das transações', last ? Math.round(last.D * 100) + '%' + (s.dforced ? ' (forçada ' + Math.round(s.dforced * 100) + '%)' : '') : '0%')
    + cell('Escassez · ágio', Math.round(s.shortage * 100) + '% · ' + big(s.agio * 100) + '%') + cell('Dívida (meses de PIB)', big(s.b))
    + cell('Regime', (s.freeze.on ? 'congelado' : 'preços livres') + (s.peg.on ? ' · âncora cambial' : '') + (s.urv.on ? ' · URV' : ''));
  $('cxLog').innerHTML = sim.log.slice(-40).reverse().map(e => '<li class="' + esc(e.kind) + '"><time>mês ' + e.t + '</time><span>' + esc(e.text) + '</span></li>').join('') || '<li><time>—</time><span>Escolha a política e avance os meses.</span></li>';
}

const ev = (name, arg) => () => { C.event(sim, name, arg()); render(); };
$('cxPreset').addEventListener('change', () => start($('cxPreset').value));
$('cxNew').addEventListener('click', () => start(key));
$('cxStep').addEventListener('click', () => step(1));
$('cxStep12').addEventListener('click', () => step(12));
$('cxAuto').addEventListener('click', () => (timer ? stopAuto() : startAuto()));
$('cxFreeze').addEventListener('click', ev('freeze', () => ({ months: num('cxFzM', 12), rigor: num('cxFzR', 95) / 100 })));
$('cxUnfreeze').addEventListener('click', ev('unfreeze', () => ({})));
$('cxCut').addEventListener('click', ev('cutZeros', () => ({ k: num('cxZk', 3), name: $('cxZn').value.trim() || 'Nova moeda' })));
$('cxConf').addEventListener('click', ev('confiscate', () => ({ share: num('cxBl', 80) / 100 })));
$('cxHeli').addEventListener('click', ev('helicopter', () => ({ share: num('cxHe', 50) / 100 })));
$('cxUrv').addEventListener('click', ev('urv', () => ({ months: num('cxUm', 4), k: 3, name: 'Real' })));
$('cxPeg').addEventListener('click', ev('peg', () => ({ crawl: num('cxPc', 0.3) / 100 })));
$('cxUnpeg').addEventListener('click', ev('unpeg', () => ({})));
$('cxDollar').addEventListener('click', ev('dollarize', () => ({ share: num('cxDz', 95) / 100 })));
$('cxUndollar').addEventListener('click', ev('undollarize', () => ({})));
window.addEventListener('resize', () => render());

start('cronica');
window.CHAOSUI = { redraw: render, sim: () => sim };
})();
