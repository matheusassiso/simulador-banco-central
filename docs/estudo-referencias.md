# Estudo de referências abertas para o Modo Pesquisa

Data do estudo: 2026-11-07. Tudo foi baixado só para leitura, em `Documents\Claude Code Projects\referencias-simuladores\`
(fora do repo, cerca de 190 MB). Nada foi executado. Esta pasta não entra no Git por causa de tamanho e de licenças.

## 1. O que foi baixado

| Pasta | Origem | Licença | Para que serve |
|---|---|---|---|
| `DSGE_mod` | JohannesPfeifer/DSGE_mod | GPL-3 | 40+ réplicas de artigos em Dynare (Galí 2015, Galí-Monacelli 2005, Smets-Wouters 2007, SGU, Aguiar-Gopinath…) |
| `MacroModelling.jl` | thorek1/MacroModelling.jl | MIT | Solver de DSGE em Julia + `models/` com FRBUS, NAWM, QUEST3, Smets-Wouters e outros |
| `DSGE.jl` | FRBNY-DSGE/DSGE.jl (só `src/` e `docs/`) | BSD-3 | Modelo e estimador do NY Fed; `gensys`, `klein`, HANK |
| `Dynare.jl` | DynareJulia/Dynare.jl | sem SPDX declarado | Reescrita do Dynare: parser de `.mod`, perturbação, política ótima |
| `pyfrbus` | federalreserve.gov (pyfrbus.zip + dados) | **domínio público** | FRB/US: 367 equações, solver Newton, demos e dados |
| `sequence-jacobian` | shade-econ/sequence-jacobian | MIT | HANK no espaço de sequências (fake news) |
| `QuantEcon.py` | QuantEcon/QuantEcon.py | MIT | Algoritmos (LQ, Kalman, Markov) |
| `HARK` | econ-ark/HARK | Apache-2.0 | Agentes heterogêneos |
| `MFMod-ModelFlow` | worldbank/MFMod-ModelFlow | CC0 | Modelos macro-fiscais de países (Bolívia, Croácia, Iraque, Nepal, Paquistão, Turquia) em Python |
| `IRIS-Toolbox` | IRIS-Solutions-Team | sem SPDX declarado | MATLAB, usado em bancos centrais |
| `eurace_unibi` | ETACE/eurace_unibi | sem SPDX declarado | Modelo baseado em agentes, em C |
| `openfisca-core` | openfisca/openfisca-core | AGPL-3 | Motor de regras fiscais (França) |

Não baixados: PolicyEngine EUA e Reino Unido e Tax-Calculator (0,4 a 1,7 GB cada, microsimulação fiscal, fora do foco macro) e o EUROMOD (exige cadastro).

## 2. O que aprendi

**Solver sem QZ (o mais útil para JavaScript).** O MacroModelling.jl resolve a forma de primeira ordem pela equação quadrática matricial
`A·X² + B·X + C = 0` e oferece quatro algoritmos: Schur (rápido), **doubling** (o mais preciso), iteração de tempo linear e iteração quadrática.
O doubling usa só produtos e inversões de matrizes, sem decomposição QZ generalizada. O código cita Huber, Meyer-Gohde e Saecker (2024),
"Solving Linear DSGE Models with Structure Preserving Doubling Methods" (arXiv 2212.09491). Inicia com `E = B⁻¹C`, `F = B⁻¹A`, `X = −E`, `Y = −F`
e itera com termos `(I − YX)⁻¹`. Conclusão: dá para escrever o solver em JS a partir do **artigo** (não do código) e validar por propriedades.
Já o DSGE.jl usa `gensys` (Sims) e `klein`, que dependem de QZ com reordenamento: mais trabalhoso em JS.

**Modelo aberto pequeno (Galí-Monacelli 2005).** O `.mod` tem cerca de 20 variáveis e 2 equações de olhar para frente (curva IS e curva de Phillips),
com choques de produtividade e de produto externo, e quatro regimes de política: ótima (`pih = 0`), regra de Taylor sobre inflação doméstica,
regra sobre IPC e câmbio fixo. Reproduz a Figura 1 (IRFs), a Tabela 1 (propriedades cíclicas) e a Tabela 2 (perdas de bem-estar). É pequeno e muito
próximo do que o modo Brasil precisa (abertura, câmbio, termos de troca).

**Coleção do Pfeifer.** Útil também: `Gali_2015` (capítulos 2 a 8, incluindo política ótima sob compromisso e discrição e limite zero),
`Smets_Wouters_2007`, `SGU_2003/2004` (economia pequena aberta com prêmio de dívida), `Aguiar_Gopinath_2007` e `GarciaCicco_et_al_2010` (emergentes),
`Guerrieri_Iacoviello_2015` (restrição ocasionalmente ativa) e `NK_linear_forward_guidance`.

**FRB/US (domínio público).** O `model.xml` descreve cada variável com `equation_type`, `python_equation`, `rhs_eq_var` e metadados.
São 367 equações (533 KB). O pacote tem ordenação em blocos (`block_ordering`), Jacobianos esparsos, solver Newton, simulação estocástica e
demos que reproduzem cenários como um choque de 100 pontos-base na política monetária. As expressões em `python_equation` são simples
(`max(...)`, defasagens), portanto convertíveis para JS. Os dados (`LONGBASE.TXT`, `HISTDATA.TXT`) também são de domínio público.

**MacroModelling.jl como catálogo.** Traz implementações de FRBUS, NAWM_EAUS_2008 (BCE), QUEST3_2009 (Comissão Europeia), GNSS_2010,
Smets-Wouters 2003 e 2007 e Iacoviello 2005. Serve de mapa de "o que existe" e de comparação de estruturas.

**HANK.** O `sequence-jacobian` separa blocos simples e blocos heterogêneos e usa o algoritmo "fake news". Um HANK completo é caro; uma versão
de dois agentes (TANK, ricardianos e não ricardianos) cobre o essencial do SAMBA e custa pouco.

**MFMod.** Os modelos de país (CC0) vêm de EViews convertidos por ModelFlow, com dados em formatos próprios (`.pcim`, `.wf1`). Valioso como
referência, caro de integrar.

## 3. O que dá para integrar, por valor, custo e risco

1. **Mini-parser de modelo linear no estilo Dynare + solver doubling (JS).** Custo baixo a médio. O usuário escreve `x = x(+1) − ...`, o app
   extrai as matrizes A, B, C por avaliação numérica e resolve. Base de tudo. Código **próprio**, escrito a partir dos artigos.
2. **Galí-Monacelli 2005 com calibração Brasil e os quatro regimes** (IRFs, comparação de política, perda de bem-estar). Custo baixo.
   Escrever do artigo, com nomes e comentários próprios; não copiar o `.mod` (GPL-3).
3. **Galí 2015 cap. 3 e 5:** três equações e política ótima (compromisso e discrição). Custo baixo, com solução analítica para validar.
4. **TANK/SAMBA-like por camadas** em cima do item 1. Custo médio. Parâmetros do SAMBA só dos artigos oficiais.
5. **FRB/US (domínio público) com expectativas VAR.** Custo alto: parser das 367 equações, Newton com Jacobiano esparso, carga de dados.
   Valor alto: o modelo oficial do Fed, com demos que servem de teste. Com expectativas de previsão perfeita o sistema empilhado fica muito
   maior; ficaria para depois.
6. **Restrição de limite zero (OccBin).** Custo médio a alto; usa Guerrieri-Iacoviello como roteiro.
7. **HANK completo, agentes (Eurace), microsimulação fiscal (OpenFisca):** só como inspiração por enquanto.

**Licenças.** MIT, BSD-3, Apache-2.0, CC0 e domínio público podem ser usados com atribuição quando exigida. **GPL-3 (Pfeifer) e AGPL (OpenFisca)**:
usar só como referência de comparação, sem copiar código para um projeto de outra licença. Equações de artigos científicos podem ser reimplementadas.

## 4. Como validar sem Dynare nem Julia

Nada disso está instalado aqui e nada baixado foi executado. Validação possível agora, por propriedades:
- Condições de Blanchard-Kahn (determinação) pela posição dos autovalores.
- Soluções analíticas conhecidas (NK de três equações; Galí-Monacelli sob política ótima: termos de troca seguem a tecnologia um a um).
- Identidades do próprio modelo (câmbio fixo implica `e = 0`).
- Resíduo da equação quadrática próximo de zero.
Para validar contra números oficiais (FRB/US), seria preciso **executar o `pyfrbus` do Fed** (Python, requer pandas, numpy, scipy e uma
biblioteca simbólica). Isso é executar código baixado e precisa de autorização explícita antes.

## 4b. Status (2026-11-07): itens 1 a 3 feitos e pyfrbus executado

**Motor DSGE próprio** (`dsge.js`, `dsge-models.js`, `research.js`, `test/dsge.test.js`): parser de modelos no estilo Dynare (sem `eval`),
solver doubling, determinação por ρ(X) e ρ(F), funções de impulso-resposta e momentos teóricos (Lyapunov). 15 testes, todos passando:
- solução escalar e matricial da equação quadrática, com resíduo ~1e-17;
- NK de três equações igual à solução analítica de Galí (2015, cap. 3) com erro menor que 1e-10;
- princípio de Taylor: φπ = 1,5 determinado e φπ = 0,5 indeterminado;
- desvio-padrão e autocorrelação de um AR(1) iguais às fórmulas fechadas;
- Galí-Monacelli 2005: determinado nos quatro regimes; sob política ótima a inflação doméstica fica em zero e os termos de troca seguem a
  tecnologia um a um; no câmbio fixo o câmbio nominal fica em zero.
Raízes unitárias (câmbio nominal e nível de preços) contam como estáveis, como no Dynare (critério 1 + 1e-5); a tela avisa e não calcula
momentos nesse caso. No app: painel "Pesquisa", com editor de modelo, parâmetros editáveis, IRFs e comparação dos quatro regimes.

**FRB/US executado.** O `pyfrbus` (domínio público) rodou num ambiente virtual isolado (pandas 2.3, numpy 2.4, scipy, symengine,
networkx, lxml, multiprocess, matplotlib e `sympy==1.3`, como o pacote exige; com sympy novo o Jacobiano simbólico falha). Cenário do demo
oficial: +100 pb em `rffintay_aerr` em 2040Q1, meta de superávit. Resultado salvo em `docs/ref/frbus-choque-100pb.json` (base, choque e desvio de
10 variáveis em 24 trimestres), gerado por `tools/pyfrbus_reference.py`:
- juro (`rff`): +1,00 no 1º trimestre, depois 0,83, 0,66 e 0,50;
- desemprego (`lur`): sobe até cerca de +0,26 p.p. por volta do 8º trimestre;
- inflação básica (`picxfe`): cai até cerca de −0,03 p.p.
O comportamento é o esperado (juro maior, desemprego maior, inflação menor). Isso é referência para uma futura versão em JavaScript do FRB/US:
o portador terá de reproduzir esses números.

## 4c. Status (segunda rodada)

Feito, com 20 testes passando (`node test/dsge.test.js`):
- **Política ótima (Galí 2015, cap. 5).** Discrição, compromisso e regra de Taylor com choque de custos. Testes: fórmula fechada da discrição
  (π = u/(1 + κ²/α − βρ) e x = −(κ/α)π, erro < 1e-10), nível de preços = −(α/κ)·x sob compromisso e perdas na ordem
  compromisso < discrição < Taylor. Na tela, a regra de Taylor tem perda 3,45 vezes a da ótima com compromisso.
- **Limite zero do juro** (`occbin` em `dsge.js`, previsão perfeita, palpite e verificação do número T de trimestres no piso). Choque pequeno
  não restringe e iguala o linear; choque grande (3 desvios-padrão negativos no juro natural) fica 6 trimestres no piso, com juro-sombra abaixo
  do piso e recessão maior que a linear.
- **Calibração do Brasil para o Galí-Monacelli: DIDÁTICA.** α = 0,14, θ = 0,80, β = 0,989, φ = 2, ρa = 0,9, φπ = 1,5. São ordens de grandeza,
  não estimativas. A calibração estimada do BCB é a do SAMBA (WP 239).
- **Desafio** no painel Pesquisa: o jogador escolhe o desvio da regra de Taylor a cada trimestre contra choques sorteados; a perda é comparada com
  Taylor e com a política ótima sob os mesmos choques. Com desvio zero a perda é idêntica à da regra de Taylor (verificado).
- **Dados reais do BCB** (API SGS, com CORS aberto): Selic meta (432), IPCA 12m (13522) e IBC-Br dessazonalizado (24364) dos últimos 10 anos,
  com regra de Taylor didática (juro de equilíbrio 4,5%, hiato por filtro HP, metas do CMN).

**TANK (feito).** Baixei e li o rascunho de 2018 de Debortoli e Galí ("Monetary policy with heterogeneous agents: insights from TANK models",
CREI), seção 3.4, e implementei a forma reduzida: curva de Phillips igual à do RANK e curva IS
`x = E x' − (i − E π' − rn)/[σ(1+χy)]`, com `rn = (1−ρz)z + σ(1+χn)·ψa·E(Δa')` e χy, χn, H dados pelo artigo em função de λ, τ0, τd. Três
regimes fiscais: sem transferências (τ0=τd=0), transferências constantes (1,0) e redistribuição total (1,1 = RANK). Validação (25 testes):
- com redistribuição total χy = χn = 0 e a solução coincide com λ = 0 e com a fórmula analítica do NK;
- sem transferências χy < 0 e χn = 0; com transferências constantes χy < 0 e χn > 0 (como o artigo afirma);
- a condição de sinal do artigo, χy > 0 ⇔ (τ0−τd)/(1−τd) > (σ(1−α)+φ+α)/(Mp−1+α), vale em 200 sorteios (100 de cada sinal);
- o choque de juros é amplificado em relação ao RANK. Com a inclinação do artigo (κ ≈ 0,06), o pico do hiato é 0,48% sem transferências contra
  0,34% no RANK (razão 1,41); com Calvo θ = 0,75 (κ ≈ 0,23) a razão cai para 1,25. O pico cresce com λ (0,29% para 0,42% de λ = 0,21 para 0,40).
Limite: os números exatos da Figura 1 do artigo não foram extraídos, então a conferência é qualitativa e por fórmulas, não ponto a ponto.
O artigo calibra a curva de Phillips por custo de ajuste de Rotemberg (ξ = 372,8, ε = 9); aqui há duas opções: Calvo com θ = 0,75 (padrão) ou
θ = 0,8655, que dá κ ≈ 0,06.

**Smets-Wouters 2007 (feito).** Modelo log-linear de 33 variáveis e 7 choques (economia rígida e economia flexível, que define o hiato na
regra de juros), escrito com nomes próprios a partir das equações do artigo, conferido contra uma segunda implementação independente
(`Smets_Wouters_2007_linear.jl`, MacroModelling.jl, MIT): equação por equação, as mesmas. Validação (29 testes):
- solução determinada, resolvida pelo doubling em 11 iterações (resíduo ~1e-15, ~50 ms);
- o doubling coincide (diferença máxima < 1e-7) com um solver independente por iteração de tempo linear, numa matriz de 33×33;
- com rigidez nominal quase nula (ξp = ξw = 1e-6) a economia rígida replica a flexível para os quatro choques reais (produtividade, prêmio de
  risco, gastos e investimento): produto, consumo, investimento, horas e salário, em 20 trimestres. Isso só vale se as equações comuns às duas
  economias estiverem coerentes;
- choque contracionista de política: juro sobe, produto, consumo e investimento caem (investimento mais que consumo), inflação cai, efeito se dissipa.
  Com o choque de 1 desvio-padrão (0,24 p.p. trimestral), o pico do produto é −0,57% (trimestre 3) e o do investimento −0,90% (trimestre 5).
Dois conjuntos de parâmetros, selecionáveis na tela: o do arquivo original `usmodel` (padrão; é também o do MacroModelling.jl) e o bloco
`estimated_params` da réplica do Pfeifer. Os dois dão respostas parecidas (produto −0,57% e −0,55%), então o tamanho da resposta vem da
estrutura do modelo e não do conjunto escolhido.
Limites: os desvios-padrão estão em decimais (os do artigo ÷ 100); não comparei com as figuras do artigo ponto a ponto nem com o Dynare (não
instalado); as equações de preços e salários foram validadas pelo limite sem rigidez e pela equivalência com a segunda fonte, não por números
publicados.

Pendente, com o motivo:
- **SAMBA (WP 239) e FRB/US em JavaScript:** os trabalhos mais longos; seguem como estavam.

## 5. Próximos passos propostos

1. ~~Mini-parser + solver doubling + testes de propriedades.~~ Feito.
2. ~~Galí-Monacelli 2005 com painel de IRFs e regimes.~~ Feito (calibração do artigo; calibração do Brasil ainda pendente).
3. Galí 2015 cap. 5 (política ótima sob compromisso e discrição, função de perda).
4. Camada TANK e depois estrutura SAMBA-like com os parâmetros dos artigos.
5. FRB/US em JavaScript, validado contra `docs/ref/frbus-choque-100pb.json`.
