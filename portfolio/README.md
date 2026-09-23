# Kedar Damale — Portfolio

A static, responsive portfolio built from HTML components and plain JavaScript/CSS for GitHub Pages. The visual direction pairs an editorial, oversized type-led hero with a portrait, custom-generated data-landscape and project artwork, detailed case studies, and a searchable public-repository index.

## Structure

```text
components/   Header, hero, about, experience, projects, contact, footer
styles/       Theme tokens, global rules, layout, and section styles
scripts/      Component loader, navigation, theme, motion, repository catalogue
assets/       Portraits and generated visual assets
```

The site has no build step or framework runtime. Start a local server from this directory, for example `python3 -m http.server 8000`, then open `http://localhost:8000/`. Component partials are fetched at runtime, so opening `index.html` directly as a `file://` URL will not work.

## Repository catalogue

The catalogue is a locally curated allowlist of public repositories with substantive code in `scripts/modules/catalogue.js`. At runtime it requests public GitHub metadata to show each repository’s primary language and last update. API failure only removes the live metadata; the local catalogue and filters remain available.

The allowlist is deliberate: repositories containing only a README, license, or scaffold are excluded. Private repositories never enter the browser catalogue. Employer work is presented separately as high-level, sanitized case studies without source links or implementation details.

## Publishing

The GitHub Pages workflow publishes this directory. Keep the résumé links in `components/site-header.html` and `components/site-footer.html` aligned with the current PDF in this folder when a new résumé is published. The profile and Open Graph image paths assume the repository’s GitHub Pages URL.
