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

## 5. Próximos passos propostos

1. Mini-parser + solver doubling + testes de propriedades.
2. Galí-Monacelli 2005 (Brasil) com painel de IRFs e regimes.
3. Galí 2015 cap. 5 (política ótima).
4. Camada TANK e depois estrutura SAMBA-like com os parâmetros dos artigos.
5. Decidir sobre executar o `pyfrbus` para uma versão do FRB/US.
