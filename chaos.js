/* Laboratório do Caos: hiperinflação sem tetos. Modelo mensal não linear, todo em logaritmos para aguentar números absurdos.
   Base teórica: demanda de moeda de Cagan (1956), ajuste parcial de preços, senhoriagem e imposto inflacionário, dívida pública indexada ao juro,
   expectativas adaptativas com âncora de credibilidade. É um modelo didático: serve para ver mecanismos (curva de Laffer da senhoriagem,
   congelamento, reforma monetária, URV, âncora cambial, confisco), não para prever nenhum país.
   Unidades: "mês de PIB" para estoques reais (PIB real normal = 1 por mês). Inflação em log mensal ℓ = ln(P_t/P_{t-1}); % = e^ℓ − 1.
   Sem dependências; funciona no navegador (window.CHAOS) e no Node (module.exports). */
(function (root) {
'use strict';
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const fin = (x, d) => (Number.isFinite(x) ? x : d);
const LN10 = Math.LN10;

const PARAMS = () => ({
  m0: 1.2,        // saldo real de base monetária com inflação zero (meses de PIB)
  alpha: 3,       // semi-elasticidade da demanda de moeda à inflação esperada (log mensal): pico da Laffer em ℓ = ln(1 + 1/α)
  ki: 2,          // custo de oportunidade do juro sobre a base
  lam0: 0.35,     // velocidade de ajuste de preços com inflação baixa (sobe para 1 quando a inflação é alta)
  lamK: 6,        // quão rápido os preços passam a reajustar todo mês
  theta: 0.2,     // adaptação das expectativas (Cagan: instável se (alpha + dolar)·theta > 1; aqui 4,5 × 0,2 = 0,9)
  dolar: 1.5,     // dolarização das transações com a inflação esperada
  mfloor: 1e-4,   // piso do saldo real: abaixo disso a moeda virou lixo (escambo/dólar)
  flight: 0.03,   // fuga de capitais quando o juro real é negativo
  cInfl: 0.15, cReal: 0.8, yAdj: 0.3, // custos da inflação e do juro real sobre o produto; velocidade de ajuste do produto
  sCap: 0.012,    // financiamento sustentável do déficit (meses de PIB por mês) para a credibilidade
  fiscW: 0.03,    // quanto de déficit excedente zera a credibilidade
  freezeDecay: 0.03, shortK: 0.7
});

const PRESETS = {
  calmo:  { name: 'Calmaria (inflação de 0,5% ao mês)', cur: 'Real', l: 0.005, y: 1, d: 0, b: 1, i: 0.008, mu: 0.005, mode: 'emissao', R: 3, lnQ: 0 },
  cronica:{ name: 'Inflação crônica (≈ 15% ao mês, déficit de 3%)', cur: 'Cruzeiro', l: 0.14, y: 1, d: 0.03, b: 2, i: 0.16, mu: 0.15, mode: 'emissao', R: 1, lnQ: 0.1 },
  hiper:  { name: 'Hiperinflação aberta (≈ 40% ao mês, déficit de 6%)', cur: 'Cruzeiro', l: 0.34, y: 0.95, d: 0.06, b: 3, i: 0.4, mu: 0.45, mode: 'emissao', R: 0.5, lnQ: 0.2 },
  colapso:{ name: 'Colapso (≈ 300% ao mês, estilo Weimar)', cur: 'Marco', l: 1.4, y: 0.8, d: 0.1, b: 1, i: 3, mu: 3, mode: 'emissao', R: 0.1, lnQ: 0.4 }
};

function newSim(key, over) {
  const pr = Object.assign({}, PRESETS[key] || PRESETS.cronica, over || {});
  const p = PARAMS(); if (pr.params) Object.assign(p, pr.params);
  const s = {
    t: 0, lnP: 0, lnM: 0, lnE: 0, lnQ: pr.lnQ || 0, l: pr.l, le: pr.l, cred: 0, credPlan: 0, y: pr.y, b: pr.b, R: pr.R, D: 0, zeros: 0, cur: pr.cur,
    dforced: 0, freeze: { on: false, left: 0, rigor: 0, boom: 0 }, urv: { on: false, left: 0, k: 3, name: 'Real' }, peg: { on: false, crawl: 0 },
    blocked: { left: 0, lnPer: -Infinity }, catchup: 0, shortage: 0, agio: 0, mPrev: 0
  };
  // começa em equilíbrio de saldos: M/P = demanda de moeda
  const D0 = clamp(1 - Math.exp(-p.dolar * Math.max(0, pr.l)), 0, 0.95);
  const md = Math.max(p.mfloor, p.m0 * Math.exp(-p.alpha * Math.max(pr.l, -0.05)) / (1 + p.ki * Math.max(0, pr.i)) * pr.y * (1 - D0));
  s.lnM = Math.log(md); s.mPrev = md; s.lnE = s.lnQ; s.D = D0;
  const sim = { p, s, hist: [], log: [], ctrl: { mode: pr.mode, mu: pr.mu, i: pr.i, d: pr.d }, _bPrev: pr.b };
  return sim;
}
const note = (sim, text, kind) => { sim.log.push({ t: sim.s.t, text, kind: kind || '' }); };

/* ---------- eventos (ações do jogador) ---------- */
function event(sim, name, a) {
  const s = sim.s, p = sim.p; a = a || {};
  switch (name) {
    case 'cutZeros': { // reforma monetária: corta k zeros e troca o nome. Variáveis reais não mudam.
      const k = clamp(Math.round(fin(a.k, 3)), 1, 12), f = k * LN10;
      s.lnP -= f; s.lnM -= f; s.lnE -= f; if (Number.isFinite(s.blocked.lnPer)) s.blocked.lnPer -= f;
      s.zeros += k; s.cur = a.name || s.cur; if (a.psych) s.credPlan = Math.min(1, s.credPlan + clamp(a.psych, 0, 1)); // efeito psicológico só se pedido
      note(sim, 'Reforma monetária: cortaram ' + k + ' zero(s); nova moeda "' + s.cur + '". Preços, salários e saldos mudam de unidade, a economia real não.', 'ev'); break;
    }
    case 'freeze': { // Plano Cruzado
      s.freeze = { on: true, left: Math.max(1, Math.round(fin(a.months, 12))), rigor: clamp(fin(a.rigor, 0.95), 0, 1), boom: clamp(fin(a.boom, 0.08), 0, 0.3) };
      s.credPlan = Math.max(s.credPlan, 0.9); note(sim, 'Congelamento de preços por ' + s.freeze.left + ' meses (rigor ' + Math.round(s.freeze.rigor * 100) + '%). A confiança sobe; a pressão monetária continua por baixo.', 'ev'); break;
    }
    case 'unfreeze': if (s.freeze.on) { s.freeze.on = false; s.catchup = 3; note(sim, 'Preços descongelados: o reajuste represado vem de uma vez.', 'alert'); } break;
    case 'confiscate': { // Plano Collor
      const x = clamp(fin(a.share, 0.8), 0, 0.99), M = Math.exp(s.lnM), per = M * x / 18;
      s.lnM = Math.log(M * (1 - x)); s.blocked = { left: 18, lnPer: Math.log(Math.max(per, 1e-300)) };
      s.credPlan = Math.max(0, s.credPlan - 0.3); s.cred = Math.max(0, s.cred - 0.2);
      note(sim, 'Bloqueio de ' + Math.round(x * 100) + '% da base e dos haveres: liberação em 18 parcelas. A liquidez some agora e volta depois.', 'alert'); break;
    }
    case 'helicopter': { const x = clamp(fin(a.share, 0.5), 0, 1e6); s.lnM += Math.log(1 + x); note(sim, 'Dinheiro de helicóptero: a base cresce ' + Math.round(x * 100) + '% de uma vez.', 'ev'); break; }
    case 'urv': { // Plano Real: unidade de conta indexada, depois conversão com âncora cambial
      s.urv = { on: true, left: Math.max(1, Math.round(fin(a.months, 4))), k: clamp(Math.round(fin(a.k, 3)), 0, 12), name: a.name || 'Real' };
      note(sim, 'URV: preços passam a ser cotados numa unidade indexada, sem a inércia de cada um reajustar numa data. A moeda velha ainda circula.', 'ev'); break;
    }
    case 'peg': s.peg = { on: true, crawl: clamp(fin(a.crawl, 0.003), -0.05, 5) }; s.R = Math.max(s.R, fin(a.reserves, 2)); s.credPlan = Math.max(s.credPlan, 0.6);
      note(sim, 'Âncora cambial: câmbio fixado (rastejando ' + (s.peg.crawl * 100).toFixed(1) + '% ao mês), reservas de ' + s.R.toFixed(1) + ' meses de PIB.', 'ev'); break;
    case 'unpeg': if (s.peg.on) { s.peg.on = false; note(sim, 'Câmbio solto.', 'ev'); } break;
    case 'dollarize': { // troca a base por dólares ao câmbio vigente, pagando com as reservas; o governo perde a senhoriagem
      const want = clamp(fin(a.share, 1), 0, 0.95), m = Math.exp(clamp(s.lnM - s.lnP, -60, 60));
      if (want <= s.dforced) { note(sim, 'Já está pelo menos ' + Math.round(s.dforced * 100) + '% dolarizado.', ''); break; }
      const delta = (want - s.dforced) / (1 - s.dforced), cost = delta * m; let eff = want;
      if (cost > s.R) { const dl = m > 0 ? Math.max(0, s.R) / m : 0; eff = s.dforced + dl * (1 - s.dforced); }
      const dEff = (eff - s.dforced) / (1 - s.dforced); s.R = Math.max(0, s.R - dEff * m); s.lnM += Math.log(Math.max(1e-12, 1 - dEff)); s.dforced = eff;
      s.credPlan = Math.max(s.credPlan, 0.5 + 0.4 * eff);
      note(sim, eff + 1e-9 < want ? 'Reservas insuficientes: só deu para dolarizar ' + Math.round(eff * 100) + '% (queria ' + Math.round(want * 100) + '%).' : 'Dolarização de ' + Math.round(eff * 100) + '% da base, paga com reservas. O governo perde a senhoriagem: déficit agora só se financia com dívida ou ajuste.', eff + 1e-9 < want ? 'alert' : 'ev'); break;
    }
  }
}

/* ---------- um mês ---------- */
function step(sim, c) {
  const p = sim.p, s = sim.s; c = Object.assign({}, sim.ctrl, c || {});
  const i = clamp(fin(c.i, 0), 0, 1e12), d = clamp(fin(c.d, 0), -5, 50), mu = clamp(fin(c.mu, 0), -0.99, 1e12);
  const lnP0 = s.lnP, lnM0 = s.lnM, mPrev = Math.exp(clamp(s.lnM - s.lnP, -60, 60));
  // expectativas: adaptativas, ancoradas pela credibilidade
  const target = s.peg.on ? s.peg.crawl : 0;
  let le = s.le + p.theta * (s.l - s.le); le = (1 - s.cred) * le + s.cred * target; le = clamp(le, -0.05, 40);
  const D = clamp(Math.max(1 - Math.exp(-p.dolar * Math.max(0, le)), s.dforced), 0, 0.95); // dolarização espontânea ou forçada
  const md = Math.max(p.mfloor, p.m0 * Math.exp(-p.alpha * Math.max(le, -0.05)) / (1 + p.ki * i) * s.y * (1 - D));
  // emissão: manual (μ) ou monetizando o déficit (incluindo juros da dívida). Com dolarização o governo imprime só o que sobrou de moeda.
  const prn = Math.pow(1 - s.dforced, 4); // dolarizado, o banco central praticamente perde a capacidade de emitir
  let lnM1;
  if (c.mode === 'deficit') { const need = prn * Math.max(0, d + ((1 + i) / Math.exp(le) - 1) * s.b); lnM1 = lnM0 + Math.log(1 + need * Math.exp(clamp(lnP0 + le - lnM0, -60, 60))); }
  else lnM1 = lnM0 + Math.log(1 + prn * mu);
  lnM1 = Math.min(lnM1, lnM0 + 44); // a gráfica não imprime mais do que os preços conseguem acompanhar em um mês (e^45)
  if (s.blocked.left > 0) { lnM1 = Math.log(Math.exp(clamp(lnM1, -700, 700)) + Math.exp(clamp(s.blocked.lnPer, -700, 700))); s.blocked.left--; }
  // preço de equilíbrio do mercado de moeda e ajuste parcial
  const lnMstar = lnM1 - Math.log(md);
  const lam = (s.urv.on || s.catchup > 0) ? 1 : 1 - (1 - p.lam0) * Math.exp(-p.lamK * Math.max(0, le));
  const lfree = clamp(le + lam * (lnMstar - lnP0 - le), -0.3, 45);
  let l = lfree, shortage = 0, agio = 0;
  if (s.freeze.on) {
    l = (1 - s.freeze.rigor) * lfree;
    const gStar = Math.max(0, lnMstar - (lnP0 + l));
    shortage = Math.tanh(gStar / p.shortK); agio = Math.exp(clamp(gStar * s.freeze.rigor, 0, 30)) - 1;
    s.credPlan = Math.max(0, s.credPlan - p.freezeDecay * (1 + 4 * shortage));
    if (--s.freeze.left <= 0) { s.freeze.on = false; s.catchup = 3; note(sim, 'Fim do congelamento. Escassez acumulada: ' + Math.round(shortage * 100) + '%.', 'alert'); }
  }
  if (s.catchup > 0) s.catchup--;
  // câmbio: fixo (âncora) ou flutuante com fuga de capitais
  let lnE, lnQ = s.lnQ, lnM = lnM1, brokeAnchor = false;
  if (s.peg.on) {
    lnE = s.lnE + s.peg.crawl;
    const lpeg = s.peg.crawl + 0.5 * (lnE - s.lnQ - lnP0 - s.peg.crawl);
    l = (1 - s.cred) * l + s.cred * clamp(lpeg, -0.3, 5);
  }
  const lnP1 = clamp(lnP0 + l, -650, 650);
  if (s.peg.on) {
    const Mdem = Math.exp(clamp(lnP1, -650, 650)) * md, Mpol = Math.exp(clamp(lnM1, -650, 650));
    s.R += -(Mpol - Mdem) / Math.exp(lnP1);
    lnM = Math.log(Math.max(Mdem, 1e-300));
    if (s.R <= 0) { brokeAnchor = true; s.R = 0; s.peg.on = false; lnM = lnM1; s.credPlan = 0; s.cred *= 0.2; lnQ = s.lnQ + 0.4; lnE = lnP1 + lnQ; note(sim, 'As reservas acabaram: a âncora cambial rompeu e o câmbio disparou.', 'alert'); }
    else lnQ = lnE - lnP1;
  }
  if (!s.peg.on && !brokeAnchor) { lnQ = clamp(s.lnQ + 0.08 * (0 - s.lnQ) + p.flight * clamp(le - Math.log(1 + i), 0, 5), -1.5, 3); lnE = lnP1 + lnQ; }
  // saldos reais, senhoriagem, dívida
  const m = Math.exp(clamp(lnM - lnP1, -60, 60)), S = m - mPrev * Math.exp(-l);
  const rReal = (1 + i) / Math.exp(l) - 1;
  const bNew = clamp(s.b * (1 + i) / Math.exp(l) + d - S, -50, 1000);
  // produto
  const urvOn = s.urv.on, liq = clamp(1 - m / md, 0, 1);
  const ystar = Math.exp(-p.cInfl * (urvOn ? 0.3 : 1) * Math.min(l, 5) - p.cReal * Math.max(0, Math.min(rReal, 3)) - 0.6 * shortage - 0.5 * liq) * (1 + (s.freeze.on ? s.freeze.boom * s.credPlan * (1 - shortage) : 0));
  s.y = clamp(s.y + p.yAdj * (ystar - s.y), 0.05, 1.3);
  // credibilidade: depende de o déficit caber no que dá para financiar
  const dEff = d + Math.max(0, rReal) * Math.max(0, s.b), f = dEff <= p.sCap ? 1 : clamp(1 - (dEff - p.sCap) / p.fiscW, 0, 1);
  s.cred += 0.2 * (s.credPlan * f - s.cred); s.cred = clamp(s.cred, 0, 1);
  // URV chega ao fim: converte na nova moeda e liga a âncora
  if (s.urv.on && --s.urv.left <= 0) {
    s.urv.on = false; const u = s.urv;
    s.lnP = lnP1; s.lnM = lnM; s.lnE = lnE; s.lnQ = lnQ; s.l = l; s.le = le; s.b = bNew; s.D = D;
    event(sim, 'cutZeros', { k: u.k, name: u.name }); event(sim, 'peg', { crawl: 0.003, reserves: Math.max(s.R, 2.5) });
    s.credPlan = f >= 0.99 ? 0.8 : 0.35; note(sim, f >= 0.99 ? 'Conversão concluída com o déficit sob controle: a credibilidade do plano é alta.' : 'Conversão feita, mas o déficit não cabe no que dá para financiar: o plano nasce frágil.', f >= 0.99 ? 'good' : 'alert');
  } else { s.lnP = lnP1; s.lnM = lnM; s.lnE = lnE; s.lnQ = lnQ; s.l = l; s.le = le; s.b = bNew; s.D = D; }
  s.shortage = shortage; s.agio = agio; s.mPrev = m; s.t++;
  const rec = {
    t: s.t, l, pct: Math.exp(l) - 1, annualLog10: l * 12 / LN10, lnPTotal: s.lnP + s.zeros * LN10, m, md, S, tax: (1 - Math.exp(-l)) * m, y: s.y, shortage, agio,
    R: s.R, cred: s.cred, lnE: s.lnE + s.zeros * LN10, b: s.b, bPrev: sim._bPrev, d, i, D, rReal, le, zeros: s.zeros, cur: s.cur, dEff, freezeOn: s.freeze.on, pegOn: s.peg.on
  };
  sim._bPrev = s.b;
  const h = sim.hist; h.push(rec);
  const n = h.length; rec.S2 = n >= 3 ? h[n - 1].S - 2 * h[n - 2].S + h[n - 3].S : NaN; rec.l2 = n >= 3 ? h[n - 1].l - 2 * h[n - 2].l + h[n - 3].l : NaN;
  rec.okLaffer = Number.isFinite(rec.S2) && rec.S2 > rec.l2;
  if (l > Math.log(1.5) && !sim._hyper) { sim._hyper = true; note(sim, 'Hiperinflação (mais de 50% ao mês).', 'alert'); }
  if (l < Math.log(1.5) * 0.5 && sim._hyper) { sim._hyper = false; note(sim, 'Saiu da hiperinflação.', 'good'); }
  if (m <= p.mfloor * 1.5 && !sim._dead) { sim._dead = true; note(sim, 'Os saldos reais chegaram ao piso: ninguém quer a moeda. Hora de trocar de moeda ou ancorar.', 'alert'); }
  return rec;
}

/* ---------- curva de Laffer da senhoriagem (estado estacionário, i = 0, y = 1) ---------- */
function laffer(p, lmax, n) {
  const pts = []; lmax = lmax || 3; n = n || 120;
  for (let k = 0; k <= n; k++) { const l = lmax * k / n; pts.push({ l, S: (1 - Math.exp(-l)) * p.m0 * Math.exp(-p.alpha * l) }); }
  return pts;
}
const lafferPeak = p => { const l = Math.log(1 + 1 / p.alpha); return { l, S: (1 - Math.exp(-l)) * p.m0 * Math.exp(-p.alpha * l) }; };

const api = { newSim, step, event, laffer, lafferPeak, PRESETS, PARAMS };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.CHAOS = api;
})(typeof window !== 'undefined' ? window : globalThis);
