/* Painel do FRB/US no Modo Pesquisa (usa frbus.js, frbus-model.js e frbus-data.js). */
(function () {
'use strict';
const $ = id => document.getElementById(id);
if (!$('fbRun') || !window.FRBUS || !window.FRBUS_MODEL || !window.FRBUS_DATA) return;
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#2b4e86';
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = x => (Number.isFinite(x) ? x.toLocaleString(document.documentElement.lang === 'en' ? 'en-US' : 'pt-BR', { maximumFractionDigits: Math.abs(x) < 1 ? 4 : 3 }) : '—');
let model = null, last = null;

function lineChart(cv, series, labels) {
  const W = cv.clientWidth, H = cv.clientHeight; if (!W) return;
  const dpr = window.devicePixelRatio || 1; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
  const L = 46, R = 8, T = 8, B = 18, pw = W - L - R, ph = H - T - B; let lo = 0, hi = 0;
  series.forEach(s => s.v.forEach(x => { if (Number.isFinite(x)) { lo = Math.min(lo, x); hi = Math.max(hi, x); } }));
  if (hi - lo < 1e-12) { hi = 1e-6; lo = -1e-6; } const pad = (hi - lo) * 0.08; hi += pad; lo -= pad;
  const n = series[0].v.length, X = k => L + pw * k / Math.max(1, n - 1), Y = v => T + ph * (1 - (v - lo) / (hi - lo));
  c.font = '10px "IBM Plex Mono", monospace'; c.fillStyle = css('--muted'); c.strokeStyle = css('--rule'); c.textAlign = 'right'; c.textBaseline = 'middle';
  for (let g = 0; g <= 4; g++) { const v = lo + (hi - lo) * g / 4, y = Y(v); c.beginPath(); c.moveTo(L, y); c.lineTo(W - R, y); c.stroke(); c.fillText(Math.abs(v) < 1e-9 ? '0' : v.toPrecision(2), L - 5, y); }
  c.strokeStyle = css('--muted'); c.beginPath(); c.moveTo(L, Y(0)); c.lineTo(W - R, Y(0)); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'top'; for (let k = 0; k < n; k += 4) c.fillText(labels[k], Math.min(X(k), W - R - 14), H - B + 4);
  series.forEach((s, i) => { c.strokeStyle = css(s.c); c.lineWidth = 2; c.beginPath(); s.v.forEach((v, k) => k ? c.lineTo(X(k), Y(v)) : c.moveTo(X(k), Y(v))); c.stroke(); });
}

function draw() {
  if (!last) return; const box = $('fbCharts'); const names = last.vars;
  box.innerHTML = names.map((v, i) => '<div class="card"><h3><span>' + esc(v) + '</span><span class="num">pico ' + fmt(last.dev[v].reduce((a, b) => Math.abs(b) > Math.abs(a) ? b : a, 0)) + '</span></h3><div class="hint" style="margin:0">' + esc(FRBUS_MODEL.def[v] || '') + '</div><canvas id="fbc' + i + '" style="height:140px"></canvas></div>').join('');
  requestAnimationFrame(() => names.forEach((v, i) => lineChart($('fbc' + i), [{ v: last.dev[v], c: '--s-r' }], last.periods)));
}

function run() {
  const msg = $('fbMsg'); msg.className = 'hint'; msg.textContent = 'Resolvendo…'; $('fbRun').disabled = true;
  setTimeout(() => {
    try {
      if (!model) model = FRBUS.create(FRBUS_MODEL, FRBUS_DATA);
      const sel = $('fbShock').value, v = sel === 'custom' ? $('fbCustom').value.trim().toLowerCase() : sel;
      const size = parseFloat($('fbSize').value), dur = Math.max(1, Math.min(24, parseInt($('fbDur').value, 10) || 1)), hor = Math.max(4, Math.min(28, parseInt($('fbHor').value, 10) || 24));
      if (!v) throw new Error('Digite o nome da variável.'); if (!Number.isFinite(size)) throw new Error('Tamanho inválido.');
      const names = $('fbVars').value.split(/[\s,;]+/).map(s => s.toLowerCase()).filter(Boolean); const bad = names.filter(n => model.endo.indexOf(n) < 0);
      if (bad.length) throw new Error('Variável(is) endógena(s) desconhecida(s): ' + bad.join(', ') + '. Use nomes do FRB/US como rff, lur, xgap2.');
      const t0 = performance.now();
      const r = model.run({ start: '2040Q1', n: hor, override: { dfpdbt: 0, dfpsrp: 1 }, shocks: Array.from({ length: Math.min(dur, hor) }, (_, q) => ({ v, q, d: size })) });
      last = Object.assign(r, { vars: names });
      msg.className = 'hint good'; msg.textContent = 'Resolvido em ' + Math.round(performance.now() - t0) + ' ms (' + r.iterations + ' iterações de Newton, resíduo ' + r.residual.toExponential(1) + '). Choque de ' + fmt(size) + ' em ' + v + ' por ' + Math.min(dur, hor) + ' trimestre(s), a partir de 2040T1.';
      draw();
    } catch (e) { msg.className = 'hint bad'; msg.textContent = 'Erro: ' + e.message; }
    $('fbRun').disabled = false;
  }, 30);
}
$('fbRun').addEventListener('click', run);
window.addEventListener('resize', draw);
window.FRBUSUI = { redraw: draw, run };
})();
