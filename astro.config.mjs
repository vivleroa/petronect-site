import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Troque 'site' pelo seu domínio quando conectar um (ex.: https://consultxlicitacoes.com.br)
export default defineConfig({
  site: 'https://petronect-consultoria.netlify.app',
  integrations: [sitemap()],
});
