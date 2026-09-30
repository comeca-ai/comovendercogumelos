/** A3 (parte 2) — Publicar no site (arquivo Markdown → commit → deploy) e indexar via IndexNow. */
import { writeFile, mkdir } from 'node:fs/promises';

export async function publicar(cfg, pagina, { seco }) {
  const dir = new URL('../../site/conteudo/', import.meta.url);
  await mkdir(dir, { recursive: true });
  const arquivo = new URL(`${pagina.slug}.md`, dir);
  await writeFile(arquivo, pagina.texto);
  const url = `${process.env.SITE_URL || 'https://' + cfg.dominio}/${pagina.slug}`;
  if (!seco && process.env.INDEXNOW_KEY) {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host: cfg.dominio, key: process.env.INDEXNOW_KEY, urlList: [url] }),
    });
  }
  return { url, arquivo: arquivo.pathname };
}
