/* Painel "Pesquisa": editor de modelo DSGE linear, parâmetros, IRFs, regimes de política, perda de bem-estar,
   limite zero, desafio contra a política ótima e dados reais do BCB. */
(function () {
'use strict';
const $ = id => document.getElementById(id);
if (!$('dsgeRun') || !window.DSGE || !window.DSGE_MODELS) return;
const D = DSGE, MD = DSGE_MODELS, MODELS = MD.MODELS, CALIB = MD.CALIB;
const COLORS = ['--s-r', '--s-u', '--s-inf', '--s-4'];
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (x, d) => (isFinite(x) ? x.toLocaleString(document.documentElement.lang === 'en' ? 'en-US' : 'pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—');
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#2b4e86';
let over = {}, curKey = 'nk3';

/* ---------- gráfico de linhas ---------- */
function lineChart(cv, series, T, ticks) {
  if (!cv) return; const W = cv.clientWidth, H = cv.clientHeight; if (!W) return;
  const dpr = window.devicePixelRatio || 1; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
  const L = 40, R = 8, Tp = 8, B = 18, pw = W - L - R, ph = H - Tp - B;
  let lo = 0, hi = 0; series.forEach(s => s.v.forEach(x => { if (isFinite(x)) { lo = Math.min(lo, x); hi = Math.max(hi, x); } }));
  if (hi - lo < 1e-12) { hi = 1e-6; lo = -1e-6; }
  const pad = (hi - lo) * 0.08; hi += pad; lo -= pad;
  const X = k => L + pw * k / Math.max(1, T - 1), Y = v => Tp + ph * (1 - (v - lo) / (hi - lo));
  c.font = '10px "IBM Plex Mono", monospace'; c.fillStyle = css('--muted'); c.strokeStyle = css('--rule'); c.textAlign = 'right'; c.textBaseline = 'middle';
  for (let g = 0; g <= 4; g++) { const v = lo + (hi - lo) * g / 4, y = Y(v); c.beginPath(); c.moveTo(L, y); c.lineTo(W - R, y); c.stroke(); c.fillText(Math.abs(v) < 1e-9 ? '0' : v.toPrecision(2), L - 5, y); }
  c.strokeStyle = css('--muted'); c.beginPath(); c.moveTo(L, Y(0)); c.lineTo(W - R, Y(0)); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'top';
  (ticks || Array.from({ length: Math.ceil(T / 4) }, (_, i) => ({ k: i * 4, label: String(i * 4) }))).forEach(t => c.fillText(t.label, X(t.k), H - B + 4));
  series.forEach((s, i) => {
    c.strokeStyle = css(s.c || COLORS[i % 4]); c.lineWidth = 2; c.setLineDash(s.dash ? [4, 3] : []); c.beginPath(); let on = false;
    s.v.forEach((v, k) => { if (!isFinite(v)) { on = false; return; } if (on) c.lineTo(X(k), Y(v)); else { c.moveTo(X(k), Y(v)); on = true; } });
    c.stroke(); c.setLineDash([]);
  });
}

/* ---------- editor, parâmetros e IRFs ---------- */
const sel = $('dsgeModel');
Object.keys(MODELS).forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = MODELS[k].name; sel.appendChild(o); });
const oc = document.createElement('option'); oc.value = 'custom'; oc.textContent = 'Personalizado (edite o texto)'; sel.appendChild(oc);
Object.keys(CALIB).forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = 'Calibração: ' + CALIB[k].name; $('dsgeCalib').appendChild(o); });

function msg(t, ok) { const m = $('dsgeMsg'); m.textContent = t; m.className = 'hint ' + (ok ? 'good' : 'bad'); }
function paramsUI(m, nm) {
  const box = $('dsgeParams'); box.innerHTML = '';
  m.params.forEach(p => {
    const w = document.createElement('label'); w.className = 'dsge-par';
    w.innerHTML = '<span>' + esc(p) + '</span><input type="number" step="any" value="' + (isFinite(nm[p]) ? +(+nm[p]).toPrecision(6) : '') + '" data-p="' + esc(p) + '">';
    box.appendChild(w);
  });
  box.querySelectorAll('input').forEach(i => i.addEventListener('change', () => { const x = parseFloat(i.value); if (isFinite(x)) over[i.dataset.p] = x; run(false); }));
}
const slice = (path, T) => Object.fromEntries(Object.keys(path).map(k => [k, path[k].slice(0, T)]));

function run(rebuild) {
  let m; try { m = D.parse($('dsgeText').value); } catch (e) { msg('Modelo inválido: ' + e.message, false); return; }
  const meta = curKey !== 'custom' ? MODELS[curKey] : null, cal = !!(meta && meta.calib);
  $('dsgeCalib').hidden = !cal; $('dsgeCalibNote').hidden = !cal;
  const cOver = {}; if (cal) { const c = CALIB[$('dsgeCalib').value] || CALIB.paper; Object.keys(c.over).forEach(k => { if (m.params.indexOf(k) >= 0) cOver[k] = c.over[k]; }); $('dsgeCalibNote').textContent = c.note; }
  const eff = Object.assign({}, cOver, over);
  let sol; try { sol = D.solve(m, eff); } catch (e) { msg('Erro: ' + e.message, false); return; }
  if (rebuild) paramsUI(m, sol.lin ? sol.lin.names : {});
  const shocks = m.exo, cur = $('dsgeShock').value;
  $('dsgeShock').innerHTML = shocks.map(s => '<option value="' + esc(s) + '">' + esc(s) + '</option>').join('');
  if (shocks.indexOf(cur) >= 0) $('dsgeShock').value = cur;
  const charts = $('dsgeCharts'), mom = $('dsgeMom'), lossWrap = $('dsgeLossWrap');
  lossWrap.hidden = true;
  if (!sol.ok || !shocks.length) { msg(sol.message, false); charts.innerHTML = ''; mom.innerHTML = ''; return; }
  const shock = $('dsgeShock').value || shocks[0], T = 24, mult = parseFloat($('dsgeMult').value); const size = (isFinite(mult) ? mult : 1) * sol.lin.sd[shock];
  const show = (meta ? meta.show : m.vars.slice(0, 6)).filter(v => m.vars.indexOf(v) >= 0);
  let sets, note = '';
  if (meta && meta.zlb) {
    const r = D.occbin(m, D.parse(meta.floorText), eff, shock, size, { floor: -sol.lin.names.iss });
    note = '  ·  ' + r.message;
    sets = [r.path ? { name: 'Com piso do juro em 0%', ir: slice(r.path, T) } : null, r.linear ? { name: 'Sem piso (linear)', ir: slice(r.linear, T) } : null].filter(Boolean);
  } else if ($('dsgeCmp').checked && meta && meta.group) {
    sets = meta.group.map(k => { const mm = D.parse(MODELS[k].text), ss = D.solve(mm, eff); return { name: MODELS[k].name, sol: ss, ir: ss.ok ? D.irf(ss, shock, T, size) : null }; }).filter(s => s.ir);
    if (meta.loss) {
      const rows = sets.map(s => { const w = {}; Object.keys(meta.loss).forEach(k => { const v = meta.loss[k]; w[k] = typeof v === 'string' ? s.sol.lin.names[v] : v; }); return { name: s.name, L: D.loss(s.sol, w) }; });
      const best = Math.min(...rows.map(r => r.L));
      $('dsgeLoss').innerHTML = rows.map(r => '<tr><td style="white-space:normal">' + esc(r.name) + '</td><td>' + fmt(r.L * 1e4, 3) + '</td><td>' + fmt(r.L / best, 2) + '×</td></tr>').join('');
      lossWrap.hidden = false;
    }
  } else sets = [{ name: 'Modelo', ir: D.irf(sol, shock, T, size) }];
  msg(sol.message + (sol.iter ? '  ·  doubling: ' + sol.iter + ' iterações, resíduo ' + sol.residual.toExponential(1) + '.' : '') + note, sol.determinate);
  const K = 100; // mostra em % (×100)
  sets.forEach(s => { Object.keys(s.ir).forEach(k => { s.ir[k] = s.ir[k].map(z => z * K); }); });
  $('dsgeUnit').textContent = '24 trimestres · em % (×100) · choque de ' + fmt(isFinite(mult) ? mult : 1, 1) + ' desvio(s)-padrão';
  const peak = v => sets.map(s => s.ir[v].reduce((a, b) => Math.abs(b) > Math.abs(a) ? b : a, 0)).reduce((a, b) => Math.abs(b) > Math.abs(a) ? b : a, 0);
  charts.innerHTML = show.map((v, i) => '<div class="card"><h3><span>' + esc(v) + '</span><span class="num">pico ' + fmt(peak(v), 3) + '</span></h3><canvas id="dc' + i + '" style="height:150px"></canvas></div>').join('')
    + (sets.length > 1 ? '<div class="legend" style="grid-column:1/-1">' + sets.map((s, i) => '<span style="color:var(' + COLORS[i % 4] + ')"><i' + (i > 1 ? ' class="d"' : '') + '></i>' + esc(s.name) + '</span>').join('') + '</div>' : '');
  requestAnimationFrame(() => show.forEach((v, i) => lineChart($('dc' + i), sets.map((s, j) => ({ v: s.ir[v], dash: j > 1 })), T)));
  const mo = D.moments(sol);
  mom.innerHTML = mo.nonStationary ? '<tr><td colspan="3" style="text-align:left;color:var(--muted)">Há raiz unitária: variância infinita, sem momentos teóricos.</td></tr>'
    : m.vars.map(v => '<tr><td>' + esc(v) + '</td><td>' + fmt(mo.byVar[v].sd, 5) + '</td><td>' + fmt(mo.byVar[v].ac1, 3) + '</td></tr>').join('');
}

function pick(key) {
  curKey = key; sel.value = key;
  if (key !== 'custom') { $('dsgeText').value = MODELS[key].text.trim() + '\n'; over = {}; }
  const meta = key !== 'custom' ? MODELS[key] : null;
  $('dsgeCmp').disabled = !(meta && meta.group); if ($('dsgeCmp').disabled) $('dsgeCmp').checked = false;
  $('dsgeMult').value = meta && meta.zlb ? -3 : 1;
  run(true);
}
sel.addEventListener('change', () => pick(sel.value));
$('dsgeCalib').addEventListener('change', () => { over = {}; run(true); });
$('dsgeRun').addEventListener('click', () => { curKey = 'custom'; sel.value = 'custom'; $('dsgeCmp').disabled = true; $('dsgeCmp').checked = false; over = {}; run(true); });
['dsgeShock', 'dsgeMult', 'dsgeCmp'].forEach(id => $(id).addEventListener('change', () => run(false)));

/* ---------- desafio: você contra a política ótima ---------- */
const CH = { T: 20, t: 0 };
const gauss = () => { let u = 0; while (!u) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random()); };
function chInit() {
  const S = k => D.solve(D.parse(MD.HIDDEN[k]));
  CH.P = S('ch_player'); CH.B = { taylor: S('ch_taylor'), discr: S('ch_discr'), commit: S('ch_commit') };
  const sd = CH.P.lin.sd, n = CH.P.vars.length; CH.alpha = CH.P.lin.names.alpha;
  CH.shk = Array.from({ length: CH.T }, () => [gauss() * sd.eu, gauss() * sd.en]);
  CH.bench = {}; Object.keys(CH.B).forEach(k => { CH.bench[k] = D.simulate(CH.B[k], CH.shk.map(e => [e[0], e[1], 0])); });
  CH.t = 0; CH.y = new Array(n).fill(0); CH.you = { x: [], pi: [], i: [] };
  $('chV').value = 0; $('chVal').textContent = '0,00'; $('chStep').disabled = false; chDraw();
}
function chLoss(path, t) { let L = 0; for (let k = 0; k < t; k++) L += path.pi[k] * path.pi[k] + CH.alpha * path.x[k] * path.x[k]; return L * 1e4; }
function chStep() {
  if (CH.t >= CH.T) return;
  const v = parseFloat($('chV').value) / 100, e = [CH.shk[CH.t][0], CH.shk[CH.t][1], v], P = CH.P, ix = P.vars.indexOf('x'), ip = P.vars.indexOf('pi'), ii = P.vars.indexOf('i');
  const Xy = P.X.map(r => r.reduce((s, a, c) => s + a * CH.y[c], 0)); CH.y = Xy.map((a, i) => a + P.G[i].reduce((s, g, j) => s + g * e[j], 0));
  CH.you.x.push(CH.y[ix]); CH.you.pi.push(CH.y[ip]); CH.you.i.push(CH.y[ii]); CH.t++; chDraw();
}
function chDraw() {
  const t = CH.t, pc = a => a.map(z => z * 100);
  const L = { you: chLoss(CH.you, t), taylor: chLoss(CH.bench.taylor, t), discr: chLoss(CH.bench.discr, t), commit: chLoss(CH.bench.commit, t) };
  const rows = [['Você', L.you], ['Regra de Taylor', L.taylor], ['Ótima sem compromisso', L.discr], ['Ótima com compromisso', L.commit]];
  $('chTable').innerHTML = rows.map((r, i) => '<tr' + (i === 0 ? ' class="you"' : '') + '><td>' + r[0] + '</td><td>' + fmt(r[1], 3) + '</td></tr>').join('');
  const ser = k => [{ v: pc(CH.you[k]), c: '--s-r' }, { v: pc(CH.bench.taylor[k].slice(0, Math.max(t, 1))), c: '--s-u', dash: 1 }, { v: pc(CH.bench.commit[k].slice(0, Math.max(t, 1))), c: '--s-4', dash: 1 }];
  lineChart($('chC1'), ser('pi'), CH.T); lineChart($('chC2'), ser('x'), CH.T);
  const end = t >= CH.T; $('chStep').disabled = end;
  $('chInfo').textContent = !t ? 'Trimestre 0 de ' + CH.T + '. Escolha o desvio da regra e avance.'
    : end ? (Math.abs(L.you - L.taylor) < 1e-9 ? 'Empate com a regra de Taylor: você não se desviou da regra.' : L.you < L.taylor ? (L.you <= L.commit * 1.05 ? 'Excelente: você ficou a menos de 5% da política ótima com compromisso.' : 'Você venceu a regra de Taylor.') : 'A regra de Taylor ficou melhor desta vez.') + ' Perda final ' + fmt(L.you, 3) + '.'
    : 'Trimestre ' + t + ' de ' + CH.T + ' · juro atual ' + fmt(CH.you.i[t - 1] * 100, 2) + ' p.p. do estado estacionário · inflação ' + fmt(CH.you.pi[t - 1] * 100, 2) + ' p.p.';
}
$('chV').addEventListener('input', () => { $('chVal').textContent = fmt(parseFloat($('chV').value), 2); });
$('chStep').addEventListener('click', chStep);
$('chNew').addEventListener('click', chInit);

/* ---------- dados reais do BCB (API pública SGS) ---------- */
const META = y => (y <= 2018 ? 4.5 : y === 2019 ? 4.25 : y === 2020 ? 4.0 : y === 2021 ? 3.75 : y === 2022 ? 3.5 : y === 2023 ? 3.25 : 3.0);
function hpGap(y, lam) { // filtro HP: (I + λ·K'K)·τ = y; devolve y − τ
  const n = y.length, A = D._la.zeros(n, n);
  for (let i = 0; i < n; i++) A[i][i] = 1;
  for (let r = 0; r < n - 2; r++) { const k = [[r, 1], [r + 1, -2], [r + 2, 1]]; k.forEach(([a, ca]) => k.forEach(([b, cb]) => { A[a][b] += lam * ca * cb; })); }
  const tau = D._la.luSolve(D._la.lu(A), y.map(v => [v])).map(r => r[0]);
  return y.map((v, i) => v - tau[i]);
}
async function sgs(code, ini, fim) {
  const r = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.' + code + '/dados?formato=json&dataInicial=' + ini + '&dataFinal=' + fim);
  if (!r.ok) throw new Error('BCB respondeu ' + r.status + ' (série ' + code + ')');
  return (await r.json()).map(o => { const [d, m, y] = o.data.split('/'); return { key: y + '-' + m, y: +y, m: +m, v: parseFloat(o.valor) }; });
}
async function bcbLoad() {
  const btn = $('bcbLoad'), out = $('bcbMsg'); btn.disabled = true; out.className = 'hint'; out.textContent = 'Baixando…';
  try {
    const now = new Date(), f = d => String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
    const start = new Date(now.getFullYear() - 9, now.getMonth(), 1);
    const [selic, ipca, ibc] = await Promise.all([sgs(432, f(start), f(now)), sgs(13522, f(start), f(now)), sgs(24364, f(start), f(now))]);
    const lastSelic = {}; selic.forEach(o => { lastSelic[o.key] = o.v; }); // fim do mês
    const months = ipca.filter(o => lastSelic[o.key] !== undefined && ibc.some(b => b.key === o.key));
    const ibcMap = {}; ibc.forEach(o => { ibcMap[o.key] = o.v; });
    const gap = hpGap(months.map(o => Math.log(ibcMap[o.key])), 14400).map(v => v * 100);
    const tay = months.map((o, i) => 4.5 + o.v + 0.5 * (o.v - META(o.y)) + 0.5 * gap[i]);
    const sel2 = months.map(o => lastSelic[o.key]), inf = months.map(o => o.v);
    const ticks = []; months.forEach((o, k) => { if (o.m === 1 && o.y % 2 === 0) ticks.push({ k, label: String(o.y) }); });
    const draw = () => lineChart($('bcbChart'), [{ v: sel2, c: '--s-r' }, { v: inf, c: '--s-inf' }, { v: tay, c: '--s-u', dash: 1 }], months.length, ticks);
    draw(); window.addEventListener('resize', draw);
    const n = months.length - 1;
    out.className = 'hint good';
    out.textContent = months.length + ' meses (até ' + String(months[n].m).padStart(2, '0') + '/' + months[n].y + '). Último mês: Selic ' + fmt(sel2[n], 2) + '%, IPCA 12m ' + fmt(inf[n], 2) + '%, regra de Taylor didática ' + fmt(tay[n], 2) + '%, hiato HP do IBC-Br ' + fmt(gap[n], 2) + '%.';
  } catch (e) { out.className = 'hint bad'; out.textContent = 'Não consegui baixar: ' + e.message + '. Verifique a internet.'; }
  btn.disabled = false;
}
$('bcbLoad').addEventListener('click', bcbLoad);

window.addEventListener('resize', () => { run(false); chDraw(); });
$('dsgeCmp').disabled = true; pick('nk3'); chInit();
window.BCRESEARCH = { redraw: () => { run(false); chDraw(); } };
})();
