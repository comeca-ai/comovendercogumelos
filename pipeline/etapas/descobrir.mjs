/** A1 — Descobrir e priorizar perguntas: SerpApi + IAs + WhatsApp, 3 Nouls, prioridade em código. */
import { decidir, noul } from '../lib/jev.mjs';

async function paa(pergunta, seco) {
  if (seco) return [`${pergunta} para supermercado`, `${pergunta} vale a pena`, `quanto cobrar por 200 g de shimeji`];
  const u = new URL('https://serpapi.com/search.json');
  u.search = new URLSearchParams({ engine: 'google', q: pergunta, hl: 'pt-br', gl: 'br', api_key: process.env.SERPAPI_API_KEY });
  const j = await (await fetch(u)).json();
  return (j.related_questions || []).map((q) => q.question);
}

export async function descobrir(cfg, perguntas, medicao, { seco }) {
  const candidatas = new Set();
  for (const p of perguntas) for (const q of await paa(p.texto, seco)) candidatas.add(q.toLowerCase());
  const existentes = perguntas.map((p) => p.texto);
  const aprovadas = [];
  for (const texto of candidatas) {
    const a = await decidir(
      { pergunta: texto, perguntas_ja_cobertas: existentes },
      {
        nicho: noul('A `pergunta` é sobre produzir ou vender cogumelos?'),
        cliente: noul('Quem faz a `pergunta` pode comprar substrato, blocos inoculados ou consultoria de cultivo?'),
        coberta: noul('A `pergunta` já é respondida por alguma das `perguntas_ja_cobertas`?'),
      },
      { seco },
    );
    if (a.nicho.noul < cfg.limiares.pergunta_e_do_nicho) continue;
    if (a.cliente.noul < cfg.limiares.pergunta_vira_cliente) continue;
    aprovadas.push({ texto, atualizar: a.coberta.noul >= cfg.limiares.ja_temos_pagina, p: a.nicho.noul * a.cliente.noul });
  }
  // prioridade: buraco (sem presença) primeiro, depois probabilidade de virar cliente
  const buracos = new Set(medicao.deteccoes.filter((d) => !d.presenca).map((d) => d.pergunta));
  aprovadas.sort((x, y) => Number(buracos.has(y.texto)) - Number(buracos.has(x.texto)) || y.p - x.p);
  return aprovadas.slice(0, cfg.paginas_por_semana);
}
