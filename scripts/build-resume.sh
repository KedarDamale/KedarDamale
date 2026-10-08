#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
resume_dir="${RESUME_DIR:-resume}"
resume_version="${RESUME_VERSION:-$(git -C "$project_dir" log -1 --format=%cs -- "$resume_dir" | tr -d '-')}"
if [[ ! "$resume_version" =~ ^[0-9]{8}$ ]]; then
  echo "Resume version must be a Git date in YYYYMMDD format (or set RESUME_VERSION)." >&2
  exit 1
fi
build_dir="$(mktemp -d)"
trap 'rm -rf "$build_dir"' EXIT
cd "$project_dir/$resume_dir"
read -r -a latex_flags <<< "${LATEX_FLAGS:--interaction=nonstopmode -halt-on-error}"
for pass in 1 2; do
  "${LATEX:-lualatex}" "${latex_flags[@]}" -output-directory="$build_dir" -jobname="resume-$resume_version" main.tex
done
bash "$project_dir/scripts/publish-resume.sh" "$build_dir/resume-$resume_version.pdf" "$resume_version"
