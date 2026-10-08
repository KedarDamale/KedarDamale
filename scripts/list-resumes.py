"""Write the available dated resume filenames for the static site's JavaScript."""

import json
import re
import sys
from pathlib import Path

output = Path(sys.argv[1])
names = sorted(
    path.name
    for path in output.iterdir()
    if path.is_file() and re.fullmatch(r"resume-\d{8}\.pdf", path.name)
)
(output / "resumes.json").write_text(json.dumps(names) + "\n")
