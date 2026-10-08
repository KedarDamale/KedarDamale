#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
preview_dir="$(mktemp -d)"
trap 'rm -rf -- "$preview_dir"' EXIT
cp -a "$project_dir/portfolio/." "$preview_dir/"
mkdir -p "$preview_dir/output"
cp "$project_dir"/output/resume-????????.pdf "$preview_dir/output/"
python3 "$project_dir/scripts/list-resumes.py" "$preview_dir/output"
python3 -m http.server 4173 --directory "$preview_dir"
