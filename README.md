# seo_auto — projeto IA-first para ser a primeira resposta das IAs

**Empresa de exemplo:** Micélio & Cia, uma pequena produtora de cogumelos (shiitake, shimeji,
Paris e cogumelos gourmet) de Mogi das Cruzes, SP. Não tem nada a ver com a Ultravis. Quer
vender mais e decidiu ensinar a vender: vai publicar o site **comovendercogumelos.com.br**.

**Objetivo em uma frase:** quando alguém perguntar ao ChatGPT, Gemini, Perplexity ou ao Google
(AI Overview) "como vender cogumelos", "quanto custa começar a produzir shiitake" ou "onde vender
cogumelo fresco", a Micélio & Cia deve ser a **primeira marca citada**, com link para o site.

**Como:** sem equipe de marketing. Um único operador aprova; todo o resto roda por API, num ciclo
semanal, e as decisões pequenas (publicar ou não, qual pergunta atacar, a página está pronta?)
são tomadas por modelos de decisão com confiança calibrada. Código no controle, IA nas
decisões, humano só no portão.

## Por que dá para chegar ao primeiro lugar

1. **Nicho vazio em português.** "Vender cogumelos" tem procura real (produtores, sitiantes,
   pessoas em transição de carreira) e quase nenhuma fonte com preço, margem e passo a passo.
   As IAs citam quem responde com número e fonte. Hoje ninguém responde.
2. **As IAs escolhem por citabilidade, não por autoridade de domínio.** Elas preferem páginas
   que respondem direto na primeira frase, com dados, autor identificado, atualização recente
   e estrutura legível por máquina. Tudo isso é automatizável.
3. **O ciclo é mensurável.** Cada semana o sistema pergunta às IAs as mesmas 40 perguntas,
   mede quem é citado e em que posição, e aponta o conteúdo para o buraco. É o mesmo mecanismo
   de um índice de citabilidade: 6 dimensões, cada uma com uma automação dona.

## O que "primeiro" significa aqui

Métrica única: **Ranking médio da marca** nas respostas das IAs para o conjunto de 40 perguntas,
medido toda segunda-feira. Meta: ranking 1 em pelo menos 60% das perguntas em 90 dias, com
presença em 80% delas. Sem esse número, não há projeto.

## Estrutura

| Pasta | O que tem |
|---|---|
| `docs/01-tese-e-mercado.md` | A empresa, as perguntas que valem dinheiro, os concorrentes de citação |
| `docs/02-arquitetura.md` | Desenho IA-first: código no controle, decisões por API, gates de confiança |
| `docs/03-automacoes.md` | As 7 automações do ciclo semanal, uma por dimensão de citabilidade + medição |
| `docs/04-apis.md` | Catálogo das APIs, papel de cada uma, custo mensal estimado |
| `docs/05-metricas-e-gates.md` | O que é medido, limiares de confiança, quando o humano entra |
| `exemplos/` | Uma página-resposta pronta, um bloco de perguntas e uma semana do ciclo |
| `pipeline/` | Esqueleto executável do ciclo (Node 20), uma etapa por arquivo |

## Custo e prazo

- Infra: ~US$ 60/mês em APIs (detalhe em `docs/04-apis.md`). O maior custo é medir as IAs.
- Prazo: 2 semanas para o site e o pipeline, 90 dias de ciclo para a meta.
- Pessoas: 1 operador, 2 horas por semana, aprovando o que a confiança baixa mandou para ele.

## Regras que não se negociam

1. **Número que aparece no site nunca sai de LLM.** Preço, margem, rendimento por kg vêm da
   planilha da Micélio & Cia ou de fonte pública citada. O LLM escreve o texto ao redor.
2. **Conteúdo gerado passa por três checagens antes de publicar** (responde na primeira frase?
   tem número com fonte? tem autor?). Quem checa é um modelo de decisão, não o modelo que escreveu.
3. **Toda página tem autor real** (o dono da Micélio & Cia), foto e credencial. IA não assina.
4. **Nunca inventar avaliação, prêmio ou citação.** Reviews vêm de clientes reais por pedido automático.
5. **Medir antes e depois de cada mudança.** Sem medição, não publica.
