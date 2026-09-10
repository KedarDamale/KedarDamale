#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <compiled-pdf> <version>" >&2
  exit 1
fi

compiled_pdf="$1"
version="$2"
project_dir="$(cd "$(dirname "$0")/.." && pwd)"
portfolio_dir="$project_dir/portfolio"
portfolio_index="$portfolio_dir/index.html"

if [[ ! -f "$compiled_pdf" ]]; then
  echo "Compiled PDF not found: $compiled_pdf" >&2
  exit 1
fi

if [[ ! "$version" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "Version may contain only letters, numbers, dots, underscores, and hyphens." >&2
  exit 1
fi

resume_name="resume-${version}.pdf"
cp "$compiled_pdf" "$portfolio_dir/$resume_name"

# Keep every website download link pointed at the PDF produced by this build.
# Matching only the href also covers links whose download attribute is on the next line.
sed -E -i "s/href=\"resume(-[A-Za-z0-9._-]+)?\\.pdf\"/href=\"$resume_name\"/g" "$portfolio_index"

echo "Published portfolio/$resume_name"
