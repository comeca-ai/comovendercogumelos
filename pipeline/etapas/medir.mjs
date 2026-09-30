/** A0 — Medir: pergunta às IAs via Cloro e detecta em código. */
import { detectar, agregar } from '../lib/deteccao.mjs';
import { decidir, choice } from '../lib/jev.mjs';
import { custo } from '../lib/custo.mjs';

const CLORO = 'https://api.cloro.dev';
// Forma real da API assíncrona do Cloro (docs.cloro.dev): submete tarefa, consulta até COMPLETED.
const TASK_TYPES = { 'chatgpt-web': 'CHATGPT', 'gemini-web': 'GEMINI', 'perplexity-web': 'PERPLEXITY', 'copilot-web': 'COPILOT', 'google-ai-overview': 'GOOGLE' };

function payloadCloro(pergunta, motor) {
  if (motor === 'google-ai-overview') return { query: pergunta, country: 'BR', include: { html: false, aioverview: { markdown: true } } };
  return { prompt: pergunta, country: 'BR', include: { html: false, markdown: true, rawResponse: false } };
}

async function perguntarCloro(pergunta, motor, seco) {
  if (seco) {
    return { texto: `Resposta simulada do ${motor} para "${pergunta}". Sebrae recomenda começar pequeno; a Micélio & Cia publica uma tabela de custos.`, links: ['https://sebrae.com.br/x', 'https://comovendercogumelos.com.br/y'] };
  }
  const headers = { Authorization: `Bearer ${process.env.CLORO_API_KEY}`, 'Content-Type': 'application/json' };
  const sub = await fetch(`${CLORO}/v1/async/task`, { method: 'POST', headers, body: JSON.stringify({ taskType: TASK_TYPES[motor], payload: payloadCloro(pergunta, motor) }) });
  if (!sub.ok) throw new Error(`cloro submit ${sub.status}`);
  const { task } = await sub.json();
  const fim = Date.now() + 180_000;
  while (Date.now() < fim) {
    await new Promise((r) => setTimeout(r, 5000));
    const st = await fetch(`${CLORO}/v1/async/task/${task.id}`, { headers });
    const data = await st.json();
    if (data.task?.status === 'COMPLETED') {
      const r = motor === 'google-ai-overview' ? data.response?.aiOverview || data.response : data.response;
      custo.registrarFixo('cloro', 5 * (30 / 37500)); // 5 créditos, plano Lite; falha não cobra
      return { texto: r?.markdown || r?.text || '', links: (r?.sources || []).map((s) => s.url || s.link).filter(Boolean) };
    }
    if (data.task?.status === 'FAILED') throw new Error(`cloro falhou: ${data.task?.error || '?'}`);
  }
  throw new Error('cloro: tempo esgotado');
}

export async function medir(cfg, perguntas, { seco }) {
  const deteccoes = [];
  for (const p of perguntas) {
    for (const motor of cfg.motores) {
      const resp = await perguntarCloro(p.texto, motor, seco);
      const d = detectar(resp, { marca: cfg.marca, aliases: cfg.aliases, dominio: cfg.dominio, concorrentes: cfg.concorrentes_de_citacao });
      let sentimento = null;
      if (d.presenca) {
        const a = await decidir(
          { marca: cfg.marca, resposta: resp.texto.slice(0, 6000) },
          { sentimento: choice(`Qual é o tom da resposta sobre a marca \`marca\`?`, { positivo: 'Recomenda, elogia ou apresenta a marca como boa opção', neutro: 'Só menciona, sem juízo', negativo: 'Critica, desaconselha ou aponta problema' }) },
          { seco },
        );
        sentimento = a.sentimento.confidence >= cfg.limiares.sentimento_confianca ? a.sentimento.choice : 'neutro';
      }
      deteccoes.push({ pergunta: p.id, motor, ...d, sentimento, texto: resp.texto, links: resp.links });
    }
  }
  return { deteccoes, resumo: agregar(deteccoes) };
}
