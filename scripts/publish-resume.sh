#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <compiled-pdf> <version>" >&2
  exit 1
fi

compiled_pdf="$1"
version="$2"
project_dir="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! -f "$compiled_pdf" ]]; then
  echo "Compiled PDF not found: $compiled_pdf" >&2
  exit 1
fi

if [[ ! "$version" =~ ^[0-9]{8}$ ]]; then
  echo "Date must use YYYYMMDD format." >&2
  exit 1
fi

resume_name="resume-${version}.pdf"
mkdir -p "$project_dir/output"
# Clear all previous output, including hidden files and nested directories.
find "$project_dir/output" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
mv "$compiled_pdf" "$project_dir/output/$resume_name"

python3 - "$project_dir" "$resume_name" <<'PY'
import re
import sys
from pathlib import Path

root = Path(sys.argv[1])
name = sys.argv[2]
# Keep site and profile links pointed at the single published artifact.
for relative in ("README.md", "portfolio/components/site-header.html", "portfolio/components/site-footer.html"):
    path = root / relative
    text = path.read_text()
    if relative == "README.md":
        text = re.sub(r"https://kedardamale.github.io/KedarDamale/(?:main\.pdf|output/resume-\d{8}\.pdf)",
                      f"https://kedardamale.github.io/KedarDamale/output/{name}", text)
    else:
        text = re.sub(r'href="(?:main\.pdf|output/resume-\d{8}\.pdf)"',
                      f'href="output/{name}"', text)
    if text != path.read_text():
        path.write_text(text)

# Remove superseded resume artifacts only after a successful build.
legacy = [root / "resume/main.pdf", root / "portfolio/main.pdf"]
legacy += list((root / "portfolio").glob("resume-*.pdf"))
for path in legacy:
    if path != root / "output" / name:
        path.unlink(missing_ok=True)
PY

echo "Resume: output/$resume_name"
