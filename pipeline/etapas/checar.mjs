/** A3 — Checar: gates com Jev (decisor, não o gerador) + validações em código. */
import { decidir, noul, choice, score } from '../lib/jev.mjs';

export async function checar(cfg, pagina, cluster, { seco }) {
  const palavras = pagina.texto.split(/\s+/).length;
  const emCodigo = { tamanho: seco || (palavras >= 900 && palavras <= 1800), links_irmas: seco || (pagina.texto.match(/\]\(\//g) || []).length >= 2 };
  const corpo = pagina.texto.replace(/^---[\s\S]*?---/, '').trim();
  const a = await decidir(
    { pergunta: pagina.pergunta, primeira_frase: corpo.split(/\n/).find(Boolean) || '', texto: corpo.slice(0, 12000) },
    {
      responde: noul('A `primeira_frase` responde diretamente à `pergunta`?'),
      fontes: noul('Todo número, preço ou percentual em `texto` tem uma fonte ou data escrita ao lado dele?', { true: 'Cada número tem fonte ou data junto', false: 'Pelo menos um número aparece sem fonte nem data' }),
      publico: choice('Para quem o `texto` foi escrito?', { produtor_iniciante: 'Quer começar a produzir e vender', produtor_experiente: 'Já produz, quer vender melhor', curioso: 'Sem intenção de produzir ou vender' }),
      acao: score('Quanto o `texto` permite ao leitor agir hoje?', ['Nada concreto', 'Ideia geral', 'Passos claros', 'Passos claros com número e fonte']),
    },
    { seco },
  );
  const L = cfg.limiares;
  const falhas = [];
  if (a.responde.noul < L.primeira_frase_responde) falhas.push('primeira frase não responde');
  if (a.fontes.noul < L.numero_tem_fonte) falhas.push('número sem fonte');
  if (a.publico.confidence < L.publico_confianca || a.publico.choice === 'curioso') falhas.push(`público: ${a.publico.choice}`);
  if (a.acao.score < L.acao_score_min) falhas.push('pouco acionável');
  if (!emCodigo.tamanho) falhas.push(`tamanho ${palavras} palavras`);
  if (!emCodigo.links_irmas) falhas.push('faltam links internos');
  return { publicar: falhas.length === 0, falhas, respostas: a };
}
