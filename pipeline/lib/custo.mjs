/** Custo medido, não estimado: cada chamada registra tokens; o ciclo para no teto. */
const linhas = [];
export const custo = {
  registrar(api, tokensIn, tokensOut, precoInPorM, precoOutPorM) {
    const usd = (tokensIn * precoInPorM + tokensOut * precoOutPorM) / 1e6;
    linhas.push({ api, tokensIn, tokensOut, usd, quando: new Date().toISOString() });
    return usd;
  },
  registrarFixo(api, usd) {
    linhas.push({ api, tokensIn: 0, tokensOut: 0, usd, quando: new Date().toISOString() });
  },
  total() {
    return linhas.reduce((s, l) => s + l.usd, 0);
  },
  porApi() {
    const m = {};
    for (const l of linhas) m[l.api] = (m[l.api] || 0) + l.usd;
    return m;
  },
  checarTeto(tetoUsd, acumuladoMesUsd = 0) {
    if (acumuladoMesUsd + custo.total() > tetoUsd) throw new Error(`teto mensal de US$ ${tetoUsd} atingido; ciclo suspenso`);
  },
};
