# Profile graphics

The root README is the public GitHub profile. Agent rules in `AGENTS.md` reserve
profile edits for explicit user requests. Local tooling documentation lives in
`docs/local-tooling.md`.

## Regenerate artwork

Run `make profile-assets` or `node scripts/generate-profile-assets.mjs` from the
repository root. The eight panels and twenty tool tiles in `assets/profile/` share the navy, mint, violet,
and amber palette in `scripts/profile-theme.mjs`. Generation needs no network,
packages, image service, or external fonts.

Profile copy and evidence are intentionally curated in the source generator.
Generating images does not write to README.md. Profile artwork and the dynamic
contribution graph use accessible SVG titles and descriptions.

The tool icons are vendored from [Devicon v2.17.0](https://github.com/devicons/devicon/tree/v2.17.0)
in `scripts/vendor/devicon.json`. Their MIT notice is preserved in
`scripts/vendor/DEVICON-LICENSE.txt`. RAG, graph, connector, and terminal glyphs
are original drawings. No accomplishments or GitHub statistics come from the
reference screenshots.

## Contribution activity

Set `GITHUB_USERNAME` and `GITHUB_TOKEN` (or `PROFILE_ACTIVITY_TOKEN`), then run
`node scripts/generate-github-activity.mjs`. Tokens are used only for GitHub's
GraphQL request and are never written into SVGs.

The graph covers the current month and the four preceding calendar months.
Totals and active-day counts are calculated only from dates inside that range;
padding cells outside the range are dimmed. A personal token with `read:user`
can include private contribution counts; otherwise visibility follows the
token and GitHub profile settings. No streaks or rankings are guessed.
`assets/github-stats.svg` reports owned public repositories, stars on non-fork
projects, and GitHub's contribution-window commit, issue, pull-request, and
review counts. Repository queries are paginated so totals stay complete beyond
100 repositories. Both dynamic SVGs share the API refresh and theme.

The existing GitHub Actions schedule refreshes graphics hourly and commits
only changed assets. It never stages or rewrites the README.

## Stable résumé link

The Pages staging step runs `scripts/list-resumes.py`. That script writes the
dated file list and copies the newest PDF to `output/resume.pdf` in the staged
site. The README uses this stable alias, so résumé builds update portfolio
fallback links without touching the profile.

## Validation

Run `node --test tests/profile-activity.test.mjs` for date boundaries, totals,
escaping, and malformed API responses. Parse generated SVGs as XML and inspect
them at GitHub profile widths after any design changes.
