"""Write dated resume filenames and a stable download alias for the static site."""

import json
import re
import shutil
import sys
from pathlib import Path

output = Path(sys.argv[1])
names = sorted(
    path.name
    for path in output.iterdir()
    if path.is_file() and re.fullmatch(r"resume-\d{8}\.pdf", path.name)
)
(output / "resumes.json").write_text(json.dumps(names) + "\n")
if names:
    shutil.copyfile(output / names[-1], output / "resume.pdf")
