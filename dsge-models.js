/* Modelos prontos para o motor dsge.js. Equações de Galí (2015, cap. 3) e Galí e Monacelli (2005, Review of Economic Studies),
   escritas aqui com nomes e comentários próprios. Calibração: a do artigo; a calibração do Brasil ainda é um ponto de partida didático. */
(function (root) {
'use strict';

const NK3 = `
// Novo-Keynesiano de três equações (economia fechada). Variáveis em desvios do estado estacionário.
var x pi i u v;               // hiato do produto, inflação, juro, choque de custos, choque de política
varexo eu ev;
parameters beta sigma kappa phipi phix rhou rhov;
beta = 0.99; sigma = 1; kappa = 0.1; phipi = 1.5; phix = 0.5; rhou = 0.5; rhov = 0.5;
model;
  x  = x(+1) - (i - pi(+1)) / sigma;          // curva IS
  pi = beta * pi(+1) + kappa * x + u;         // curva de Phillips
  i  = phipi * pi + phix * x + v;             // regra de Taylor
  u  = rhou * u(-1) + eu;
  v  = rhov * v(-1) + ev;
end;
shocks; std eu = 0.01; std ev = 0.0025; end;
`;

// Economia pequena e aberta (Galí-Monacelli 2005). 'policy' escolhe o regime de política monetária.
const GM_POLICY = {
  optimal: { title: 'Política ótima (estabiliza a inflação doméstica)', eq: 'pih = 0;' },
  ditr:    { title: 'Regra de Taylor sobre a inflação doméstica',       eq: 'r = phipi * pih;' },
  citr:    { title: 'Regra de Taylor sobre a inflação ao consumidor',   eq: 'r = phipi * pi;' },
  peg:     { title: 'Câmbio fixo',                                      eq: 'e = 0;' }
};
function gm(policy) {
  return `
// Galí e Monacelli (2005): economia pequena e aberta. Mundo com inflação zero.
var pih x y ynat rnat r s pi e ystar a;
// pih inflação doméstica, x hiato, y produto, ynat produto natural, rnat juro real natural, r juro nominal,
// s termos de troca, pi inflação ao consumidor, e câmbio nominal, ystar produto mundial, a produtividade
varexo ea es;
parameters sigma eta gamma phi theta beta alpha phipi rhoa rhoy;
sigma = 1; eta = 1; gamma = 1; phi = 3; theta = 0.75; beta = 0.99; alpha = 0.4; phipi = 1.5; rhoa = 0.66; rhoy = 0.86;
model;
  #omega   = sigma*gamma + (1-alpha)*(sigma*eta - 1);
  #sigma_a = sigma / ((1-alpha) + alpha*omega);
  #Theta   = (sigma*gamma - 1) + (1-alpha)*(sigma*eta - 1);
  #lambda  = (1 - beta*theta)*(1 - theta)/theta;
  #kappa_a = lambda*(sigma_a + phi);
  #Gamma   = (1 + phi)/(sigma_a + phi);
  #Psi     = -Theta*sigma_a/(sigma_a + phi);

  x    = x(+1) - (r - pih(+1) - rnat)/sigma_a;                                       // IS
  pih  = beta*pih(+1) + kappa_a*x;                                                   // Phillips
  rnat = -sigma_a*Gamma*(1 - rhoa)*a + alpha*sigma_a*(Theta + Psi)*(ystar(+1) - ystar);
  ynat = Gamma*a + alpha*Psi*ystar;
  x    = y - ynat;
  y    = ystar + s/sigma_a;
  pi   = pih + alpha*(s - s(-1));
  s    = s(-1) + e - e(-1) - pih;                                                    // inflação mundial = 0
  a    = rhoa*a(-1) + ea;
  ystar = rhoy*ystar(-1) + es;
  ${GM_POLICY[policy].eq}
end;
shocks; std ea = 0.0071; std es = 0.0078; end;
`;
}

// Choque de custos e política ótima (Galí 2015, cap. 5). Perda: π² + α·x², com α = κ/ε.
//   discrição:  κ·π + α·x = 0        compromisso (perspectiva atemporal):  α·(x − x(-1)) + κ·π = 0
const CP_POLICY = {
  taylor: { title: 'Regra de Taylor', eq: 'i = phipi * pi + phix * x;' },
  discr:  { title: 'Ótima sem compromisso (discrição)', eq: 'kappa * pi + alpha * x = 0;' },
  commit: { title: 'Ótima com compromisso', eq: 'alpha * (x - x(-1)) + kappa * pi = 0;' }
};
function cp(policy) {
  return `
// Novo-Keynesiano com choque de custos (Galí 2015, cap. 5): ${CP_POLICY[policy].title}.
var x pi i u;
varexo eu;
parameters beta sigma kappa epsilon alpha phipi phix rhou;
beta = 0.99; sigma = 1; kappa = 0.1; epsilon = 6; alpha = kappa / epsilon; phipi = 1.5; phix = 0.5; rhou = 0.5;
model;
  x  = x(+1) - (i - pi(+1)) / sigma;
  pi = beta * pi(+1) + kappa * x + u;
  u  = rhou * u(-1) + eu;
  ${CP_POLICY[policy].eq}
end;
shocks; std eu = 0.01; end;
`;
}

// Limite zero do juro (estilo OccBin): dois regimes do mesmo modelo. 'ishadow' é o juro que a regra pediria.
function zlb(floor) {
  return `
var x pi i ishadow rn;
varexo en;
parameters beta sigma kappa phipi phix rhon iss;
beta = 0.99; sigma = 1; kappa = 0.1; phipi = 1.5; phix = 0.5; rhon = 0.8; iss = 1/beta - 1;
model;
  x  = x(+1) - (i - pi(+1) - rn) / sigma;
  pi = beta * pi(+1) + kappa * x;
  ishadow = phipi * pi + phix * x;
  ${floor ? 'i = -iss;' : 'i = ishadow;'}
  rn = rhon * rn(-1) + en;
end;
shocks; std en = 0.01; end;
`;
}

// Desafio: o jogador escolhe o desvio da regra (ev) a cada trimestre; choques de custos e de juro natural são sorteados.
function challenge(policy) {
  const eq = policy === 'player' ? 'i = phipi * pi + phix * x + ev;' : CP_POLICY[policy].eq;
  return `
var x pi i u rn;
varexo eu en ev;
parameters beta sigma kappa epsilon alpha phipi phix rhou rhon;
beta = 0.99; sigma = 1; kappa = 0.1; epsilon = 6; alpha = kappa / epsilon; phipi = 1.5; phix = 0.5; rhou = 0.5; rhon = 0.7;
model;
  x  = x(+1) - (i - pi(+1) - rn) / sigma;
  pi = beta * pi(+1) + kappa * x + u;
  u  = rhou * u(-1) + eu;
  rn = rhon * rn(-1) + en;
  ${eq}
end;
shocks; std eu = 0.004; std en = 0.003; std ev = 0.005; end;
`;
}

// Calibrações. "paper" usa os valores dos artigos. "brasil" é DIDÁTICA: ordens de grandeza, não estimativa (ver nota na tela).
const CALIB = {
  paper:  { name: 'Valores do artigo', over: {}, note: '' },
  brasil: { name: 'Brasil (didática)', over: { alpha: 0.14, theta: 0.8, beta: 0.989, phi: 2, rhoa: 0.9, phipi: 1.5 },
    note: 'Didática, não estimada: α = 0,14 (importações ≈ 14% do PIB, ordem de grandeza), θ = 0,80 (preços mudam a cada ~5 trimestres), β = 0,989 (juro real de equilíbrio ≈ 4,5% ao ano), φ = 2, ρa = 0,9 e φπ = 1,5. Para a calibração estimada do Banco Central, ver o SAMBA (WP 239).' }
};

const GM_GROUP = ['gm_optimal', 'gm_ditr', 'gm_citr', 'gm_peg'];
const CP_GROUP = ['cp_taylor', 'cp_discr', 'cp_commit'];
const GM_SHOW = ['pih', 'x', 's', 'e', 'r'];
const MODELS = {
  nk3: { name: 'Novo-Keynesiano de 3 equações', text: NK3, shocks: ['ev', 'eu'], show: ['x', 'pi', 'i'] },
  cp_taylor: { name: 'Choque de custos · regra de Taylor', text: cp('taylor'), show: ['pi', 'x', 'i'], group: CP_GROUP, loss: { pi: 1, x: 'alpha' } },
  cp_discr: { name: 'Choque de custos · política ótima sem compromisso', text: cp('discr'), show: ['pi', 'x', 'i'], group: CP_GROUP, loss: { pi: 1, x: 'alpha' } },
  cp_commit: { name: 'Choque de custos · política ótima com compromisso', text: cp('commit'), show: ['pi', 'x', 'i'], group: CP_GROUP, loss: { pi: 1, x: 'alpha' } },
  gm_optimal: { name: 'Pequena economia aberta · política ótima', text: gm('optimal'), show: GM_SHOW, group: GM_GROUP, calib: true },
  gm_ditr: { name: 'Pequena economia aberta · Taylor (inflação doméstica)', text: gm('ditr'), show: GM_SHOW, group: GM_GROUP, calib: true },
  gm_citr: { name: 'Pequena economia aberta · Taylor (IPC)', text: gm('citr'), show: GM_SHOW, group: GM_GROUP, calib: true },
  gm_peg: { name: 'Pequena economia aberta · câmbio fixo', text: gm('peg'), show: GM_SHOW, group: GM_GROUP, calib: true },
  nk_zlb: { name: 'Limite zero do juro (piso em 0%)', text: zlb(false), floorText: zlb(true), show: ['x', 'pi', 'i', 'ishadow', 'rn'], zlb: true }
};
const HIDDEN = { ch_player: challenge('player'), ch_taylor: challenge('taylor'), ch_discr: challenge('discr'), ch_commit: challenge('commit') };

const out = { MODELS, HIDDEN, CALIB, GM_POLICY, CP_POLICY, gm, cp, zlb, challenge };
if (typeof module !== 'undefined' && module.exports) module.exports = out; else root.DSGE_MODELS = out;
})(typeof window !== 'undefined' ? window : globalThis);
