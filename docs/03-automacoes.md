# 03 — As 7 automações do ciclo semanal

Cada automação é dona de uma dimensão de citabilidade (pesos de um índice típico entre
parênteses) ou da medição. Todas rodam só por API.

## A0 — Medir (a base de tudo)

- **Quando:** segunda 06:00, antes de qualquer outra.
- **Faz:** envia as 40 perguntas a 5 motores (ChatGPT, Gemini, Perplexity, Copilot, Google AI
  Overview) via Cloro. Guarda a resposta bruta e os links citados.
- **Detecção em código, sem IA:** presença = nome da marca ou domínio aparece; citação =
  domínio está nos links; ranking = 1 + número de concorrentes citados antes.
- **Sentimento:** um Choice de 3 opções (positivo/neutro/negativo) por resposta em que a marca
  aparece. Confiança < 0,6 vira "neutro" declarado.
- **Custo:** 40 perguntas × 5 motores × 4 semanas × 5 créditos ≈ 4.000 créditos Cloro/mês.

## A1 — Descobrir e priorizar perguntas (Conteúdo, 20)

- **Faz:** para cada cluster, puxa "as pessoas também perguntam" e autocomplete (SerpApi),
  pergunta às IAs "quais dúvidas de quem quer vender cogumelos você recebe" (Cloro), e
  extrai perguntas do WhatsApp comercial (API do WhatsApp Business, com consentimento).
- **Decisão:** cada pergunta candidata passa por 3 Nouls numa chamada só: "é sobre vender
  cogumelos?", "alguém que a faz pode virar cliente da Micélio?", "já existe página nossa que
  responde?". Entra na fila a que passa nos dois primeiros e falha no terceiro.
- **Prioridade em código:** buraco (presença 0 na medição) × volume × intenção comercial.
- **Saída:** as 3 perguntas da semana.

## A2 — Gerar a página-resposta (Conteúdo, 20)

- **Entrada:** pergunta, os fatos da planilha (preço, custo, rendimento, com data e fonte),
  as 3 respostas que as IAs deram hoje (para cobrir o que elas já dizem e ir além).
- **Gerador:** Claude escreve seguindo o molde de `exemplos/pagina-resposta.md`: primeira
  frase responde; depois tabela com número; depois passo a passo; depois FAQ com 5 perguntas
  do cluster; autor Renata Kimura; "atualizado em".
- **Regra:** o gerador recebe os números prontos e a instrução "não invente número nem fonte".
  Números novos que ele escrever são apagados pelo checador.

## A3 — Checar e publicar (Legibilidade, 15)

- **Gates com Jev, numa chamada só sobre a página gerada:**
  1. Noul: "A primeira frase responde diretamente à pergunta?"
  2. Noul: "Todo número no texto tem fonte ou data ao lado?"
  3. Choice: "Para quem é o texto?" → {produtor iniciante, produtor experiente, curioso}; tem de bater com a intenção do cluster.
  4. Score 0–3: "Quanto o texto dá para alguém agir hoje?" (nada / ideia / passos / passos com número).
- **Em código:** validação do JSON-LD, links internos para as 2 páginas irmãs, tamanho
  entre 900 e 1.800 palavras, imagem com alt, Lighthouse > 90.
- **Publica sozinho** se todos os gates ≥ 0,8 de confiança e Score ≥ 2. Senão vai para a fila.
- **Indexa:** IndexNow (Bing, Yandex, e o que mais aderir) + Google Indexing via sitemap ping
  + Search Console API para pedir inspeção.

## A4 — Reviews (Reviews, 18)

- **Faz:** 3 dias após cada entrega a restaurante ou feira (evento vindo da planilha de pedidos),
  envia pedido de avaliação por WhatsApp API com link direto do Google Business Profile.
  Uma vez por mês, pede no e-mail dos alunos do curso.
- **Monitora:** Google Business Profile API lê avaliações novas; Reclame Aqui e Trustpilot
  via Scrape.do (leitura). Review negativa → fila do operador em 1 hora.
- **Decisão:** Noul "esta avaliação menciona um problema de produto ou entrega?" para separar
  o que precisa de resposta humana do que é elogio (resposta automática curta e assinada).
- **Meta:** 50 avaliações no Google em 90 dias, nota ≥ 4,7.

## A5 — Social derivado (Social, 12)

- **Faz:** de cada página publicada, o gerador tira 1 vídeo curto roteirizado (Renata grava
  com o celular, 60 s), 3 posts de Instagram (Graph API), 1 post de LinkedIn, 1 resposta em
  comunidade (Reddit r/brasil, grupos de Facebook de produtores) com link.
- **Regra:** cada post tem o número central da página e o link. Nada de post sem dado.
- **YouTube Data API** publica o vídeo com título igual à pergunta e descrição com o link e o
  número. É o formato que Gemini e AI Overview mais citam para "como fazer".

## A6 — Verticais e entidade (Verticais, 13)

- **Faz uma vez, mantém por API:** perfil em Mercado Livre (kit de cultivo e substrato, via
  API de vendedor), listagem no Sebrae/feiras, Google Business Profile completo, Wikidata
  (entidade "Micélio & Cia" com site oficial, fundação, localização), perfil de produtor em
  diretórios de orgânicos.
- **Por quê:** as IAs confirmam que a marca existe cruzando fontes. Uma marca que só existe
  no próprio site não é citada com confiança.

## A7 — Menções externas (Open Media, 22)

- **A mais difícil de automatizar; a de maior peso.**
- **Faz:** o pipeline monta, para cada página nova, uma lista de 10 alvos (portais de
  agronegócio, jornais regionais, podcasts de empreendedorismo rural) via SerpApi e
  enriquecimento de contato (API de prospecção). Gera o e-mail de pauta com o número
  central da página ("shiitake rende R$ X por m² em Mogi").
- **Humano:** Renata aprova a primeira versão de cada template; depois o envio é automático
  (API de e-mail, domínio próprio, no máximo 30 por semana, descadastro obrigatório).
- **Mede:** menções novas do domínio (Ahrefs ou Semrush API, ou busca "micelioecia" via
  SerpApi) entram no relatório semanal.

## Relatório de segunda (saída do ciclo)

Uma página em `relatorios/AAAA-MM-DD.md` e um e-mail: presença, ranking médio, sentimento,
3 páginas publicadas, o que foi para a fila, custo da semana por API, e a decisão da semana
seguinte (3 perguntas escolhidas). Gráfico de presença por motor, 12 semanas.
