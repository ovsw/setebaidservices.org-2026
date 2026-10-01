# Page polish workflow

Shared process for `/page-polish` in Claude Code and `$page-polish` in
ChatGPT/Codex. It follows the drafting stage in `docs/agents/page-workflow.md`
and takes a page whose card sits in Polish: the copy is written and every
section is filled, but nobody has checked that each section is served by the
layout that fits it. One agent reviews the page as a senior web designer,
fixes what the existing Page Builder can fix, and reports the rest in chat.

## Scope and outcome

Content and layout choice only, inside the existing Page Builder. The agent
may move copy between sections, swap a section for a better one, swap photos,
trim and dedupe copy, reorder sections, and publish. It keeps the writer's
voice and the page's argument: no rewrite of what the page says, no new
claims, no removed `(camp to confirm)` markers. Schema, GROQ, frontend, and
generated types stay untouched; a new section is a proposal in chat.

The result is a fresh page draft that differs from the newly published
baseline only by the polish changes, matching supporting documents
published, a before-and-after set of section screenshots, a change comment
on the card, and a chat report with the section verdicts, the proposals,
and the links for Ovi's visual check. The card stays in Polish; Ovi's own
look at the screen is the verdict.

Ovi's standing instruction for this stage: publish the page's current draft
and every draft-only document it references. Claims, offer details, and
placeholder quotes are the client's to verify in their collaboration pass,
where they also learn Studio; realness is not the agent's concern here.

## Take the page

The input is a link to the record that holds the page's current facts.
Today that is the page's Basecamp card; Ovi pastes its URL from the Kanban
board. With no link, take the top unclaimed card in Polish.

Resolve the link to the page before anything else:

- **Basecamp card** (`app.basecamp.com/<account>/buckets/<project>/card_tables/cards/<id>`):
  read it with `basecamp cards show <url> --json`. The card body carries
  `Slug: /<slug>`, `Sanity id: <pageId>`, and the Studio preview link; the
  brief, decisions, layout proposals, and checklist follow. Take the slug
  and page id from the body. If either is missing, read the preview link's
  `page/<pageId>` and `preview=...%2F<slug>` parts, and record on the card
  what you found.
- **Another system's link**: acceptable when its record holds the slug and
  the Sanity page id. Read it with the MCP or skill that reaches that
  system, and say in the report which record and fields you used.
- **A bare slug or page id**: accepted as a fallback; then find the card by
  listing Polish and matching the slug, because the card is still where the
  brief and the change comment live.

Confirm the resolved page exists in Sanity (`*[_type=="page" && slug.current==$slug]`
in the `raw` perspective) before claiming. Claim it with the protocol in "Taking a page so
nobody else works on it" in `docs/agents/page-workflow.md`, with the comment
`Taking this page for polish. Run: <id>. Page: /<slug>.` Leave the card in
Polish. Read the card body: the brief, the decisions, the layout proposals
the writer recorded, and the checklist. Read the draft as a reader with
`pnpm page:text <slug>` and as structure through Sanity MCP in the `raw`
perspective: every block's type, key, background, item counts, and image
references.

## Publish the baseline

1. Verify the MCP project and dataset against `studio/.env.local`. Create a
   timestamped raw export under `backups/` and run `gzip -t` on it. A failed
   export stops the run.
2. Publish, through MCP, every document the page references that exists only
   as a draft (page-owned FAQs, testimonials, team members, and shared drafts
   from other pages). Then publish the page draft itself.
3. From here on, every write creates or patches `drafts.<pageId>`, guarded by
   `ifRevisionId`. In the first patch, remove `_weak` from the page's
   references to the documents you published, so Studio stops showing
   "Reference strength mismatch".

Ovi compares the fresh draft with this published baseline in Studio, so the
baseline must be the page exactly as it was handed over.

## Look before judging

Start or reuse this worktree's servers with `pnpm dev:worktree` and run
`pnpm page:shots <slug>`. It writes one PNG per section at 1440 and 390 wide
to `/tmp/cac-page-shots/<slug>/` and prints each section's height. Read every
image. Section heights and the page height are part of the evidence: a
section that is three times taller than its neighbours has to earn it.

## Judge each section

Work through the page in order. For every section, answer the fit questions
below, then give it one verdict. Write the verdict down before changing
anything; the list of verdicts is the plan and it goes in the chat report.

**Fit questions**

1. **Job.** What must the reader do or learn here: choose between options,
   understand a story, follow a sequence, check a price, gain trust, or ask?
2. **Mode.** Does the section's presentation mode serve that job? Use the
   catalogue below. A section's name is a layout, not a topic.
3. **Hierarchy.** Does the fact the reader came for get the biggest slot? A
   price hidden in a checkmark bullet fails. A one-line requirement in a
   full-width story section fails.
4. **Capacity.** Item counts sit inside the schema's minimum and maximum. Each
   slot holds what it was designed for: fact labels on one line, prices as
   short figures, timeline text under 180 characters, key details under
   eight. Read the schema descriptions in `studio/schemas/blocks/` when in
   doubt.
5. **Photos.** Each photo shows what its caption or copy says, and the people
   in it are the page's reader (adults on an adult page, coaches on a coach
   page). A photo that contradicts the copy is worse than no photo.
6. **Repetition.** A fact said in two sections stays where the reader needs
   it and leaves the other. Hero facts, key-detail lists, and FAQ answers are
   the usual offenders.
7. **Order.** A requirement comes before the action it gates. Decision
   sections sit high on a page whose reader came to decide.
8. **Weight.** Section height matches its importance to the page's purpose,
   and the whole page matches its tier. Atmosphere sections do not outweigh
   the offer.
9. **Rhythm.** Page-level rules: one hero, one FAQ, one team section, the
   last section is the Director CTA, a nudge sits mid-page, and three
   sections with the same background in a row read as one long band.
10. **Placeholders.** Invented quotes and sample data are visibly labelled,
    and the label survives the layout.

**Verdicts**

- **keep**: fits; leave it.
- **trim**: right section, too much or repeated content; cut and dedupe.
- **re-house**: some of the content belongs in another section on the page;
  move it.
- **replace**: another existing section serves this content better; rebuild
  the block with that type and carry every idea across.
- **propose**: no existing section fits without loss; keep the closest
  fallback in the draft and describe the missing section in chat.

**Section catalogue** (existing sections and the job each serves; the
Studio preview image and the renderer in `frontend/components/blocks/` are
the source of truth for how each looks)

| Section | Serves | Watch |
| --- | --- | --- |
| Inner Hero | Opening: heading, one-line body, two buttons, up to four facts | Facts are a short figure plus a one-line label |
| Image and Text (`storyFeature`) | A story or point of view with one photo, a pull quote, key details, buttons | Adjacent ones alternate sides; three paragraphs is the ceiling |
| Image Feature Cards (`featureCards`) | Options the reader picks between: courses, sessions, next pages; two to six linked photo cards per group | Every card needs a photo and a link |
| Feature Grid (`benefitCards`) | Text-only cards with an icon: reasons, features, rules | No links, no photos |
| Stacked Feature Rows | Short headings with supporting points and an optional link | Points are explanations, not prices or comparisons |
| Timeline (`stackedTimeline`) | Ordered steps or a schedule as numbered cards with a time or label, two to eight | Text under 180 characters; photos optional |
| Big Image List | Ordered stops where every stop deserves a large photo, two to eight | Very tall; only when each photo shows the caption |
| Journey | A trip in stops: horizontal path on desktop, vertical on phones | Travel and arrival pages |
| Large Slides | Places, moments, or steps with one pinned photo per slide | Photo-led; copy is short |
| Image Collage Feature | A story with supporting points and two overlapping photos | Needs two good photos |
| Heading and Image | A centred heading and paragraph over one full-width photo | A pause, not an argument |
| Included and Extras | A fee: what the price includes beside priced extras | Price slot is short; "Camp to confirm" squeezes it on phones |
| Dates and Rates, Packing Checklist, Activity Schedule, Activity Catalogue, Facilities Map, International Campers | Their named purpose | Specialised; keep to that purpose |
| Quote Wall | Quotes from Testimonial documents as a wall of cards | Long quotes open in a dialog; nine cards show before "Show more" |
| Team Members | Selected Team Member documents, profiles or roster | |
| FAQ Section | One accordion of FAQ documents | One per page |
| Call to Action (`ctaBanner`) | `nudge` between sections for a small aside; `closing` only when no Director CTA closes the page | A nudge never ends the page |
| Director CTA | The last section, always | |
| Rich Text Block, Latest Posts | Starter sections without a finished design | Avoid; pick a designed section or propose one |

## Apply the verdicts

Build the new `blocks` array in a small node script from the raw draft, so
keys, marks, references, icons, and image hotspots carry over untouched
where content is unchanged. New items get new keys. Check the schema fields
of any section you add (`studio/schemas/blocks/<type>.ts`): required fields,
minimum and maximum counts, the `_type` of nested items and links. Reuse
row icons from existing rows or the lucide render recipe. For photos, query
`sanity.imageAsset` by `description` and choose by what the description
says; write alt text; drop crop and hotspot values that belonged to the old
photo.

Patch `drafts.<pageId>` through MCP with `ifRevisionId`. Then read the draft
back to ndjson and run scoped validation with `pnpm --dir studio exec sanity
documents validate -y --file <ndjson> --format ndjson --level warning`. Only
pre-existing markers, such as the legacy `migration` field, may remain.
Run `pnpm page:shots <slug> --out /tmp/cac-page-shots/<slug>-after` and read
every image again. Each changed section must look like its verdict said,
at both widths. Fix what does not, and re-shoot that width.

## Report

Post one comment on the card: the changes section by section, the ids you
published, the backup path, and the new page height beside the old one.
Nothing else on the card changes; the layout proposals stay in chat.

Then tell Ovi, in chat, the short report by default: at most six lines
with the outcome, what changed for the reader, anything unverified or
open, and the Studio Presentation link for his visual check,
`http://localhost:<studioPort>/presentation?preview=%2F<slug>%3Fsanity-preview-perspective%3Ddrafts`,
for both widths, with the sections to look at first. Say that the look is
unverified until he has seen it. No table.

Give the full report only when Ovi asks for it ("full report", "details",
"more"):

- the verdict for every section and what changed, as a table;
- each **propose** verdict: the content, the fallback used, what the
  fallback loses, and the section that would serve it;
- anything left open;
- the visual-check links again, one for each width.

Ovi decides on each proposal afterwards and asks, when he wants, for a card
comment or a GitHub issue.
