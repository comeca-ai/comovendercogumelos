/** A2 — Gerar a página-resposta ao redor de fatos fornecidos pelo código. */
import { readFile } from 'node:fs/promises';
import { escrever } from '../lib/gerador.mjs';

const SYSTEM = `Você escreve páginas-resposta em português do Brasil para o site de uma produtora de cogumelos.
Regras: (1) a primeira frase responde a pergunta diretamente, em negrito, com o número central e a fonte entre parênteses;
(2) use SOMENTE os números da seção FATOS, cada um com fonte e data ao lado; não invente número, preço, percentual nem fonte;
(3) estrutura: resposta direta, tabela, passo a passo numerado, 5 perguntas frequentes do cluster, bloco de autor;
(4) 900 a 1800 palavras; (5) linke 2 páginas irmãs listadas; (6) front matter YAML igual ao molde.`;

export async function gerar(cfg, escolha, fatos, { seco }) {
  const molde = await readFile(new URL('../../exemplos/pagina-resposta.md', import.meta.url), 'utf8');
  const prompt = `PERGUNTA: ${escolha.texto}\n\nFATOS (use só estes):\n${fatos.map((f) => `- ${f.valor} (${f.fonte}, ${f.data})`).join('\n')}\n\nPÁGINAS IRMÃS: /vender-para-restaurantes, /qual-cogumelo-da-mais-lucro\n\nMOLDE:\n${molde}`;
  const texto = await escrever(SYSTEM, prompt, { seco });
  return { pergunta: escolha.texto, texto, slug: escolha.texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') };
}
