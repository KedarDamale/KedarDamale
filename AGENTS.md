# Profile repository instructions

This is the special `KedarDamale/KedarDamale` repository. Its root `README.md`
appears on the owner's GitHub profile; it is public profile content, not a
general repository manual.

## Protected profile content

- Do not edit, replace, append to, reformat, or regenerate `README.md` unless
  the user explicitly requests a README/profile-content change in the current
  task. Routine implementation, cleanup, dependency, résumé, and documentation
  tasks do not authorize README edits.
- Treat editorial text in `scripts/generate-profile-assets.mjs` and the visuals
  under `assets/profile/` as part of that profile. Change their content or design
  only when the user explicitly requests a profile change. Deterministic
  regeneration of unchanged source is allowed.
- Put setup instructions and developer documentation in `docs/`. Do not add
  build logs, local tooling instructions, or implementation notes to the profile.
- Do not add unverified skills, employment, achievements, statistics, or project
  claims. Use evidence already supplied by the user or present in this repository.
- Keep profile links stable. Résumé publishing and scheduled workflows must not
  rewrite the README. The Pages build provides `output/resume.pdf` as an alias.

## Generated graphics

- `node scripts/generate-profile-assets.mjs` regenerates static profile SVGs
  offline using pinned local icons and the shared theme.
- `node scripts/generate-github-activity.mjs` refreshes actual GitHub contribution
  data and profile statistics. Updating `assets/github-activity.svg` and
  `assets/github-stats.svg` is allowed without a profile prose rewrite.
- Keep SVGs standalone: no scripts, external fonts/images, or `foreignObject`.
  Preserve accessible titles/descriptions and third-party license notices.
- Validate generated SVGs and visually inspect a render after design changes.

These are agent instructions, not a filesystem lock. Explicit user requests
to change the protected profile take precedence.
