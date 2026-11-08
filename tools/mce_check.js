// Confere o MCE do motor JS contra a referência do pyfrbus. Uso: node tools/mce_check.js
const R = __dirname + '/../';
const F = require(R + 'frbus.js'), M = require(R + 'frbus-model.js'), D = require(R + 'frbus-data.js');
const ref = require(R + 'docs/ref/frbus-mce-choque-100pb.json');
const m = F.create(M, D, { mce: 'mcap+wp' }); const t0 = Date.now();
const out = m.run({ start: '2040Q1', n: 80, override: { dfpdbt: 0, dfpsrp: 1, drstar: k => (k >= 39 ? 1 : 0) }, shocks: [{ v: 'rffintay_aerr', q: 0, d: 1 }], tol: +(process.argv[2] || 1e-9), maxSweeps: +(process.argv[3] || 400) });
console.log('ms', Date.now() - t0, 'sweeps', out.sweeps, 'res', out.residual);
for (const v of ref.variaveis) { let mx = 0, sc = 0; for (let k = 0; k < 80; k++) { mx = Math.max(mx, Math.abs(out.dev[v][k] - ref.desvio[v][k])); sc = Math.max(sc, Math.abs(ref.desvio[v][k])); } console.log(v, mx.toExponential(2), sc.toFixed(3)); }
