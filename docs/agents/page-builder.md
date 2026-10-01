# Page Builder sections

Read this guide before adding or changing a section in a page's `blocks` array.

For page content drafting, use existing types and fields only. General
sections describe presentation layouts, not content topics; specialized
sections such as a facilities map retain their specific purpose. Preserve
the complete copy with the closest existing layout and record any proposed
schema or layout change on the Basecamp card. The development instructions
below apply only to a separately authorized section-development task.

## How a section reaches the page

A top-level section passes through this flow:

1. A Sanity schema defines its fields.
2. The Page schema allows editors to insert it.
3. A GROQ projection selects the data the frontend needs.
4. Sanity TypeGen turns the schema and query into TypeScript types.
5. The frontend block dispatcher selects its React renderer.

The section's Sanity `_type` is the shared identifier across every step. Keep it exact and use the existing camelCase naming convention.

## Section spacing

The block dispatcher decides the vertical padding of every section. A section
does not decide its own padding.

**Seam and edge rule.** Each section has a top boundary and a bottom boundary.
A boundary is a seam or an edge. Two neighbours meet at a seam when they
resolve to the same background and the upper one is not a hero. Every other
boundary is an edge. A tucker tucks only when its background differs from the
section above; on a matching background its curve would be invisible, so it
seams like a normal section. The first section's top is an edge. The last
section's bottom is an edge, and the footer tucks under it.

**Values.** A seam gets half the section rhythm: `--section-pad` multiplied
by `--seam-factor` (0.5). An edge gets the full rhythm. An edge above a tucker
gets the full rhythm plus `--section-overlap`, so the tucker's curve does not
eat the padding. These values live in `frontend/app/globals.css` next to the
rhythm tokens. Change them there. Do not change the resolver for a pixel
change.

**Wrapper attributes.** The resolver in
`frontend/components/blocks/section-boundaries.ts` runs once per page on the
server. The dispatcher in `frontend/components/blocks/index.tsx` writes its
result on the wrapper element as four boolean data attributes:

- `data-seam-top`: the top boundary is a seam.
- `data-seam-bottom`: the bottom boundary is a seam.
- `data-tuck`: this section overlaps the section above.
- `data-tuck-below`: the next section, or the footer, tucks under this one.
- `data-mirror`: this section holds an odd position in a run, so it flips.

A section reads these attributes from its wrapper in CSS. It never receives
them as a prop, and it never reads the DOM or its neighbours.

One stylesheet rule maps the attributes to `--section-pad-top` and
`--section-pad-bottom`. The `py-section` utility reads those two properties.
Put `py-section` on the section element. Put content in a `container-content`
div inside it.

**Bands.** `resolveSectionBands` in the same file groups seam-joined
sections into bands, and the dispatcher wraps each band in a div with
`data-band="<background>"` and `data-band-tuck` when its first section
tucks. Green and night bands carry a warm glow sweep and a grain overlay
that span the whole run, so the texture does not restart at a seam. The
band paints no background; sections keep their own colour. The glow, shade,
and grain tokens live in `frontend/app/globals.css` next to the rhythm
tokens.

**Trait table.** `sectionTraits` in `section-boundaries.ts` is a `Record`
keyed by every block `_type`. A new section type without an entry fails
typecheck. Declare traits like this:

- `{}`: a normal section. The editor picks the background.
- `{ tuck: true }`: a rounded-top section that overlaps the section above
  when their backgrounds differ. Do not add `rounded-t-section`, a negative
  margin, or a z-index on the section; the wrapper applies all three, and
  only while the section tucks.
- `{ background: "night", tuck: true }`: a fixed background. The editor field
  is ignored. Also add the `_type` to `FixedBackgroundType` in the same file,
  and omit `background` from its GROQ projection.
- `{ background: "photo", hero: true }`: a full-bleed hero. The boundary
  below a hero is always an edge.
- `{ alternate: true }`: a section that flips its photo to the other side
  when it follows one of its own kind. Neighbouring sections of the same
  alternating type that each carry a photo form a **run**; odd positions in
  the run get `data-mirror`. A section without a photo, or of a different
  type, ends the run. Background never affects run membership.

**Overlap token.** `--section-overlap` is the distance a tucker reaches up
over the section above. It equals `--radius-section`, so the curve starts at
the boundary. The footer is not in the section list. It applies the same
token itself in `frontend/components/footer/site-footer.tsx`.

**Bleeds.** A section may ignore the computed padding on one side only. Do
this only where the edge element on that side is a full-bleed image. The
bleed must not depend on the neighbour. Text and buttons always keep the
computed padding.

**Module constraint.** A section's CSS module never sets vertical padding on
the section element. Modules keep layout mechanisms that do not fit
utilities: grid tracks, sticky frames, scroll-driven animation, keyframes.

## Add a top-level section

Create the vertical slice with the generator, then shape its three files together:

```bash
pnpm page-builder:new <name> --title "Studio title"
```

The default `content` scope makes the section available on regular and home
pages. Use `--scope general` or `--scope home` for a page-specific section.
Pass `--preview ./image.jpg` when the Studio grid preview is ready. Use
`--dry-run` to inspect the planned paths without writing.

The generator:

- creates the Studio schema in `studio/schemas/blocks/`;
- registers the schema and Page Builder scope;
- creates and registers the GROQ projection;
- creates and registers a typed React renderer with click-to-edit attributes;
- copies and registers an optional Studio preview image.

After generation, replace the starter `title` and `description` fields with the
chosen section's real content model. Keep the schema, query, and renderer in
sync. Run TypeGen once after those shapes settle.

Then complete the section in Sanity. Back up the dataset, locate the intended
draft page, insert the section, and populate every required field with supplied,
reference, or practical draft content. Generator output alone is not complete.

For a manual addition, preserve the mirrored folder structure in Studio,
queries, and renderers.

1. Define the Studio schema in `studio/schemas/blocks/`.
2. Register the schema and any supporting object schemas in `studio/schema-types.ts`.
3. Add the top-level type to the Page schema's `blocks.of` list in `studio/schemas/documents/page.ts`.
4. Add the type to one insert-menu group in the same file.
5. Add its preview image at `studio/static/images/preview/<type>.jpg`. The Page schema resolves this path by `_type`.
6. Create its GROQ projection in `frontend/sanity/queries/` and interpolate it into `frontend/sanity/queries/page.ts`.
7. Create its React renderer in `frontend/components/blocks/` and register it in the `componentMap` in `frontend/components/blocks/index.tsx`.
8. Declare its spacing traits in `frontend/components/blocks/section-boundaries.ts`. See "Section spacing".
9. Run TypeGen once after the schema and query settle. Do not edit
   `studio/schema.json` or `frontend/sanity.types.ts` by hand.
10. Back up the dataset, add the section to the intended draft page, and fill its
    final content shape.

## Add a nested block

A nested block is an object used only inside another section, such as a card inside a grid. It still needs a Studio schema registration, a parent GROQ projection, and a React renderer or parent rendering logic. It does not belong in the Page schema's `blocks.of`, Page insert-menu groups, or the top-level `componentMap` unless editors can insert it directly as a page section.

## Change an existing section

Other development worktrees may be editing the same block. Before changing
it, inspect unmerged branch changes for the affected schema, query, and
renderer files. Coordinate overlapping work rather than overwrite it.
Content drafts use existing schemas; schema changes require their own
development task and the migration checks below.

Trace the whole vertical slice before editing:

- Studio fields: `studio/schemas/blocks/`
- GROQ data shape: `frontend/sanity/queries/`
- Generated types: `frontend/sanity.types.ts`
- React rendering: `frontend/components/blocks/`

When a field is added, renamed, removed, or changes type or structure, update
the schema and projection together, regenerate types, inspect every affected
Sanity document, and migrate content that no longer matches the stored shape.
Preserve each document's draft or published state.

For visual changes, treat the existing design system as the default:

- Reuse tokens from `frontend/app/globals.css`.
- Reuse the section shell (`sectionThemeClass`, `py-section`, `container-content`), shared buttons, and nearby block patterns before adding a new primitive.
- Check the full page and mobile layout, not only the section in isolation.
- Introduce a one-off value or variant only when the design intentionally requires it.

## Definition of done

- The same `_type` is present at every required top-level registration point.
- The GROQ projection returns every field the renderer uses.
- The section has an entry in the trait table, and its module sets no vertical
  padding on the section element.
- The section exists on the intended Sanity draft with complete content in the
  final schema shape.
- Every affected existing document has been migrated; Ovi is not left with
  content entry or reshaping work.
- The GROQ query returns the updated dataset content used by the renderer.
- Generated files are current and are not manually edited.
- The handoff names the backup path and every document created or changed.
- Ovi has the exact URL, viewport, state, and actions needed to test the section.
- Add automated tests only for destructive data work, security or authorization,
  subtle pure logic that is hard to verify manually, or an expensive regression.

`pnpm verify` is reserved for an explicitly requested pull-request or release
gate. Do not run it during Page Builder iteration.
