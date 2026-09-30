# Uma semana do ciclo (exemplo: semana 6, 2026-11-09)

**06:00 A0 Medir.** 16 perguntas × 5 motores = 80 respostas via Cloro (semana de exemplo com o
conjunto reduzido). Detecção em código: presença 22 de 80 (27%), citação 14 de 80, ranking médio
2,4. Sentimento (Jev, Choice): 20 positivas, 2 neutras, 0 negativas. Custo: 400 créditos.

**06:20 A1 Descobrir.** SerpApi trouxe 38 perguntas de "as pessoas também perguntam"; Cloro
trouxe 11 das próprias IAs; WhatsApp trouxe 6. Após os 3 Nouls do Jev: 19 aprovadas, 9 já
cobertas. Prioridade em código escolheu: "como vender cogumelos para supermercado" (presença 0,
intenção vender), "cogumelo desidratado dá lucro" (presença 0), "quanto cobrar em feira por
200 g de shimeji" (presença 0, cluster preço).

**06:30 A2 Gerar.** Claude escreveu 3 páginas com os números da planilha (preço de feira
R$ 12 a 15 por 200 g de shimeji, custo R$ 5,20). 2.900 tokens de saída por página.

**06:40 A3 Checar.** Página 1: 4 gates ≥ 0,9, Score 3, publicada. Página 2: Noul "todo número
tem fonte" = 0,61 (o gerador escreveu "cerca de 40% de perda" sem fonte); número apagado,
reescrita, 0,94, publicada. Página 3: Choice "para quem" = curioso (conf. 0,83) mas cluster é
"preço" para produtor; foi para a fila. IndexNow enviado para as 2 publicadas.

**07:00 A4 Reviews.** 4 pedidos de avaliação enviados por WhatsApp (entregas de quarta).
2 avaliações novas no Google (5 e 4 estrelas); Noul "relata problema" = 0,08 e 0,12, respostas
automáticas curtas assinadas por Renata.

**07:10 A5 Social.** 2 roteiros de 60 s na fila da Renata; 6 posts de Instagram agendados
(Graph API); 1 resposta com link em grupo de produtores.

**07:15 A7 Menções.** 10 alvos para a página de supermercado (portais de varejo alimentar
regional); e-mails gerados com o número "R$ 38/kg no atacado, margem de 45%"; 10 enviados
(template já aprovado na semana 3). 1 menção nova detectada (blog de hortifrúti citou a
tabela de preços).

**07:20 Relatório.** `relatorios/2026-11-09.md` + e-mail. Custo da semana: US$ 3,10 (Cloro
US$ 2,40, Claude US$ 0,60, Jev US$ 0,02, SerpApi no plano). Fila do operador: 1 página, 2 roteiros.

**Segunda 09:00, Renata.** 40 minutos: aprovou a página 3 com um ajuste de título, gravou os
2 vídeos. Fim.
