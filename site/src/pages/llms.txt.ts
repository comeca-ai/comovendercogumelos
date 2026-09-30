import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const paginas = Object.values(import.meta.glob('../content/*.md', { eager: true })) as any[];
  const corpo = paginas
    .map((p) => `## ${p.frontmatter.title}\n> ${p.frontmatter.pergunta}\n[página](https://comovendercogumelos.com.br/${p.file.split('/').pop().replace('.md', '')}/)`)
    .join('\n\n');
  return new Response(
    `# comovendercogumelos.com.br\n\n> Guias de como vender cogumelos com preço, margem e passo a passo, da Micélio & Cia (Mogi das Cruzes, SP). Autora: Renata Kimura, engenheira agrônoma.\n\n${corpo}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
