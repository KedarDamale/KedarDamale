# Astro portfolio

The Vercel portfolio lives in `blogging_website/`. The homepage combines a
shared layout and Astro components for each section. The experience tabs are a
React island. The GitHub Pages portfolio uses the HTML in `portfolio/`.

Astro stages the existing styles, assets, browser modules, and résumé PDFs at
startup and build time. Both deployments use the same résumé listing script.
For editorial changes, update the relevant Astro component and its corresponding
GitHub Pages HTML partial.

## Local development

Use Node.js 22 and Python 3.

```sh
cd blogging_website
npm ci
npm run dev
```

Build and preview the production output with `npm run build` and `npm run
preview` from the same directory.

## Vercel deployment

On pushes to `main`, the `Deploy Astro portfolio to Vercel` workflow runs when
the Astro project, its shared inputs, or the workflow file changes. It also
supports manual runs.
The workflow runs the Vercel CLI from `blogging_website/`, so the `kedar-damale`
Vercel project uses the default root directory. GitHub Actions uses three
repository secrets.

- `VERCEL_TOKEN`: a Vercel access token
- `VERCEL_ORG_ID`: the team or account ID that owns the project
- `VERCEL_PROJECT_ID`: the project ID for `kedar-damale`

For a manual production deployment, run these commands from `blogging_website/`
with a signed-in Vercel CLI linked to `kedar-damale`.

```sh
vercel pull --yes --environment=production
vercel build --prod
vercel deploy --prebuilt --prod
```
