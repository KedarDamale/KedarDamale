import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import { portfolioPublicAssets } from './scripts/portfolio-public-assets.mjs';

export default defineConfig({
  publicDir: './.portfolio-public',
  adapter: vercel(),
  integrations: [portfolioPublicAssets(), react()],
});
