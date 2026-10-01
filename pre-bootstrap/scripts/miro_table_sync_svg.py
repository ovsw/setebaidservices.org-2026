"""Write Canvas Composer SVG that brings the Miro sitemap table in line with build/pages.json.

Outputs (in build/miro/):
- table-new-rows.svg: rows for pages that have no table row yet (matched on "Old path").
- table-existing.svg: CMS state + Notes for rows that already exist.
- table-parents.svg: Miro Parent links, only for rows whose Parent is still empty
  (links set by hand in Miro are never overwritten).

Needs build/miro/table-rows.json: {old path: record id, ...} plus "__parents__": [paths with a
Parent already set]. Refresh it from a table read before running.
"""

import json
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
PAGES = json.loads((ROOT / "build" / "pages.json").read_text())
IDS = json.loads((ROOT / "build" / "miro" / "ids.json").read_text())
ROWS = json.loads((ROOT / "build" / "miro" / "table-rows.json").read_text())
OUT = ROOT / "build" / "miro"
SITE = "https://setebaidservices.org"
TABLE = IDS["table"]
F = IDS["table_fields"]

SECTIONS = [
    ("About", "/about/"), ("Campers", "/campers/"), ("Volunteer", "/volunteer-camp-staff/"),
    ("Alumni", "/alumni/"), ("Contact", "/contact-us/"), ("News", "/news/"),
    ("Donors", "/donors/"), ("Parents", "/parents/"),
]


def section(path: str) -> str:
    return next((label for label, prefix in SECTIONS if path.startswith(prefix)), "Home")


def th(name: str) -> str:
    return f'<th data-field-id="{F[name]}">{escape(name)}</th>'


def table(head: list[str], rows: list[str]) -> str:
    return (
        f'<svg>\n<foreignObject data-type="table" data-miro-id="{TABLE}"><table><thead><tr>'
        + "".join(th(h) for h in head) + "</tr></thead><tbody>\n" + "\n".join(rows)
        + "\n</tbody></table></foreignObject>\n</svg>\n"
    )


def tr(cells: list[str], record: str | None = None) -> str:
    attr = f' data-record-id="{record}"' if record else ""
    return f"<tr{attr}>" + "".join(f"<td>{escape(c)}</td>" for c in cells) + "</tr>"


def main() -> None:
    head = ["Title", "Old path", "Old parent path", "Level", "Section", "Description",
            "Content", "Old page", "Status", "Notes", "CMS state"]
    new_rows = []
    for p in PAGES:
        if p["path"] in ROWS:
            continue
        doc = f'{IDS["board"]}?moveToWidget={IDS["docs"][p["slug"]]}'
        new_rows.append(tr([
            p["title"], p["path"], p["parent"], str(p["depth"]), section(p["path"]),
            p["description"], f"[Open document]({doc})", f"[{p['path']}]({SITE}{p['path']})",
            "To review", p["notes"], p["state"],
        ]))
    (OUT / "table-new-rows.svg").write_text(table(head, new_rows))

    existing = [
        tr([p["title"], p["notes"], p["state"]], ROWS[p["path"]])
        for p in PAGES if p["path"] in ROWS
    ]
    (OUT / "table-existing.svg").write_text(table(["Title", "Notes", "CMS state"], existing))

    with_parent = set(ROWS.get("__parents__", []))
    links = [
        tr([p["title"], json.dumps([{"value": ROWS[p["parent"]]}])], ROWS[p["path"]])
        for p in PAGES
        if p["path"] in ROWS and p["parent"] in ROWS and p["path"] not in with_parent
    ]
    (OUT / "table-parents.svg").write_text(table(["Title", "Parent"], links))
    print(f"new rows: {len(new_rows)}, existing: {len(existing)}, parent links to set: {len(links)}")


if __name__ == "__main__":
    main()
