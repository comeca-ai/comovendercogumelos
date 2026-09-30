/** Relatório de segunda: números com denominador, custo por API, fila do operador + estado pro painel. */
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { custo } from '../lib/custo.mjs';

export async function relatorio(cfg, r) {
  const data = new Date().toISOString().slice(0, 10);
  const m = r.medicao.resumo;
  const md = `# Relatório ${data} — ${cfg.marca}

| Métrica | Valor |
|---|---|
| Presença | ${m.presenca.n} de ${m.denominador} (${m.presenca.pct}%) |
| Citação | ${m.citacao.n} de ${m.denominador} |
| Ranking médio | ${m.ranking_medio ?? '—'} |
| Ranking 1 | ${m.ranking_1} de ${m.presenca.n} com presença |

## Publicado
${r.publicadas.map((p) => `- ${p.url}`).join('\n') || '- nada'}

## Fila do operador
${r.fila.map((f) => `- ${f}`).join('\n') || '- vazia'}

## Custo da semana
${Object.entries(custo.porApi()).map(([k, v]) => `- ${k}: US$ ${v.toFixed(3)}`).join('\n')}
- total: US$ ${custo.total().toFixed(3)}
`;
  const dir = new URL('../../relatorios/', import.meta.url);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL(`${data}.md`, dir), md);

  const painelDir = new URL('../../painel/dados/', import.meta.url);
  await mkdir(painelDir, { recursive: true });
  const estado = {
    semana: data,
    marca: cfg.marca,
    dominio: cfg.dominio,
    metricas: m,
    sentimento: r.medicao.sentimento || null,
    publicadas: r.publicadas,
    fila: r.fila,
    custo: { porApi: custo.porApi(), total: custo.total() },
    deteccoes: r.medicao.deteccoes?.map((d) => ({ pergunta: d.pergunta, motor: d.motor, presenca: d.presenca, citacao: d.citacao, ranking: d.ranking, sentimento: d.sentimento })),
  };
  const histUrl = new URL('historico.json', painelDir);
  let historico = [];
  try { historico = JSON.parse(await readFile(histUrl, 'utf8')); } catch { /* primeira semana */ }
  historico = historico.filter((h) => h.semana !== data);
  historico.push(estado);
  await writeFile(histUrl, JSON.stringify(historico, null, 1));
  await writeFile(new URL('atual.json', painelDir), JSON.stringify(estado, null, 1));
  return md;
}
