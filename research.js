/* Painel "Pesquisa": editor de modelo DSGE linear, parâmetros, funções de impulso-resposta e comparação de regimes. */
(function () {
'use strict';
const $ = id => document.getElementById(id);
if (!$('dsgeRun') || !window.DSGE || !window.DSGE_MODELS) return;
const D = DSGE, MD = DSGE_MODELS, MODELS = MD.MODELS;
const COLORS = ['--s-r', '--s-u', '--s-inf', '--s-4'];
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (x, d) => (isFinite(x) ? x.toLocaleString(document.documentElement.lang === 'en' ? 'en-US' : 'pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—');
let over = {}, curKey = 'nk3';

const sel = $('dsgeModel');
Object.keys(MODELS).forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = MODELS[k].name; sel.appendChild(o); });
const oc = document.createElement('option'); oc.value = 'custom'; oc.textContent = 'Personalizado (edite o texto)'; sel.appendChild(oc);

function msg(t, ok) { const m = $('dsgeMsg'); m.textContent = t; m.className = 'hint ' + (ok ? 'good' : 'bad'); }
function color(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#2b4e86'; }

function lineChart(cv, series, T) {
  const W = cv.clientWidth, H = cv.clientHeight; if (!W) return;
  const dpr = window.devicePixelRatio || 1; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
  const L = 44, R = 8, Tp = 8, B = 18, pw = W - L - R, ph = H - Tp - B;
  let lo = 0, hi = 0; series.forEach(s => s.v.forEach(x => { if (isFinite(x)) { lo = Math.min(lo, x); hi = Math.max(hi, x); } }));
  if (hi - lo < 1e-12) { hi = 1e-6; lo = -1e-6; }
  const pad = (hi - lo) * 0.08; hi += pad; lo -= pad;
  const X = k => L + pw * k / (T - 1), Y = v => Tp + ph * (1 - (v - lo) / (hi - lo));
  c.font = '10px "IBM Plex Mono", monospace'; c.fillStyle = color('--muted'); c.strokeStyle = color('--rule'); c.textAlign = 'right'; c.textBaseline = 'middle';
  for (let g = 0; g <= 4; g++) { const v = lo + (hi - lo) * g / 4, y = Y(v); c.beginPath(); c.moveTo(L, y); c.lineTo(W - R, y); c.stroke(); c.fillText(Math.abs(v) < 1e-9 ? '0' : v.toPrecision(2), L - 5, y); }
  c.strokeStyle = color('--muted'); c.beginPath(); c.moveTo(L, Y(0)); c.lineTo(W - R, Y(0)); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'top';
  for (let k = 0; k < T; k += 4) c.fillText(String(k), X(k), H - B + 4);
  series.forEach((s, i) => { c.strokeStyle = color(COLORS[i % 4]); c.lineWidth = 2; c.setLineDash(i > 1 ? [4, 3] : []); c.beginPath();
    s.v.forEach((v, k) => k ? c.lineTo(X(k), Y(v)) : c.moveTo(X(k), Y(v))); c.stroke(); c.setLineDash([]); });
}

function paramsUI(m, nm) {
  const box = $('dsgeParams'); box.innerHTML = '';
  m.params.forEach(p => {
    const w = document.createElement('label'); w.className = 'dsge-par';
    const v = over[p] !== undefined ? over[p] : nm[p];
    w.innerHTML = '<span>' + esc(p) + '</span><input type="number" step="any" value="' + (isFinite(v) ? +(+v).toPrecision(6) : '') + '" data-p="' + esc(p) + '">';
    box.appendChild(w);
  });
  box.querySelectorAll('input').forEach(i => i.addEventListener('change', () => { const x = parseFloat(i.value); if (isFinite(x)) over[i.dataset.p] = x; run(false); }));
}

function run(rebuild) {
  let m;
  try { m = D.parse($('dsgeText').value); } catch (e) { msg('Modelo inválido: ' + e.message, false); return; }
  let sol; try { sol = D.solve(m, over); } catch (e) { msg('Erro: ' + e.message, false); return; }
  if (rebuild) paramsUI(m, sol.lin ? sol.lin.names : {});
  const shocks = m.exo, cur = $('dsgeShock').value;
  $('dsgeShock').innerHTML = shocks.map(s => '<option value="' + esc(s) + '">' + esc(s) + '</option>').join('');
  if (shocks.indexOf(cur) >= 0) $('dsgeShock').value = cur;
  msg(sol.message + (sol.iter ? '  ·  doubling: ' + sol.iter + ' iterações, resíduo ' + sol.residual.toExponential(1) + '.' : ''), sol.determinate);
  const charts = $('dsgeCharts'), mom = $('dsgeMom');
  if (!sol.ok || !shocks.length) { charts.innerHTML = ''; mom.innerHTML = ''; return; }
  const shock = $('dsgeShock').value || shocks[0], T = 24;
  const meta = curKey !== 'custom' && MODELS[curKey] ? MODELS[curKey] : null;
  const show = meta ? meta.show.filter(v => m.vars.indexOf(v) >= 0) : m.vars.slice(0, 6);
  const unit = $('dsgeSize').value === 'sd' ? sol.lin.sd[shock] : 1;
  let sets;
  if ($('dsgeCmp').checked && /^gm_/.test(curKey)) {
    sets = Object.keys(MD.GM_POLICY).map(p => {
      const mm = D.parse(MD.gm(p)), ss = D.solve(mm, over);
      return { name: MD.GM_POLICY[p].title, ok: ss.ok, ir: ss.ok ? D.irf(ss, shock, T, unit) : null, det: ss.determinate };
    });
  } else sets = [{ name: 'Modelo', ok: true, ir: D.irf(sol, shock, T, unit), det: sol.determinate }];
  const K = $('dsgeSize').value === 'sd' ? 100 : 1; // choque de 1 desvio-padrão: mostra em % (×100)
  sets.forEach(s => { if (s.ok) Object.keys(s.ir).forEach(k => { s.ir[k] = s.ir[k].map(z => z * K); }); });
  $('dsgeUnit').textContent = '24 trimestres · ' + (K === 100 ? 'em % (×100)' : 'unidades do modelo');
  charts.innerHTML = show.map((v, i) => '<div class="card"><h3><span>' + esc(v) + '</span><span class="num">pico ' + fmt(sets.filter(s => s.ok).map(s => s.ir[v].reduce((a, b) => Math.abs(b) > Math.abs(a) ? b : a, 0)).reduce((a, b) => Math.abs(b) > Math.abs(a) ? b : a, 0), 3) + '</span></h3><canvas id="dc' + i + '" style="height:150px"></canvas></div>').join('')
    + (sets.length > 1 ? '<div class="legend" style="grid-column:1/-1">' + sets.map((s, i) => '<span style="color:var(' + COLORS[i % 4] + ')"><i' + (i > 1 ? ' class="d"' : '') + '></i>' + esc(s.name) + (s.ok ? '' : ' (sem solução)') + '</span>').join('') + '</div>' : '');
  requestAnimationFrame(() => show.forEach((v, i) => lineChart($('dc' + i), sets.filter(s => s.ok).map(s => ({ name: s.name, v: s.ir[v] })), T)));
  const mo = D.moments(sol);
  mom.innerHTML = mo.nonStationary ? '<tr><td colspan="3" style="text-align:left;color:var(--muted)">Há raiz unitária: variância infinita, sem momentos teóricos.</td></tr>'
    : m.vars.map(v => '<tr><td>' + esc(v) + '</td><td>' + fmt(mo.byVar[v].sd, 5) + '</td><td>' + fmt(mo.byVar[v].ac1, 3) + '</td></tr>').join('');
}

sel.addEventListener('change', () => {
  curKey = sel.value;
  if (curKey !== 'custom') { $('dsgeText').value = MODELS[curKey].text.trim() + '\n'; over = {}; }
  $('dsgeCmp').disabled = !/^gm_/.test(curKey); if ($('dsgeCmp').disabled) $('dsgeCmp').checked = false;
  run(true);
});
$('dsgeRun').addEventListener('click', () => { curKey = 'custom'; sel.value = 'custom'; $('dsgeCmp').disabled = true; $('dsgeCmp').checked = false; over = {}; run(true); });
['dsgeShock', 'dsgeSize', 'dsgeCmp'].forEach(id => $(id).addEventListener('change', () => run(false)));
window.addEventListener('resize', () => run(false));
$('dsgeText').value = MODELS.nk3.text.trim() + '\n'; sel.value = 'nk3'; $('dsgeCmp').disabled = true;
run(true);
window.BCRESEARCH = { redraw: () => run(false) };
})();
