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

The `Deploy Astro blog to Vercel` GitHub Actions workflow only runs for changes
inside `blogging_website/` or its workflow file. In Vercel, create or select a
project for this repository and set its **Root Directory** to `blogging_website`.
Add these Actions repository secrets:

- `VERCEL_TOKEN`: a Vercel access token
- `VERCEL_ORG_ID`: the team or account ID that owns the project
- `VERCEL_PROJECT_ID`: the project ID for the blog

After the secrets are set, pushes to `main` that change the blog will build and
deploy it to production. The existing portfolio GitHub Pages workflow remains
independent.
