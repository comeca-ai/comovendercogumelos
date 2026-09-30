/** A7 — Menções externas: 10 alvos por página, e-mail de pauta com o número central, envio pós-aprovação, medição. */
import { escrever } from '../lib/gerador.mjs';
import { custo } from '../lib/custo.mjs';

async function alvos(pergunta, seco) {
  if (seco || !process.env.SERPAPI_API_KEY) {
    return ['portal agronegócio SP', 'jornal regional Mogi', 'podcast empreendedorismo rural', 'site de fruticultura', 'revista de orgânicos', 'blog de negócios rurais', 'portal de alimentos', 'rádio rural', 'newsletter de agro', 'portal de pequenos negócios']
      .map((t) => ({ nome: t, email: `pauta@${t.replace(/\s/g, '')}.com.br`, motivo: `cobre "${pergunta}"` }));
  }
  const u = new URL('https://serpapi.com/search.json');
  u.search = new URLSearchParams({ engine: 'google', q: `${pergunta} cogumelos agronegócio`, hl: 'pt-br', gl: 'br', api_key: process.env.SERPAPI_API_KEY });
  const j = await (await fetch(u)).json();
  custo.registrarFixo('serpapi', 50 / 5000);
  return (j.organic_results || []).slice(0, 10).map((o) => ({ nome: o.title, url: o.link, motivo: o.snippet }));
}

export async function mencoes(cfg, pagina, url, templateAprovado, { seco }) {
  const lista = await alvos(pagina.pergunta, seco);
  const numero = (pagina.texto.match(/\*\*([^*]{5,160})\*\*/) || [])[1] || pagina.pergunta;
  const corpo = templateAprovado || (await escrever(
    'Você escreve e-mails curtos de pauta em português do Brasil para veículos de agronegócio. Assunto curto com o número.',
    `Assunto + 120 palavras. Pauta: "${pagina.pergunta}". Número central: ${numero}. Fonte: planilha Micélio & Cia + CEAGESP. Link: ${url}. Tom: oferecer dado com fonte, não vender.`,
    { seco, maxTokens: 500 },
  ));
  const envios = lista.slice(0, 30).map((a) => ({ para: a.email, assunto: corpo.split('\n')[0], corpo, alvo: a.nome }));
  if (seco) return { alvos: lista, corpo, envios, enviar: false, simulado: true };
  // só envia se o template já foi aprovado pelo operador uma vez (config.template_pauta_aprovado)
  if (!templateAprovado || !process.env.RESEND_API_KEY) return { alvos: lista, corpo, envios, enviar: false };
  let enviados = 0;
  for (const e of envios) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'pauta@micelioecia.com.br', to: e.para, subject: e.assunto, text: e.corpo }),
    });
    if (r.ok) enviados++;
    custo.registrarFixo('resend', 0.0001);
    await new Promise((res) => setTimeout(res, 2000)); // no máximo ~30/semana, sem disparo em massa
  }
  return { alvos: lista, corpo, envios, enviados, enviar: enviados > 0 };
}
