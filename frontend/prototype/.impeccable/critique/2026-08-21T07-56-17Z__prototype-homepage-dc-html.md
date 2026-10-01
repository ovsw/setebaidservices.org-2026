---
target: prototype homepage
total_score: 21
max_score: 32
na_heuristics: 7,10
p0_count: 2
p1_count: 2
timestamp: 2026-08-21T07-56-17Z
slug: prototype-homepage-dc-html
---
Method: dual-agent (A: design review · B: detector + browser)

## Design Health Score (Persuade surface, 7 and 10 n/a)

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Build-a-day, pillar tour, Big Top carousel auto-advance with no pause or progress cue |
| 2 | Match System / Real World | 4 | Session calendar bars, airport codes, "+TAX" beside price |
| 3 | User Control and Freedom | 2 | No way to stop auto-cycling; build-a-day overwrites the user's picks |
| 4 | Consistency and Standards | 2 | #families centred while all else left-aligned; Caveat 2-5x per section; FULL chip not Ember Red |
| 5 | Error Prevention | 2 | Required fields unmarked, no blur validation |
| 6 | Recognition Rather Than Recall | 3 | Enroll hidden in session-row hover state |
| 7 | Flexibility and Efficiency | n/a | single-path marketing page |
| 8 | Aesthetic and Minimalist Design | 3 | #activities breaks One Fire (amber x7 in one viewport); dead 200px band before it |
| 9 | Error Recovery | 2 | Summary-line error, no field highlight, no aria-invalid |
| 10 | Help and Documentation | n/a | marketing page |
| **Total** | | **21/32** | **Acceptable (66%)** |

## Design Specificity Verdict
Specific. Outlined 35 + handwritten aside, island satellite walk with mono legend pills, Polaroid strip, globe + departures board: none of it lifts onto another camp site. Only #families (centred headline, four equal icon cards) and the testimonial cards are template-grade.

Deterministic scan: 201 findings. 188 are token-drift advisories (font sizes, alpha colours, radii off the DESIGN.md ramp) which are expected for a pre-system prototype. Real ones: 45 UI labels at 10-10.5px (session dates, FULL, UNDER 5 SPOTS, EN ROUTE), 6 overshoot easings, 4 layout transitions on width/max-height, one amber glow, 33 em dashes, zero media queries, zero :focus rules, 0 prefers-reduced-motion rules, 4.6 MB of local images (doctors-office.png alone 2.3 MB).

## Overall Impression
The desktop page has a real identity and three genuine peaks (hero, build-a-day, globe). The biggest gap: it is a 1280px artboard, not a website. The second: the middle third (#facilities, #families, testimonials) loses the discipline the top and bottom have.

## What's Working
- #rates card: length toggle reshapes the calendar live, Full is legible at a glance, refund and sibling lines sit under the button. Best high-stakes moment on the page.
- #activities outlined 35 + Caveat + build-a-day card: the core claim (kid's agency) as a toy, no copy needed.
- #world globe + arrivals list: sells "international" without saying it.

## Priority Issues
- **[P0] It is a fixed 1280px page.** Wrapper at line 68 has min-width:1280px, zero media queries. At 375 the page scrolls sideways 905px, hero CTAs and nav sit offscreen. Most parents arrive on a phone. Fix: drop the wrapper, implement the three DESIGN.md breakpoints, mobile nav + persistent Enroll pill. `/impeccable adapt`
- **[P0] No focus styles, no reduced-motion.** 76 focusable elements, zero :focus-visible rules, inputs set outline:none. Seven infinite animations ignore prefers-reduced-motion. Fix: Field Ring Rule globally; pause loops under reduced motion. `/impeccable audit`
- **[P1] Auto-play fights the visitor.** Build-a-day overwrites the user's picks mid-click, pillar tour advances while reading, carousel rotates, session-row Enroll is hover-only (never on touch). Fix: demo until first interaction then stop; pause on hover/focus; persistent small Enroll link in every session row. `/impeccable animate`
- **[P1] Accent discipline breaks in the middle third.** #activities: 4 amber chips + amber 35 + amber script + amber stamp. #facilities: Caveat x4. #families: centred, full script sentence, four mismatched icon treatments. Fix: picked chips go Cedar/Birch; one Caveat per section; left-align #families on the triad. `/impeccable polish`
- **[P2] Form errors are a summary line.** One red line above the button, no field highlight, no focus move. Fix: per DESIGN.md, blur validation, Ember Red border, mono message under the field. `/impeccable harden`
- **[P2] Rhythm holes.** 200px dead band with a stranded hairline between #programs and #activities; testimonials are dark cards on a dark field with no imagery after #safety. Page ends on a textarea, not a feeling. `/impeccable layout`

## Persona Red Flags
- **Jordan (first-time parent):** lands on #families, the weakest section; age range only in a chip; nothing shows what a first day looks like before the card flips names.
- **Casey (mobile parent):** page unusable at 375; sticky nav's only CTA is Request Info, Enroll lives in the ticker and a hover state.
- **Riley (stress tester):** Tab shows no ring; clicking a chip during the demo gets overwritten; 4-week toggle leaves a half-empty panel; blink dot loops forever.
- **International parent:** #world is the only travel content; who meets the child at YYZ never surfaces before the form; "Transportation extra" is 11px mono at the bottom of the price card.

## Minor Observations
- FULL chip is Pine Night; DESIGN.md says Ember Red.
- Under 5 spots pill + Enroll button: two ambers in one card.
- #families card titles misalign (OCA badge taller than icon squares).
- Testimonial bylines in Caveat (UI text, breaks One Hand).
- Map stop card covers CABINS / THE HUB; FLINTSTONE FIELD overlaps the trail.
- Pillar tour ghosts previous text during crossfade.
- Carousel dots 8px, below touch minimum.
- 45 labels at 10-10.5px; DESIGN.md floor is 11px.
- 33 em dashes in copy.
- Hero photo repeats in #island.

## Questions to Consider
- Should the page end on the directors ("we know every camper by name") with the form beside it, instead of on a textarea?
- Does the auto-demo sell agency, or take it away the moment a parent tries it?
- Is #families needed, or do its four claims fold into #safety with the Polaroid strip moving up to #island?
- Which door opens first: Enroll (ticker) or Request Info (nav)? Right now the page can't decide.
