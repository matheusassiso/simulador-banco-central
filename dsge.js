/* Motor de DSGE linear com expectativas racionais. Código próprio, escrito a partir da teoria publicada:
   - forma:  A·E[y(t+1)] + B·y(t) + C·y(t-1) + D·e(t) = 0   ⇒   y(t) = X·y(t-1) + G·e(t)
   - X resolve A·X² + B·X + C = 0 pelo método "structure-preserving doubling"
     (Huber, Meyer-Gohde e Saecker, 2024, arXiv 2212.09491; base: Chiang, Chu, Guo, Huang, Lin e Xu, 2009)
   - determinação: raio espectral de X e de F = -(A·X + B)⁻¹·A (soluções fundamentais únicas se ambos < 1)
   Sem dependências. Funciona no navegador (window.DSGE) e no Node (module.exports). */
(function (root) {
'use strict';

/* ---------- álgebra linear densa ---------- */
const zeros = (r, c) => Array.from({ length: r }, () => new Array(c).fill(0));
const eye = n => { const I = zeros(n, n); for (let i = 0; i < n; i++) I[i][i] = 1; return I; };
const mul = (A, B) => {
  const n = A.length, k = B.length, m = B[0].length, R = zeros(n, m);
  for (let i = 0; i < n; i++) for (let p = 0; p < k; p++) {
    const a = A[i][p]; if (a === 0) continue;
    const Bp = B[p], Ri = R[i]; for (let j = 0; j < m; j++) Ri[j] += a * Bp[j];
  }
  return R;
};
const add = (A, B, s) => { s = s === undefined ? 1 : s; return A.map((r, i) => r.map((v, j) => v + s * B[i][j])); };
const scale = (A, s) => A.map(r => r.map(v => v * s));
const tr = A => A[0].map((_, j) => A.map(r => r[j]));
const fro = A => Math.sqrt(A.reduce((s, r) => s + r.reduce((t, v) => t + v * v, 0), 0));
const maxAbs = A => A.reduce((s, r) => r.reduce((t, v) => Math.max(t, Math.abs(v)), s), 0);

function lu(A) { // decomposição LU com pivô; null se singular (tolerância relativa)
  const n = A.length, M = A.map(r => r.slice()), piv = [...Array(n).keys()], tol = 1e-12 * (maxAbs(A) || 1);
  for (let k = 0; k < n; k++) {
    let p = k, mx = Math.abs(M[k][k]);
    for (let i = k + 1; i < n; i++) { const v = Math.abs(M[i][k]); if (v > mx) { mx = v; p = i; } }
    if (mx < tol) return null;
    if (p !== k) { [M[k], M[p]] = [M[p], M[k]]; [piv[k], piv[p]] = [piv[p], piv[k]]; }
    for (let i = k + 1; i < n; i++) {
      M[i][k] /= M[k][k]; const f = M[i][k];
      if (f !== 0) for (let j = k + 1; j < n; j++) M[i][j] -= f * M[k][j];
    }
  }
  return { M, piv };
}
function luSolve(F, B) { // resolve A·X = B
  const n = F.M.length, m = B[0].length, X = zeros(n, m);
  for (let c = 0; c < m; c++) {
    const y = new Array(n);
    for (let i = 0; i < n; i++) { let s = B[F.piv[i]][c]; for (let j = 0; j < i; j++) s -= F.M[i][j] * y[j]; y[i] = s; }
    for (let i = n - 1; i >= 0; i--) { let s = y[i]; for (let j = i + 1; j < n; j++) s -= F.M[i][j] * X[j][c]; X[i][c] = s / F.M[i][i]; }
  }
  return X;
}
const inv = A => { const F = lu(A); return F ? luSolve(F, eye(A.length)) : null; };

function specRad(M) { // raio espectral por quadraturas sucessivas: ρ ≈ ‖M^(2^k)‖^(1/2^k)
  let A = M.map(r => r.slice()), ls = 0;
  const K = 20;
  for (let k = 0; k < K; k++) {
    const nr = fro(A); if (nr === 0) return 0;
    A = scale(A, 1 / nr); ls += Math.log(nr); A = mul(A, A); ls *= 2;
  }
  const nr = fro(A); if (nr === 0) return 0;
  return Math.exp((ls + Math.log(nr)) / Math.pow(2, K));
}

/* ---------- solver ---------- */
function solveQME(A, B, C, o) { // A·X² + B·X + C = 0, solução estável via doubling
  o = o || {}; const maxIter = o.maxIter || 60, tol = o.tol || 1e-14, n = A.length;
  const FB = lu(B); if (!FB) return { ok: false, reason: 'A matriz B (coeficientes contemporâneos) é singular.' };
  let E = luSolve(FB, C), F = luSolve(FB, A), X = scale(E, -1), Y = scale(F, -1);
  const I = eye(n); let it = 0, conv = false;
  for (; it < maxIter; it++) {
    const IYX = inv(add(I, mul(Y, X), -1)), IXY = inv(add(I, mul(X, Y), -1));
    if (!IYX || !IXY) return { ok: false, reason: 'Sem solução estável única (o modelo é indeterminado ou explosivo: o doubling não converge).' };
    const Xn = add(X, mul(mul(mul(F, IXY), X), E));
    const Yn = add(Y, mul(mul(mul(E, IYX), Y), F));
    const En = mul(mul(E, IYX), E), Fn = mul(mul(F, IXY), F);
    const d = fro(add(Xn, X, -1)) / (1 + fro(Xn));
    X = Xn; Y = Yn; E = En; F = Fn;
    if (!isFinite(d)) return { ok: false, reason: 'Doubling divergiu.' };
    if (d < tol) { conv = true; it++; break; }
  }
  const res = fro(add(add(mul(A, mul(X, X)), mul(B, X)), C)) / (1 + fro(C));
  return { ok: conv && res < 1e-8, X, iter: it, residual: res, reason: conv ? (res < 1e-8 ? '' : 'Resíduo alto.') : 'Não convergiu.' };
}

function lyap(X, Q) { // Σ = X Σ X' + Q (doubling de Smith)
  let S = Q.map(r => r.slice()), M = X.map(r => r.slice());
  for (let k = 0; k < 40; k++) {
    const N = add(S, mul(mul(M, S), tr(M)));
    const d = fro(add(N, S, -1)) / (1 + fro(N)); S = N; M = mul(M, M);
    if (d < 1e-15) break;
  }
  return S;
}

/* ---------- parser de modelos ---------- */
function tokenize(s) {
  const t = [], re = /\s*(?:(\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)|([A-Za-z_][A-Za-z0-9_]*)|(\*\*|[-+*\/^(),=#]))/y;
  let m; re.lastIndex = 0;
  while (re.lastIndex < s.length) {
    const rest = s.slice(re.lastIndex); if (/^\s*$/.test(rest)) break;
    m = re.exec(s); if (!m) throw new Error('Caractere inválido perto de: "' + rest.trim().slice(0, 20) + '"');
    if (m[1] !== undefined) t.push({ k: 'num', v: parseFloat(m[1]) });
    else if (m[2] !== undefined) t.push({ k: 'id', v: m[2] });
    else t.push({ k: 'op', v: m[3] === '**' ? '^' : m[3] });
  }
  return t;
}
const FUNCS = { exp: Math.exp, log: Math.log, sqrt: Math.sqrt, abs: Math.abs };
function parseExpr(tokens, vars, exo) { // precedência: + - < * / < unário - < ^ (associativa à direita)
  let p = 0; const peek = () => tokens[p], next = () => tokens[p++];
  const isOp = v => peek() && peek().k === 'op' && peek().v === v;
  function add() {
    let l = mulE();
    while (isOp('+') || isOp('-')) { const o = next().v; l = { t: 'op', o, a: l, b: mulE() }; }
    return l;
  }
  function mulE() {
    let l = unary();
    while (isOp('*') || isOp('/')) { const o = next().v; l = { t: 'op', o, a: l, b: unary() }; }
    return l;
  }
  function unary() {
    if (isOp('-')) { next(); return { t: 'neg', a: unary() }; }
    if (isOp('+')) { next(); return unary(); }
    return pow();
  }
  function pow() {
    const b = primary();
    if (isOp('^')) { next(); return { t: 'op', o: '^', a: b, b: unary() }; }
    return b;
  }
  function primary() {
    const t = next(); if (!t) throw new Error('Expressão incompleta.');
    if (t.k === 'num') return { t: 'n', v: t.v };
    if (t.k === 'op' && t.v === '(') { const e = add(); if (!isOp(')')) throw new Error('Faltou ")".'); next(); return e; }
    if (t.k !== 'id') throw new Error('Símbolo inesperado: ' + t.v);
    const isVar = vars.indexOf(t.v) >= 0, isExo = exo.indexOf(t.v) >= 0;
    if ((isVar || isExo) && isOp('(')) { // x(+1), x(-1), x(0)
      const n1 = tokens[p + 1], n2 = tokens[p + 2];
      const shift = n1 && n1.k === 'op' && (n1.v === '+' || n1.v === '-') && n2 && n2.k === 'num' && tokens[p + 3] && tokens[p + 3].v === ')';
      const zero = n1 && n1.k === 'num' && n1.v === 0 && n2 && n2.v === ')';
      if (shift || zero) {
        next(); let lag = 0;
        if (shift) { const sg = next().v === '-' ? -1 : 1; lag = sg * next().v; } else next();
        next(); // ")"
        if (isExo && lag !== 0) throw new Error('Choques só podem aparecer em t: ' + t.v);
        if (isVar && (lag < -1 || lag > 1 || Math.round(lag) !== lag)) throw new Error('Só há defasagens -1, 0 e +1 (variável ' + t.v + ').');
        return { t: isVar ? 'v' : 'x', name: t.v, lag };
      }
    }
    if (isVar) return { t: 'v', name: t.v, lag: 0 };
    if (isExo) return { t: 'x', name: t.v, lag: 0 };
    if (FUNCS[t.v] && isOp('(')) { next(); const a = add(); if (!isOp(')')) throw new Error('Faltou ")" em ' + t.v + '().'); next(); return { t: 'f', f: t.v, a }; }
    return { t: 'id', name: t.v };
  }
  const e = add(); if (p < tokens.length) throw new Error('Texto sobrando na expressão perto de "' + tokens[p].v + '".');
  return e;
}
function evalAst(n, env) {
  switch (n.t) {
    case 'n': return n.v;
    case 'id': { const v = env.names[n.name]; if (v === undefined) throw new Error('Parâmetro desconhecido: ' + n.name); return v; }
    case 'v': return env.v(n.name, n.lag);
    case 'x': return env.x(n.name);
    case 'neg': return -evalAst(n.a, env);
    case 'f': return FUNCS[n.f](evalAst(n.a, env));
    case 'op': { const a = evalAst(n.a, env), b = evalAst(n.b, env);
      return n.o === '+' ? a + b : n.o === '-' ? a - b : n.o === '*' ? a * b : n.o === '/' ? a / b : Math.pow(a, b); }
  }
  throw new Error('Nó inválido.');
}

function stripComments(s) { return s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(\/\/|%)[^\n]*/g, ' '); }

/* Formato:
     var x pi i;  varexo ev;  parameters beta kappa;
     beta = 0.99;
     model;  #lambda = ...;   x = x(+1) - ...;   end;
     shocks; std ev = 0.01; end;                                                  */
function parse(text) {
  const src = stripComments(text).split(';').map(s => s.trim()).filter(Boolean);
  const m = { vars: [], exo: [], params: [], values: {}, locals: [], eqs: [], std: {}, linear: true };
  let inModel = false, inShocks = false;
  const words = s => s.split(/[\s,]+/).filter(Boolean);
  for (const st of src) {
    const low = st.toLowerCase();
    if (inModel) {
      if (low === 'end') { inModel = false; continue; }
      let s = st.replace(/^\[[^\]]*\]\s*/, '');
      if (s[0] === '#') { const i = s.indexOf('='); if (i < 0) throw new Error('Definição local sem "=": ' + s); m.locals.push({ name: s.slice(1, i).trim(), src: s.slice(i + 1) }); }
      else { const i = s.indexOf('='); if (i < 0 || s.indexOf('=', i + 1) >= 0) throw new Error('Cada equação precisa de exatamente um "=": ' + s.slice(0, 40)); m.eqs.push({ lhs: s.slice(0, i), rhs: s.slice(i + 1), text: s }); }
      continue;
    }
    if (inShocks) {
      if (low === 'end') { inShocks = false; continue; }
      const mm = st.match(/^std\s+([A-Za-z_]\w*)\s*=\s*(.+)$/i); if (!mm) throw new Error('Em "shocks", use: std nome = valor;'); m.std[mm[1]] = mm[2]; continue;
    }
    if (/^var\s/i.test(st)) { m.vars.push(...words(st.slice(3))); continue; }
    if (/^varexo\s/i.test(st)) { m.exo.push(...words(st.slice(6))); continue; }
    if (/^parameters\s/i.test(st)) { m.params.push(...words(st.slice(10))); continue; }
    if (/^model(\s*\(.*\))?$/i.test(st)) { inModel = true; continue; }
    if (low === 'shocks') { inShocks = true; continue; }
    const i = st.indexOf('=');
    if (i > 0 && m.params.indexOf(st.slice(0, i).trim()) >= 0) { m.values[st.slice(0, i).trim()] = st.slice(i + 1); continue; }
    throw new Error('Não entendi: "' + st.slice(0, 50) + '"');
  }
  if (inModel || inShocks) throw new Error('Faltou "end;".');
  if (m.eqs.length !== m.vars.length) throw new Error('Há ' + m.eqs.length + ' equações para ' + m.vars.length + ' variáveis.');
  const mk = e => parseExpr(tokenize(e), m.vars, m.exo);
  m.parsed = {
    values: Object.fromEntries(Object.entries(m.values).map(([k, v]) => [k, mk(v)])),
    locals: m.locals.map(l => ({ name: l.name, ast: mk(l.src) })),
    eqs: m.eqs.map(e => ({ lhs: mk(e.lhs), rhs: mk(e.rhs) })),
    std: Object.fromEntries(Object.entries(m.std).map(([k, v]) => [k, mk(v)]))
  };
  return m;
}

function names(m, over) { // avalia parâmetros (na ordem) e definições locais
  const env = { names: {}, v() { return 0; }, x() { return 0; } };
  for (const p of m.params) if (m.parsed.values[p] !== undefined) env.names[p] = evalAst(m.parsed.values[p], env);
  for (const k in (over || {})) env.names[k] = over[k];
  for (const l of m.parsed.locals) env.names[l.name] = evalAst(l.ast, env);
  return env.names;
}

function linearize(m, over, opt) {
  opt = opt || {};
  const n = m.vars.length, k = m.exo.length, nm = names(m, over);
  const idx = Object.fromEntries(m.vars.map((v, i) => [v, i])), xidx = Object.fromEntries(m.exo.map((v, i) => [v, i]));
  const A = zeros(n, n), B = zeros(n, n), C = zeros(n, n), D = zeros(n, Math.max(k, 1));
  const resid = (lead, cur, lag, sh) => {
    const env = { names: nm, v: (name, l) => (l === 1 ? lead : l === 0 ? cur : lag)[idx[name]], x: name => sh[xidx[name]] || 0 };
    return m.parsed.eqs.map(e => evalAst(e.lhs, env) - evalAst(e.rhs, env));
  };
  const z = new Array(n).fill(0), zs = new Array(k).fill(0), r0 = resid(z, z, z, zs);
  if (!opt.allowConst && r0.some(v => Math.abs(v) > 1e-10)) throw new Error('O modelo não está em desvios (resíduo não nulo na origem). Use forma linear sem constantes.');
  for (let j = 0; j < n; j++) {
    const e = z.slice(); e[j] = 1;
    const a = resid(e, z, z, zs), b = resid(z, e, z, zs), c = resid(z, z, e, zs);
    for (let i = 0; i < n; i++) { A[i][j] = a[i] - r0[i]; B[i][j] = b[i] - r0[i]; C[i][j] = c[i] - r0[i]; }
  }
  for (let j = 0; j < k; j++) {
    const s = zs.slice(); s[j] = 1; const d = resid(z, z, z, s); for (let i = 0; i < n; i++) D[i][j] = d[i] - r0[i];
  }
  const sd = {}; for (const x of m.exo) sd[x] = m.parsed.std[x] ? evalAst(m.parsed.std[x], { names: nm, v() { return 0; }, x() { return 0; } }) : 1;
  return { A, B, C, D, n, k, sd, names: nm, d: r0 };
}

/* ---------- solução, IRFs e momentos ---------- */
function solve(m, over) {
  const L = linearize(m, over), n = L.n;
  const q = solveQME(L.A, L.B, L.C);
  const out = { vars: m.vars, exo: m.exo, lin: L, ok: false, determinate: false, message: '' };
  if (!q.ok) { out.message = q.reason || 'Sem solução estável.'; out.residual = q.residual; return out; }
  const X = q.X, AXB = add(mul(L.A, X), L.B), F = lu(AXB);
  if (!F) { out.message = 'A·X + B singular: sem solução única.'; return out; }
  out.X = X; out.G = scale(luSolve(F, L.D), -1);
  out.rhoX = specRad(X);
  out.rhoF = specRad(scale(luSolve(F, L.A), -1));
  out.residual = q.residual; out.iter = q.iter;
  // Como no Dynare, raízes unitárias (variáveis nominais em nível) contam como estáveis: critério 1 + 1e-5.
  out.unitRoot = out.rhoX > 1 - 1e-5;
  out.ok = out.rhoX < 1 + 1e-5;
  out.determinate = out.ok && out.rhoF < 1 - 1e-9;
  out.message = out.determinate ? 'Determinado (solução estável única)' + (out.unitRoot ? ', com raiz unitária: há variáveis em nível não estacionárias.' : '.')
    : out.ok ? 'Indeterminado: existem equilíbrios de manchas solares (ρ(F) = ' + out.rhoF.toFixed(3) + ' ≥ 1).' : 'Sem solução estável (ρ(X) = ' + out.rhoX.toFixed(3) + ').';
  return out;
}
function irf(sol, shock, T, size) {
  const j = sol.exo.indexOf(shock); if (j < 0) throw new Error('Choque desconhecido: ' + shock);
  size = size === undefined ? 1 : size; T = T || 20;
  let y = sol.G.map(r => r[j] * size); const res = {}; sol.vars.forEach((v, i) => res[v] = [y[i]]);
  for (let t = 1; t < T; t++) { y = sol.X.map(r => r.reduce((s, v, c) => s + v * y[c], 0)); sol.vars.forEach((v, i) => res[v].push(y[i])); }
  return res;
}
function moments(sol) { // desvios-padrão e autocorrelação de 1ª ordem (choques independentes com std do modelo)
  if (sol.unitRoot) return { nonStationary: true, byVar: {}, cov: null }; // variância infinita com raiz unitária
  const k = sol.exo.length, Om = zeros(k, k); sol.exo.forEach((x, i) => Om[i][i] = Math.pow(sol.lin.sd[x], 2));
  const GQ = mul(mul(sol.G, Om), tr(sol.G)), S = lyap(sol.X, GQ), R = mul(sol.X, S), out = {};
  sol.vars.forEach((v, i) => out[v] = { sd: Math.sqrt(Math.max(0, S[i][i])), ac1: S[i][i] > 0 ? R[i][i] / S[i][i] : 0 });
  return { byVar: out, cov: S };
}

/* Perda de bem-estar: soma de pesos × variância incondicional (ex.: {pi: 1, x: alpha}). */
function loss(sol, w) {
  const mo = moments(sol); if (mo.nonStationary) return NaN;
  let L = 0; for (const k in w) { const i = sol.vars.indexOf(k); if (i >= 0) L += w[k] * mo.cov[i][i]; }
  return L;
}

/* Simula y(t) = X·y(t-1) + G·e(t) para uma sequência de choques (T vetores, um valor por choque do modelo). */
function simulate(sol, shocks, y0) {
  let y = y0 ? y0.slice() : new Array(sol.vars.length).fill(0); const out = {}; sol.vars.forEach(v => { out[v] = []; });
  for (const e of shocks) {
    const Xy = sol.X.map(r => r.reduce((s, v, c) => s + v * y[c], 0));
    y = Xy.map((v, i) => v + sol.G[i].reduce((s, g, j) => s + g * (e[j] || 0), 0));
    sol.vars.forEach((v, i) => out[v].push(y[i]));
  }
  return out;
}

/* Limite inferior do juro (estilo OccBin, previsão perfeita): palpite e verificação do número T de períodos no piso.
   mN: modelo com a regra normal; mF: o mesmo modelo com o juro fixo no piso (pode ter constante). Os dois têm a variável
   "sombra" (juro que a regra pediria). Resolve para um choque inicial; depois de T períodos a economia volta à regra normal. */
function occbin(mN, mF, over, shockName, size, opt) {
  opt = opt || {}; const Tmax = opt.Tmax || 80, shadow = opt.shadow || 'ishadow', floor = opt.floor;
  const sN = solve(mN, over); if (!sN.ok) return { ok: false, message: 'Regime normal sem solução: ' + sN.message };
  const LF = linearize(mF, over, { allowConst: true }), n = LF.n, k = sN.exo.length, j = sN.exo.indexOf(shockName);
  if (j < 0) return { ok: false, message: 'Choque desconhecido: ' + shockName };
  const e = new Array(k).fill(0); e[j] = size;
  const zero = () => new Array(k).fill(0), iS = sN.vars.indexOf(shadow);
  const lin = simulate(sN, [e].concat(Array.from({ length: Tmax - 1 }, zero)));
  const eps = 1e-12, binds = (v, t) => v[t] < floor - eps;
  const consistent = (path, T) => {
    for (let t = 0; t < Tmax; t++) { const b = binds(path[shadow], t); if ((t < T) !== b) return false; }
    return true;
  };
  if (consistent(lin, 0)) return { ok: true, T: 0, path: lin, linear: lin, message: 'O piso não restringe: igual à solução linear.' };
  let best = null;
  for (let T = 1; T <= Tmax - 2; T++) {
    let P = sN.X, q = new Array(n).fill(0), bad = false; const Ps = new Array(T), qs = new Array(T);
    for (let t = T - 1; t >= 0; t--) {
      const F = lu(add(mul(LF.A, P), LF.B)); if (!F) { bad = true; break; }
      const dv = LF.d.slice(); if (t === 0) for (let i = 0; i < n; i++) dv[i] += LF.D[i].reduce((s, v, c) => s + v * e[c], 0);
      const rhs = dv.map((d, i) => d + LF.A[i].reduce((s, a, c) => s + a * q[c], 0));
      const Pn = scale(luSolve(F, LF.C), -1), qn = luSolve(F, rhs.map(v => [-v])).map(r => r[0]);
      Ps[t] = Pn; qs[t] = qn; P = Pn; q = qn;
    }
    if (bad) continue;
    let y = new Array(n).fill(0); const arr = sN.vars.map(() => []);
    for (let t = 0; t < Tmax; t++) {
      y = t < T ? Ps[t].map((r, i) => r.reduce((s, v, c) => s + v * y[c], 0) + qs[t][i]) : sN.X.map(r => r.reduce((s, v, c) => s + v * y[c], 0));
      arr.forEach((a, i) => a.push(y[i]));
    }
    const path = Object.fromEntries(sN.vars.map((v, i) => [v, arr[i]]));
    if (consistent(path, T)) { best = { ok: true, T, path, linear: lin, message: 'No piso por ' + T + ' trimestre(s).' }; break; }
  }
  return best || { ok: false, linear: lin, message: 'Não achei uma sequência consistente de regimes até ' + (Tmax - 2) + ' trimestres.' };
}

const api = { parse, linearize, solve, irf, moments, loss, simulate, occbin, solveQME, specRad, lyap, _la: { mul, add, inv, lu, luSolve, eye, zeros, fro } };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DSGE = api;
})(typeof window !== 'undefined' ? window : globalThis);
