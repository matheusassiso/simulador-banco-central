/* FRB/US em JavaScript (versão com expectativas VAR). Modelo e dados do Federal Reserve (domínio público), exportados de pyfrbus por
   tools/frbus_export.py para frbus-model.js e frbus-data.js. Este arquivo é código próprio: lê as equações em texto, compila, calcula os
   fatores de ajuste que replicam o cenário base e resolve cada trimestre por Newton com Jacobiano numérico esparso.
   Funciona no navegador (window.FRBUS) e no Node (module.exports). */
(function (root) {
'use strict';
const FUNCS = { log: Math.log, exp: Math.exp, max: Math.max, min: Math.min, abs: Math.abs, sqrt: Math.sqrt };

/* ---------- parser das equações (sintaxe Python do pyfrbus) ---------- */
function tokenize(s) {
  const t = [], re = /\s*(?:(\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)|([A-Za-z_][A-Za-z0-9_]*)|(\*\*|[-+*\/(),=]))/y;
  re.lastIndex = 0; let m;
  while (re.lastIndex < s.length) {
    if (/^\s*$/.test(s.slice(re.lastIndex))) break;
    m = re.exec(s); if (!m) throw new Error('símbolo inválido em: ' + s.slice(re.lastIndex, re.lastIndex + 25));
    t.push(m[1] !== undefined ? { k: 'n', v: parseFloat(m[1]) } : m[2] !== undefined ? { k: 'i', v: m[2] } : { k: 'o', v: m[3] });
  }
  return t;
}
function parse(tokens, coef) {
  let p = 0; const peek = () => tokens[p], next = () => tokens[p++], isOp = v => peek() && peek().k === 'o' && peek().v === v;
  const add = () => { let l = mul(); while (isOp('+') || isOp('-')) { const o = next().v; l = { t: 'b', o, a: l, b: mul() }; } return l; };
  const mul = () => { let l = un(); while (isOp('*') || isOp('/')) { const o = next().v; l = { t: 'b', o, a: l, b: un() }; } return l; };
  const un = () => { if (isOp('-')) { next(); return { t: 'u', a: un() }; } if (isOp('+')) { next(); return un(); } return pw(); };
  const pw = () => { const b = prim(); if (isOp('**')) { next(); return { t: 'b', o: '**', a: b, b: un() }; } return b; };
  function prim() {
    const t = next(); if (!t) throw new Error('expressão incompleta');
    if (t.k === 'n') return { t: 'n', v: t.v };
    if (t.k === 'o' && t.v === '(') { const e = add(); if (!isOp(')')) throw new Error('faltou )'); next(); return e; }
    if (t.k !== 'i') throw new Error('inesperado: ' + t.v);
    if (isOp('(')) {
      if (FUNCS[t.v]) { next(); const args = [add()]; while (isOp(',')) { next(); args.push(add()); } if (!isOp(')')) throw new Error('faltou ) em ' + t.v); next(); return { t: 'f', f: t.v, args }; }
      next(); let sg = 1; if (isOp('-')) { next(); sg = -1; } else if (isOp('+')) next();
      const n = next(); if (!n || n.k !== 'n' || !isOp(')')) throw new Error('defasagem inválida em ' + t.v); next();
      return { t: 'v', name: t.v, lag: sg * n.v };
    }
    return coef[t.v] !== undefined ? { t: 'n', v: coef[t.v] } : { t: 'v', name: t.v, lag: 0 };
  }
  const e = add(); if (p < tokens.length) throw new Error('sobrou texto: ' + tokens[p].v); return e;
}
function vars(n, acc) { // variáveis (nome, defasagem) usadas
  if (n.t === 'v') acc.push(n); else if (n.t === 'b') { vars(n.a, acc); vars(n.b, acc); } else if (n.t === 'u') vars(n.a, acc); else if (n.t === 'f') n.args.forEach(a => vars(a, acc));
  return acc;
}

/* ---------- LU denso (para o Newton) ---------- */
function luSolve(A, b) {
  const n = b.length; for (let k = 0; k < n; k++) {
    let p = k, mx = Math.abs(A[k][k]); for (let i = k + 1; i < n; i++) { const v = Math.abs(A[i][k]); if (v > mx) { mx = v; p = i; } }
    if (mx < 1e-300) throw new Error('Jacobiano singular');
    if (p !== k) { [A[k], A[p]] = [A[p], A[k]]; [b[k], b[p]] = [b[p], b[k]]; }
    for (let i = k + 1; i < n; i++) { const f = A[i][k] / A[k][k]; if (f !== 0) { for (let j = k; j < n; j++) A[i][j] -= f * A[k][j]; b[i] -= f * b[k]; } }
  }
  const x = new Array(n); for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; }
  return x;
}

/* ---------- períodos ---------- */
const qIndex = (label, start) => { const [y, q] = label.split('Q').map(Number), [y0, q0] = start.split('Q').map(Number); return (y - y0) * 4 + (q - q0); };
const qLabel = (i, start) => { const [y0, q0] = start.split('Q').map(Number); const k = (q0 - 1) + i; return (y0 + Math.floor(k / 4)) + 'Q' + (((k % 4) + 4) % 4 + 1); };

/* LU com pivô, reaproveitável (para o Newton "chord" das expectativas racionais) */
function luFactor(A) {
  const n = A.length, piv = new Int32Array(n);
  for (let k = 0; k < n; k++) {
    let p = k, mx = Math.abs(A[k][k]); for (let i = k + 1; i < n; i++) { const v = Math.abs(A[i][k]); if (v > mx) { mx = v; p = i; } }
    if (mx < 1e-300) throw new Error('Jacobiano singular'); piv[k] = p; if (p !== k) { const t = A[k]; A[k] = A[p]; A[p] = t; }
    for (let i = k + 1; i < n; i++) { const f = A[i][k] / A[k][k]; A[i][k] = f; if (f !== 0) for (let j = k + 1; j < n; j++) A[i][j] -= f * A[k][j]; }
  }
  return { A, piv };
}
function luBack(F, b) {
  const n = b.length, A = F.A, x = Array.from(b);
  for (let k = 0; k < n; k++) { const p = F.piv[k]; if (p !== k) { const t = x[k]; x[k] = x[p]; x[p] = t; } }
  for (let i = 1; i < n; i++) { let s = x[i]; for (let j = 0; j < i; j++) s -= A[i][j] * x[j]; x[i] = s; }
  for (let i = n - 1; i >= 0; i--) { let s = x[i]; for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; }
  return x;
}
const MCE_GROUPS = { mcap: ['mcap'], wp: ['mcwp'], 'mcap+wp': ['mcap', 'mcwp'], all: ['mcap', 'mcwp', 'mcother'] };

function create(M, Dt, opts) {
  opts = opts || {}; const endo = M.endo, N = endo.length, n = Dt.n, mceOn = !!opts.mce;
  if (mceOn && !MCE_GROUPS[opts.mce]) throw new Error('tipo de MCE inválido: ' + opts.mce);
  const gset = mceOn ? MCE_GROUPS[opts.mce] : [];
  const eqs = endo.map(name => {
    const mc = mceOn && M.mce && M.mce[name] && gset.indexOf(M.mce[name].g) >= 0 ? M.mce[name] : null;
    const text = mc ? mc.eq : M.eq[name], coef = mc ? Object.assign({}, M.coef, mc.coef) : M.coef, toks = tokenize(text), eqAt = toks.findIndex(t => t.k === 'o' && t.v === '=');
    if (eqAt < 0) throw new Error('equação sem "=": ' + name);
    const L = parse(toks.slice(0, eqAt), coef), R = parse(toks.slice(eqAt + 1), coef);
    const used = vars(L, []).concat(vars(R, [])); if (!mc && used.some(u => u.lag > 0)) throw new Error('avanço na equação padrão de ' + name);
    return { name, L, R, dep: [...new Set(used.filter(u => u.lag === 0 && endo.indexOf(u.name) >= 0 && u.name !== name + '_aerr').map(u => u.name))].concat([name]).filter((v, i, a) => a.indexOf(v) === i) };
  });
  function fresh(overrides) { // séries mutáveis (cópia da janela de dados)
    const S = {}; Object.keys(Dt.series).forEach(k => { S[k] = Float64Array.from(Dt.series[k], v => (v === null ? NaN : v)); });
    endo.forEach(e => { S[e + '_aerr'] = new Float64Array(n); });
    return S;
  }
  function build(S) { // compila as equações contra as séries S
    const T = { t: 0 };
    const comp = nd => {
      switch (nd.t) {
        case 'n': return () => nd.v;
        case 'v': { const a = S[nd.name]; if (!a) throw new Error('série ausente: ' + nd.name); const lag = nd.lag; return () => a[T.t + lag]; }
        case 'u': { const f = comp(nd.a); return () => -f(); }
        case 'f': { const fs = nd.args.map(comp), fn = FUNCS[nd.f]; return fs.length === 1 ? () => fn(fs[0]()) : () => fn(fs[0](), fs[1]()); }
        case 'b': { const a = comp(nd.a), b = comp(nd.b); switch (nd.o) { case '+': return () => a() + b(); case '-': return () => a() - b(); case '*': return () => a() * b(); case '/': return () => a() / b(); default: return () => Math.pow(a(), b()); } }
      }
    };
    return { T, f: eqs.map(e => { const l = comp(e.L), r = comp(e.R); return () => l() - r(); }) };
  }
  function run(o) {
    const start = o.start || '2040Q1', len = o.n || 24, S = fresh(), i0 = qIndex(start, Dt.start), i1 = i0 + len - 1;
    if (i0 < 16 || i1 >= n) throw new Error('período fora da janela de dados (' + Dt.start + ' + 16 trimestres de histórico até o fim da janela)');
    Object.keys(o.override || {}).forEach(k => { if (!S[k]) throw new Error('variável desconhecida: ' + k); const val = o.override[k]; for (let t = i0; t <= i1; t++) S[k][t] = typeof val === 'function' ? val(t - i0) : val; });
    const { T, f } = build(S), base = {};
    // 1) fatores de ajuste que fazem o modelo replicar a trajetória base (init_trac)
    for (let t = i0; t <= i1; t++) { T.t = t; for (let i = 0; i < N; i++) { S[endo[i] + '_aerr'][t] = 0; S[endo[i] + '_aerr'][t] = f[i](); } }
    endo.forEach(e => { base[e] = Array.from(S[e].slice(i0, i1 + 1)); });
    // 2) choque nos fatores de ajuste (ou em exógenas) e solução trimestre a trimestre
    (o.shocks || []).forEach(s => { const a = S[s.v]; if (!a) throw new Error('variável desconhecida: ' + s.v); a[i0 + (s.q || 0)] += s.d; });
    let worst = 0, iters = 0, sweeps = 0;
    if (mceOn) { // expectativas racionais: varreduras de Fair-Taylor (cada trimestre usa os avanços da varredura anterior)
      const facts = new Array(len).fill(null), tol = o.tol || 1e-5, maxSweeps = o.maxSweeps || 800;
      const jac = t => { const J = Array.from({ length: N }, () => new Array(N).fill(0)); const F0 = f.map(g => g());
        for (let i = 0; i < N; i++) for (const nm of eqs[i].dep) { const j = endo.indexOf(nm), a = S[nm], x0 = a[t], h = 1e-7 * Math.max(1, Math.abs(x0)); a[t] = x0 + h; J[i][j] = (f[i]() - F0[i]) / h; a[t] = x0; }
        return J; };
      let change = 1;
      for (; sweeps < maxSweeps && change > tol; sweeps++) {
        change = 0;
        for (let t = i0; t <= i1; t++) {
          T.t = t; const k = t - i0, before = endo.map(e => S[e][t]); let F = f.map(g => g()), res = Math.max(...F.map(Math.abs));
          for (let st = 0; st < 40 && res > 1e-9; st++) {
            if (!facts[k]) facts[k] = luFactor(jac(t));
            const dx = luBack(facts[k], F.map(v => -v)); iters++;
            const keep = endo.map(e => S[e][t]); let step = 1, nr = res;
            for (let q = 0; q < 8; q++) { endo.forEach((e, j) => { S[e][t] = keep[j] + step * dx[j]; }); F = f.map(g => g()); nr = Math.max(...F.map(Math.abs)); if (Number.isFinite(nr) && nr < res) break; step /= 2; }
            if (!(nr < 0.7 * res)) facts[k] = null; // chord estagnou: refaz o Jacobiano
            res = nr;
          }
          if (!(res < 1e-6)) throw new Error('Newton não convergiu em ' + qLabel(t, Dt.start) + ' (resíduo ' + res + ')');
          worst = Math.max(worst, res);
          endo.forEach((e, j) => { change = Math.max(change, Math.abs(S[e][t] - before[j]) / (1 + Math.abs(before[j]))); });
        }
      }
      if (change > tol * 100) throw new Error('As expectativas racionais não convergiram em ' + sweeps + ' varreduras (variação ' + change.toExponential(1) + ')');
    } else
    for (let t = i0; t <= i1; t++) {
      T.t = t; let res = 1;
      for (let it = 0; it < 40; it++) {
        const F = f.map(g => g()); res = Math.max(...F.map(Math.abs)); if (res < 1e-9) break;
        const J = Array.from({ length: N }, () => new Float64Array(N));
        for (let i = 0; i < N; i++) for (const nm of eqs[i].dep) {
          const j = endo.indexOf(nm), a = S[nm], x0 = a[t], h = 1e-7 * Math.max(1, Math.abs(x0)); a[t] = x0 + h; J[i][j] = (f[i]() - F[i]) / h; a[t] = x0;
        }
        const dx = luSolve(J.map(r => Array.from(r)), F.map(v => -v)); iters++;
        let step = 1; const keep = endo.map(e => S[e][t]);
        for (let k = 0; k < 8; k++) {
          endo.forEach((e, j) => { S[e][t] = keep[j] + step * dx[j]; });
          const r2 = Math.max(...f.map(g => Math.abs(g()))); if (Number.isFinite(r2) && r2 < res) break; step /= 2;
        }
      }
      worst = Math.max(worst, res); if (!(res < 1e-6)) throw new Error('Newton não convergiu em ' + qLabel(t, Dt.start) + ' (resíduo ' + res + ')');
    }
    const sim = {}, dev = {}; endo.forEach(e => { sim[e] = Array.from(S[e].slice(i0, i1 + 1)); dev[e] = sim[e].map((v, k) => v - base[e][k]); });
    return { start, periods: Array.from({ length: len }, (_, k) => qLabel(i0 + k, Dt.start)), base, sim, dev, residual: worst, iterations: iters, sweeps };
  }
  return { run, endo, exo: M.exo };
}

const api = { create, qIndex, qLabel, tokenize, parse };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FRBUS = api;
})(typeof window !== 'undefined' ? window : globalThis);
