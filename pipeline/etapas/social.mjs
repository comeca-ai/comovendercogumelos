/** A5 — Social derivado: cada página vira posts com o número central e o link. Nada de post sem dado. */
import { escrever } from '../lib/gerador.mjs';
import { custo } from '../lib/custo.mjs';

const IG = 'https://graph.facebook.com/v20.0';

function numeroCentral(pagina) {
  const m = pagina.texto.match(/\*\*([^*]{5,160})\*\*/);
  return m ? m[1] : pagina.pergunta;
}

export async function social(cfg, pagina, url, { seco }) {
  const dado = numeroCentral(pagina);
  const roteiro = await escrever(
    'Você roteiriza vídeos curtos em português do Brasil para uma produtora de cogumelos.',
    `Roteiro de 60 s, tom direto, apresentado por Renata.\nPergunta: ${pagina.pergunta}\nNúmero central: ${dado}\nSite: ${url}\nEstrutura: gancho (3 s), número com fonte, 2 passos, CTA pro site.`,
    { seco, maxTokens: 700 },
  );
  const posts = [
    { rede: 'instagram', texto: `${pagina.pergunta}? ${dado}. Passo a passo completo: ${url}` },
    { rede: 'instagram', texto: `Tabela de custos atualizada (${new Date().toISOString().slice(0, 7)}): ${dado.split(',')[0]}. Fonte no site: ${url}` },
    { rede: 'instagram', texto: `Pergunta de produtor: "${pagina.pergunta}". Resposta com número e fonte: ${url}` },
    { rede: 'linkedin', texto: `Publicamos resposta nova no comovendercogumelos: ${pagina.pergunta}. Dado central: ${dado}. ${url}` },
    { rede: 'youtube', titulo: pagina.pergunta, descricao: `${dado}\n\nPasso a passo completo: ${url}` },
    { rede: 'comunidade', texto: `Sobre "${pagina.pergunta}": compilamos números com fonte (planilha + CEAGESP) aqui: ${url}` },
  ];
  if (seco) return { roteiro, posts, enviados: [], simulado: true };

  const enviados = [];
  if (process.env.IG_USER_ID) {
    for (const p of posts.filter((x) => x.rede === 'instagram')) {
      const r = await fetch(`${IG}/${process.env.IG_USER_ID}/media`, {
        method: 'POST', headers: { Authorization: `Bearer ${process.env.IG_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: p.texto, image_url: process.env.IG_IMAGE_URL || 'https://placehold.co/1080x1080' }),
      });
      const j = await r.json();
      if (r.ok) { await fetch(`${IG}/${process.env.IG_USER_ID}/media_publish`, { method: 'POST', headers: { Authorization: `Bearer ${process.env.IG_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ creation_id: j.id }) }); enviados.push('instagram'); }
    }
  }
  if (process.env.YT_TOKEN) {
    enviados.push('youtube (aguardando vídeo da Renata)');
  }
  if (process.env.LI_TOKEN) {
    const r = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.LI_TOKEN}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' },
      body: JSON.stringify({ author: `urn:li:person:${process.env.LI_PERSON_ID}`, lifecycleState: 'PUBLISHED', specificContent: { 'com.linkedin.ugc.ShareContent': { shareCommentary: { text: posts.find((p) => p.rede === 'linkedin').texto }, shareMediaCategory: 'NONE' } }, visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' } }),
    });
    if (r.ok) enviados.push('linkedin');
  }
  custo.registrarFixo('social', 0);
  return { roteiro, posts, enviados };
}
