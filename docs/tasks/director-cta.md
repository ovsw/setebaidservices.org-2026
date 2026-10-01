# Director CTA implementation

Status: Implemented and verified, 2026-09-11. Complete for local draft review; no publish or push.

## Approved scope

Build `directorCta` (Studio title `Director CTA`) from `design/mocks/director-cta-options.html`, frame `Final · At the desk`. Source URL: https://dpcjmcx8yuqk.postplan.dev.

Use the prototype heading, full desktop description, buttons, and embedded Justin portrait. The user explicitly replaced the earlier requirement to copy the old section's content. Keep the full description at both widths so one DOM serves both layouts.

Replace only `expTalkToDirectors` on a draft of `theCacExperience`, slug `canadian-adventure-camp-experience`. Keep the published page and every other section unchanged. No publishing, pushing, or PR.

## Plan and status

- [x] Verify prototype, source section, and available type name.
- [x] Confirm existing servers belong to this worktree: frontend 3002, Studio 3335.
- [x] Save approved comp and design notes.
- [x] Build schema, query, renderer, registrations, and Studio preview.
- [x] Export project bf76qlx9 production dataset with assets; verify with gzip -t.
- [x] Upload prototype portrait; create or patch only the target draft section with concurrency protection.
- [x] Generate types and run typecheck plus lint on changed files.
- [x] Verify draft data, published preservation, and desktop/mobile UI in Chromium.
- [x] Independent finish review; apply material fixes.
- [x] Commit task files and record handoff.

## Ownership

Terra worker: schema, query, renderer, CSS, registrations.
Root: plan, reference assets, backup, draft mutation, generated code, checks, Chromium verification, commit.

## Verification and decisions

- Chromium extension is connected. Use it for the site and Studio; user explicitly ruled out the in-app browser.
- Existing section is ctaBanner, key expTalkToDirectors; published source uses button items.
- No draft was returned by the initial dataset query. Re-read immediately before writing.
- Full asset backup is required because the task uploads a portrait.
- The section-build review reference is unavailable at its supplied path. Perform a bounded independent review against the approved comp and repository rules.
- Basecamp CLI has no account selected; local task tracking remains the durable record. No Basecamp messages are needed for this implementation.

## Approved frame design notes

- Desktop frame: 1440 px; content max-width 1320 px with 56 px side gutters. Two columns, 7fr and 5fr; 40 px gap, bottom alignment. Top and copy-bottom padding 120 px.
- Figure: 640 px tall. The 900 × 675 transparent portrait renders at 620 px high, preserving the entire image aspect ratio. It is bottom-aligned and translated horizontally by -46% from the center. No photo crop or rectangular background.
- Disc: 540 px diameter, centered horizontally, bottom -170 px. Forest Panel on Forest Floor; 1 px Birch Bark border at 12% opacity. Radial amber glow at the base. Portrait drop shadow.
- Heading: Bricolage Grotesque 800, 58 px maximum, line-height 1.02, tracking -0.02em. Emphasis: Caveat 600, 1.08em, amber, no italic slant.
- Description: Archivo 17 px, line-height 1.6, max-width 32rem, Birch Bark at 75%; 24 px top margin.
- Actions: below description, 34 px top margin, 12 px gap. 48 px tall pill buttons with 30 px horizontal padding, 15 px text. Amber primary with Pine Night text and arrow; transparent secondary with Birch Bark border and external arrow.
- Section: Forest Floor, Birch Bark text, 44 px top corners. Mock labels and the previous/next section strips are excluded.
- Below 1024 px: same DOM in one column, portrait first. Phone gutters 20 px. Figure 320 px tall, portrait 300 px high, 330 px disc at top 70 px, 120 px fade at bottom. Centered copy, 34 px heading, 16 px description. Full-width buttons, 26 px top gap, 72 px bottom padding.
- Map prototype colors to existing globals.css tokens: forest → forest-floor; panel → forest-panel; amber → campfire-amber; pine → pine-night; birch → birch-bark. Reuse font, radius, spacing, and container tokens. No global tokens added.

## Backup

Verified with `gzip -t`: `backups/director-cta-2026-09-11T05-27-17-182Z.tar.gz`. Full export: 673 documents and 451 assets. No dataset writes occurred before verification.

## Dataset result

Created draft `drafts.theCacExperience` and image asset `image-a296124145931595c4290e6671c180545c9040fd-900x675-webp`. The page still has 11 blocks in the same order. Button keys remain `ttd-b1` and `ttd-b2`. The contact reference resolves to `/contact`; the second button links to CampBrain in a new tab. Exact before/after checks passed for published page, all other sections, page fields, and other ctaBanner documents. Mutation evidence is in `/tmp/section-build/directorCta/`.

## Final verification

- TypeGen completed after the shapes settled; generated schema and query types are current.
- `pnpm typecheck` passed for frontend and Studio. ESLint passed on changed frontend files, including a repeat check after the image-edit boundary fix. `git diff --check` passed.
- The actual exported `PAGE_QUERY`, fetched with the drafts perspective, returned directorCta, its 900 × 675 portrait, rich heading, and correct action targets.
- Chromium extension checks at 1440 × 1000 and 390 × 1100 showed the approved desktop and mobile structure. The image loaded. Mobile buttons are 48 px high and span the content width.
- Clicked the CTA contact link; `/contact` loaded. Verified the CampBrain URL, new-tab target, and safe rel attributes without submitting a registration.
- Clicked the heading inside Studio Presentation; the editor opened section #10 with the expected heading, description, portrait, alt text, and actions. Nothing was published.
- Fixed a Sanity image overlay that extended past the visible portrait: the image field edit target now sits on the bounded figure container. Mobile document width now equals its client width.
- Desktop Presentation can still create horizontal overflow for an off-screen testimonial name overlay. The page body and CTA remain within the viewport. This pre-existing testimonial/editor interaction is outside the section scope.
- Studio shows an unknown `migration` field carried from the published page. Preserved this legacy data; no unrelated cleanup.
- Independent Terra finish review found no outstanding material section issues. Its review also confirmed the Studio preview registration. No CodeRabbit run.
- Captures: `/tmp/section-build/directorCta/desktop.png` and `/tmp/section-build/directorCta/mobile.png`. Approved comp is committed at `design/mocks/directorCta-Final-approved.png`.

## Handoff

Backup: `backups/director-cta-2026-09-11T05-27-17-182Z.tar.gz`.

Dataset changes: draft `drafts.theCacExperience`; uploaded portrait asset `image-a296124145931595c4290e6671c180545c9040fd-900x675-webp`. No published document changed.

Studio Presentation: http://localhost:3335/presentation/page/theCacExperience?preview=/canadian-adventure-camp-experience

Standalone draft preview after opening Presentation: http://localhost:3002/canadian-adventure-camp-experience?sanity-preview-perspective=drafts#director-cta-expTalkToDirectors

Check at 1440 and 390 px: portrait and disc placement, heading emphasis, full supporting copy, both actions, and click-to-edit fields.

No selected prototype copy was omitted. The alternate headings and mock labels were not page content. The full desktop description is also used on mobile. Buttons use the existing shared component, so their label size and border treatment follow the site instead of duplicating the mock CSS.

No new tests, broad suite, release gate, PR, push, deployment, or publication was needed for this local section build.
