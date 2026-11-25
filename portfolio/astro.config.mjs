import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import { resumeDownloads } from './scripts/resume-downloads.mjs';

export default defineConfig({
  adapter: vercel(),
  integrations: [resumeDownloads()],
});
