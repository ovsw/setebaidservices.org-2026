# 1. Conversion funnel and header CTAs

Date: 2026-08-24

## Status

Accepted (director-call CTA pending client confirmation, see Consequences)

## Context

The old site captured leads with a generic "Request Info" form. A form that asks
for basic info admits the site failed to answer the question; diligent parents
skip it, and it competes with the enrollment CTA. CAC's actual differentiator in
a sales conversation is the family-run directors themselves.

## Decision

Three-tier funnel:

1. **Website = information tier.** The brochure. It answers all standard
   questions itself. No "Request Info" form anywhere.
2. **Fit quiz = lead capture.** An acquisition asset targeted by ads and
   social, mostly off-site. Asks about the child (age, interests, program
   leanings) and returns a personalized artifact (e.g. a sample week at CAC for
   that camper, emailed as a PDF) in exchange for parent contact info and
   consent. On the website it appears only as in-page blocks, never a header
   CTA.
3. **Director call = sales call.** Booked via a scheduling page; converts a
   lead into a qualified lead.

Header CTAs (the navigation schema allows max 2): **Enroll** (primary,
external CampBrain) and **Talk to the Directors** (secondary, booking page).

Off-season main nav groups (card sort, Whimsical board
`3vNoFam9jPZKggghD9rU5U`): Programs & Activities, The Island, About, Planning,
and Dates & Rates as a direct link. Contact lives in Planning, with a phone
number visible in the header itself.

## Consequences

- Before shipping "Talk to the Directors", confirm with the client that the
  directors will reliably staff the call calendar Sep through Mar. If not,
  fall back to a concrete-deliverable CTA (e.g. "Get the Info Pack"), not
  "Request Info".
- The fit quiz and its artifact generator are marketing assets to build and
  maintain outside the page-builder scope.
- CONTEXT.md's funnel terms (Fit quiz, Director call, Lead, Qualified lead)
  reflect this model; "Info request" was removed.
