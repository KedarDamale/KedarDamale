# Kedar Damale — Portfolio

A static, responsive portfolio built from HTML components and plain JavaScript/CSS for GitHub Pages. The visual direction pairs an editorial, oversized type-led hero with a portrait, custom-generated data-landscape and project artwork, detailed case studies, and a searchable public-repository index.

## Structure

```text
components/   Header, hero, about, experience, projects, contact, footer
styles/       Theme tokens, global rules, layout, and section styles
scripts/      Component loader, navigation, theme, motion, repository catalogue
assets/       Portraits and generated visual assets
```

The site has no framework runtime. Run `bash scripts/dev.sh` from the repository root, then open `http://localhost:4173/`. This stages the site, résumé PDFs, and filename list in a temporary directory; restart the preview after changes. Component partials are fetched at runtime, so opening `index.html` directly as a `file://` URL will not work.

## Repository catalogue

The catalogue is a locally curated allowlist of public repositories with substantive code in `scripts/modules/catalogue.js`. At runtime it requests public GitHub metadata to show each repository’s primary language and last update. API failure only removes the live metadata; the local catalogue and filters remain available.

The allowlist is deliberate: repositories containing only a README, license, or scaffold are excluded. Private repositories never enter the browser catalogue. Employer work is presented separately as high-level, sanitized case studies without source links or implementation details.

## Publishing

The GitHub Pages workflow stages this directory and all `output/resume-YYYYMMDD.pdf` artifacts, then generates `output/resumes.json`. JavaScript reads this list and updates both résumé links to the filename with the latest date. Add a dated PDF to `output/` and deploy to update the download automatically. `make resume` uses the latest Git commit date affecting `resume/`, removes redundant resume PDFs after a successful build, and updates the fallback download links and profile README. The profile and Open Graph image paths assume the repository’s GitHub Pages URL.
