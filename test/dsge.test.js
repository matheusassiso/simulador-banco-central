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

console.log('\n' + n + ' testes ok, ' + fails + ' falhas');
process.exit(fails ? 1 : 0);
