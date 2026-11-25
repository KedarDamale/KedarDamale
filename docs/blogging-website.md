# Astro portfolio

The Vercel portfolio lives in `blogging_website/`. The homepage combines a
shared layout and Astro components for each section. The GitHub Pages portfolio
uses the HTML in `portfolio/`. Both use the same browser modules for the
experience tabs and other interactions.

Astro stages the existing styles, assets, browser modules, and résumé PDFs at
startup and build time. Both deployments provide the dated résumés and a
`resume.pdf` alias for the latest file.
For editorial changes, update the relevant Astro component and its corresponding
GitHub Pages HTML partial.

## Local development

Use Node.js 22.

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

To redeploy from GitHub, open the workflow under **Actions** and select
**Run workflow** on `main`.
