#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../portfolio"
python3 -m http.server 4173
