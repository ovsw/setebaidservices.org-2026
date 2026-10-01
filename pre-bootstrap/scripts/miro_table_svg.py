"""Write the Canvas Composer SVG for the sitemap table: one row per old page, linked to its Miro doc.

Input: build/pages.json and build/miro/ids.json. Output: build/miro/table.svg.
"""

import json
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
PAGES = json.loads((ROOT / "build" / "pages.json").read_text())
IDS = json.loads((ROOT / "build" / "miro" / "ids.json").read_text())
SITE = "https://setebaidservices.org"

SECTIONS = [  # (label, path prefix, colour)
    ("Home", None, "#c6dcff"),
    ("About", "/about/", "#c6dcff"),
    ("Campers", "/campers/", "#c6dcff"),
    ("Volunteer", "/volunteer-camp-staff/", "#c6dcff"),
    ("Alumni", "/alumni/", "#c6dcff"),
    ("Contact", "/contact-us/", "#c6dcff"),
    ("News", "/news/", "#c6dcff"),
    ("Donors", "/donors/", "#ffc6c6"),
]
STATUS = "To review:#e7e7e7, Keep:#adf0c7, Rewrite:#fff6b6, Merge:#dedaff, Remove:#ffc6c6"


def section(path: str) -> str:
    for label, prefix, _ in SECTIONS[1:]:
        if path.startswith(prefix):
            return label
    return "Home"


def main() -> None:
    order = {label: i for i, (label, _, _) in enumerate(SECTIONS)}
    rows = sorted(PAGES, key=lambda p: (order[section(p["path"])], p["path"]))
    head = [
        '<th data-role="title">Title</th>',
        "<th>Old path</th>",
        "<th>Parent</th>",
        '<th data-type="number">Level</th>',
        '<th data-type="select" data-options="' + ", ".join(f"{l}:{c}" for l, _, c in SECTIONS) + '">Section</th>',
        '<th data-role="description">Description</th>',
        '<th data-type="link">Content</th>',
        '<th data-type="link">Old page</th>',
        f'<th data-type="select" data-options="{STATUS}">Status</th>',
        "<th>Notes</th>",
    ]
    body = []
    for p in rows:
        doc = f'{IDS["board"]}?moveToWidget={IDS["docs"][p["slug"]]}'
        cells = [
            p["title"],
            p["path"],
            p["parent"],
            str(p["depth"]),
            section(p["path"]),
            p["description"],
            f"[Open document]({doc})",
            f"[{p['path']}]({SITE}{p['path']})",
            "To review",
            p["notes"],
        ]
        body.append("<tr>" + "".join(f"<td>{escape(c)}</td>" for c in cells) + "</tr>")
    svg = (
        '<svg>\n<foreignObject id="sitemap" x="0" y="0" width="4000" height="2000" data-type="table" '
        'data-title="Old site pages (setebaidservices.org, Sept 2026)"><table><thead><tr>'
        + "".join(head) + "</tr></thead><tbody>\n" + "\n".join(body) + "\n</tbody></table></foreignObject>\n</svg>\n"
    )
    (ROOT / "build" / "miro" / "table.svg").write_text(svg)
    print(svg)


if __name__ == "__main__":
    main()
