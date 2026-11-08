// Confere a demissão por mau desempenho: política ruim é demitida, política boa (Taylor) não. Uso: node tools/fire_check.js
const fs = require('fs'), html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
const S = new Function(html.match(/<script id="model">([\s\S]*?)<\/script>/)[1] + ';return SIM;')();
let bad = 0;
for (const mode of ['BR', 'CL']) for (const scen of Object.keys(S.SCEN[mode])) {
  const run = pol => { const st = S.newState(S.decode(mode + '-' + scen + '-R-7')); while (!st.over && st.m < 200) S.step(st, { i: pol(st), qe: 0, elf: false, ccyb: false, g: null, gov: [] }); return st; };
  const pior = run(st => (st.m % 2 ? 0.25 : 60)), taylor = run(st => S.taylor(st, true));
  console.log(mode, scen.padEnd(8), 'ruim:', pior.over.t, 'mês', pior.m, '| Taylor:', taylor.over.t, 'mês', taylor.m, 'pressão', Math.round(taylor.pressure));
  if (pior.over.t === 'Fim do mandato') bad++;
}
process.exit(bad ? 1 : 0);
