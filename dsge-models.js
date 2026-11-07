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

const MODELS = {
  nk3: { name: 'Novo-Keynesiano de 3 equações', text: NK3, shocks: ['ev', 'eu'], show: ['x', 'pi', 'i'] },
  gm_optimal: { name: 'Pequena economia aberta · política ótima', text: gm('optimal'), shocks: ['ea', 'es'], show: ['pih', 'x', 's', 'e', 'r'] },
  gm_ditr: { name: 'Pequena economia aberta · Taylor (inflação doméstica)', text: gm('ditr'), shocks: ['ea', 'es'], show: ['pih', 'x', 's', 'e', 'r'] },
  gm_citr: { name: 'Pequena economia aberta · Taylor (IPC)', text: gm('citr'), shocks: ['ea', 'es'], show: ['pih', 'x', 's', 'e', 'r'] },
  gm_peg: { name: 'Pequena economia aberta · câmbio fixo', text: gm('peg'), shocks: ['ea', 'es'], show: ['pih', 'x', 's', 'e', 'r'] }
};

const out = { MODELS, GM_POLICY, gm };
if (typeof module !== 'undefined' && module.exports) module.exports = out; else root.DSGE_MODELS = out;
})(typeof window !== 'undefined' ? window : globalThis);
