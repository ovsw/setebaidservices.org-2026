"""Refresh build/miro/table-rows.json from a saved Miro table read-back (canvas result JSON).

Usage: python3 scripts/read_table_rows.py <result.json>
"""

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
data = json.loads(Path(sys.argv[1]).read_text())
svg = data.get("result_svg") or data["svg"]
head = re.findall(r"<th[^>]*>([^<]*)</th>", svg)
col = {name: i for i, name in enumerate(head)}
rows, with_parent = {}, []
for rec, body in re.findall(r'<tr data-record-id="([^"]+)">(.*?)</tr>', svg, re.S):
    cells = [html.unescape(c) for c in re.findall(r"<td>(.*?)</td>|<td />", body.replace("<td />", "<td></td>"))]
    path = cells[col["Old path"]]
    rows[path] = rec
    if cells[col["Parent"]].strip():
        with_parent.append(path)
rows["__parents__"] = sorted(with_parent)
(ROOT / "build" / "miro" / "table-rows.json").write_text(json.dumps(rows, indent=2))
print(f"rows: {len(rows) - 1}, with parent: {len(with_parent)}")
