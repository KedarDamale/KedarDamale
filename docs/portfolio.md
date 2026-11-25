# Astro portfolio

The portfolio at [kedar-damale.vercel.app](https://kedar-damale.vercel.app/)
lives in `portfolio/`. Astro renders the homepage from components in `src/`.
Styles, assets, browser modules, and dated résumé PDFs live under `public/`.

## Local development

Use Node.js 22.

```sh
cd portfolio
npm ci
npm run dev
```

Run `npm run build` from the same directory for a production build. Run
`make resume` from the repository root to publish a dated résumé to
`portfolio/public/output/`. Astro serves the latest PDF at
`/output/resume.pdf`.

## Deployment

Vercel builds from `portfolio/` on pushes to `main`. The **Build Astro
portfolio** GitHub Actions workflow checks the Astro build independently.
