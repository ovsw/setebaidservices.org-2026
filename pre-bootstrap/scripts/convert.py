# /// script
# requires-python = ">=3.11"
# dependencies = ["markdownify>=0.13", "beautifulsoup4>=4.12"]
# ///
"""Turn the ProcessWire JSON export into one clean Markdown page per public page.

Output: build/pages.json (one record per page, in site order) and build/pages/*.md.
Images are dropped. Embedded forms, maps and videos become one-line placeholders.
"""

import json
import re
from pathlib import Path

from bs4 import BeautifulSoup
from markdownify import markdownify

ROOT = Path(__file__).resolve().parent.parent
# Full tree export (Home, recursive, hidden + unpublished included; Trash excluded).
SOURCE = ROOT / "source" / "processwire-export-full.json"
OUT = ROOT / "build"
SITE = "https://setebaidservices.org"

PAGE_TEMPLATES = {
    "home-page", "inner-page", "under_construction", "news-index", "news",
    "fulscreen-gallery", "basic-page-duplicate",
}
HIDDEN = 1024
UNPUBLISHED = 2048

# Written from the page content for pages with no SEO description in the CMS.
WRITTEN_DESCRIPTIONS = {
    "/a-typical-day-at-camp/": "Hour-by-hour schedule of a typical camp day, from wake-up and glucose checks to lights out.",
    "/events/": "Upcoming fundraising events that support Camp Setebaid and the Harrisburg Diabetic Youth Camp.",
    "/interactive-map/": "Placeholder for an interactive camp map; the page is under construction.",
    "/alumni/": "Who counts as Setebaid alumni, the past camps, and how alumni can stay in touch or return as staff.",
    "/alumni/alumni-info/": "Form for alumni to update their contact details.",
    "/alumni/photo-gallery/": "Intro to the alumni photo gallery, organised by year.",
    "/campers/camp-setebaid/what-to-bring-to-camp/": "Packing list for Camp Setebaid: what to bring, diabetes supplies to send, and what not to bring.",
    "/campers/campership-fund/": "How the Campership Fund helps families pay camp fees, and other ways to raise money for camp.",
    "/campers/financial-assistance-setebaid-campership-fund/": "How the Campership Fund helps families pay camp fees, and other ways to raise money for camp.",
    "/campers/harrisburg-diabetic-youth-camp/typical-day/": "Hour-by-hour schedule of a typical camp day, from wake-up and glucose checks to lights out.",
    "/campers/harrisburg-diabetic-youth-camp/what-to-bring-to-camp/": "Packing list for HDYC: what to bring, diabetes supplies to send, and what not to bring.",
    "/campers/register-now/": "Dates for the 2027 programs and the link to camp registration.",
    "/campers/request-info/": "Form to request more information about the camps.",
    "/contact-us/": "Office email, phone, fax and mailing addresses, plus the camp addresses for camper mail.",
    "/contact-us/request-info/": "Form to request more information about the camps.",
    "/donors/camperships/": "Donate to fund a camp scholarship (campership) for a child with Type 1 diabetes.",
    "/donors/medical-staff-training-at-camp/": "History of the medical training programme at camp and a request to fund it.",
    "/news/": "Section landing page with no content of its own.",
    "/news/news/": "Short intro for camp news and upcoming events.",
    "/volunteer-camp-staff/": "Why volunteer at camp: what volunteers give and the skills and contacts they gain.",
    "/volunteer-camp-staff/available-positions/": "List of volunteer camp roles (admin, counselling, health care) with duty descriptions and how to apply.",
    "/volunteer-camp-staff/staff-interest-form/": "Form for people who want to volunteer as camp staff.",
    # Unpublished pages
    "/donors/donors/": "Donor recognition list by giving level (Platinum to Nickel), current to November 2017.",
    "/donors/golf-tournament/": "Details and sponsorship levels for the August 2020 charity golf tournament.",
    "/donors/virtual-camp-support-for-2020/": "Appeal to fund the 2020 virtual camps, told through a camper's story.",
    "/news/news/2023-camp-registration-is-open/": "Announcement that 2023 camp registration is open, with session dates and links.",
    "/news/news/camp-registration-is-open/": "Announcement that camp registration is open, with office contact details.",
    "/news/news/events-planned-for-novembers-diabetes-awareness-month/": "List of fundraising events planned for Diabetes Awareness Month, November 2024.",
    "/news/news/setebaid-campetition/": "Announcement of the Setebaid Campetition fundraiser.",
    "/news/news/create-camp-smiles-with-amazonsmile/": "How to support camp through AmazonSmile.",
    "/news/news/support-setebaid-services-by-participating-in-igive.com/": "How to support Setebaid by shopping through iGive.com.",
    "/parents/camper-email-photo-gallery/": "How parents send bunk notes to campers and view the online camp photo gallery.",
    "/parents/request-info/": "Form to request more information about the camps.",
    "/volunteer-camp-staff/about-staff/": "What Setebaid camps are and what volunteer staff do there.",
    "/campers/virtual-camps/": "Why camps went virtual in 2020, with the virtual camp schedule and how to join.",
    "/campers/2021-spring-virtual-camps/": "Schedule and set-up details for the spring 2021 virtual camps.",
}
PLACEHOLDER_BODIES = {"", "Coming Soon!"}  # page bodies that carry no real content


def embed_placeholder(tag) -> str:
    src = tag.get("src") or ""
    link = tag.find("a", href=True) if hasattr(tag, "find") else None
    if "wufoo" in str(tag):
        href = link["href"] if link else src
        return f"*[Embedded Wufoo form: {href}]*"
    if "google.com/maps" in src:
        return "*[Embedded Google map]*"
    if "forms.office.com" in src:
        return f"*[Embedded Microsoft form: {src.split('?')[0]}]*"
    if "youtube" in src or "vimeo" in src:
        return f"*[Embedded video: {src}]*"
    return f"*[Embedded content: {src}]*" if src else ""


def html_to_md(html: str) -> str:
    if not isinstance(html, str) or not html.strip():
        return ""
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["img", "script", "style", "noscript"]):
        tag.decompose()
    for tag in soup.find_all("div", id=re.compile(r"^wuf-adv")):
        tag.decompose()
    # Placeholders go in as tokens so markdownify does not escape their asterisks.
    placeholders = []
    for tag in soup.find_all(["iframe", "embed", "object"]) + soup.find_all("div", id=re.compile(r"^wufoo-")):
        placeholders.append(embed_placeholder(tag))
        tag.replace_with(soup.new_string(f"EMBEDTOKEN{len(placeholders) - 1}X"))
    for a in soup.find_all("a", href=True):
        if a["href"].startswith("/"):
            a["href"] = SITE + a["href"]
    md = markdownify(str(soup), heading_style="ATX", bullets="-", strip=["span", "font", "sup", "u"])
    for i, text in enumerate(placeholders):
        md = md.replace(f"EMBEDTOKEN{i}X", text)
    md = md.replace("\xa0", " ")
    # Old layouts used runs of spaces for alignment; in Markdown, 4+ leading spaces become code.
    md = re.sub(r"^[ \t]+(?![-*+] |\d+\. )", "", md, flags=re.M)
    md = re.sub(r"(?<=\S)[ \t]{2,}", " ", md)
    md = re.sub(r"\*{4,}", "**", md)
    md = re.sub(r"\*\* \*\*", " ", md)  # adjacent bold runs on one line
    md = re.sub(r"\]\(([^)\s]+)\): <\1>", r"](\1)", md)  # URL repeated after its own link
    md = re.sub(r"^(#+ )\*\*(.*?)\*\*[ \t]*$", r"\1\2", md, flags=re.M)
    md = re.sub(r"[ \t]+\n", "\n", md)
    md = re.sub(r"^#+\s*$", "", md, flags=re.M)  # headings left empty after stripping
    md = re.sub(r"\n{3,}", "\n\n", md)
    # Page H1 is the title; demote content headings so the doc keeps one H1.
    md = re.sub(r"^# ", "## ", md, flags=re.M)
    return md.strip()


def plain(md: str) -> str:
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", md)
    text = re.sub(r"[#*_>`<|]|-{3,}", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def first_sentence(md: str, limit: int = 200) -> str:
    text = plain(md)
    m = re.match(r"(.{40,}?[.!?])(\s|$)", text)
    s = m.group(1) if m else text
    return s if len(s) <= limit else s[: limit - 1].rsplit(" ", 1)[0] + "…"


def main() -> None:
    export = json.loads(SOURCE.read_text())
    records = export["pages"]

    accordions: dict[int, list[dict]] = {}
    for p in records:
        m = re.fullmatch(r"/manager/repeaters/for-field-98/for-page-(\d+)/[^/]+/", p["path"])
        if not m or p["settings"]["status"] & UNPUBLISHED:
            continue
        if (p["data"].get("collapsable_header") or "").strip():
            accordions.setdefault(int(m.group(1)), []).append(p)

    pages = [p for p in records if p["template"] in PAGE_TEMPLATES]
    pages.sort(key=lambda p: p["path"])
    paths = {p["path"] for p in pages}
    states = {
        p["path"]: "Unpublished" if p["settings"]["status"] & UNPUBLISHED else "Published"
        for p in pages
    }

    out_pages = OUT / "pages"
    out_pages.mkdir(parents=True, exist_ok=True)
    rows = []
    for p in pages:
        d, pid, path = p["data"], p["settings"]["id"], p["path"]
        status = p["settings"]["status"]
        state = "Unpublished" if status & UNPUBLISHED else "Hidden" if status & HIDDEN else "Published"
        head = [f"# {d.get('title', '').strip()}"]
        if (d.get("headline") or "").strip():
            head.append(f"*{d['headline'].strip()}*")
        head.append(f"Old URL: {SITE}{path}")
        if state != "Published":
            head.append(f"**CMS state: {state}** (not visible on the live site)")
        if d.get("date"):
            head.append(f"Posted: {d['date'][:10]}")
        parts = []

        if p["template"] == "home-page":
            parts.append(html_to_md(d.get("homepage_rich_text")))
            if d.get("main_video"):
                parts.append(f"*[Embedded video: {d['main_video']}]*")
            items = []
            for r in records:
                if r["template"] == "repeater_donate_dropdown" and not r["settings"]["status"] & UNPUBLISHED:
                    items.append(f"- [{r['data']['donate_menu_item']}]({r['data']['donate_link']})")
            if items:
                parts.append("## Donate menu\n\n" + "\n".join(items))
            contact = [d.get(k, "") for k in ("org_name", "street_address", "locality", "region_name", "postal_code", "country", "phone_no", "contact_email")]
            parts.append("## Contact details (site-wide)\n\n" + "\n".join(f"- {c}" for c in contact if c))
            if d.get("register_now_link"):
                parts.append(f"Register now link: {d['register_now_link']}")
        else:
            for field in ("body", "retrievable_content"):
                parts.append(html_to_md(d.get(field)))
            items = sorted(accordions.get(pid, []), key=lambda r: r["settings"]["sort"])
            for r in items:
                text = r["data"].get("collapsable_text") or ""
                body = html_to_md(text) if "<" in text else text.strip()
                parts.append(f"### {r['data']['collapsable_header'].strip()}\n\n{body}")
            parts.append(html_to_md(d.get("special_content")))
            parts.append(html_to_md(d.get("bottom_text")))
            if p["template"] == "fulscreen-gallery":
                albums = [
                    r for r in records
                    if r["template"] == "repeater_fs_albums3" and f"/for-page-{pid}/" in r["path"]
                ]
                parts.append("## Albums\n\n" + "\n".join(
                    f"- [{a['data']['title']}]({a['data']['flickr_url']})" for a in albums
                ))

        content = "\n\n".join(x for x in head + parts if x).strip() + "\n"
        seo = (d.get("seo_description") or "").strip()
        body_only = "\n\n".join(x for x in parts if x)
        parent = path.rstrip("/").rsplit("/", 1)[0] + "/" if path != "/" else ""
        notes = []
        if parent and parent not in paths:
            notes.append(f"Parent {parent} does not exist")
        elif state == "Published" and parent and states[parent] != "Published":
            notes.append(f"Published, but its parent {parent} is unpublished")
        if p["template"] == "under_construction":
            notes.append("CMS template is 'under construction'")

        placeholder = ""
        if plain(body_only) in PLACEHOLDER_BODIES and p["template"] != "home-page":
            placeholder = "Placeholder page: 'Coming Soon!' only." if "Coming Soon" in body_only else "Empty page: no content in the CMS."
            notes.append(placeholder.split(":")[0])

        slug = "home" if path == "/" else path.strip("/").replace("/", "__")
        (out_pages / f"{slug}.md").write_text(content)
        rows.append({
            "id": pid,
            "slug": slug,
            "title": d.get("title", "").strip(),
            "path": path,
            "parent": parent,
            "depth": path.strip("/").count("/") + (1 if path != "/" else 0),
            "template": p["template"],
            "state": state,
            "date": (d.get("date") or "")[:10],
            "description": placeholder or seo or WRITTEN_DESCRIPTIONS.get(path) or first_sentence(body_only),
            "description_source": "written" if placeholder or (not seo and path in WRITTEN_DESCRIPTIONS) else "seo" if seo else "first sentence",
            "body": body_only.strip(),
            "notes": "; ".join(notes),
            "chars": len(content),
            "content": content,
        })

    first_with_body: dict[str, str] = {}
    # Published pages first, so a duplicate points at the live copy.
    for row in sorted(rows, key=lambda r: (r["state"] != "Published", r["path"])):
        body = row.pop("body")
        if plain(body) in PLACEHOLDER_BODIES:
            continue
        if body in first_with_body:
            note = f"Same content as {first_with_body[body]}"
            row["notes"] = f"{row['notes']}; {note}" if row["notes"] else note
        else:
            first_with_body[body] = row["path"]

    (OUT / "pages.json").write_text(json.dumps(rows, indent=2, ensure_ascii=False))
    print(f"{len(rows)} pages -> {OUT}")


if __name__ == "__main__":
    main()
