#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
resume_version="${RESUME_VERSION:-$(date -u +%Y%m%d)}"
cd "$project_dir/resume"
lualatex -interaction=nonstopmode -halt-on-error main.tex
lualatex -interaction=nonstopmode -halt-on-error main.tex
bash "$project_dir/scripts/publish-resume.sh" "$project_dir/resume/main.pdf" "$resume_version"
