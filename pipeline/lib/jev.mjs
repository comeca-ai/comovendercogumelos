/**
 * Decisor: TypeSafe Jev (System One). Só perguntas fechadas: Noul, Choice, Score.
 * Nunca gera texto. Confiança abaixo do limiar vai para a fila do operador.
 * Doc: https://docs.typesafe.ai/api
 */
import { custo } from './custo.mjs';

const URL = 'https://api.typesafe.ai/v1/systemone';

export const noul = (instructions, criteria) => ({ type: 'noul', instructions, ...(criteria && { criteria }) });
export const choice = (instructions, criteria) => ({ type: 'choice', instructions, criteria });
export const score = (instructions, criteria) => ({ type: 'score', instructions, criteria });

/**
 * @param {string|object|any[]} state  Só o que as perguntas precisam (estado enxuto).
 * @param {Record<string, object>} questions
 */
export async function decidir(state, questions, { seco = false } = {}) {
  if (seco) return Object.fromEntries(Object.keys(questions).map((k) => [k, simulado(questions[k])]));
  const r = await fetch(URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.TYPESAFE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ state, model: 'jev-latest', questions }),
  });
  if (!r.ok) throw new Error(`jev ${r.status}: ${await r.text()}`);
  const json = await r.json();
  custo.registrar('jev', json.usage?.input_tokens ?? 0, 0, 0.042, 0);
  return json.answers;
}

function simulado(q) {
  if (q.type === 'noul') return { type: 'noul', noul: 0.95 };
  if (q.type === 'choice') {
    const opts = Object.keys(q.criteria);
    return { type: 'choice', choice: opts[0], confidence: 0.95, probabilities: Object.fromEntries(opts.map((o, i) => [o, i ? 0 : 1])) };
  }
  return { type: 'score', score: q.criteria.length - 1, confidence: 0.95 };
}
