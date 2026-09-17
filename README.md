# Kedar Damale

<p align="left">
  <a href="https://github.com/KedarDamale"><img src="https://img.shields.io/badge/GitHub-KedarDamale-181717?style=flat-square&logo=github" alt="GitHub"></a>
  <a href="https://www.linkedin.com/in/kedar-damale-57252a324/"><img src="https://img.shields.io/badge/LinkedIn-Kedar%20Damale-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="https://www.kaggle.com/kedarpdamale"><img src="https://img.shields.io/badge/Kaggle-kedarpdamale-20BEFF?style=flat-square&logo=kaggle&logoColor=white" alt="Kaggle"></a>
  <a href="https://github.com/KedarDamale/KedarDamale/actions/workflows/deploy-portfolio.yml"><img src="https://github.com/KedarDamale/KedarDamale/actions/workflows/deploy-portfolio.yml/badge.svg" alt="Portfolio build and deployment"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-344467?style=flat-square" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/Focus-Machine%20Learning-344467?style=flat-square" alt="Machine Learning">
  <img src="https://img.shields.io/badge/Open%20to-Opportunities-2E7D32?style=flat-square" alt="Open to opportunities">
</p>

Machine Learning Engineer building practical AI systems: from operational-data automation to agentic analytics, IoT intelligence, and computer vision.

## GitHub activity — last five months

<a href="https://github.com/KedarDamale?tab=overview">
  <img src="./assets/github-activity.svg" alt="Kedar Damale's GitHub contribution activity for the last five months" width="100%" />
</a>

This graph is regenerated daily and always covers the current month plus the previous four months. It includes private contribution counts when the `PROFILE_ACTIVITY_TOKEN` repository secret is configured with the `read:user` scope; repository names and other private details are never displayed.

## What I work with

`Python` `SQL` `FastAPI` `React` `PostgreSQL` `scikit-learn` `Pandas` `Generative AI` `Computer Vision` `IoT`

## Highlights

- Built production-minded AI/ML applications across structured-data automation, agentic workflows, and full-stack delivery.
- Automated PR vs GSTR-2B reconciliation for 10,000+ invoices with fuzzy matching, reducing a 5-6 day manual cycle by more than 99.9%.
- Contributed to GenAI workflows for structured pharmaceutical sales analysis, including human-in-the-loop agent-state management.
- Led applied work in IoT geospatial analytics and YOLOv8-based computer vision.

## Featured projects

| Project | Focus | Result |
| --- | --- | --- |
| [Cattle Monitoring](https://github.com/KedarDamale/ioe-project) | ESP32, FastAPI, React, DBSCAN | GPS/RSSI monitoring and grazing-zone analytics |
| [Chessablanka](https://github.com/KedarDamale/Chessablanka) | YOLOv8, Roboflow, Computer Vision | 98.57% detection accuracy on 500+ test images |

## Explore

- [Portfolio](./portfolio/index.html)
- [Resume source](./resume/main.tex)
- [GitHub](https://github.com/KedarDamale)
- [LinkedIn](https://www.linkedin.com/in/kedar-damale-57252a324/)
- [Kaggle](https://www.kaggle.com/kedarpdamale)

## Repository map

```text
resume/       Modular LaTeX resume source and job-focused variants
portfolio/    Dependency-free portfolio for GitHub Pages
.github/      Portfolio deployment workflow
scripts/      Small local build helpers
```

## Resume versions

The resume is modular: shared content lives in `resume/content/`, while `resume/variants/` provides role-focused entry points. Generate and publish it manually with `make resume` (or `./scripts/build-resume.sh`), or run `bash scripts/publish-resume.sh resume/main.pdf YYYYMMDD` after compiling. Published files use the exact name `portfolio/resume-YYYYMMDD.pdf`. Update both portfolio component links manually to that filename before committing. GitHub Actions only deploys the static portfolio; it does not compile, publish, or rewrite resume links.
