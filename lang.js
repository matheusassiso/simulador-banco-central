/* Inglês (EN) por tradução do DOM: o jogo é escrito em português; este arquivo traduz os textos visíveis,
   inclusive os que mudam durante a partida. Textos sem tradução ficam em português. */
(function(){
'use strict';
const EN={
/* cabeçalho e navegação */
'Simulador do Banco Central':'Central Bank Simulator',
'Banco Central do Brasil · simulação':'Central Bank of Brazil · simulation',
'Banco central genérico · simulação':'Generic central bank · simulation',
'Leve o IPCA à meta de 3% sem sacrificar o emprego. A Selic leva meses para agir.':'Bring IPCA inflation to the 3% target without sacrificing jobs. The Selic rate takes months to work.',
'Leve a inflação a 2% com pleno emprego. Cuidado com as defasagens.':'Bring inflation to 2% with full employment. Mind the lags.',
'Como jogar':'How to play','Brasil · BCB':'Brazil · BCB','Clássico':'Classic',
'Mês':'Month','Mandato':'Term','Pontuação de estabilidade':'Stability score','Mandato · preços':'Mandate · prices','Mandato · emprego':'Mandate · employment','Desejável · crescimento':'Preferred · growth',
'Painel':'Dashboard','Previsão':'Forecast','Monitores':'Monitors','Mercados e famílias':'Markets and households','Governo':'Government','Compartilhar':'Share','Conquistas':'Achievements','Ranking':'Ranking','Diário':'Log',
/* status */
'Na meta':'On target','Acima do centro, na banda':'Above center, within band','Abaixo do centro, na banda':'Below center, within band','Inflação fora da meta':'Inflation off target','Inflação baixa demais':'Inflation too low',
'Pleno emprego':'Full employment','Desemprego alto':'High unemployment','Folga no mercado de trabalho':'Labor market slack','Mercado superaquecido':'Overheated market','Mercado apertado':'Tight market',
'Recessão':'Recession','Superaquecido':'Overheating','Fraco':'Weak','Saudável':'Healthy',
/* banners */
'Partida salva encontrada':'Saved game found','Continuar partida':'Resume game','Descartar':'Discard',
'Mandato encerrado':'Term ended','Continuar jogando (sem fim)':'Keep playing (endless)','Nova economia':'New economy',
'Fim do mandato':'End of term','Demitido':'Dismissed','Não reconduzido':'Not reappointed','Pressão insustentável':'Unsustainable pressure',
'Um ano inteiro com credibilidade abaixo de 8%. Você deixa o cargo.':'A whole year with credibility below 8%. You leave office.',
/* painel */
'Painel econômico':'Economic dashboard','Repetição contrafactual':'Counterfactual replay',
'A linha tracejada roxa mostra a inflação e o desemprego da mesma economia sob outra regra, com os mesmos choques.':'The dashed purple line shows inflation and unemployment of the same economy under another rule, with the same shocks.',
'Fechar comparação':'Close comparison',
'IPCA (3 meses anualizada)':'IPCA inflation (3-month annualized)','Inflação (3 meses anualizada)':'Inflation (3-month annualized)',
'Tendência 3m':'3m trend','Leitura mensal':'Monthly reading','Expectativa (Focus)':'Expectations (Focus)','Expectativa':'Expectations',
'Desemprego':'Unemployment','Inflação':'Inflation','Taxa':'Rate','Taxa natural (com cicatrizes)':'Natural rate (with scarring)',
'Juro real ex-ante':'Ex-ante real rate','Neutro nominal':'Nominal neutral','Selic':'Selic','Juro básico':'Policy rate','Juro':'Rate',
'PIB (crescimento em 12 meses)':'GDP (12-month growth)','Crescimento':'Growth','Potencial':'Potential',
'Previsão da equipe':'Staff forecast','24 meses · sem novos choques':'24 months · no new shocks','Inflação em 12 meses':'Inflation, 12 months',
'Seus ajustes mantidos':'Your settings held','Piloto de Taylor':'Taylor autopilot',
'Projeção determinística a partir de hoje: os juros ficam onde você deixou (ou o piloto de Taylor assume) e nenhum choque novo acontece. Serve para ver para onde a economia já está indo, não como previsão do que vai acontecer.':'Deterministic projection from today: rates stay where you left them (or the Taylor autopilot takes over) and no new shocks occur. It shows where the economy is already heading, not a prediction of what will happen.',
/* monitores */
'Monitores de nível':'Level monitors','índices · 100 = dia da posse':'indices · 100 = day in office',
'Nível de preços acumulado':'Cumulative price level','IPCA acumulado':'Cumulative IPCA','Índice de preços':'Price index',
'Desde a posse':'Since taking office','Últimos 12 meses':'Last 12 months','Últimos 3 anos (a.a.)':'Last 3 years (p.a.)','Média anual':'Annual average','Desvio da trajetória':'Gap from path',
'R$ 100 hoje compram':'R$ 100 today buys','$ 100 hoje compram':'$ 100 today buys',
'PIB real acumulado':'Cumulative real GDP','PIB efetivo':'Actual GDP','Tendência herdada':'Inherited trend','Potencial vs tendência':'Potential vs trend','Perdido em recessões':'Lost to slumps',
'PIB nominal e trajetória':'Nominal GDP and path','PIB nominal':'Nominal GDP','Preços ao consumidor vs deflator':'Consumer prices vs deflator',
'IPCA (12m)':'IPCA (12m)','Consumidor (12m)':'Consumer (12m)','Deflator do PIB (12m)':'GDP deflator (12m)',
'Câmbio · R$ por US$':'Exchange rate · R$ per US$','Índice do dólar (100 = posse)':'Dollar index (100 = day in office)',
'Juro real alto atrai capital e valoriza o real, o que ajuda a derrubar o IPCA. Risco fiscal e perda de credibilidade fazem o contrário.':'A high real rate attracts capital and strengthens the real, which helps pull IPCA down. Fiscal risk and lost credibility do the opposite.',
'Curva de juros':'Yield curve','2 anos':'2 years','10 anos':'10 years',
/* mesa */
'Reunião do Copom':'Copom meeting','Mesa de política':'Policy desk','Sem reunião do Copom este mês':'No Copom meeting this month','O Copom se reúne este mês':'Copom meets this month','decida a Selic':'set the Selic rate',
'Meta da taxa Selic':'Selic target rate','Taxa básica de juros':'Policy interest rate',
'A Selic só muda nas reuniões do Copom. Avance até a próxima.':'The Selic rate only changes at Copom meetings. Advance to the next one.',
'Partida encerrada.':'Game over.','O piloto automático decide os juros ao avançar.':'The autopilot sets rates when you advance.',
'Balanço · QT ↔ QE':'Balance sheet · QT ↔ QE','Neutro':'Neutral','Apertar':'Tighten','Afrouxar':'Ease',
'Funciona até no piso dos juros, comprimindo o prêmio a termo.':'Works even at the lower bound, by compressing the term premium.',
'Avançar um mês ▸':'Advance one month ▸','Avançar ▸':'Advance ▸','▶ Rodar automático':'▶ Auto-run','❚❚ Pausar':'❚❚ Pause','Reiniciar':'Restart',
'Focus 12m':'Focus 12m','Credibilidade':'Credibility','Hiato do produto':'Output gap','Juro real − neutro':'Real rate − neutral','Fragilidade financeira':'Financial fragility','Baixa':'Low','Elevada':'Elevated','Crítica':'Critical',
'Piloto automático':'Autopilot','Regra de Taylor':'Taylor rule','· reage à inflação e ao hiato do produto separadamente':'· reacts to inflation and the output gap separately',
'Meta de PIB nominal':'Nominal GDP targeting','· mantém o PIB nominal numa trajetória de':'· keeps nominal GDP on a path of','ao ano':'a year',
'PIB nominal · repõe só as quedas':'Nominal GDP · make up shortfalls only','PIB nominal · nível estrito (devolve excessos)':'Nominal GDP · strict level (claw back overshoots)','PIB nominal · só crescimento (sem reposição)':'Nominal GDP · growth only (no catch-up)',
'Limitador de fragilidade':'Fragility governor','· no máximo':'· at most','p.p. a cada 3 meses e juro real até':'pts per 3 months and real rate up to',
'Comunicação (forward guidance)':'Communication (forward guidance)','Manter os juros baixos por 12 meses':'Keep rates down for 12 months','Anunciar':'Announce','Retirar compromisso':'Withdraw commitment',
'Nenhum compromisso em vigor.':'No commitment in force.','Anúncio agendado para a próxima decisão.':'Announcement scheduled for the next decision.',
'Estabilidade financeira':'Financial stability','Linha de liquidez de emergência':'Emergency lending facility',
'· bancos tomam emprestado contra títulos pelo valor de face; perdas contábeis não forçam vendas':'· banks borrow against bonds at face value; paper losses do not force sales',
'Colchão contracíclico':'Countercyclical capital buffer','· bancos acumulam 2,5 p.p. de capital em um ano; o crédito desacelera um pouco':'· banks build 2.5 pts of extra capital over a year; credit slows a little',
'Configuração da partida':'Game setup','Cenário':'Scenario','Modelo':'Model','Dificuldade':'Difficulty',
'Fácil · choques menores e mais raros':'Easy · smaller, rarer shocks','Normal':'Normal','Difícil · choques maiores e mais frequentes':'Hard · bigger, more frequent shocks',
'Opções da economia':'Economy options',
'Ciclo de crédito: juro real baixo por muito tempo infla o crédito e os ativos e eleva o risco de crise. Reparo de dívida: após a crise, as famílias poupam para quitar dívidas. Oferta por causa: choques de alimentos e energia pesam mais em orçamentos apertados.':'Credit cycle: low real rates for long inflate credit and assets and raise crisis risk. Debt repair: after a crisis, households save to pay down debt. Supply by cause: food and energy shocks weigh more on tight budgets.',
'Modo sem fim':'Endless mode','· sem prazo de mandato nem demissão':'· no term limit, no dismissal','Reprodução rápida':'Fast playback','· 220 ms por mês no modo automático':'· 220 ms per month in auto-run',
/* cenários */
'Herança de 2025 · Selic a 15%':'2025 inheritance · Selic at 15%','Calmaria · meta contínua':'Calm · steady target','Recessão de 2015–16 · difícil':'2015–16 recession · hard',
'Pandemia e o surto de 2021':'Pandemic and the 2021 surge','Plano Real · fim da hiperinflação (1994) · difícil':'Real Plan · end of hyperinflation (1994) · hard',
'Crise de 2002 · eleição e dólar · difícil':'2002 crisis · election and the dollar · hard','Crise global de 2008':'2008 global crisis',
'Taper tantrum e ciclo de alta (2013–15)':'Taper tantrum and hiking cycle (2013–15)','Greve dos caminhoneiros e Previdência (2018–19)':'Truckers\' strike and pension reform (2018–19)',
'Era aleatória':'Random era','Águas calmas':'Calm waters','Grande Inflação (anos 1970) · difícil':'Great Inflation (1970s) · hard','Década perdida (limite zero) · difícil':'Lost decade (lower bound) · hard',
'Grande Recessão (2006–2015)':'Great Recession (2006–2015)','Choque Volcker (1979–82) · difícil':'Volcker shock (1979–82) · hard','Japão dos anos 1990 · armadilha da deflação · difícil':'Japan in the 1990s · deflation trap · hard',
'Crise da dívida europeia (2011)':'European debt crisis (2011)','Inflação pós-pandemia (2021–23)':'Post-pandemic inflation (2021–23)','Fuga de capitais de um emergente · difícil':'Emerging-market capital flight · hard',
/* modelos e opções */
'Clássico + finanças (padrão)':'Classic + finance (default)','Clássico, sem finanças (v2)':'Classic, no finance (v2)','Aprendizado (v3, exp.)':'Learning (v3, exp.)','Aprendizado + finanças (exp.)':'Learning + finance (exp.)',
'Âncora (v5.1, exp.)':'Anchored (v5.1, exp.)','Âncora + finanças (v5.1, exp.)':'Anchored + finance (v5.1, exp.)','Livro-texto · linear, sem crises':'Textbook · linear, no crises',
'Opções · nenhuma':'Options · none','Opções · ciclo de crédito (exp.)':'Options · credit cycle (exp.)','Opções · ciclo de crédito + reparo de dívida (exp.)':'Options · credit cycle + debt repair (exp.)',
'Opções · choques de oferta por causa (exp.)':'Options · supply shocks by cause (exp.)','Opções · ciclo de crédito + oferta (exp.)':'Options · credit cycle + supply (exp.)','Opções · reparo de dívida + oferta (exp.)':'Options · debt repair + supply (exp.)',
/* mercados */
'Mercados, bancos e famílias':'Markets, banks and households','O que o mercado espera da sua política, quanto custa o crédito e quanto os bancos aguentam.':'What markets expect from your policy, what credit costs and how much banks can take.',
'Preços de mercado':'Market prices','Juro de 2 anos':'2-year yield','Juro de 10 anos':'10-year yield','Prêmio a termo (10a)':'Term premium (10y)','Spread de crédito':'Credit spread','Índice de Basileia':'Basel capital ratio','Capital dos bancos':'Bank capital',
'Variação do juro em 3 meses':'Rate change over 3 months','Financiamento imobiliário (30a)':'30-year mortgage rate','Vagas por desempregado':'Vacancies per jobless','Prêmio de risco de inflação':'Inflation risk premium',
'Risco de crise em 12 meses':'Crisis risk, 12 months','Dívida pública (% do PIB)':'Public debt (% of GDP)','Prêmio de risco soberano':'Sovereign risk premium','Lacuna de crédito (p.p. da renda)':'Credit gap (pts of income)','Preços de ativos vs tendência':'Asset prices vs trend',
'Ligue "ciclo de crédito" nas opções da partida para acompanhar a lacuna de crédito e os preços de ativos.':'Turn on "credit cycle" in the game options to follow the credit gap and asset prices.',
'Este modelo não tem setor financeiro: sem fragilidade, crises ou ciclo de crédito.':'This model has no financial sector: no fragility, crises or credit cycle.',
'Famílias e empresas':'Households and firms','dia da posse = 100':'day in office = 100','Renda real das famílias':'Household real income','Colchão de poupança (meses de renda)':'Savings buffer (months of income)',
'Essenciais no orçamento apertado':'Essentials in tight budgets','Margem das empresas':'Firm margins','Capacidade perdida por escassez e apagões':'Capacity lost to shortages and outages','Pressão de custos (choque de oferta)':'Cost pressure (supply shock)',
'Preços de alimentos e energia pesam mais para quem tem orçamento apertado. Com a opção de choques de oferta ligada, isso também derruba a demanda.':'Food and energy prices weigh more on tight budgets. With the supply-shock option on, this also drags down demand.',
'De onde vem a demanda':'Where demand comes from','pontos de hiato':'gap points','Política':'Policy','Mercados':'Markets','Crédito':'Credit','Outros':'Other',
'Barras para a direita aquecem a economia; para a esquerda, esfriam. A política monetária age com defasagem de 9 a 18 meses.':'Bars to the right heat the economy; to the left, cool it. Monetary policy works with a 9 to 18 month lag.',
/* governo */
'Governo · fora do seu controle':'Government · outside your control','Decisões do Executivo e choques que você não escolhe, mas terá de administrar. Use-os para testar sua política. Cada um entra em vigor no próximo mês.':'Executive decisions and shocks you do not choose but must manage. Use them to test your policy. Each takes effect next month.',
'Tarifas de importação':'Import tariffs','Salto pontual no nível de preços enquanto o custo de importação é repassado. O PIB potencial cai de vez.':'A one-off jump in the price level as import costs pass through. Potential output falls permanently.','+1,5% no nível de preços':'+1.5% on the price level',
'Gasto deficitário':'Deficit spending','Injeção pura de demanda. Também eleva o juro neutro, então você precisa de juros mais altos só para ficar neutro.':'A pure demand injection. It also lifts the neutral rate, so you need higher rates just to stay neutral.','+1,5 p.p. de demanda':'+1.5 pts of demand',
'Arcabouço fiscal desacreditado':'Fiscal framework loses credibility','Mercado duvida da trajetória da dívida. Sobem o prêmio de risco, o dólar e os juros longos.':'Markets doubt the debt path. The risk premium, the dollar and long rates rise.','risco fiscal ↑':'fiscal risk ↑',
'Crise hídrica':'Water crisis','Reservatórios baixos acionam a bandeira tarifária vermelha. Choque de oferta temporário na energia.':'Low reservoirs trigger the red tariff flag. A temporary energy supply shock.','+1,3% no nível de preços':'+1.3% on the price level',
'Boom de commodities':'Commodity boom','Preços de soja, minério e petróleo sobem lá fora. O real se valoriza e a renda do país aumenta.':'Soy, ore and oil prices rise abroad. The real strengthens and national income grows.','real ↑ · demanda ↑':'real ↑ · demand ↑',
'Escassez de mão de obra':'Labor shortage','Corte de imigração ou envelhecimento encolhe a força de trabalho. O potencial cai e a curva de Phillips fica mais inclinada.':'Immigration cuts or aging shrink the workforce. Potential falls and the Phillips curve steepens.','por 3 anos':'for 3 years',
'Agendado para o próximo mês · clique para cancelar':'Scheduled for next month · click to cancel',
'Crescimento potencial':'Potential growth','Desemprego natural':'Natural unemployment','Juro neutro nominal':'Nominal neutral rate','Cartas abertas ao CMN':'Open letters to the CMN',
/* compartilhar */
'Compartilhar, reproduzir e comparar':'Share, replay and compare','O código da partida recria a mesma economia com os mesmos choques. O registro de decisões refaz a sua partida mês a mês.':'The game code recreates the same economy with the same shocks. The decision log replays your game month by month.',
'Código da partida':'Game code','Copiar código':'Copy code','Repetir esta economia':'Replay this economy','Carregar código ou registro de decisões':'Load a game code or decision log','Carregar':'Load','Exportar registro':'Export decision log',
'Comparar com alternativas':'Compare with alternatives','Roda a mesma economia, com os mesmos choques e decisões de governo, sob regras automáticas, até o mês em que você está.':'Runs the same economy, with the same shocks and government decisions, under automatic rules, up to the month you are in.',
'Comparar agora':'Compare now','Estratégia':'Strategy','Pontos':'Points','Inflação média':'Average inflation','Desemprego médio':'Average unemployment','Perda de PIB':'GDP loss','Clique em “Comparar agora”.':'Click "Compare now".',
'Você':'You','Juros parados':'Rates unchanged','ver no painel':'show on dashboard','jogue ao menos 12 meses':'play at least 12 months',
/* conquistas */
'Conquistas e histórico':'Achievements and history','Conquistas ficam salvas neste navegador. O histórico guarda as últimas partidas que chegaram ao fim.':'Achievements are saved in this browser. The history keeps your latest finished games.',
'Mandato cumprido':'Term completed','Conclua um mandato inteiro.':'Complete a full term.','Pouso suave':'Soft landing','Termine o mandato com média de 80 pontos ou mais.':'Finish the term with an average of 80 points or more.',
'Âncora firme':'Firm anchor','Chegue ao fim do mandato com credibilidade de 90% ou mais.':'Reach the end of your term with credibility of 90% or more.','Dentro da banda':'Within the band','Fique 36 meses seguidos com a inflação dentro da banda da meta.':'Keep inflation inside the target band for 36 months in a row.',
'Sem crises':'No crises','Conclua o mandato sem nenhuma crise financeira, num modelo com setor financeiro.':'Finish the term with no financial crisis, in a model with a financial sector.','Gestor de crise':'Crisis manager','Atravesse uma crise financeira e termine o mandato.':'Go through a financial crisis and finish the term.',
'Cenário difícil vencido':'Hard scenario beaten','Conclua um cenário marcado como difícil com 60 pontos ou mais.':'Finish a scenario marked hard with 60 points or more.','Reconduzido':'Reappointed','No modo Brasil, seja reconduzido ao fim dos quatro primeiros anos.':'In Brazil mode, be reappointed after the first four years.',
'Suas partidas':'Your games','Meses':'Months','Resultado':'Result','Limpar histórico':'Clear history','Nenhuma partida concluída ainda.':'No finished games yet.',
/* ranking */
'Local (neste navegador)':'Local (this browser)','Online':'Online',
'Termine o mandato e envie sua partida. O ranking reexecuta o seu registro de decisões e mostra a pontuação verificada, então não dá para inventar nota.':'Finish your term and submit your game. The ranking replays your decision log and shows the verified score, so scores cannot be made up.',
'Entrar por link':'Sign in by link','Conectado:':'Signed in:','Sair':'Sign out','Apelido no ranking':'Ranking nickname','Enviar esta partida':'Submit this game',
'Só partidas com o mandato concluído. Reenviar o mesmo código substitui o registro anterior.':'Only finished games. Resubmitting the same code replaces the earlier entry.','Mostrar todos os códigos':'Show all codes','Atualizar':'Refresh',
'Jogador':'Player','Código':'Code','Nenhuma partida concluída com este código ainda.':'No finished game with this code yet.',
'Diário de bordo':'Captain\'s log',
'Modelo didático, inspirado em simuladores de política monetária. Parâmetros aproximados; não é previsão. Versão':'Didactic model inspired by monetary policy simulators. Approximate parameters; not a forecast. Version',
/* tutorial */
'Pular':'Skip','Voltar':'Back','Próximo':'Next','Começar':'Start',
'Seu papel':'Your role','Você comanda o banco central. Seu trabalho é levar a inflação à meta sem deixar o desemprego subir. A política monetária age com defasagem de 9 a 18 meses, então decida olhando para onde a economia vai, não só para onde está.':'You run the central bank. Your job is to bring inflation to target without letting unemployment rise. Monetary policy works with a 9 to 18 month lag, so decide by looking at where the economy is going, not just where it is.',
'A mesa de política':'The policy desk','Na coluna da direita (no topo, no celular) você escolhe os juros e o balanço do banco central (QE/QT). No modo Brasil a Selic só muda nas reuniões do Copom, 8 vezes por ano.':'In the right column (at the top on mobile) you set interest rates and the central bank balance sheet (QE/QT). In Brazil mode the Selic rate only changes at Copom meetings, 8 times a year.',
'Avançar no tempo':'Moving through time','"Avançar um mês" executa a sua decisão e mostra o resultado. Também há o modo automático e o atalho N no teclado. Quando o mandato termina, sua pontuação é a média de estabilidade.':'"Advance one month" carries out your decision and shows the result. There is also auto-run and the N keyboard shortcut. When the term ends, your score is the average stability.',
'Leia os gráficos':'Read the charts','Inflação com a banda da meta, desemprego contra o natural e juro real contra o neutro. A previsão da equipe projeta 24 meses sem novos choques, com os seus ajustes mantidos e com o piloto de Taylor.':'Inflation with the target band, unemployment against the natural rate and the real rate against neutral. The staff forecast projects 24 months with no new shocks, with your settings held and with the Taylor autopilot.',
'Ferramentas e metas':'Tools and goals','Use pilotos automáticos, forward guidance e as medidas de estabilidade financeira. Troque cenário, modelo e dificuldade em "Configuração da partida". Suas conquistas e partidas ficam salvas, e o ranking compara quem jogou o mesmo código.':'Use autopilots, forward guidance and financial stability tools. Change scenario, model and difficulty under "Game setup". Your achievements and games are saved, and the ranking compares everyone who played the same code.',
/* eventos e diário */
'Realinhamento de preços administrados: energia elétrica e combustíveis sobem forte.':'Administered prices realign: electricity and fuel jump.','Agência rebaixa a nota de crédito do país; perda do grau de investimento.':'A rating agency downgrades the country; investment grade is lost.',
'Pandemia: lojas fecham, atividade despenca e o dólar dispara.':'Pandemic: stores close, activity collapses and the dollar soars.','Governo aprova auxílio emergencial amplo.':'The government approves broad emergency aid.',
'Commodities em alta e crise hídrica: bandeira tarifária de escassez.':'Commodities surge and a water crisis hits: scarcity tariff flag.',
'Lançamento do Real: a moeda nova ancora os preços, mas a memória inflacionária ainda é forte.':'Launch of the Real: the new currency anchors prices, but inflation memory is still strong.','Crise do México (efeito tequila): fuga de capitais dos emergentes.':'Mexico crisis (tequila effect): capital flees emerging markets.',
'Corrida contra o real: o dólar dispara com a incerteza eleitoral.':'Run on the real: the dollar soars on election uncertainty.','Racionamento de crédito externo: linhas de comércio exterior encolhem.':'External credit rationing: trade finance lines shrink.','Compromisso fiscal reafirmado: o prêmio de risco começa a ceder.':'Fiscal commitment reaffirmed: the risk premium starts to ease.',
'Quebra do Lehman Brothers: o crédito global congela e o real despenca.':'Lehman Brothers collapses: global credit freezes and the real plunges.','Estímulos fiscais e crédito dos bancos públicos sustentam a retomada.':'Fiscal stimulus and public bank credit support the recovery.',
'Fed sinaliza a redução de estímulos: capital deixa os emergentes.':'The Fed signals tapering: capital leaves emerging markets.','Realinhamento de energia elétrica e combustíveis.':'Electricity and fuel prices realign.','Deterioração fiscal e pedaladas: o mercado perde a confiança nas contas.':'Fiscal deterioration and accounting tricks: markets lose confidence in the budget.',
'Greve dos caminhoneiros: desabastecimento e alta de preços; o dólar sobe.':'Truckers\' strike: shortages and price rises; the dollar climbs.','Reforma da Previdência aprovada: o risco fiscal cai.':'Pension reform passes: fiscal risk falls.',
'Embargo do petróleo: o preço do barril quadruplica.':'Oil embargo: the price of a barrel quadruples.','Revolução no Irã: segundo choque do petróleo.':'Iranian revolution: second oil shock.','Segundo choque do petróleo: a energia volta a subir.':'Second oil shock: energy rises again.',
'Austeridade fiscal em vários países pesa sobre a demanda.':'Fiscal austerity in several countries weighs on demand.','Gargalos nas cadeias de suprimento elevam os preços de bens.':'Supply chain bottlenecks push up goods prices.','Guerra na Ucrânia: energia e alimentos disparam.':'War in Ukraine: energy and food soar.',
'Fuga de capitais: a moeda despenca e os importados encarecem.':'Capital flight: the currency plunges and imports get pricier.',
'Quebra de um grande banco de investimento: o crédito congela.':'A major investment bank collapses: credit freezes.','Crise financeira: inadimplência dispara e um banco médio quebra.':'Financial crisis: defaults surge and a mid-sized bank fails.',
'Crise financeira: bancos médios sofrem com a falta de liquidez em dólar.':'Financial crisis: mid-sized banks suffer from the dollar liquidity shortage.','Estouro da bolha de ativos: bancos acumulam crédito podre.':'Asset bubble bursts: banks pile up bad loans.',
'Crise de dívida soberana: bancos e governos entram numa espiral.':'Sovereign debt crisis: banks and governments spiral together.','Crise financeira: bancos locais sofrem com a dívida em moeda estrangeira.':'Financial crisis: local banks suffer from foreign-currency debt.',
'Governo eleva tarifas de importação. Preços sobem e o potencial encolhe.':'The government raises import tariffs. Prices rise and potential shrinks.','Força de trabalho encolhe: potencial menor e salários mais sensíveis.':'The workforce shrinks: lower potential and more sensitive wages.',
'Governo amplia gastos financiados por dívida.':'The government expands debt-financed spending.','Mudança nas regras fiscais assusta o mercado: dólar e juros futuros disparam.':'Changes to fiscal rules scare the market: the dollar and future rates soar.',
'Crise hídrica: bandeira vermelha na conta de luz.':'Water crisis: red flag on electricity bills.','Boom de commodities: o real se valoriza e a renda do agro cresce.':'Commodity boom: the real strengthens and farm income grows.',
'Quebra de safra encarece os alimentos.':'A crop failure makes food pricier.','Aversão a risco global: capital deixa os emergentes e o dólar sobe.':'Global risk aversion: capital leaves emerging markets and the dollar rises.','Petróleo sobe; Petrobras reajusta a gasolina.':'Oil rises; Petrobras adjusts gasoline prices.',
'Crédito consignado e renda em alta aquecem o consumo.':'Payroll loans and rising income heat up consumption.','Confiança de empresários despenca; investimentos adiados.':'Business confidence plunges; investment is postponed.','Fluxo estrangeiro forte valoriza o real.':'Strong foreign inflows strengthen the real.',
'Choque do petróleo: energia sobe.':'Oil shock: energy prices rise.','Euforia nas bolsas: consumo e investimento aceleram.':'Stock market euphoria: consumption and investment accelerate.','Pânico global: empresas cortam investimentos.':'Global panic: firms cut investment.',
'Onda de produtividade: custos caem e o potencial sobe temporariamente.':'Productivity wave: costs fall and potential rises temporarily.',
'Compromisso retirado antes do prazo. O mercado anota.':'Commitment withdrawn early. The market takes note.','Compromisso quebrado: você subiu juros antes de 12 meses. Credibilidade despenca.':'Commitment broken: you raised rates before 12 months. Credibility plunges.','Compromisso de 12 meses cumprido.':'12-month commitment kept.',
'Fim do primeiro mandato. O presidente da República o reconduz e o Senado aprova. Mais 4 anos.':'End of the first term. The President reappoints you and the Senate approves. Four more years.',
'O Copom se reúne 8 vezes por ano; só nesses meses a Selic pode mudar.':'Copom meets 8 times a year; the Selic rate can only change in those months.','Você decide os juros todo mês.':'You set rates every month.',
' A linha de liquidez de emergência evitou vendas forçadas de títulos.':' The emergency lending facility prevented forced bond sales.',' Sem linha de emergência, bancos vendem títulos às pressas.':' Without an emergency facility, banks dump bonds in a hurry.',
/* avisos (toast) */
'Mesma economia, do mês zero.':'Same economy, from month zero.','Código copiado.':'Code copied.','Anúncio entra com a próxima decisão.':'The announcement takes effect with your next decision.','Não há compromisso em vigor.':'There is no commitment in force.',
'Cole um código ou registro primeiro.':'Paste a code or log first.','Economia carregada.':'Economy loaded.','Texto selecionado na caixa abaixo; copie com Ctrl+C.':'Text selected in the box below; copy it with Ctrl+C.',
'Pontuação enviada.':'Score submitted.','Termine o mandato para enviar.':'Finish the term to submit.','Apelido de 2 a 24 letras.':'Nickname of 2 to 24 characters.','Jogue pelo menos 12 meses.':'Play at least 12 months.','Entre com seu e-mail primeiro.':'Sign in with your email first.',
'Erro ao carregar o ranking.':'Error loading the ranking.','Não foi possível enviar.':'Could not submit.','Digite seu e-mail.':'Enter your email.','Link enviado. Confira seu e-mail.':'Link sent. Check your email.','Falha ao enviar o link.':'Failed to send the link.'
};
const MON={Jan:'Jan',Fev:'Feb',Mar:'Mar',Abr:'Apr',Mai:'May',Jun:'Jun',Jul:'Jul',Ago:'Aug',Set:'Sep',Out:'Oct',Nov:'Nov',Dez:'Dec'};
let tr;
const RX=[
 [/^(Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez) · Ano (\d+)$/,(a,m,y)=>MON[m]+' · Year '+y],
 [/^(Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez) · A(\d+)$/,(a,m,y)=>MON[m]+' · Y'+y],
 [/^próxima: (Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez)$/,(a,m)=>'next: '+MON[m]],
 [/^(\d+) de (\d+)$/,(a,x,y)=>x+' of '+y],
 [/^(\d+) registros$/,(a,n)=>n+' entries'],
 [/^média (\d+) pts$/,(a,n)=>'average '+n+' pts'],
 [/^(.+?) · sem fim$/,(a,x)=>x+' · endless'],
 [/^Meta (.+?)% ± (.+?)$/,(a,x,y)=>'Target '+x+'% ± '+y],
 [/^Trajetória de (.+?)% a\.a\.$/,(a,x)=>'Path of '+x+'% a year'],
 [/^Trajetória de (.+?)% \((.+?)% real \+ (.+?)% inflação\)$/,(a,x,y,z)=>'Path of '+x+'% ('+y+'% real + '+z+'% inflation)'],
 [/^diferença (.+)$/,(a,x)=>'gap '+x],
 [/^(.+) de um ano$/,(a,x)=>x+' of a year'],
 [/^em 24m: (.+?) · Taylor (.+)$/,(a,x,y)=>'in 24m: '+x+' · Taylor '+y],
 [/^(Selic|Juro básico) e juro real$/,(a,x)=>(x==='Selic'?'Selic':'Policy rate')+' and real rate'],
 [/^(.+?) \(juro real neutro (.+?)% \+ expectativa (.+?)%\)\.$/,(a,x,y,z)=>x.replace('Neutro hoje:','Neutral today:')+' (neutral real rate '+y+'% + expectation '+z+'%).'],
 [/^Neutro hoje: (.+?)% \(juro real neutro (.+?)% \+ expectativa (.+?)%\)\.$/,(a,x,y,z)=>'Neutral today: '+x+'% (neutral real rate '+y+'% + expectation '+z+'%).'],
 [/^Manter os juros altos até a inflação cair abaixo de (.+?)%$/,(a,x)=>'Keep rates up until inflation is below '+x+'%'],
 [/^Em vigor desde o mês (\d+): juros altos até a inflação ceder\.$/,(a,n)=>'In force since month '+n+': rates stay high until inflation eases.'],
 [/^Em vigor desde o mês (\d+): juros baixos por 12 meses\.$/,(a,n)=>'In force since month '+n+': rates stay low for 12 months.'],
 [/^Anúncio: juros ficam altos até a inflação em 12 meses cair abaixo de (.+?)%\.$/,(a,x)=>'Announcement: rates stay high until 12-month inflation falls below '+x+'%.'],
 [/^Anúncio: juros ficam baixos pelos próximos 12 meses\.$/,()=>'Announcement: rates stay low for the next 12 months.'],
 [/^Compromisso quebrado: você cortou juros com a inflação acima de (.+?)%\. Credibilidade despenca\.$/,(a,x)=>'Commitment broken: you cut rates with inflation above '+x+'%. Credibility plunges.'],
 [/^Compromisso cumprido: inflação abaixo de (.+?)%\. Credibilidade sobe\.$/,(a,x)=>'Commitment kept: inflation below '+x+'%. Credibility rises.'],
 [/^Copom (eleva|reduz) a Selic em (.+?) p\.p\., para (.+?)%\.$/,(a,v,d,r)=>'Copom '+(v==='eleva'?'raises':'cuts')+' the Selic rate by '+d+' pts, to '+r+'%.'],
 [/^Juro básico (sobe|cai) (.+?) p\.p\., para (.+?)%\.$/,(a,v,d,r)=>'Policy rate '+(v==='sobe'?'rises':'falls')+' '+d+' pts, to '+r+'%.'],
 [/^Copom mantém a Selic em (.+?)%\.$/,(a,r)=>'Copom holds the Selic rate at '+r+'%.'],
 [/^Trimestre: (.+?) 12m (.+?)% · desemprego (.+?)% · PIB 12m (.+?)%\.$/,(a,i,p,u,g)=>'Quarter: '+tr(i)+' 12m '+p+'% · unemployment '+u+'% · GDP 12m '+g+'%.'],
 [/^Seis meses seguidos fora do intervalo de tolerância: você assina a (\d+)ª carta aberta ao ministro da Fazenda explicando o descumprimento\.$/,(a,n)=>'Six months in a row outside the tolerance band: you sign open letter no. '+n+' to the Finance Minister explaining the miss.'],
 [/^Você tomou posse no (.+?)\. Cenário: (.+?)\. (.+?) Meta: (.+?)% ± (.+?) p\.p\.$/,(a,b,sc,inner,t,w)=>'You took office at the '+b.replace('Banco Central do Brasil','Central Bank of Brazil').replace('Banco Central','Central Bank')+'. Scenario: '+tr(sc)+'. '+tr(inner)+' Target: '+t+'% ± '+w+' pts.'],
 [/^(.+?) · mês (\d+) · ((?:BR|CL)-.+)$/,(a,sc,m,c)=>tr(sc)+' · month '+m+' · '+c],
 [/^(Fim do mandato|Demitido|Não reconduzido|Pressão insustentável)\. (.+)$/,(a,t,x)=>tr(t)+'. '+tr(x)],
 [/^Com (.+?) pontos de média e credibilidade de (.+?)%, o Senado rejeitou sua recondução\. Era preciso 50 pontos ou 40% de credibilidade\.$/,(a,p,c)=>'With an average of '+p+' points and credibility of '+c+'%, the Senate rejected your reappointment. You needed 50 points or 40% credibility.'],
 [/^Você completou (.+?) anos no cargo com (.+?) pontos de média\.$/,(a,y,p)=>'You completed '+y+' years in office with an average of '+p+' points.'],
 [/^Seis meses de inflação acima de (.+?)% ao ano\. O Congresso exige sua saída\.$/,(a,x)=>'Six months of inflation above '+x+'% a year. Congress demands your exit.'],
 [/^Comparação até o mês (\d+)\. PIB perdido = soma dos hiatos negativos, em % de um ano de PIB\.$/,(a,n)=>'Comparison up to month '+n+'. GDP lost = sum of negative gaps, as % of a year of GDP.'],
 [/^Registro copiado \((\d+) decisões\)\.$/,(a,n)=>'Log copied ('+n+' decisions).'],
 [/^Partida refeita: (\d+) meses\.$/,(a,n)=>'Game replayed: '+n+' months.'],
 [/^Partida retomada no mês (\d+)\.$/,(a,n)=>'Game resumed at month '+n+'.'],
 [/^Conquista: (.+)$/,(a,x)=>'Achievement: '+tr(x)],
 [/^Não reconheci esse código\. Formato: (.+)\.$/,(a,x)=>'I did not recognize that code. Format: '+x+'.'],
 [/^Reparo de dívida em curso: as famílias poupam para quitar dívidas e seguram a demanda por (\d+) meses\.$/,(a,n)=>'Debt repair under way: households save to pay down debt and hold back demand for '+n+' more months.'],
 [/^(.*?)( A linha de liquidez de emergência evitou vendas forçadas de títulos\.| Sem linha de emergência, bancos vendem títulos às pressas\.)$/,(a,x,y)=>tr(x)+tr(y)],
 [/^Choque de demanda: (.+?) \(modelo sem setor financeiro: só o efeito sobre a demanda\)\.$/,(a,x)=>'Demand shock: '+tr(x)+' (model without a financial sector: demand effect only).'],
 [/^Cole aqui um código \(ex\.: (.+?)\) ou um registro exportado$/,(a,x)=>'Paste a code (e.g. '+x+') or an exported log here']
];
tr=function(s){
  const t=s.trim();if(!t)return s;
  let r=EN[t];if(r===undefined)r=EN[s];
  if(r===undefined){for(const [re,f] of RX){const m=t.match(re);if(m){r=f.apply(null,m);break;}}}
  if(r===undefined)return s;
  return s.slice(0,s.length-s.trimStart().length)+r+s.slice(s.trimEnd().length);
};
window.I18N={tr,EN};

const $=id=>document.getElementById(id);
let lang='pt',busy=false;
try{lang=localStorage.getItem('bcsim-lang')||((navigator.language||'pt').toLowerCase().startsWith('pt')?'pt':'en');}catch(e){}

function textNode(n){
  const p=n.parentNode;if(!p||/^(SCRIPT|STYLE|TITLE)$/.test(p.nodeName))return;
  if(lang==='en'){
    if(n.__en!==undefined&&n.nodeValue===n.__en)return;
    n.__pt=n.nodeValue;const r=tr(n.nodeValue);n.__en=r;if(r!==n.nodeValue)n.nodeValue=r;
  }else if(n.__en!==undefined){
    if(n.nodeValue===n.__en&&n.__pt!==undefined)n.nodeValue=n.__pt;
    delete n.__en;delete n.__pt;
  }
}
function walk(root){
  if(root.nodeType===3){textNode(root);return;}
  if(root.nodeType!==1||/^(SCRIPT|STYLE|CANVAS)$/.test(root.nodeName))return;
  attrs(root);
  for(let c=root.firstChild;c;c=c.nextSibling)walk(c);
}
const AT=['title','placeholder','aria-label'];
function attrs(e){
  for(const a of AT){
    const v=e.getAttribute&&e.getAttribute(a);if(v==null)continue;
    const k='data-pt-'+a;
    if(lang==='en'){if(!e.hasAttribute(k))e.setAttribute(k,v);const r=tr(e.getAttribute(k));if(r!==v)e.setAttribute(a,r);}
    else if(e.hasAttribute(k)){e.setAttribute(a,e.getAttribute(k));e.removeAttribute(k);}
  }
}
function apply(){busy=true;try{walk(document.body);document.documentElement.lang=lang==='en'?'en':'pt-BR';
  const T=document.querySelector('title');if(T){if(T.__pt===undefined)T.__pt=T.textContent;T.textContent=lang==='en'?'Central Bank Simulator':T.__pt;}
  const b=$('btnLang');if(b)b.textContent=lang==='en'?'PT':'EN';}finally{busy=false;}
}
const obs=new MutationObserver(recs=>{
  if(busy||lang!=='en')return;busy=true;
  try{for(const r of recs){if(r.type==='characterData')textNode(r.target);else r.addedNodes.forEach(walk);}}finally{busy=false;}
  obs.takeRecords();
});
function setLang(l){
  lang=l;try{localStorage.setItem('bcsim-lang',l);}catch(e){}
  if(window.SIM&&SIM.setLocale)SIM.setLocale(l==='en'?'en-US':'pt-BR');
  if(window.BCSIM&&BCSIM.rerender)BCSIM.rerender();
  apply();
}
document.addEventListener('DOMContentLoaded',()=>{});
const btn=$('btnLang');if(btn)btn.addEventListener('click',()=>setLang(lang==='en'?'pt':'en'));
obs.observe(document.body,{childList:true,subtree:true,characterData:true});
if(lang==='en')setLang('en');else apply();
})();
