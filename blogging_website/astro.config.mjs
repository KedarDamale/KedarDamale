import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import { portfolioPublicAssets } from './scripts/portfolio-public-assets.mjs';

export default defineConfig({
  publicDir: './.portfolio-public',
  adapter: vercel(),
  integrations: [portfolioPublicAssets()],
});
