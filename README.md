# Simulador do Banco Central

Jogo de política monetária em uma única página (`index.html`, sem dependências). Abra o arquivo no navegador.

Duas modalidades, alternáveis no topo:

- **Brasil · BCB**: você decide a Selic nos 8 meses de reunião do Copom. Meta de 3% ± 1,5 p.p., expectativas "Focus", câmbio no modelo, mandato de 4 anos com recondução. Cenários: herança de 2025, calmaria, recessão de 2015–16, pandemia e surto de 2021, era aleatória.
- **Clássico**: meta de 2%, decisão mensal, 10 anos de mandato. Cenários: anos 70, década perdida, Grande Recessão, águas calmas, aleatório.

Em comum: juros e balanço (QE/QT) com defasagem, credibilidade e expectativas, fragilidade financeira, forward guidance, pilotos automáticos (Taylor, PIB nominal), choques de governo, monitores de nível, pontuação, códigos de partida e exportação do registro de decisões.

Modelo didático; parâmetros aproximados, não é previsão.

## Ranking e contas

Seção "Ranking" no fim da página. Sem configuração, o ranking fica só no navegador. Para ligar o online:

1. Crie um projeto no Supabase e rode `supabase/schema.sql` no SQL Editor.
2. Ative Authentication > Email (login por link).
3. Preencha `url` e `anonKey` em `config.js` (a anon key é pública; a segurança vem das regras RLS).

O ranking reexecuta o registro de decisões de cada partida e mostra a pontuação verificada, não a declarada.
[INFO] Recording command outcome: printf

[OK] Command outcome recorded

## Modelos e opções (v2.0)

Modelos: Clássico + finanças (padrão), Clássico sem finanças, Aprendizado, Aprendizado + finanças, Âncora, Âncora + finanças e Livro-texto. Eles mudam como as expectativas se formam e se há setor financeiro.

Opções (só em modelos com setor financeiro): ciclo de crédito, ciclo de crédito + reparo de dívida, choques de oferta por causa e combinações.

Também: previsão da equipe de 24 meses, famílias e empresas, condições financeiras extras, repetição contrafactual no painel e estatística de 3 anos nos monitores.

Implementação própria, inspirada nas ideias de simuladores de política monetária; não usa código de terceiros.

## Modelos e opções (v2.0)

Modelos: Clássico + finanças (padrão), Clássico sem finanças, Aprendizado, Aprendizado + finanças, Âncora, Âncora + finanças e Livro-texto. Eles mudam como as expectativas se formam e se há setor financeiro.

Opções (só em modelos com setor financeiro): ciclo de crédito, ciclo de crédito + reparo de dívida, choques de oferta por causa e combinações.

Também: previsão da equipe de 24 meses, famílias e empresas, condições financeiras extras, repetição contrafactual no painel e estatística de 3 anos nos monitores.

Implementação própria, inspirada nas ideias de simuladores de política monetária; não usa código de terceiros.

## v3

- 10 novos cenarios: Brasil (Plano Real 1994, crise de 2002, crise global de 2008, taper tantrum 2013-15, greve dos caminhoneiros e Previdencia 2018-19) e Classico (Volcker, Japao dos anos 1990, divida europeia 2011, inflacao pos-pandemia, fuga de capitais).
- Niveis de dificuldade (facil, normal, dificil) que escalam choques; entram no codigo da partida.
- Conquistas, historico das partidas com grafico e salvar/continuar partida (tudo no navegador).
- Tutorial na primeira visita e botao "Como jogar".
- Barra fixa "Avancar" no celular.
- Ingles (botao EN/PT): `lang.js` traduz a interface e os eventos do diario; frases novas sem traducao ficam em portugues.

## App de desktop (sem navegador)

O jogo tambem roda como app do Windows, offline, com janela e menu nativos (Jogo, Modo, Cenario, Exibir, Idioma, Ajuda) e barra lateral com um painel por vez.

- Rodar em desenvolvimento: `npm install` e `npm run app`.
- Gerar o executavel portatil: `npm run dist` (saida em `dist/`, sem precisar instalar).
- Teste de fumaca: `SMOKE_OUT=smoke npx electron app/smoke.js`.

O idioma padrao e portugues do Brasil; o menu Idioma troca para ingles.
