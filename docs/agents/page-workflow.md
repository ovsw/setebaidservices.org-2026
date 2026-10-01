# Page content workflow

Shared process for `$page-draft` in ChatGPT/Codex and `/page-draft` in
Claude Code. One capable writer owns the complete page. Basecamp holds
content planning and client review; Sanity holds the content; GitHub holds
separately approved code work.

## Scope and outcome

Write a complete, ambitious proposed page for a high-end camp, then map it
to existing presentation layouts. Content comes first. Freely propose the
promises, services, details, numbers, and experiences appropriate to the
page. Factual accuracy is a later client pass: mark unconfirmed claims
`(camp to confirm)` and put each on the page's checklist. Existing source
facts are useful inputs, not a limit on what the draft can propose. For this
drafting stage, this rule supersedes source-only or "do not fabricate"
restrictions in older page guidance and PRODUCT.md. The page is not
published; only its page-owned supporting documents, such as FAQs, are.

The result is a complete Sanity draft, its Basecamp card in Ovi Polish,
and a traceable confirmation checklist. A temporary layout limitation is
acceptable when recorded. Missing content and failed writes are not.
Ovi is the editorial reviewer; do not create a review agent or review loop.
Content drafting is the content-only row of the review routing table, so it
earns no CodeRabbit review either.

Content work requires no dedicated branch or worktree. Read repository
instructions and section definitions from an available checkout, including
main, without changing it. No schemas, queries, frontend, generated types,
code commits, pushes, GitHub plans, PRs, or release checks belong to this
task. Propose section changes on the card for Ovi to decide on later.

## Start and claim one page

Accept a slug, old-site URL, or Basecamp card URL. With no target, select
the first unclaimed card in To Build. Resolve the card, slug, title, and
Sanity document id. Normalize the slug without a leading slash. A missing
page document can be created as a draft after the backup. An old Spec issue
link may be read as reference if useful; do not create or update an issue.

Before claiming, confirm that Sanity MCP can read and mutate the target
dataset, and that Basecamp is available. If the required connection is
unavailable, report the specific missing capability. Do not replace MCP
mutations with local seeds or an invented CLI write path.

### Taking a page so nobody else works on it

1. Read the card and all claim/release comments. Use a unique session or
   run identifier independent of Git branches.
2. An active claim by another run blocks writes, even in the same checkout.
   An old claim without an explicit release or completed handover remains
   active. Ask before taking over; age alone does not release it. For an
   untargeted run, choose the next unclaimed card instead.
3. Post `Taking this page. Run: <id>. Page: /<slug>.` Re-read the comments.
   The earliest unreleased claim wins. If another run won, record that your
   claim was withdrawn and stop without touching the draft or card body.
4. After winning, move the card to Building and record the active run in
   the card body. Re-read the body immediately before each update and
   preserve unrelated fields and edits.

Resume only a known claim from this session, or a takeover authorized by
Ovi. Inspect the card and current Sanity draft to establish what remains.
Never infer ownership from a branch name or replay a cached mutation.

## Brief and selective research

Read the page's avatar row and relevant profiles in `docs/avatars.md`,
`CONTEXT.md` "Conversion funnel" and "Copy voice", and the relevant CTA
rules in `docs/adr/0001-conversion-funnel-and-header-ctas.md`. Keep the
reader restrictions, such as Rachel not receiving a fit quiz and Maya not
receiving a form. Use `frontend/PRODUCT.md` for useful camp context.

Record a short brief on the card: primary reader, page purpose, questions
to answer, intended next action, and important decisions. This replaces
the GitHub plan issue. Keep work in the conversation and the card, not a
local plan, research artifact, state manifest, or seed file.

Read the current page and old page where helpful. `pnpm legacy:page <slug>`
is an available read helper. Choose further research for this page, not
from a fixed roster. Delegate only substantial independent questions and
keep the answers concise. No fixed audience/content/photo agent pipeline.
Do not repeat research to verify proposed claims. Defer layout and asset
selection until the content is written.

The unit of delivery is this page. Use supplied links or known shared facts
when relevant. Ask Ovi before searching other pages for matching defects,
claim occurrences, or wider coherence problems. Do not start a site audit.

## Write the complete page

Write without regard to available layouts. Serve the reader's questions
in a clear sequence with complete headings, body copy, and appropriate
calls to action. Run `unslop` on the writing; Ovi's later review is not a
reason to leave known repetition, fragments, or missing material.

Clearly mark each unconfirmed promise wherever it appears. If a field
cannot carry a visible marker, place one immediately beside its displayed
content and name the exact field in the checklist. Metadata claims also
need markers and checklist locations. Invented example quotations must
be visibly identified as proposed placeholders, not attributed as genuine
testimony. Preserve useful proposed detail instead of deleting it for lack
of a source.


## Match presentation layouts

After writing, read `docs/agents/page-builder.md` and inspect only the
existing section definitions needed to select layouts. General sections
are content-agnostic presentation patterns; their names are not topics.
Specialized sections, such as a facilities map, retain their actual purpose.

Choose by presentation mode, fields, capacity, and existing rendering
support. Aim to reuse existing sections nearly all the time. Preserve the
complete copy with multiple instances or the closest flexible layout when
necessary. Do not shorten, omit, or rewrite ideas merely to fit a block.
Preserve meaningful emphasis, links, ordering, and required fields.

Choose existing assets after the copy. Use supplied or stored descriptions
for alt text; record uncertain image suitability for Ovi. Leave an optional
image slot empty and note the gap rather than create a broken asset link.

A new section or schema modification is a proposal only. Record the
affected content, current fallback, specific presentation limitation, and
benefit of the proposed change on the card. Ovi decides whether to start
separate design/development work. Make no schema or frontend changes here,
and do not create a GitHub issue for an unapproved proposal.

## Save directly to Sanity

### Rules for working in parallel

The dataset is shared. Only the operator mutates the claimed page and its
page-owned supporting drafts. Keep deterministic, page-scoped ids for new
FAQs or other supporting documents. Read shared references, but do not
overwrite them. Leave `homePage`, `navigation`, `settings`, `footer`, other
pages, asset documents, and global configuration unchanged.

Before the first dataset write, name and verify the configured Sanity
project and dataset against the MCP target. Current repository project:
`bf76qlx9`, dataset `production`; verify rather than assume. Create a
timestamped export under `backups/` and run `gzip -t` on that exact archive.
Follow `docs/agents/sanity-cli.md` to pass the auth token from
`studio/.env.local` to the CLI. Use `sanity datasets export <dataset>
<absolute-backup>.tar.gz --raw` for document-only work. If the task changes
asset references, use a full export including assets. A failed export or
verification stops writes. Backups are recovery archives only.

Use Sanity MCP to read current document ids and revisions, then apply
scoped mutations to drafts. For an existing published-only page, create
the draft from its current content without altering the published version.
Preserve fields outside the task. Use revision preconditions when patching
existing drafts; create new drafts without replacing a concurrently created
document. On a conflict, re-read the document and reconcile the scoped
change. Do not blindly retry or overwrite another writer's work.

Use registered section types and actual schema fields. Portable Text
blocks, spans, list items, and marks need valid keys and references.
Page-owned FAQs and other supporting documents are published as soon as
they are created, in the same session, so the page draft can hold normal
references to them. Never hand over with supporting drafts left for Ovi to
publish by hand. The page itself stays a draft. If MCP lacks the operation
needed for a safe write, stop and report it instead of using an unsafe
replacement.

Write and fix the dataset directly. No seed files, repeated imports,
content artifacts, or local progress files are required or created.
The Sanity draft is the content result.

## Check storage and hand over

Read the affected drafts back through MCP, including referenced page-owned
documents. Check that all intended copy survived in order, required fields
and keys are present, references resolve in the draft perspective, and
every proposed claim has its marker and checklist entry. Use scoped schema
validation where available. Fix mutation or structural errors; distinguish
pre-existing warnings from new failures. This is a completeness check, not
a factual or independent editorial review.

No browser, screenshot, server-render test, typecheck, or build gate is part
of content drafting. Browser checks belong to separate section design work.
For the handover URL, identify the existing Studio server and its matching
frontend from `.worktree-ports.json` or `pnpm dev:stop` without stop flags.
Inspect ports before starting a server; reuse a matching server. Start the
existing development setup only if needed to provide the review link.
Do not guess the port or change CORS/settings. If preview setup is blocked,
report that limitation and retain the draft; do not claim a working link.

Finish by updating the card with:

- The brief and decisions, Sanity page id, and completed content status.
- The complete client checklist, with any known shared confirmation links.
- Necessary layout proposals, temporary presentation limitations, and media gaps.
- Backup path and ids of documents changed.
- When the matching servers are verified, the direct local Studio
  Presentation URL: `http://localhost:<studioPort>/presentation?preview=/<slug>`.
  Otherwise record the preview setup limitation and omit the URL.

Preserve historical Spec issue, Branch, and PR links without creating new
ones. Keep content planning and checklist updates on the card; no separate
GitHub plan, homepage issues, or new client to-do list is required. Reuse
and link an existing checklist when resuming rather than duplicate it.
Move the card to Ovi Polish only after the content and checklist are saved.
Record handover and release the run's claim. Tell Ovi the card URL, the
verified Studio URL if available, and any presentation limitations. Content
ready and presentation work proposed are separate outcomes; a layout
proposal does not block handover. The next stage is
`docs/agents/page-polish.md`.

## Pauses, failures, and later corrections

Honor a requested stop after the brief or writing. Record progress on the
card and release the claim on a deliberate pause. A later session reads
the card and current draft, then claims the page again before writing.
On an unexpected failure, record the step, cause, saved document ids, and
next action on the card when possible. Keep Building status and the claim
until the same run resumes or Ovi authorizes takeover. If Basecamp itself
fails, report the failure directly to Ovi. Never report incomplete content
as handed over.

When Ovi reports a quality failure, correct this page and identify the
cause. Ask before searching other pages for the same failure. Broader
coherence, client fact confirmation, and section development are separate
passes. Do not start them as cleanup for this run.

## Basecamp project reference

Account `6230954`, project CAC `48063970`, page tracker `10092471266`.
Use the Basecamp skill. Pass `--in 48063970 --account 6230954` for this
project's CLI operations. Resolve current column ids by title before moving
a card: To Build, Building, Ovi Polish. The existing column ids are
`10274031872`, `10092471270`, and `10274031944`, respectively.

Useful reads: `basecamp cards columns --card-table 10092471266`,
`basecamp cards list --column <id>`, `basecamp cards show <id>`, and
`basecamp comments list <id>`. Read all relevant comment pages when claiming.
Bodies are HTML in `data.content`; preserve unrelated fields when updating.
Use `basecamp cards update <id> --body <html>` and
`basecamp cards move <id> --to <column>`. Comments accept Markdown through
`basecamp comments create <id> <text>`. Supply content as structured tool
arguments or safely quoted text; no local content file is needed.
