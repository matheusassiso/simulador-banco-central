// Teste do FRB/US em JavaScript contra o pyfrbus (Federal Reserve). Uso: node test/frbus.test.js
const assert = require('assert'), fs = require('fs'), path = require('path');
const F = require('../frbus.js'), M = require('../frbus-model.js'), D = require('../frbus-data.js');
const ref = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'docs', 'ref', 'frbus-choque-100pb.json'), 'utf8'));
let n = 0, fails = 0;
const t = (name, fn) => { try { fn(); n++; console.log('ok   ' + name); } catch (e) { fails++; console.log('FALHA ' + name + '\n     ' + e.message); } };
const model = F.create(M, D);
const scen = { start: '2040Q1', n: 24, override: { dfpdbt: 0, dfpsrp: 1 }, shocks: [{ v: 'rffintay_aerr', q: 0, d: 1 }] };
let t0 = Date.now(), out;
t('o motor compila as 284 equações e resolve 24 trimestres', () => { out = model.run(scen); assert(out.periods.length === 24 && out.residual < 1e-6); console.log('     (' + (Date.now() - t0) + ' ms, ' + out.iterations + ' iterações de Newton)'); });
t('sem choque, a solução replica o cenário base (desvios ~ 0)', () => {
  const z = model.run({ start: '2040Q1', n: 24, override: { dfpdbt: 0, dfpsrp: 1 }, shocks: [] });
  let mx = 0; Object.keys(z.dev).forEach(k => z.dev[k].forEach(v => { mx = Math.max(mx, Math.abs(v)); })); assert(mx < 1e-6, 'desvio máximo ' + mx);
});
for (const v of ref.variaveis) t('choque de 100 pb: "' + v + '" coincide com o pyfrbus', () => {
  const a = out.dev[v], b = ref.desvio[v]; let mx = 0, sc = 0;
  for (let k = 0; k < 24; k++) { mx = Math.max(mx, Math.abs(a[k] - b[k])); sc = Math.max(sc, Math.abs(b[k])); }
  assert(mx <= 1e-4 * Math.max(1, sc) + 1e-6, 'diferença máxima ' + mx + ' (escala ' + sc + ')');
});
console.log('\n' + n + ' testes ok, ' + fails + ' falhas'); process.exit(fails ? 1 : 0);
