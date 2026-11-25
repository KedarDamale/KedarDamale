# Blogging website

The Astro blog lives in `blogging_website/`. It uses Astro with the React
integration for small interactive islands and the Vercel serverless adapter.
The root route is an editorial landing page; add published writing as Astro
content under `src/content/blog/` and link it from the home page.

## Local development

```sh
cd blogging_website
npm install
npm run dev
```

Build and preview the production output with `npm run build` and `npm run
preview` from the same directory.

## Vercel deployment

On pushes to `main`, the `Deploy Astro blog to Vercel` workflow runs when
`blogging_website/` or the workflow file changes. It also supports manual runs.
The workflow runs the Vercel CLI from `blogging_website/`, so the `kedar-damale`
Vercel project uses the default root directory. GitHub Actions uses three
repository secrets.

- `VERCEL_TOKEN`: a Vercel access token
- `VERCEL_ORG_ID`: the team or account ID that owns the project
- `VERCEL_PROJECT_ID`: the project ID for the blog

For a manual production deployment, run these commands from `blogging_website/`
with a signed-in Vercel CLI linked to `kedar-damale`.

```sh
vercel pull --yes --environment=production
vercel build --prod
vercel deploy --prebuilt --prod
```
