"""Write Canvas Composer SVG batches for page docs that are not on the Miro board yet.

Input: build/pages.json and build/miro/ids.json (docs already on the board).
Output: build/miro/new-docs-<n>.svg, each under the 200,000-char tool limit.

Layout: one row per site section. Published pages come first; unpublished pages follow
after a gap, under an "Unpublished" label. Miro shows every doc as a 784 x 1105 card.
"""

import json
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
PAGES = json.loads((ROOT / "build" / "pages.json").read_text())
IDS = json.loads((ROOT / "build" / "miro" / "ids.json").read_text())
OUT = ROOT / "build" / "miro"

DOC_W, DOC_H, STEP_X, GROUP_GAP = 784, 1105, 944, 320
ROW_STEP = 100 + DOC_H + 320
MAX_SVG = 60_000

# (row heading, path prefix); Home takes every path no other prefix claims.
SECTIONS = [
    ("Home and top-level pages", None),
    ("About", "/about/"),
    ("Campers", "/campers/"),
    ("Volunteer / Camp Staff", "/volunteer-camp-staff/"),
    ("Alumni", "/alumni/"),
    ("Contact Us", "/contact-us/"),
    ("News", "/news/"),
    ("Donors (not linked on the live site)", "/donors/"),
    ("Parents (unpublished section)", "/parents/"),
]
ROW_Y = {title: 3000 + i * ROW_STEP for i, (title, _) in enumerate(SECTIONS)}


def section_of(path: str) -> str:
    for title, prefix in SECTIONS[1:]:
        if path.startswith(prefix):
            return title
    return SECTIONS[0][0]


def main() -> None:
    parts = []
    for title, _ in SECTIONS:
        y = ROW_Y[title]
        pages = [p for p in PAGES if section_of(p["path"]) == title]
        published = [p for p in pages if p["state"] == "Published"]
        unpublished = [p for p in pages if p["state"] != "Published"]
        if title not in IDS["headings"]:
            parts.append(
                f'<text id="h-{len(parts)}" x="0" y="{y}" font-family="Noto Sans" font-size="67" '
                f'font-weight="bold" fill="#1a1a1a">{escape(title)}</text>'
            )
        slots = [(i * STEP_X, p) for i, p in enumerate(published)]
        if unpublished:
            x0 = len(published) * STEP_X + (GROUP_GAP if published else 0)
            label_key = f"unpublished:{title}"
            if label_key not in IDS.get("labels", {}) and published:
                parts.append(
                    f'<text id="u-{len(parts)}" x="{x0}" y="{y + 20}" font-family="Noto Sans" font-size="33" '
                    f'font-weight="bold" fill="#bd0a0a">Unpublished in the CMS</text>'
                )
            slots += [(x0 + i * STEP_X, p) for i, p in enumerate(unpublished)]
        for x, p in slots:
            if p["slug"] in IDS["docs"]:
                continue
            parts.append(
                f'<foreignObject id="doc-{p["slug"]}" x="{x}" y="{y + 100}" width="{DOC_W}" '
                f'height="{DOC_H}" data-type="doc">\n{escape(p["content"])}</foreignObject>'
            )

    batches, current = [], []
    for part in parts:
        if current and sum(map(len, current)) + len(part) > MAX_SVG:
            batches.append(current)
            current = []
        current.append(part)
    if current:
        batches.append(current)
    for old in OUT.glob("new-docs-*.svg"):
        old.unlink()
    for n, batch in enumerate(batches, 1):
        svg = "<svg>\n" + "\n".join(batch) + "\n</svg>\n"
        (OUT / f"new-docs-{n}.svg").write_text(svg)
        print(f"new-docs-{n}.svg {len(svg)} chars, {sum('data-type=\"doc\"' in b for b in batch)} docs")


if __name__ == "__main__":
    main()
