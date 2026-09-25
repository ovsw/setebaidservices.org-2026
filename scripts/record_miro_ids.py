"""Record Miro ids from a saved canvas_create_from_svg result into build/miro/ids.json.

Usage: python3 scripts/record_miro_ids.py <result.json> [...]
Maps doc-<slug> -> docs, h-* headings and u-* "Unpublished" labels by their text.
Prints any failed items and any auto-placement shift so the layout can be checked.
"""

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from miro_docs_svg import ROW_Y  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
IDS_PATH = ROOT / "build" / "miro" / "ids.json"


def main() -> None:
    ids = json.loads(IDS_PATH.read_text())
    ids.setdefault("labels", {})
    for path in sys.argv[1:]:
        result = json.loads(Path(path).read_text())
        print(path, "success:", result["success"], "|", result["message"][:200])
        if result.get("failed_items"):
            print("  FAILED:", result["failed_items"])
        svg = result["result_svg"]
        for shift in re.findall(r'<g transform="translate\(([^)]*)\)"', svg):
            print("  AUTO-PLACED SHIFT:", shift)
        for m in re.finditer(r'<foreignObject id="doc-([^"]+)"[^>]*data-miro-id="(\d+)"', svg):
            ids["docs"][m.group(1)] = m.group(2)
        for m in re.finditer(r'<text id="([hu])-\d+"[^>]*? y="(\d+)"[^>]*data-miro-id="(\d+)"[^>]*>([^<]*)</text>', svg):
            kind, y, miro_id, text = m.groups()
            if kind == "h":
                ids["headings"][text] = miro_id
            else:
                row = next(t for t, row_y in ROW_Y.items() if row_y + 20 == int(y))
                ids["labels"][f"unpublished:{row}"] = miro_id
    IDS_PATH.write_text(json.dumps(ids, indent=2))
    print("docs recorded:", len(ids["docs"]), "labels:", len(ids["labels"]), "headings:", len(ids["headings"]))


if __name__ == "__main__":
    main()
