# Page content work: Setebaid facts

The page skills (`/page-plan`, `/page-draft`, `/page-polish`) hold the
process. This file holds this project's facts. Use only these; never copy
ids, names, readers or rules from another project.

## Release scope: MVP (Ovi, 2026-10-01)

The MVP launches in about one week, before the first Breakthrough T1D walk
on 2026-10-11, so Setebaid can use it at the October events. The MVP is the
current site, rewritten and much better, plus all legal pages, plus the
event landing pages (`/go/{channel}`) behind the QR-code cards. Those
landing pages are the main reason for the sprint.

- MVP pages are the rows with Launch = "MVP" and Status other than
  "Remove". Rows with Launch = "Final" are later releases.
- No lead magnets in the MVP: no quizzes, no parent's guide, no giveaway,
  no "talk to a camp parent". No other new features (no full staff roster,
  no impact graphs, no referral kit, no "Get involved" hub).
- An MVP page uses the content that exists today, rewritten for the reader.
  It never links to a "Final" page. If its parent is a "Final" page (for
  example `/get-involved`), the page sits at the top level for now.
- Treat the current segments and avatars as correct and complete.
- Unconfirmed facts never block a plan or a draft. A button whose target
  does not exist in the MVP is a blocker: point it at an MVP page.

## Page record

- **System:** the Miro site map table, read and written with the Miro MCP:
  https://miro.com/app/board/uXjVHivCMTQ=/?moveToWidget=3458764685507184567 .
  One row per page; find a row by its "Path" column. The table's "Parent"
  link column can only be read with `canvas_read_as_svg`, not with
  `table_list_rows`, and cannot be written by the tools.
- **Columns used:** "Path", "Page", "Launch", "Status" (new, keep, rewrite,
  merge, remove), "Audience", "Job of the page", "Parent path", "Section",
  "Page Type", "Plan steps", "Old pages", "Open question", "Content Doc"
  (the plan Doc link), "Workflow Step".
- **Workflow Step:** To Plan → To Build → Internal Review → Client Review →
  Approved (or Rejected).
  - `/page-plan`: a row is "To Build" once its plan Doc is linked. Plans
    are not reviewed in Internal Review.
  - `/page-draft`: the row stays "To Build" while the draft is written;
    at handover it moves to "Internal Review", where Ovi reviews the draft.
  - `/page-polish`: runs after Ovi's internal review, on rows in "Internal
    Review" that Ovi hands over. It does not change the status; Ovi moves
    the row to "Client Review" after his look.
- **Taking a page:** Ovi, or one coordinating session, assigns each page to
  one run. Do not take a page you were not given; no untargeted runs.
- **Handover notes:** in the page's plan Doc (the "Content Doc" link), in a
  tab named "Draft notes" (`/page-draft`) or "Polish notes"
  (`/page-polish`). Add the tab with `gws docs documents batchUpdate` and
  `addDocumentTab`; write into it with `insertText` using its `tabId`.
- If the Miro MCP is not available in the session, do the content work,
  then tell Ovi the row and the status it needs.

## Plan

- **Plan Docs:** Google Drive folder "Setebaid 2026 Redesign — Page Plans",
  https://drive.google.com/drive/folders/1KcKQUrknr5GJTMQtP1H8OPC24TUGph_u
  (folder id `1KcKQUrknr5GJTMQtP1H8OPC24TUGph_u`). Each row's "Content Doc"
  links its plan.
- **Topic map:** `docs/content/topic-map.md`. Which page owns each topic,
  where each old page's content goes, and the content conflicts (C1–C20).

## Readers and sources

- **Segments and avatars:** Google Doc "Setebaid 2026 Redesign Customer
  Avatars" (the master copy),
  https://docs.google.com/document/d/1GWEIRrCAPV-8fiUsjCAWIFxwLz1JYIQRLwZXJfcnlNE/edit .
  Segment → avatar: Parents → Worried Wendy; Donors → Generous Greta;
  Volunteers and staff → Eager Ethan; Doctors and nurses → Busy Beth RN.
  Audience "Everyone" means: pick the main reader for each part of the
  page. Export it as text with
  `gws drive files export --params '{"fileId":"1GWEIRrCAPV-8fiUsjCAWIFxwLz1JYIQRLwZXJfcnlNE","mimeType":"text/markdown"}' -o /tmp/stb-avatars.md`
  and drop the embedded image data lines. Each segment and each avatar
  starts with a top-level heading. Read only the segment and avatar
  sections that the page's Audience (or the plan's "Reader" section)
  names.
- **Marketing plan:** `/work/dev/stb/marketing/marketing-recommendations.md`
  (outside the repo). The "Plan steps" column (A1, C3, F2…) points to its
  sections.
- **Old site content:** `pre-bootstrap/build/pages/<old path with / replaced
  by __>.md`, for example `/campers/dates-rates` →
  `pre-bootstrap/build/pages/campers__dates-rates.md`.
- **Camp facts:** `PRODUCT.md`.

## Message rules

- Short messages (hero lines, cards, buttons) never show $3,700. Lead with
  the outcome, then "nonprofit", then "donors pay most of the cost". The
  price page and long texts may use value first, then $3,700 as the
  anchor, then the tiers. Use "$50" only if the tier numbers support it.
- Registration and donations happen in Camp Brain. The site links out. No
  live "spots left" count. Network for Good is gone.
- Never name the experts or authors whose marketing methods we use.
- No criticism of the current site or of Setebaid's past work. Ovi gives
  that on a call. Plans and drafts may go to Setebaid for review.
- Accessibility target: WCAG 2.2 AA.
- **Confirmation marker:** "(Setebaid to confirm)". Setebaid confirms the
  facts on the pages during Client Review.

## Shared wording (Ovi, 2026-10-01)

Every plan and every draft uses these exact words. Do not invent variants.

- **Who camp is for:** "kids and teens with diabetes". Not "type 1" in
  short lines.
- **Short description:** "a nonprofit camp for kids and teens with
  diabetes".
- **Medical line:** "Medical staff on site day and night."
- **Price, short lines:** "Donors cover most of the cost, so families pay
  far less than the full cost. Financial help is available."
- **Names:** "Setebaid" is the name for the whole organization and all its
  programs. "Camp Setebaid" is only the camp for ages 13–17. "Harrisburg
  Diabetic Youth Camp (HDYC)" is the camp for ages 7–13. Every page title
  ends with "| Setebaid Services".
- **Fund name:** "Dr. David Langdon Medical Staff Training Fund".
- **Buttons (label → target):**
  - "Register" → /register. Only /register links out to Camp Brain for
    registration. One exception: "Log in to Camp Brain" on
    /parents/before-camp, for families who already registered.
  - "Financial help" → /dates-and-prices/financial-help.
  - "Ask about camp" → /ask-about-camp.
  - "Talk to the director" → /ask-about-camp, with "Talk with the camp
    director" chosen on the form. It replaces every "talk to a camp parent"
    offer in the MVP.
  - "See dates and prices" → /dates-and-prices.
  - "How we care for your child" → /parents/medical-care.
  - "Donate" → /donate.
  - "Volunteer at camp" → /volunteer.
  - "See campaigns and fundraisers" → /donate/campaigns.
  - "Sign up" → an event's own sign-up (never "Register" for events).
  - "Call the office" → tel:+15705249090.
- **Pennsylvania statement** (word for word, wherever the site asks for
  money, and on printed requests for gifts): "The official registration and
  financial information of Setebaid Services, Inc. may be obtained from the
  Pennsylvania Department of State by calling toll free, within
  Pennsylvania, 1 (800) 732-0999. Registration does not imply
  endorsement." The /terms-of-use page owns it; other pages quote it
  exactly.
- **Forms and privacy:** an "Ask about camp" entry shows that a child
  likely has diabetes. Treat every form entry as private health
  information: no ad tracking on form pages or /go pages, and no form
  answers sent to analytics.

## Sections (Ovi, 2026-10-02)

Read this part before you choose sections for a page. Where it differs
from the section catalogue in the shared page skills, this part wins.

The section library comes from the copied CAC code base. Its sections
already use the Setebaid design system, and the MVP reuses them. The
design source is the home page prototype,
`frontend/prototype/Home-Page-Prototype.html`. Each of its sections has a
`data-screen-label`. Only the home page has a prototype; inner pages use
the reused sections.

**Use freely:** `innerHero`, `storyFeature`, `featureCards`,
`benefitCards`, `stackedFeatureRows`, `stackedTimeline`,
`imageCollageFeature`, `headingImage`, `largeSlides`, `bigImageList`,
`quoteWall`, `teamMembers`, `faqAccordion`, `ctaBanner`, `directorCta`,
`flipCards`. `photoStrip` holds only photos: use it only when at least
three fitting photos are in Sanity.

**Use only for their named job:** `faqHub` on /parents/faqs.
`packingChecklist` for the packing list on /parents/before-camp.
`pricingTiers` for the camp fees on /dates-and-prices; other pages link
there. `wordSwap` for the story of the Setebaid name. `richTextBlock` for
the legal and policy pages (/privacy-policy, /terms-of-use,
/cookie-policy, /accessibility, /refund-policy); on other pages, choose a
designed section.

**Layouts.** Six sections have a second look, set in their `layout`
field (`variant` on `ctaBanner`). The home page uses each one. On other
pages, use a layout when the content does the same job; otherwise keep
the default.

- `featureCards`: `grid` (default), or `tilted` for a few large cards
  with a tilted photo, a date badge and two buttons, e.g. camps.
- `benefitCards`: `grid` (default), or `ringPhoto` for a round photo
  beside the heading and up to three short points.
- `stackedTimeline`: `timeline` (default) for ordered steps, or
  `dateCards` for up to three dated items, e.g. events. The item's small
  label shows large, so put the date there.
- `quoteWall`: `wall` (default), or `track` for one row of quotes that
  visitors drag sideways.
- `imageCollageFeature`: `collage` (default), or `bento` for a text card
  with buttons and three captioned photos, e.g. staff.
- `ctaBanner` `variant`: `closing` (default) ends a page, `nudge` is a
  quiet prompt between sections, `photo` is a full-width photo band.

**Text-only pages have no hero.** Legal and policy pages open with the
page's own title and description, which the site shows as a styled title
header. Do not add an `innerHero` without a photo. Write the short intro in
the page's `description` field.

**Do not use:**

- `pricingSingleToggle`: the CAC price panel. `pricingTiers` replaces
  it.
- `includedExtras`: made for one fee with priced extras. Setebaid prices
  are tiers.
- `internationalCampersSection` and `journey`: CAC topics (international
  campers, the bus trip). For ordered steps, use `stackedTimeline`.
- `latestArticles`: a starter section, and the MVP has no news.

**Pricing.** `pricingTiers` holds the tiers (name, label, price, button),
the honor-system note and the small print. Prices are content in Sanity
only, never in code: this repository is public.

**Prototype section → section to use** when a page needs the same job:

- Hero → `homeHero` on the home page, `innerHero` on all other pages.
- Name story → `wordSwap`.
- Turn it around → `flipCards`.
- Photo strip → `photoStrip`.
- Camps → `featureCards`, layout `tilted`.
- Why Setebaid → `benefitCards`, layout `ringPhoto`.
- Pricing → `pricingTiers`.
- Voices → `quoteWall`, layout `track`.
- Events → `stackedTimeline`, layout `dateCards`.
- Donate → `ctaBanner`, variant `photo`.
- Staff → `imageCollageFeature`, layout `bento`.
- News: not in the MVP.

**Testimonials.** `quoteWall` shows Testimonial documents. The home
page's testimonials (`testimonial-home-*`) are still drafts. Another page
may show them: reference them the way the home page draft does (a weak
reference with `_strengthenOnPublish`). Do not edit them.

**Photos.** The camp photos are still being processed. If no fitting photo
is in Sanity, keep the section, leave the photo empty, and write the photo
the slot needs in the Draft notes (for example "counselor helping a camper
check blood sugar"). An empty required photo field is an expected gap: do
not fill it with a photo that does not fit. A later photo pass fills it.

## Sanity

Project `o36mi5w4`, dataset `production` (see `docs/agents/sanity-cli.md`).
Verify against the Sanity MCP target before any write.
