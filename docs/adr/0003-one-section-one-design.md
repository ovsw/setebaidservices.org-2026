# 3. One section, one design

Date: 2026-11-06

## Status

Accepted. Decided with Ovi on 2026-11-06 after the Alumni page bug (a
Feature Cards section drew nothing because its cards were filled for the
tilted design while the section used the grid design). Implementation is
tracked in [issue #112](https://github.com/ovsw/setebaidservices.org-2026/issues/112).

## Context

The home page prototype (#29) gave six Page Builder sections a second or
third design, chosen in a `layout` field (`variant` on `ctaBanner`):
`featureCards`, `benefitCards`, `stackedTimeline`, `quoteWall`,
`imageCollageFeature`, `ctaBanner`. That is thirteen designs behind six
catalogue thumbnails. By 2026-11-06, 44 blocks on about 30 pages used a
non-default design, so the pattern had spread well beyond the home page.

The cost showed up in three places:

- The catalogue thumbnail shows one design. An editor who picks a section
  from the catalogue cannot see what a different `layout` value will draw.
- Each design shows and hides different fields through `hidden` rules, so
  the editor fills a form that changes under them. A field hidden for one
  design can still be filled through the API, and then renders nowhere, or
  makes the renderer drop the whole section. That is the Alumni bug.
- The boundary resolver and the renderers carry special cases keyed on the
  field value (`ctaBanner` with `variant == "photo"` resolves to a photo
  background), so a section's behaviour depends on data, not on its type.

The alternative was to keep one type per family and improve the dropdown:
thumbnails per option, stricter validation per design. Sanity's array
insert menu shows one preview per type, not per field value, so the
thumbnail problem does not go away, and validation per design keeps the
form-that-changes problem.

## Decision

A section is one entry in the Page Builder catalogue: one `_type`, one
thumbnail, one design, one set of fields. A section never changes its
design through a field. A second design is a second section with its own
`_type`, its own fields, its own preview image, and its own entry in the
trait table.

The six grandfathered sections are split: the existing `_type` keeps its
default design, and each extra design becomes a new section. Each new
section carries only the fields its design renders, with its own nested
objects where the fields differ (a tilted feature card is not a grid
feature card). Stored content moves to the new types in one migration that
preserves each document's draft or published state.

The section `background` field (Cream, Sand, Forest) is not a design. It
stays on every section.

## Consequences

- Seven more catalogue entries: `tiltedFeatureCards`, `ringPhotoBenefits`,
  `dateCards`, `quoteTrack`, `bentoCollage`, `nudgeBanner`, `photoBanner`.
  The catalogue is longer, and every entry means what its thumbnail shows.
- No `hidden` rule keyed on a design, and no special case keyed on a field
  value in the boundary resolver: `photoBanner` is a fixed `photo`
  background in the trait table.
- A new design proposed for an existing section is a new section. An agent
  never adds a `layout` or `variant` field; an exception needs Ovi's
  express approval before the work starts.
- The migration rewrites `_type` on 44 blocks, so old code and new data
  cannot overlap. The cutover accepts a few minutes in which the seven
  designs render as their default design until the migration has run.
- Renderer code is shared as modules where two sections draw the same
  piece (quote dialog, card frames); schemas share nothing that would bring
  hidden fields back one level down.
- The terms "layout", "variant" and "look" leave the vocabulary
  (`GLOSSARY.md`, Section). "Layout" in the ownership rules means CSS and
  stays.

## References

- `GLOSSARY.md`, Section.
- `docs/agents/page-builder.md`, the "one section, one look" rule and the
  trait table.
- [Issue #112](https://github.com/ovsw/setebaidservices.org-2026/issues/112).
