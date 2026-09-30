# 04 — Catálogo de APIs

Só o que é chamado por código. Sem painel manual em nada disso depois da configuração.

| Papel | API | Uso no ciclo | Custo mensal estimado |
|---|---|---|---|
| Medir as IAs | **Cloro** (ChatGPT, Gemini, Perplexity, Copilot, AI Overview) | A0, A1 | US$ 30 (plano Lite, 37,5k créditos; o ciclo usa ~4k) |
| Google e "as pessoas também perguntam" | **SerpApi** | A1, A7 | US$ 0 a 50 (plano dev, 5k buscas; ~300/mês) |
| Decisões fechadas com confiança | **TypeSafe Jev** (`POST /v1/systemone`) | A0 sentimento, A1, A3, A4 | < US$ 1 (US$ 0,042/M tokens de entrada) |
| Escrever texto | **Anthropic API** (Claude Sonnet 5.5) | A2, A5, A7 | US$ 10 a 20 (12 páginas + derivados) |
| Ler páginas bloqueadas para robô | **Scrape.do** | A4 (Reclame Aqui, Trustpilot) | US$ 0 a 10 |
| Site e deploy | **Cloudflare Pages + Workers + D1** | A3, dados | US$ 0 a 5 |
| Indexação | **IndexNow**, **Google Search Console API** | A3 | US$ 0 |
| Avaliações | **Google Business Profile API** | A4 | US$ 0 |
| Pedido de avaliação e perguntas de clientes | **WhatsApp Business Cloud API** | A1, A4 | ~US$ 5 (mensagens de utilidade) |
| Social | **Instagram Graph API**, **YouTube Data API**, **LinkedIn API** | A5 | US$ 0 |
| Fatos (preço, custo, rendimento) | **Google Sheets API** | A2 | US$ 0 |
| E-mail transacional e de pauta | **Cloudflare Email Service** ou **Resend** | A7, relatório | US$ 0 a 5 |
| Menções externas | **Ahrefs API** ou **Semrush API** (opcional) | A7 medição | US$ 0 (usa SerpApi) a 100+ |
| Entidade | **Wikidata API** | A6 | US$ 0 |

**Total previsto: ~US$ 60/mês** (teto de US$ 120 em `config.json` supõe SerpApi no plano gratuito e sem Ahrefs/Semrush; com eles, subir o teto). O item caro é sempre medir as IAs; a
alavanca de custo é a frequência (semanal, nunca diária) e o número de motores.

## Regras de uso de modelo

1. **Decisão ≠ geração.** Perguntas fechadas vão para o Jev; texto vai para o Claude. Nunca
   pedir ao gerador "você acha que está bom?". Nunca pedir ao decisor para escrever.
2. **Fatos vêm de código.** O gerador recebe os números; o decisor confere se cada número tem
   fonte ao lado. Número sem fonte é apagado antes de publicar.
3. **Confiança governa o fluxo.** Choice e Score devolvem `confidence`; abaixo de 0,8 nada
   publica sozinho. Noul devolve probabilidade; o limiar é por pergunta (0,7 para "é sobre
   vender cogumelos?", 0,9 para "todo número tem fonte?").
4. **Estado enxuto.** O Jev perde precisão com texto irrelevante: mandar só a seção que a
   pergunta precisa, não a página inteira, sempre que der.
5. **Medir custo por chamada.** Tokens de entrada/saída gravados em `medicoes` e somados no
   relatório. Teto mensal em `config.json`; estourou, o ciclo para.
6. **Testar sobre respostas guardadas.** Mudança de prompt ou de modelo roda primeiro sobre as
   respostas já coletadas (custo zero em Cloro) e compara com a semana anterior.
