# Homepage design brief

Status: awaiting confirmation (2026-09-26). Written by the Impeccable `shape` step. No code and no direction contract yet.

> **Update 2026-10-04:** the visual world is **Sunlit Camp**, not The Nightly Gallery. Its design system is `frontend/DESIGN.md`. Section 3 below describes the earlier Nightly Gallery pick and is replaced by `frontend/DESIGN.md`. The rest of this brief still applies.

Visual world: **Sunlit Camp** (see `frontend/DESIGN.md`). The first pick, The Nightly Gallery (Impeccable direction round, seed key `fa5dfdaf`, re-roll 1), is replaced. Visitor mode: **Persuade**.

## 1. Job and audience

- **Who arrives:** a parent or guardian of a child or teen with type 1 diabetes. Often a first-time camp parent, often on a phone in the evening, often anxious about a week away from home with insulin and blood-sugar care out of their hands.
- **Their job:** find the camp for their child's age, believe the child is medically safe, see dates and cost (with financial help), and register on CampBrain without calling the office.
- **Second audiences, in order:** donors and sponsors (give, join an event), staff and volunteers (apply), campers, teens and alumni (see camp, CIT path, stay connected).
- **Mode:** Persuade. The page must make the offer clear, show one action, and prove something only Setebaid can prove.

## 2. Outcome and proof

- **Primary action:** the parent picks their child's age band and gets that camp's dates, cost and register link. 7 to 13 is HDYC, 13 to 17 is Camp Setebaid, families is the Diabetes Family Conference.
- **Success:** the parent registers without a phone call. Donors give quickly. Staff and volunteers find the apply link.
- **Real proof the page carries:** real photographs of campers at camp (the heart of the page), the camp video, the on-site healthcare team, tiered honor-system pricing with the Campership Fund shown openly, founding years (programs 1977, HDYC 1978, incorporated 1998), and the research on reduced diabetes-related stress only when the client supplies it.
- **Product truth in one line:** "Summer camp for kids who just happen to have diabetes." Diabetes education is built into ordinary camp fun, and campers go home more independent.
- **Not invented, ever:** testimonials, statistics, camper counts, staff names, accreditations, medical claims.

## 3. Selected direction (replaced: see `frontend/DESIGN.md`, Sunlit Camp)

- **Visual authority:** none exists yet. This is a new world. DESIGN.md is written at the end of the build from the built page, not before it.
- **Thesis:** the photographs are the page. The homepage is a camp week seen the way parents actually see it: big pictures stamped by day and activity, newest first. This is the daily gallery a parent refreshes every night of camp week, hoping to see their own kid smiling.
- **What it refuses:** the category default (one hero photo, a slogan, three icon cards, a quote slider) and every non-photo concept (illustrated, typographic, chart-led).
- **Color strategy:** Restrained. White ground, near-black type and stamps, one warm accent for actions. The photographs carry all the color. Scene that forces light over dark: a grandparent reading tier prices at noon and a parent on a phone at night both need long, calm reading; sunny daytime photographs read true on white, and white is the gallery language parents already know from camp photo apps.
- **Type intent:** one sturdy sans with a point of view and tabular figures, used for the hook at very large size and for the small day and time stamps. Not a serif, not a display face from the common AI defaults. The exact face is a build decision.
- **Sequence (top to bottom):**
  1. **The wall:** large photographs fill the first viewport, newest first. Each photo carries a stamp chip: day of camp, weekday, activity (for example "Day 4, Tuesday, archery"). The hook sits over the top photo in one line, on a solid chip, never as bare text over a photo. The **season line** sits with it: one short sentence that office staff set in Sanity (for example "Summer 2027 registration is open. Late fee after May 15.").
  2. **The age filter strip:** "Show me: ages 7 to 13, ages 13 to 17, families." Picking one reorders the wall to that camp's photos and pins that camp's card at the top of the wall.
  3. **The pinned camp card:** camp name, ages, dates (July 11 to 17, 2027), Mifflinburg PA, the tier line ("Tier I to IV pricing. Every family pays what it can. Every child gets the same camp."), Register (CampBrain, external) and Request info (small).
  4. **A day at camp:** photographs in time order from wake-up to campfire with short captions. Blood-sugar checks and carb counting appear in the captions as ordinary items, in the same voice as swimming and archery. This is how the page proves "they don't realize they are learning."
  5. **The people:** the medical team and counselors as photographs with short, quiet copy on competence. No invented names.
  6. **Cost and campership:** the four tiers shown openly in a small table, the Campership Fund explained in two sentences, confidential and same camp for every tier.
  7. **Give, volunteer, alumni:** three photo tiles, each with one line and one link (Network for Good, staff interest form, alumni).
  8. **News and events:** the latest three, with dates.
  9. **Footer:** office address, phone, email, PO Box, the registered-mark name, and a one-line statement about how published camper photos are handled.
- **Focal moment:** picking an age band. The wall reorders in place and the camp card pins to the top.
- **Signature interaction:** the in-place reorder of the wall, animated as a move (each photo slides to its new place), with the pinned card sliding in. Under reduced motion the change is instant. There is one motion grammar on the page: things move to their new place; nothing fades in for decoration.
- **Implementation consequence:** the page needs a real photo library with consent flags and captions, and a Sanity content model for photos, season state, camps, events and news. Until the real photos arrive, every photo slot ships as a clearly labelled placeholder frame (marked "placeholder, real camp photo goes here"), never stock imagery.

## 4. Scope and boundaries

- **Next deliverable (user's choice):** a single-file HTML prototype of the homepage in this repo, production-grade structure, responsive, accessible, with the age filter and the season states switchable for review. After sign-off: the Next.js + Sanity build.
- **Breadth:** the homepage only, including the site header and footer as they would ship.
- **Interactivity in the prototype:** the age filter, the season line states, the video embed with a poster. No lightbox and no load-more in the first prototype.
- **Untouched:** external registration on CampBrain, donations on Network for Good, office contact facts, the registered-mark names, and all factual copy from `build/pages/`. No new claims.
- **Anti-goals (from the user):** must not look like a clinic or hospital; must not be a generic stock summer camp site; cost and campership must never be hidden below the fold or behind a click; no wall of text at the top.

## 5. States and ranges

- **Season states (staff pick one in Sanity):** registration open (with the May 15 deadline), late-fee window (after May 15 until camp), camp in session (link to the daily gallery and camper mail), after camp (thank-you, next season's dates once set, donate), event season (the Walk, golf, 5K, Family Day, cornhole). Exactly one element changes with the state: the season line and its link.
- **Photo count:** minimum 6 (the wall still fills the first viewport), typical 24 to 48, maximum hundreds (later: load more or link to the gallery). Landscape and portrait mixed; the wall must handle both.
- **Camps:** two residential camps plus the family conference; the CIT program is secondary and lives on its own page.
- **News:** 0 to 3 posts. **Events:** 0 to 5. Empty states hide the section rather than show an empty box.
- **Copy limits:** hook one line; season line one sentence; caption up to 12 words; camp card copy fixed by the content model.
- **Missing assets:** logo, real photos, testimonials and research are not in the repo. Placeholders are labelled. The page must still read as finished with placeholders in place.

## 6. Interaction and layout

- **Hierarchy:** photographs, then the hook, then the season line, then the age filter, then the camp card, then everything else.
- **Topology:** one scrolling page. The filter changes the wall in place and updates the URL fragment so a link to "ages 7 to 13" works.
- **Responsive:** mobile first. On phones, one column with one or two photos per viewport and the filter strip sticky under the header. On desktop, a three-column wall with one photo spanning two columns near the top.
- **Affordances:** buttons look like buttons. External links say they leave the site. The filter is a radio group. Stamps and the hook always sit on solid chips for contrast.
- **Feedback:** the selected age band is visible in the filter, in the pinned card and in the URL.
- **Accessibility:** WCAG 2.2 AA. Alt text comes from captions. Contrast 4.5 to 1 on all text. Focus states visible. Motion respects reduced-motion. Video is a real embed with a title and a poster.

## 7. Constraints and open decisions

- **Platform:** prototype as one HTML file in this repo; then Next.js with Sanity on Vercel. English only.
- **Reusable pieces to expect:** photo tile with stamp chip, season line, age filter strip, camp card, section header, button, photo-tile trio, news item, footer.
- **Decisions the builder must not invent:**
  1. Real photographs with permission, and captions. Until then, labelled placeholders.
  2. Logo files.
  3. The exact wording of each season state.
  4. Whether the in-session daily gallery is public or password-protected (this changes the in-session season link).
  5. Which donate options to feature (the old site lists Memorial, Campership, Monthly donor, Medical staff training).
  6. Where form submissions go (email, Sanity, or both).
  7. The photo privacy statement in the footer.

## Assumptions made without an answer

- Light ground rather than dark, for the reasons in section 3.
- One accent color for actions; the exact palette is chosen at build.
- The homepage links to the two camp pages and Dates & Rates rather than repeating their full content.
