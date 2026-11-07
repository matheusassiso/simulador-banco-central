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

// TANK (dois agentes): forma reduzida de Debortoli e Galí (2018), seção 3.4. Uma fração lambda das famílias é "keynesiana" (consome a renda).
// A curva de Phillips é igual à do RANK; a IS fica x = E x' − (i − E π' − rn)/[σ(1+χy)] e a taxa natural ganha o fator (1+χn).
// tau0 e taud definem as transferências fiscais: (0,0) sem transferências; (1,0) transferências constantes; (1,1) redistribuição total (= RANK).
const TANK_POLICY = {
  notr:  { title: 'TANK sem transferências',          tau0: 0, taud: 0 },
  const: { title: 'TANK com transferências constantes', tau0: 1, taud: 0 },
  rank:  { title: 'RANK (redistribuição total)',       tau0: 1, taud: 1 }
};
function tank(p) {
  return `
// TANK (Debortoli e Galí): ${TANK_POLICY[p].title}. Variáveis em desvios do estado estacionário.
var x pi i rn z a ynat nu h;
// x hiato, pi inflação, i juro, rn juro natural, z preferência, a tecnologia, ynat produto natural, nu choque de política, h índice de heterogeneidade
varexo ez ea en;
parameters beta sigma phi alpha eps theta lambda tau0 taud phipi phix rhoz rhoa rhonu;
beta = 0.9925; sigma = 1; phi = 1; alpha = 0.25; eps = 9; theta = 0.75; lambda = 0.21;
tau0 = ${TANK_POLICY[p].tau0}; taud = ${TANK_POLICY[p].taud}; phipi = 1.5; phix = 0.125; rhoz = 0.5; rhoa = 0.9; rhonu = 0.5;
model;
  #Mp   = eps / (eps - 1);
  #H    = 1 + lambda * (1 - tau0) / (1 - lambda) * (1 - (1 - alpha) / Mp);
  #psia = (1 + phi) / (sigma * (1 - alpha) + alpha + phi);
  #chiy = lambda / ((1 - lambda) * H) * ((tau0 - taud) * (1 - (1 - alpha) / Mp) - (1 - taud) * (1 - alpha) / Mp * (sigma + (alpha + phi) / (1 - alpha)));
  #chin = lambda * (tau0 - taud) / ((1 - lambda) * H) * (1 - (1 - alpha) / Mp);
  #kap  = (1 - theta) * (1 - beta * theta) / theta * (sigma + (alpha + phi) / (1 - alpha));

  x    = x(+1) - (i - pi(+1) - rn) / (sigma * (1 + chiy));        // IS dinâmica do TANK
  pi   = beta * pi(+1) + kap * x;                                 // Phillips (igual ao RANK)
  rn   = (1 - rhoz) * z + sigma * (1 + chin) * psia * (a(+1) - a);
  ynat = psia * a;
  h    = chiy * x + chin * ynat;                                  // desigualdade de consumo
  i    = phipi * pi + phix * x + nu;                              // regra de Taylor
  z    = rhoz * z(-1) + ez;
  a    = rhoa * a(-1) + ea;
  nu   = rhonu * nu(-1) + en;
end;
shocks; std ez = 0.01; std ea = 0.01; std en = 0.0025; end;
`;
}

// Smets e Wouters (2007, AER), versão log-linear. Duas economias: a de preços e salários rígidos (variáveis sem sufixo) e a flexível
// (sufixo f), que define o hiato do produto na regra de juros. 33 variáveis, 7 choques. Variáveis em desvios (decimais); as unidades dos
// desvios-padrão são as do artigo divididas por 100. Parâmetros: valores do bloco estimated_params da réplica do Pfeifer (modo do artigo).
const SW07 = `
// Smets e Wouters (2007). Variáveis: y produto, c consumo, inv investimento, kp capital instalado, k serviços de capital, zcap utilização,
// rk retorno do capital, pk valor do capital (Tobin), w salário real, lab horas, pi inflação, r juro, mc custo marginal.
// Choques: a produtividade, b prêmio de risco, gov gastos, qi investimento, mp política, mup markup de preços, muw markup de salários.
var y c inv kp k zcap rk pk w lab pi r mc a b gov qi mp mup muw epma ewa
    yf cf invf kpf kf zcf rkf pkf wf labf rrf;
varexo e_a e_b e_g e_q e_m e_p e_w;
parameters alpha delta lamw gshare curvp curvw fc adj habit sigma sigl xiw xip iotaw iotap psi rpi rhoi ry rdy
    rho_a rho_b rho_g rho_q rho_m rho_p rho_w theta_p theta_w gy_a trend constebeta
    sd_a sd_b sd_g sd_q sd_m sd_p sd_w;
alpha = 0.24; delta = 0.025; lamw = 1.5; gshare = 0.18; curvp = 10; curvw = 10; fc = 1.5;
adj = 6.0144; habit = 0.6361; sigma = 1.5; sigl = 1.9423; xiw = 0.8087; xip = 0.6; iotaw = 0.3243; iotap = 0.47; psi = 0.2696;
rpi = 1.488; rhoi = 0.8762; ry = 0.0593; rdy = 0.2347;
rho_a = 0.9977; rho_b = 0.5799; rho_g = 0.9957; rho_q = 0.7165; rho_m = 0; rho_p = 0; rho_w = 0; theta_p = 0; theta_w = 0;
gy_a = 0.51; trend = 0.3982; constebeta = 0.742;
sd_a = 0.004618; sd_b = 0.018513; sd_g = 0.00609; sd_q = 0.006017; sd_m = 0.002397; sd_p = 0.001455; sd_w = 0.002089;
model;
  // relações do estado estacionário
  #gam    = 1 + trend/100;
  #beta   = 1/(1 + constebeta/100);
  #betabar = beta * gam^(-sigma);
  #rkss   = beta^(-1) * gam^sigma - (1 - delta);
  #wss    = (alpha^alpha * (1-alpha)^(1-alpha) / (fc * rkss^alpha))^(1/(1-alpha));
  #ikbar  = 1 - (1-delta)/gam;
  #ik     = ikbar * gam;
  #lk     = ((1-alpha)/alpha) * (rkss/wss);
  #ky     = fc * lk^(alpha-1);
  #iy     = ik * ky;
  #cy     = 1 - gshare - ik*ky;
  #rkky   = rkss * ky;
  #whlc   = (1/lamw) * (1-alpha)/alpha * rkss*ky/cy;
  #hh     = habit/gam;
  #bg     = betabar*gam;

  // ---- economia flexível ----
  a    = alpha*rkf + (1-alpha)*wf;
  zcf  = ((1-psi)/psi) * rkf;
  rkf  = wf + labf - kf;
  kf   = kpf(-1) + zcf;
  invf = (1/(1+bg)) * (invf(-1) + bg*invf(+1) + (1/(gam^2*adj))*pkf) + qi;
  pkf  = -rrf + (sigma*(1+hh)/(1-hh))*b + (rkss/(rkss+1-delta))*rkf(+1) + ((1-delta)/(rkss+1-delta))*pkf(+1);
  cf   = hh/(1+hh)*cf(-1) + 1/(1+hh)*cf(+1) + ((sigma-1)*whlc/(sigma*(1+hh)))*(labf - labf(+1)) - (1-hh)/(sigma*(1+hh))*rrf + b;
  yf   = cy*cf + iy*invf + gov + rkky*zcf;
  yf   = fc*(alpha*kf + (1-alpha)*labf + a);
  wf   = sigl*labf + (1/(1-hh))*cf - (hh/(1-hh))*cf(-1);
  kpf  = (1-ikbar)*kpf(-1) + ikbar*invf + ikbar*gam^2*adj*qi;

  // ---- economia com preços e salários rígidos ----
  mc   = alpha*rk + (1-alpha)*w - a;
  zcap = ((1-psi)/psi) * rk;
  rk   = w + lab - k;
  k    = kp(-1) + zcap;
  inv  = (1/(1+bg)) * (inv(-1) + bg*inv(+1) + (1/(gam^2*adj))*pk) + qi;
  pk   = -r + pi(+1) + (sigma*(1+hh)/(1-hh))*b + (rkss/(rkss+1-delta))*rk(+1) + ((1-delta)/(rkss+1-delta))*pk(+1);
  c    = hh/(1+hh)*c(-1) + 1/(1+hh)*c(+1) + ((sigma-1)*whlc/(sigma*(1+hh)))*(lab - lab(+1)) - (1-hh)/(sigma*(1+hh))*(r - pi(+1)) + b;
  y    = cy*c + iy*inv + gov + rkky*zcap;
  y    = fc*(alpha*k + (1-alpha)*lab + a);
  pi   = (1/(1+bg*iotap)) * (bg*pi(+1) + iotap*pi(-1) + ((1-xip)*(1-bg*xip)/xip)/((fc-1)*curvp+1)*mc) + mup;
  w    = (1/(1+bg))*w(-1) + (bg/(1+bg))*w(+1) + (iotaw/(1+bg))*pi(-1) - ((1+bg*iotaw)/(1+bg))*pi + (bg/(1+bg))*pi(+1)
         + ((1-xiw)*(1-bg*xiw)/((1+bg)*xiw)) * (1/((lamw-1)*curvw+1)) * (sigl*lab + (1/(1-hh))*c - (hh/(1-hh))*c(-1) - w) + muw;
  r    = rpi*(1-rhoi)*pi + ry*(1-rhoi)*(y-yf) + rdy*(y-yf-y(-1)+yf(-1)) + rhoi*r(-1) + mp;
  kp   = (1-ikbar)*kp(-1) + ikbar*inv + ikbar*gam^2*adj*qi;

  // ---- choques ----
  a    = rho_a*a(-1) + e_a;
  b    = rho_b*b(-1) + e_b;
  gov  = rho_g*gov(-1) + e_g + gy_a*e_a;
  qi   = rho_q*qi(-1) + e_q;
  mp   = rho_m*mp(-1) + e_m;
  mup  = rho_p*mup(-1) + epma - theta_p*epma(-1);
  epma = e_p;
  muw  = rho_w*muw(-1) + ewa - theta_w*ewa(-1);
  ewa  = e_w;
end;
shocks; std e_a = sd_a; std e_b = sd_b; std e_g = sd_g; std e_q = sd_q; std e_m = sd_m; std e_p = sd_p; std e_w = sd_w; end;
`;

// Calibrações. "paper" usa os valores dos artigos. "brasil" é DIDÁTICA: ordens de grandeza, não estimativa (ver nota na tela).
const CALIB = {
  paper:  { name: 'Valores do artigo', over: {}, note: '' },
  tank_default: { name: 'Calvo, θ = 0,75 (padrão)', over: {}, note: 'A curva de Phillips usa preços de Calvo com θ = 0,75 (κ ≈ 0,23). A heterogeneidade não altera a oferta neste modelo; só a curva IS muda.' },
  dg: { name: 'inclinação do artigo (κ ≈ 0,06)', over: { theta: 0.8655 }, note: 'θ = 0,8655 reproduz κ ≈ 0,06, perto da inclinação da calibração de Debortoli e Galí (custo de ajuste ξ = 372,8, ε = 9). Os demais parâmetros seguem o artigo (β = 0,9925, σ = 1, φ = 1, 1−α = 3/4, λ = 0,21); ρ de a, z e do choque de política são didáticos.' },
  sw07_orig: { name: 'Smets-Wouters: arquivo original (usmodel)', over: {}, note: 'Parâmetros e desvios-padrão do arquivo de replicação original de Smets e Wouters (2007), conferidos em duas implementações independentes (Pfeifer e MacroModelling.jl). Variáveis em decimais; os desvios-padrão são os do artigo divididos por 100.' },
  sw07_rep: { name: 'Réplica do Pfeifer (estimated_params)', over: { sigma: 1.2312, fc: 1.4672, gy_a: 0.05, adj: 6.3325, habit: 0.7205, xiw: 0.7937, sigl: 2.8401, xip: 0.7813, iotaw: 0.4425, iotap: 0.3291, psi: 0.2648,
    rpi: 1.7985, rhoi: 0.8258, ry: 0.0893, rdy: 0.2239, rho_a: 0.9676, rho_b: 0.2703, rho_g: 0.993, rho_q: 0.5724, rho_m: 0.3, rho_p: 0.8692, rho_w: 0.9546, theta_p: 0.7652, theta_w: 0.8936,
    sd_b: 0.001818513, sd_q: 0.0046017 },
    note: 'Valores iniciais do bloco estimated_params do arquivo de réplica do Pfeifer (uma reestimação com ruído de MA nos markups). Não são necessariamente os do artigo.' },
  brasil: { name: 'Brasil (didática)', over: { alpha: 0.14, theta: 0.8, beta: 0.989, phi: 2, rhoa: 0.9, phipi: 1.5 },
    note: 'Didática, não estimada: α = 0,14 (importações ≈ 14% do PIB, ordem de grandeza), θ = 0,80 (preços mudam a cada ~5 trimestres), β = 0,989 (juro real de equilíbrio ≈ 4,5% ao ano), φ = 2, ρa = 0,9 e φπ = 1,5. Para a calibração estimada do Banco Central, ver o SAMBA (WP 239).' }
};

const GM_GROUP = ['gm_optimal', 'gm_ditr', 'gm_citr', 'gm_peg'];
const CP_GROUP = ['cp_taylor', 'cp_discr', 'cp_commit'];
const TANK_GROUP = ['tank_notr', 'tank_const', 'tank_rank'];
const TANK_CAL = ['tank_default', 'dg'], GM_CAL = ['paper', 'brasil'];
const GM_SHOW = ['pih', 'x', 's', 'e', 'r'];
const MODELS = {
  nk3: { name: 'Novo-Keynesiano de 3 equações', text: NK3, shocks: ['ev', 'eu'], show: ['x', 'pi', 'i'] },
  cp_taylor: { name: 'Choque de custos · regra de Taylor', text: cp('taylor'), show: ['pi', 'x', 'i'], group: CP_GROUP, loss: { pi: 1, x: 'alpha' } },
  cp_discr: { name: 'Choque de custos · política ótima sem compromisso', text: cp('discr'), show: ['pi', 'x', 'i'], group: CP_GROUP, loss: { pi: 1, x: 'alpha' } },
  cp_commit: { name: 'Choque de custos · política ótima com compromisso', text: cp('commit'), show: ['pi', 'x', 'i'], group: CP_GROUP, loss: { pi: 1, x: 'alpha' } },
  gm_optimal: { name: 'Pequena economia aberta · política ótima', text: gm('optimal'), show: GM_SHOW, group: GM_GROUP, calib: GM_CAL },
  gm_ditr: { name: 'Pequena economia aberta · Taylor (inflação doméstica)', text: gm('ditr'), show: GM_SHOW, group: GM_GROUP, calib: GM_CAL },
  gm_citr: { name: 'Pequena economia aberta · Taylor (IPC)', text: gm('citr'), show: GM_SHOW, group: GM_GROUP, calib: GM_CAL },
  gm_peg: { name: 'Pequena economia aberta · câmbio fixo', text: gm('peg'), show: GM_SHOW, group: GM_GROUP, calib: GM_CAL },
  tank_notr: { name: 'TANK · sem transferências', text: tank('notr'), show: ['x', 'pi', 'i', 'h'], group: TANK_GROUP, calib: TANK_CAL },
  tank_const: { name: 'TANK · transferências constantes', text: tank('const'), show: ['x', 'pi', 'i', 'h'], group: TANK_GROUP, calib: TANK_CAL },
  tank_rank: { name: 'RANK · redistribuição total (sem heterogeneidade)', text: tank('rank'), show: ['x', 'pi', 'i', 'h'], group: TANK_GROUP, calib: TANK_CAL },
  sw07: { name: 'Smets-Wouters (2007) · economia dos EUA, 33 variáveis', text: SW07, show: ['y', 'c', 'inv', 'pi', 'r', 'w'], calib: ['sw07_orig', 'sw07_rep'] },
  nk_zlb: { name: 'Limite zero do juro (piso em 0%)', text: zlb(false), floorText: zlb(true), show: ['x', 'pi', 'i', 'ishadow', 'rn'], zlb: true }
};
const HIDDEN = { ch_player: challenge('player'), ch_taylor: challenge('taylor'), ch_discr: challenge('discr'), ch_commit: challenge('commit') };

const out = { MODELS, HIDDEN, CALIB, GM_POLICY, CP_POLICY, TANK_POLICY, gm, cp, zlb, tank, challenge };
if (typeof module !== 'undefined' && module.exports) module.exports = out; else root.DSGE_MODELS = out;
})(typeof window !== 'undefined' ? window : globalThis);
