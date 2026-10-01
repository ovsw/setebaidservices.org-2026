# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: parents (and guardians) deciding where to send their kid to overnight camp. Two groups:

- Canadian families, mostly Toronto area, comparing camps and checking dates, rates, safety.
- International families evaluating a camp abroad; travel logistics and supervision weigh heavily.

Secondary: the kids themselves (browsing activities, watching the film), alumni parents re-enrolling, and prospective staff (Join Our Team, sent to the CampBrain staff portal).

Job: get enough confidence to book a director call or enroll before a session fills.

## Product Purpose

Marketing website for Canadian Adventure Camp (CAC), a family-run overnight summer camp on Adventure Island, its own island on Lake Temagami, Ontario, running since 1975. The site exists to turn parent research into enrollments and booked director calls for the upcoming season.

Success: info-form submissions, calls, and click-throughs to the external enrollment system, especially before sessions sell out.

## Positioning

Claims a neighbouring camp cannot copy:

- The whole of Adventure Island is the camp: one supervised community, reached by boat, in the Temagami wilderness.
- Campers build their own day from 35 activities, no fixed timetable.
- World-class specialty coaching (gymnastics, trampoline, aerials, waterski/wakeboard) with serious facilities on-island (the Big Top, upgraded 2019; fully equipped gym; dedicated waterfront and boats).
- International camper body, met at Toronto airport and escorted to the dock.
- Family-run by camp parents for 50+ summers; directors aim to know every camper by name.

## Operating Context

- Session-based enrollment; sessions sell out (prototype shows Session 2 full). Seasonal urgency matters from fall through spring.
- Enrollment is two-path: Enroll CTAs link out to CampBrain (https://canadianadventurecamp.campbrainregistration.com/); the secondary header CTA is Talk to the Directors (scheduling page for the sales call; confirm directors staff the Sep-Mar calendar before shipping). No request-info form: the site is the information tier and must answer standard questions itself. Lead capture happens via the fit quiz (ads/social asset; in-page blocks only). Phone and email stay real contact channels (905-886-1406, info@canadianadventurecamp.com). See docs/adr/0001-conversion-funnel-and-header-ctas.md.
- Parents stay connected during the season via daily photos and weekly videos, hosted on an external platform (CampBrain/Bunk1-type); the site links to it, does not host it.
- Supervised bus from the Toronto area; airport service for international campers.
- Winter office: 6 Hubner Drive, Richmond Hill, ON L4E 4W5.

## Capabilities and Constraints

- Target build: this Next.js + Sanity monorepo. The homepage prototype defines the initial visual direction.
- Old site: Nuxt frontend https://github.com/ovsw/cac-web3 and Sanity Studio https://github.com/ovsw/cac-studio. Source for redirects, analytics setup, old schema, and content import.
- Site map (from prototype nav/footer): Home, The Island, Programs (Specialty: Gymnastics, Trampoline, Aerials, Waterski & Wakeboard; General Program; Y.L.P. Youth Leadership), Activities, Facilities, Dates & Rates, For Parents (Health & Safety), Testimonials, History & Goal, Leadership, Join Our Team, Contact, Privacy, Terms.
- Terminology: CAC; Adventure Island; the Big Top; Y.L.P. (Youth Leadership Program); OCA (Ontario Camps Association); CCA (Canadian Camping Association); tuck shop.
- Verified facts (user confirmed all sourced from the live site): 2026 session start dates Jun 29, Jul 13, Jul 27, Aug 10, Aug 23; sessions all-inclusive (cabin, meals, 35 activities, instruction, gear); deposits refundable until Mar 31, balances due Apr 1; sibling discount 5% second camper, 10% third; $150 tuck deposit, unused refunded; transportation and taxes extra; OCA + CCA accredited, 400+ standards; full-time doctor on island; staff minimum age and first-aid percentage as shown in prototype; Big Top sqft as shown in prototype.
- Season-specific numbers (dates, prices, availability, refund deadlines) must be editable per year in Sanity. Availability status per session (Full / Limited / Open) is set by staff in Sanity, not synced from CampBrain.
- Build targets the 2027 season: reuse prototype dates and prices with the year switched to 2027; client updates exact values in the CMS before launch. Pricing model stays as in the prototype (per camper, by session length).
- Old site URLs must keep working: build redirects from canadianadventurecamp.com paths to new slugs.
- Content is edited by non-technical camp staff; Studio must keep dates, prices, availability, photos, testimonials, jobs simple to edit.
- Join Our Team links to the CampBrain staff portal: https://canadianadventurecamp.campbrainstaff.com/. No newsletter (not on the old site; do not introduce one).
- Forms (fit quiz, contact) submit via Formspark, delivering to the camp office inbox.
- Hosting: Vercel.
- Old site content lives in an existing Sanity dataset; the new site gets a new Sanity project, content imported from the old one. Inner-page copy is rewritten in the prototype homepage's voice using old-site facts.
- Prototype interactions (build-a-day, spinning globe, island walk, pillar tour, session-length toggle) are all required in production.
- Analytics: carry over whatever the old site uses (check the old codebase).
- Timeline: top priority, launch as soon as possible and before the fall 2026 enrollment push.

## Brand Commitments

- The prototype is the new identity; the old logo and colours are not binding.
- Name: Canadian Adventure Camp / CAC. Tagline-style positioning: "Canada's premiere international overnight camp."
- Voice in prototype: warm, confident, parent-to-parent, light humour ("Phones stay home; friendships don't").
- People: Justin Gerson (Camp Director), Anna Gerson (Co-Director), Anna Brady (Director of Youth Leadership).
- Social: Instagram, YouTube, Facebook.

## Evidence on Hand

- Homepage prototype: `prototype/Homepage.dc.html` (Claude Design file) plus `prototype/build/make-standalone.mjs` to produce a standalone HTML.
- Photos and assets: `prototype/uploads/` (island satellite and illustrated map, Big Top panorama, gym, doctor's office, lifeguard, staff/campers, director portraits, CleanShot references).
- Two real parent testimonials (Karen, Alice) in the prototype; more exist on the live site.
- Camp film: `prototype/videos/cac-new-intro-2024-2025.mp4`.
- Live site canadianadventurecamp.com is the source of truth for copy and numbers.
- Do not fabricate: additional testimonials, awards, enrollment counts, staff bios beyond the three directors.

## Product Principles

1. Sell the island and the kid's agency (35 activities, their pick) before anything else.
2. Every safety claim is specific and verifiable; parents are the buyers.
3. Urgency is real, never invented: show live availability per session.
4. Two doors always within reach: enroll (CampBrain) and talk to the directors (booking page).
5. International parents are first-class: travel, supervision, and time zones are explained, not assumed.

## Accessibility & Inclusion

English only. WCAG 2.2 AA.
