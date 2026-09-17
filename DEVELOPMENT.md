# Repository maintenance

## Layout

```text
resume/       Modular LaTeX résumé source and job-focused variants
portfolio/    Dependency-free portfolio for GitHub Pages
.github/      Deployment and profile-activity workflows
scripts/      Small local build helpers
```

## Résumés

Shared résumé content lives in `resume/content/`; role-specific entry points live in `resume/variants/`.

Build locally with `make resume` (or `./scripts/build-resume.sh`). To publish a compiled version, run `bash scripts/publish-resume.sh resume/main.pdf YYYYMMDD`. Published files must be named exactly `portfolio/resume-YYYYMMDD.pdf`; update both portfolio component links to that filename before committing.

GitHub Actions deploys the static portfolio only. It does not compile, publish, or rewrite résumé links.

## GitHub activity

`update-github-activity.yml` regenerates `assets/github-activity.svg` daily. Add a repository secret named `PROFILE_ACTIVITY_TOKEN` containing a personal access token with the `read:user` scope if private contribution counts should be included. The graph never exposes private repository names or commit details.

`snake.yml` publishes the contribution animation to the `output` branch daily. Its image URLs are consumed by the profile README.
