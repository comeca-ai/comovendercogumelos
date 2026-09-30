# 02 — Arquitetura IA-first

## Princípio

**Código no controle, IA nas decisões, humano no portão.** Nenhum agente autônomo decidindo o
fluxo. O fluxo é um script semanal com etapas fixas. Cada etapa chama APIs, faz perguntas
fechadas a um modelo de decisão e só usa um modelo gerador para escrever texto.

```
              ┌──────────────── ciclo semanal (segunda 06:00) ────────────────┐
              │                                                               │
  medir ──► descobrir ──► priorizar ──► gerar ──► checar ──► publicar ──► indexar ──► distribuir
   (IAs)     (perguntas)   (buracos)    (texto)   (gates)    (site)     (IndexNow)   (social, reviews, PR)
     ▲                                     │
     └─────────────── relatório + fila de aprovação do operador ◄──────────┘
```

## Três tipos de IA, três papéis

| Papel | O que faz | Exemplo de serviço | Regra |
|---|---|---|---|
| **Medidor** | Pergunta às IAs e devolve a resposta bruta | Cloro (ChatGPT, Gemini, Perplexity, Copilot, AI Overview), SerpApi (Google) | Só coleta. Detecção de marca é busca de texto em código. |
| **Decisor** | Responde perguntas fechadas com probabilidade e confiança | TypeSafe Jev (Choice, Score, Noul) | Nunca gera texto. Confiança baixa vai para o operador. |
| **Gerador** | Escreve rascunho, título, FAQ, post | Claude (Anthropic API) ou Kimi via endpoint compatível | Só escreve ao redor de fatos que o código forneceu. |

## Site

- **Hospedagem:** Cloudflare Pages (estático) + um Worker para formulários e webhooks.
- **Gerador de site:** Astro. Uma página = um arquivo Markdown com front matter. O pipeline
  escreve arquivos e faz commit; o deploy é automático.
- **Dados:** Cloudflare D1 (SQLite) com 5 tabelas: `perguntas`, `medicoes`, `paginas`,
  `publicacoes`, `fila_operador`. Uma planilha da Micélio & Cia (Google Sheets API) é a
  fonte de preço, custo e rendimento.
- **Legibilidade por máquina, de fábrica:** `robots.txt` liberando GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended; `llms.txt` gerado a cada deploy; `sitemap.xml`;
  JSON-LD (Article, FAQPage, HowTo, Product, Organization, Person) em toda página;
  data de atualização visível e no schema.

## Onde o humano entra

Uma fila só, `fila_operador`, revisada às segundas em 2 horas:
1. Página nova cuja checagem teve confiança < 0,8 em qualquer gate.
2. Resposta a review negativa (sempre humano).
3. E-mail de assessoria/parceria antes de enviar (sempre humano, primeira versão).
4. Alerta: queda de presença > 10 pontos na semana.

Tudo fora disso publica sozinho.

## Segurança e reversão

- Chaves só em variáveis do Worker e no `.env` do pipeline, nunca no repositório.
- Toda publicação é um commit; reverter = `git revert`.
- Orçamento por API com teto mensal em código; estourou, o ciclo para e avisa.
