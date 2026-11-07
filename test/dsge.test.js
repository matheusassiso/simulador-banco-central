// Testes por propriedades analíticas do motor DSGE. Uso: node test/dsge.test.js
const assert = require('assert');
const D = require('../dsge.js'), M = require('../dsge-models.js');
let n = 0, fails = 0;
const t = (name, fn) => { try { fn(); n++; console.log('ok   ' + name); } catch (e) { fails++; console.log('FALHA ' + name + '\n     ' + e.message); } };
const near = (a, b, tol, msg) => assert(Math.abs(a - b) <= tol, (msg || '') + ' esperado ' + b + ', obtido ' + a);

t('QME escalar: a=1, b=-2.5, c=1 tem raiz estável 0,5', () => {
  const r = D.solveQME([[1]], [[-2.5]], [[1]]); assert(r.ok, r.reason); near(r.X[0][0], 0.5, 1e-10);
});
t('QME matricial: resíduo ~ 0 e solução estável (20 casos aleatórios)', () => {
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5;
  const mat = (s) => [[rnd() * s, rnd() * s], [rnd() * s, rnd() * s]];
  let okc = 0;
  for (let k = 0; k < 20; k++) {
    const A = mat(0.6), X0 = mat(0.8), B = add(mat(0.4), [[-1.5, 0], [0, -1.5]]);
    const C = D._la.mul(A, D._la.mul(X0, X0)).map((r, i) => r.map((v, j) => -(v + D._la.mul(B, X0)[i][j])));
    const r = D.solveQME(A, B, C);
    if (!r.ok) continue; // pode não haver solução estável: não é erro do solver
    assert(r.residual < 1e-9, 'resíduo ' + r.residual); assert(D.specRad(r.X) < 1, 'ρ(X) ' + D.specRad(r.X)); okc++;
  }
  assert(okc >= 12, 'poucos casos resolvidos: ' + okc);
});
function add(A, B) { return A.map((r, i) => r.map((v, j) => v + B[i][j])); }

const nk = D.parse(M.MODELS.nk3.text);
t('NK3: choque de política bate com a solução analítica (Galí 2015, cap. 3)', () => {
  const s = D.solve(nk); assert(s.determinate, s.message);
  const p = s.lin.names, rho = p.rhov;
  const Lam = (1 - p.beta * rho) * (p.sigma * (1 - rho) + p.phix) + p.kappa * (p.phipi - rho);
  const ir = D.irf(s, 'ev', 6, 1);
  const a = -(1 - p.beta * rho) / Lam, b = p.kappa * a / (1 - p.beta * rho);
  for (let k = 0; k < 6; k++) {
    near(ir.x[k], a * Math.pow(rho, k), 1e-10, 'x[' + k + ']');
    near(ir.pi[k], b * Math.pow(rho, k), 1e-10, 'pi[' + k + ']');
    near(ir.i[k], (p.phipi * b + p.phix * a + 1) * Math.pow(rho, k), 1e-10, 'i[' + k + ']');
  }
});
t('NK3: princípio de Taylor (φπ=1,5 determinado; φπ=0,5 indeterminado)', () => {
  assert(D.solve(nk, { phipi: 1.5 }).determinate);
  const s = D.solve(nk, { phipi: 0.5, phix: 0 }); assert(!s.determinate, 'deveria ser indeterminado'); assert(s.ok, 'ainda há solução estável');
});
t('NK3: desvio-padrão de um AR(1) = σ/√(1−ρ²)', () => {
  const s = D.solve(nk), mo = D.moments(s), sd = s.lin.sd.eu / Math.sqrt(1 - 0.5 * 0.5);
  near(mo.byVar.u.sd, sd, 1e-9); near(mo.byVar.u.ac1, 0.5, 1e-9);
});

for (const key of ['gm_optimal', 'gm_ditr', 'gm_citr', 'gm_peg']) {
  const m = D.parse(M.MODELS[key].text), s = D.solve(m);
  t(key + ': determinado', () => assert(s.determinate, s.message));
  if (key === 'gm_optimal') t('GM ótima: pih=0 e termos de troca seguem a tecnologia (σ=η=γ=1)', () => {
    const ir = D.irf(s, 'ea', 12, 1), rho = s.lin.names.rhoa;
    for (let k = 0; k < 12; k++) { near(ir.pih[k], 0, 1e-10, 'pih'); near(ir.s[k], Math.pow(rho, k), 1e-9, 's[' + k + ']'); near(ir.x[k], 0, 1e-10, 'x'); }
  });
  if (key === 'gm_peg') t('GM câmbio fixo: e = 0 em todo o horizonte', () => {
    const ir = D.irf(s, 'ea', 12, 1); for (let k = 0; k < 12; k++) near(ir.e[k], 0, 1e-12, 'e');
  });
}

t('parser: número de equações diferente de variáveis falha', () => assert.throws(() => D.parse('var a b; varexo e; model; a = e; end;'), /equações/));
t('parser: defasagem +2 falha', () => assert.throws(() => D.parse('var a; varexo e; model; a = a(+2) + e; end;'), /defasagens/));
t('parser: caractere inválido falha (sem eval)', () => assert.throws(() => D.solve(D.parse('var a; varexo e; model; a = process; end;')), /desconhecido|Parâmetro/));
t('parser: precedência (−2^2 = −4; 2^3^2 = 512)', () => {
  const m = D.parse('var a; varexo e; parameters p q; p = -2^2; q = 2^3^2; model; a = p*0 + q*0 + e; end;'), nm = D.linearize(m).names;
  near(nm.p, -4, 1e-12); near(nm.q, 512, 1e-12);
});

// ---------- política ótima (Galí 2015, cap. 5) ----------
const cpS = k => D.solve(D.parse(M.MODELS[k].text));
const W = s => ({ pi: 1, x: s.lin.names.alpha });
t('Discrição: π = u/(1 + κ²/α − βρ) e x = −(κ/α)·π (fórmula fechada)', () => {
  const s = cpS('cp_discr'); assert(s.determinate, s.message);
  const p = s.lin.names, ir = D.irf(s, 'eu', 8, 1);
  for (let k = 0; k < 8; k++) {
    const u = Math.pow(p.rhou, k), pi = u / (1 + p.kappa * p.kappa / p.alpha - p.beta * p.rhou);
    near(ir.pi[k], pi, 1e-10, 'pi[' + k + ']'); near(ir.x[k], -(p.kappa / p.alpha) * pi, 1e-10, 'x[' + k + ']');
  }
});
t('Compromisso: o nível de preços (soma de π) é −(α/κ)·x em todo o horizonte', () => {
  const s = cpS('cp_commit'); assert(s.determinate, s.message);
  const p = s.lin.names, ir = D.irf(s, 'eu', 40, 1); let P = 0;
  for (let k = 0; k < 40; k++) { P += ir.pi[k]; near(P, -(p.alpha / p.kappa) * ir.x[k], 1e-9, 'k=' + k); }
});
t('Perda de bem-estar: compromisso < discrição < regra de Taylor', () => {
  const Lc = D.loss(cpS('cp_commit'), W(cpS('cp_commit'))), Ld = D.loss(cpS('cp_discr'), W(cpS('cp_discr'))), Lt = D.loss(cpS('cp_taylor'), W(cpS('cp_taylor')));
  assert(Lc < Ld, 'compromisso ' + Lc + ' não é menor que discrição ' + Ld); assert(Ld < Lt, 'discrição ' + Ld + ' não é menor que Taylor ' + Lt);
});

// ---------- limite zero (estilo OccBin) ----------
const zN = D.parse(M.MODELS.nk_zlb.text), zF = D.parse(M.MODELS.nk_zlb.floorText), iss = 1 / 0.99 - 1;
t('ZLB: choque pequeno não bate no piso e iguala a solução linear', () => {
  const r = D.occbin(zN, zF, {}, 'en', -0.0005, { floor: -iss }); assert(r.ok, r.message); assert(r.T === 0, 'T=' + r.T);
});
t('ZLB: choque grande fica no piso, o juro-sombra está abaixo do piso e a recessão é maior que a linear', () => {
  const r = D.occbin(zN, zF, {}, 'en', -0.03, { floor: -iss }); assert(r.ok, r.message); assert(r.T > 0, 'T=' + r.T);
  for (let k = 0; k < 40; k++) {
    if (k < r.T) { near(r.path.i[k], -iss, 1e-10, 'i[' + k + '] no piso'); assert(r.path.ishadow[k] < -iss, 'sombra[' + k + ']'); }
    else assert(r.path.ishadow[k] >= -iss - 1e-9, 'fora do piso, sombra[' + k + ']');
  }
  const minZ = Math.min(...r.path.x), minL = Math.min(...r.linear.x);
  assert(minZ < minL, 'recessão ZLB ' + minZ + ' deveria ser maior que a linear ' + minL);
});

// ---------- TANK (Debortoli e Galí, 2018, seção 3.4) ----------
const tk = (key, over) => { const m = D.parse(M.MODELS[key].text); return D.solve(m, over || {}); };
const peakAbs = a => a.reduce((s, v) => Math.max(s, Math.abs(v)), 0);
t('TANK: os três regimes de transferência são determinados', () => { for (const k of ['tank_notr', 'tank_const', 'tank_rank']) assert(tk(k).determinate, k + ': ' + tk(k).message); });
t('TANK com redistribuição total (τ0=τd=1) é o RANK: χy=χn=0, igual a λ=0 e à solução analítica', () => {
  const s = tk('tank_rank'), s0 = tk('tank_rank', { lambda: 0 }), p = s.lin.names;
  near(p.chiy, 0, 1e-12); near(p.chin, 0, 1e-12);
  const a = D.irf(s, 'en', 8, 1), b = D.irf(s0, 'en', 8, 1);
  const rho = p.rhonu, Lam = (1 - p.beta * rho) * (p.sigma * (1 - rho) + p.phix) + p.kap * (p.phipi - rho);
  for (let k = 0; k < 8; k++) { near(a.x[k], b.x[k], 1e-12, 'x vs λ=0'); near(a.x[k], -(1 - p.beta * rho) / Lam * Math.pow(rho, k), 1e-9, 'x analítico[' + k + ']'); }
});
t('TANK: sem transferências χy<0 e χn=0; com transferências constantes χy<0 e χn>0 (como no artigo)', () => {
  const a = tk('tank_notr').lin.names, c = tk('tank_const').lin.names;
  assert(a.chiy < 0 && Math.abs(a.chin) < 1e-12, 'sem transf.: χy=' + a.chiy + ' χn=' + a.chin);
  assert(c.chiy < 0 && c.chin > 0, 'constantes: χy=' + c.chiy + ' χn=' + c.chin);
});
t('TANK: χy>0 se e só se (τ0−τd)/(1−τd) > (σ(1−α)+φ+α)/(Mp−1+α), a condição do artigo (200 sorteios)', () => {
  let seed = 11; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let positives = 0, negatives = 0;
  for (let k = 0; k < 200; k++) {
    const taud = r() * 0.9, tau0 = taud + r() * (1 - taud), hi = k % 2 === 0, // metade dos sorteios com markup alto e σ, φ baixos, onde χy > 0 é possível
      alpha = 0.1 + r() * (hi ? 0.2 : 0.5), sigma = 0.3 + r() * (hi ? 0.7 : 3), phi = 0.2 + r() * (hi ? 0.8 : 3), eps = hi ? 1.1 + r() * 0.8 : 3 + r() * 10, lam = 0.05 + r() * 0.5;
    const p = D.linearize(D.parse(M.MODELS.tank_notr.text), { tau0, taud, alpha, sigma, phi, eps, lambda: lam }).names;
    const Mp = eps / (eps - 1), cond = (tau0 - taud) / (1 - taud) > (sigma * (1 - alpha) + phi + alpha) / (Mp - 1 + alpha);
    if (cond) positives++; else negatives++;
    assert((p.chiy > 0) === cond, 'k=' + k + ' χy=' + p.chiy + ' condição=' + cond);
  }
  assert(positives >= 10 && negatives >= 10, 'sorteio desbalanceado: ' + positives + ' com χy>0, ' + negatives + ' com χy<0');
});
t('TANK: o choque de política é amplificado sem transferências e com transferências constantes, versus o RANK', () => {
  const r = peakAbs(D.irf(tk('tank_rank'), 'en', 24, 0.0025).x), n = peakAbs(D.irf(tk('tank_notr'), 'en', 24, 0.0025).x), c = peakAbs(D.irf(tk('tank_const'), 'en', 24, 0.0025).x);
  assert(n > r, 'sem transf. ' + n + ' deveria superar RANK ' + r); assert(c > r, 'constantes ' + c + ' deveria superar RANK ' + r);
});

console.log('\n' + n + ' testes ok, ' + fails + ' falhas');
process.exit(fails ? 1 : 0);
