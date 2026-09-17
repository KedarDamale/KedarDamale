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

if [[ ! -f "$compiled_pdf" ]]; then
  echo "Compiled PDF not found: $compiled_pdf" >&2
  exit 1
fi

if [[ ! "$version" =~ ^[0-9]{8}$ ]]; then
  echo "Date must use YYYYMMDD format." >&2
  exit 1
fi

resume_name="resume-${version}.pdf"
cp "$compiled_pdf" "$portfolio_dir/$resume_name"

echo "Published portfolio/$resume_name"
