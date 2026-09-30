/**
 * Detecção em código, sem IA: presença, citação e ranking de uma marca numa resposta de IA.
 * Regra: número que aparece no relatório nunca sai de LLM.
 */
const norm = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Índice da primeira ocorrência de qualquer termo (nome ou alias) no texto; -1 se ausente. */
export function primeiraOcorrencia(texto, termos) {
  const t = norm(texto);
  let menor = -1;
  for (const termo of termos) {
    const i = t.indexOf(norm(termo));
    if (i >= 0 && (menor < 0 || i < menor)) menor = i;
  }
  return menor;
}

/**
 * @param {{ texto: string, links: string[] }} resposta
 * @param {{ marca: string, aliases: string[], dominio: string, concorrentes: string[] }} cfg
 * @returns {{ presenca: boolean, citacao: boolean, ranking: number|null, rivais: string[] }}
 */
export function detectar(resposta, cfg) {
  const termos = [cfg.marca, ...(cfg.aliases || [])];
  const pos = primeiraOcorrencia(resposta.texto, termos);
  const presenca = pos >= 0;
  const citacao = (resposta.links || []).some((l) => norm(l).includes(norm(cfg.dominio)));
  const rivais = (cfg.concorrentes || []).filter((c) => primeiraOcorrencia(resposta.texto, [c]) >= 0);
  const antes = presenca
    ? rivais.filter((c) => primeiraOcorrencia(resposta.texto, [c]) < pos).length
    : null;
  return { presenca, citacao, ranking: presenca ? 1 + antes : null, rivais };
}

/** Agrega uma semana: denominador declarado, nunca escondido. */
export function agregar(deteccoes) {
  const n = deteccoes.length;
  const com = deteccoes.filter((d) => d.presenca);
  const media = com.length ? com.reduce((s, d) => s + d.ranking, 0) / com.length : null;
  return {
    denominador: n,
    presenca: { n: com.length, pct: n ? Math.round((100 * com.length) / n) : 0 },
    citacao: { n: deteccoes.filter((d) => d.citacao).length },
    ranking_medio: media === null ? null : Math.round(media * 10) / 10,
    ranking_1: com.filter((d) => d.ranking === 1).length,
  };
}
