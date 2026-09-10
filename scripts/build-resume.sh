#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
resume_version="${RESUME_VERSION:-$(date -u +%Y%m%dT%H%M%SZ)}"
cd "$project_dir/resume"
pdflatex -interaction=nonstopmode -halt-on-error main.tex
pdflatex -interaction=nonstopmode -halt-on-error main.tex
bash "$project_dir/scripts/publish-resume.sh" "$project_dir/resume/main.pdf" "$resume_version"
