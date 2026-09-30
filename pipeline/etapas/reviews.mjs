/** A4 — Reviews: pedir por WhatsApp após entrega; ler novas; separar problema (humano) de elogio (automático). */
import { decidir, noul } from '../lib/jev.mjs';
import { custo } from '../lib/custo.mjs';

const WA = 'https://graph.facebook.com/v20.0';
const GBP = 'https://mybusinessaccountmanagement.googleapis.com/v1';

async function enviarWhatsApp(telefone, texto) {
  if (!process.env.WHATSAPP_TOKEN) return { simulado: true };
  const r = await fetch(`${WA}/${process.env.WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: telefone, type: 'text', text: { body: texto } }),
  });
  const j = await r.json();
  custo.registrarFixo('whatsapp', 0.005);
  if (!r.ok) throw new Error(`whatsapp: ${j.error?.message || r.status}`);
  return j;
}

/** Avaliações novas do Google Business Profile (conta vinculada ao domínio). */
async function avaliacoesNovas(seco) {
  if (seco || !process.env.GBP_ACCOUNT_ID) return [];
  const r = await fetch(`${GBP}/${process.env.GBP_ACCOUNT_ID}/locations/-/reviews?pageSize=50`, {
    headers: { Authorization: `Bearer ${await tokenConta()}` },
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`gbp: ${JSON.stringify(j).slice(0, 200)}`);
  return (j.reviews || []).filter((rv) => new Date(rv.updateTime) > new Date(Date.now() - 8 * 864e5));
}

async function tokenConta() {
  const { tokenJwt } = await import('../lib/fatos.mjs');
  return tokenJwt('https://www.googleapis.com/auth/business.manage');
}

export async function reviews(cfg, entregasRecentes, avaliacoes, { seco }) {
  // 1. pedir avaliação 3 dias após cada entrega
  const pedidos = entregasRecentes.map((e) => ({ para: e.telefone, texto: `Olá ${e.nome}, aqui é a Renata da Micélio & Cia. Sua avaliação ajuda outros produtores: ${process.env.LINK_AVALIACAO || 'https://g.page/r/xxx/review'}` }));
  if (!seco && process.env.WHATSAPP_TOKEN) for (const p of pedidos) await enviarWhatsApp(p.para, p.texto);

  // 2. ler avaliações novas (GBP direto; Reclame Aqui/Trustpilot via Scrape.do)
  let novas = avaliacoes;
  if (!seco && avaliacoes.length === 0 && process.env.GBP_ACCOUNT_ID) novas = await avaliacoesNovas(seco);
  if (!seco && process.env.SCRAPEDO_API_KEY) {
    for (const alvo of ['https://www.reclameaqui.com.br/empresa/micelio-e-cia/', 'https://www.trustpilot.com/review/micelioecia.com.br']) {
      const u = new URL('https://api.scrape.do/');
      u.search = new URLSearchParams({ token: process.env.SCRAPEDO_API_KEY, url: alvo, render: 'true' });
      const r = await fetch(u);
      custo.registrarFixo('scrapedo', 0.001);
      const html = await r.text();
      novas = novas.concat(extrairAvaliacoesHtml(html));
    }
  }

  // 3. triagem: problema de produto/entrega vai ao humano; elogio responde sozinho
  const fila = [], respondidas = [];
  for (const av of novas) {
    const a = await decidir(
      { avaliacao: (av.texto || '').slice(0, 2000), estrelas: av.estrelas ?? null },
      { problema: noul('A `avaliacao` relata problema concreto de produto, entrega ou atendimento?', { true: 'Descreve falha, atraso, qualidade ruim ou insatisfação', false: 'Elogio, satisfação ou sem conteúdo negativo' }) },
      { seco },
    );
    if (a.problema.noul >= cfg.limiares.review_relata_problema || (av.estrelas ?? 5) <= 2) {
      fila.push({ tipo: 'review', texto: av.texto, estrelas: av.estrelas, em: av.em });
    } else {
      respondidas.push(av);
      if (!seco && process.env.WHATSAPP_TOKEN && av.telefone) await enviarWhatsApp(av.telefone, `Obrigada pela avaliação! — Renata, Micélio & Cia`);
    }
  }
  return { pedidos, fila, respondidas };
}

function extrairAvaliacoesHtml(html) {
  const fora = [];
  const re = /<[^>]*(?:class|id)=["'][^"']*(?:complaint|review|opinion)[^"']*["'][^>]*>([\s\S]{20,800}?)<\/div>/gi;
  let m;
  while ((m = re.exec(html)) && fora.length < 10) fora.push({ texto: m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), em: new Date().toISOString() });
  return fora;
}
