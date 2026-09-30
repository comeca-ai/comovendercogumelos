import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://comovendercogumelos.com.br',
  integrations: [sitemap()],
});
