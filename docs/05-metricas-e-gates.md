# 05 — Métricas e gates

## O painel de uma linha

| Métrica | Definição | Como se calcula | Meta 90 dias |
|---|---|---|---|
| **Presença** | % das perguntas em que a marca aparece na resposta | nome ou domínio no texto, busca literal em código | 80% |
| **Citação** | % das perguntas em que o site aparece como link | domínio ⊂ links da resposta | 60% |
| **Ranking** | posição média da marca entre as marcas citadas | 1 + concorrentes citados antes | 1 em 60% das perguntas |
| **Sentimento** | % de respostas positivas entre as com presença | Choice 3 opções, confiança ≥ 0,6 | ≥ 85% |
| Reviews | nº e nota no Google | Business Profile API | 50 avaliações, ≥ 4,7 |
| Menções | domínios externos novos citando o site por mês | SerpApi / Ahrefs | 8 por mês |

Todas as quatro primeiras têm o mesmo denominador (40 perguntas × 5 motores = 200 respostas
por semana) e o denominador aparece no relatório ("31 de 200").

## Gates (onde a confiança decide)

| Onde | Pergunta ao decisor | Tipo | Limiar | Se falhar |
|---|---|---|---|---|
| A1 | A pergunta é sobre vender cogumelos? | Noul | 0,7 | descarta |
| A1 | Quem pergunta pode virar cliente? | Noul | 0,6 | descarta |
| A1 | Já temos página que responde? | Noul | 0,5 | vai para "atualizar página", não "criar" |
| A3 | A primeira frase responde diretamente? | Noul | 0,9 | reescreve 1 vez, depois fila |
| A3 | Todo número tem fonte ou data ao lado? | Noul | 0,9 | apaga o número e reescreve |
| A3 | Para quem é o texto? | Choice | conf. 0,8 e opção = cluster | fila |
| A3 | Quanto dá para agir hoje? | Score 0–3 | ≥ 2 | fila |
| A0 | Sentimento sobre a marca | Choice | conf. 0,6 | "neutro" declarado |
| A4 | A avaliação relata problema? | Noul | 0,5 | humano responde |

Regra geral: o limiar sobe com o risco. Publicar uma página errada custa reputação; descartar
uma pergunta boa custa uma semana. Por isso A3 é mais exigente que A1.

## Quando o projeto para

- Antes de tudo: o decisor (Jev) não documenta suporte a português. Portão de entrada: rodar as 9
  perguntas dos gates sobre 30 respostas reais em português e comparar com rótulo humano; abaixo de
  90% de acordo, trocar o decisor por um LLM com saída estruturada antes de ligar o ciclo.

- Dia 45 com presença < 20%: tese errada, revisão do conjunto de perguntas.
- Custo de API > US$ 120 no mês: teto, ciclo suspenso até revisão.
- Qualquer número publicado sem fonte encontrado em auditoria: publicação automática desligada
  até corrigir o gate.
