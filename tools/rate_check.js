// Confere que o modelo do Copom aguenta juros enormes sem NaN. Uso: node tools/rate_check.js
const fs = require('fs'), html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
const src = html.match(/<script id="model">([\s\S]*?)<\/script>/)[1];
const S = new Function(src + ';return SIM;')();
for (const mode of ['BR', 'CL']) for (const rate of [120, 1000, 100000]) {
  const st = S.newState(S.decode(mode + '-' + Object.keys(S.SCEN[mode])[0] + '-R-7'));
  for (let k = 0; k < 60 && !st.over; k++) S.step(st, { i: rate, qe: 0, elf: false, ccyb: false, g: null, gov: [] });
  const bad = ['i', 'pi3', 'piYoY', 'y', 'u', 'C', 'piE'].filter(f => !Number.isFinite(st[f]));
  console.log(mode, rate, 'mes', st.m, 'i', st.i, 'pi12', st.piYoY && st.piYoY.toFixed(1), 'y', st.y && st.y.toFixed(1), bad.length ? 'NaN em ' + bad : 'ok');
}
