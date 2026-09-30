/**
 * Gerador: escreve texto ao redor de fatos que o código forneceu. Nunca decide, nunca inventa número.
 * Claude via Anthropic API (modelo em GERADOR_MODEL, padrão claude-sonnet-5-5).
 */
import { custo } from './custo.mjs';

const MODEL = process.env.GERADOR_MODEL || 'claude-sonnet-5-5';

export async function escrever(system, prompt, { seco = false, maxTokens = 4000 } = {}) {
  if (seco) return `# (seco) rascunho para: ${prompt.slice(0, 80)}...`;
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic();
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: prompt }],
  });
  custo.registrar('claude', msg.usage.input_tokens, msg.usage.output_tokens, 3, 15);
  return msg.content.map((c) => c.text || '').join('');
}
