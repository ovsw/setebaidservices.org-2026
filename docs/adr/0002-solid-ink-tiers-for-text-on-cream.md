# 2. Solid ink tiers replace alpha text on cream

Date: 2026-09-17

## Status

Accepted

## Context

The Translucent Ink Rule said that secondary text, borders, and dividers are
the field's text colour at reduced alpha. It kept the palette to thirteen
colours and it made new components easy to write. For text it does not work.

Alpha is not a colour; it is a recipe that the surface finishes. The same
`text-pine-night/65` is one contrast ratio on Birch Bark and a lighter one on
Birch Bark Bright, and a third on a card that sits on either. A contrast audit
on 2026-09-16 (axe-core 4.13, nine routes, production build) found 35 failing
nodes, all of them on cream. Measured on Birch Bark Bright: `/45` was 2.75:1,
`/55` 3.67:1, `/65` about 4.2:1, `/70` 4.36:1. Only `/75` and above cleared
WCAG 2.2 AA. Because of the failures, the e2e accessibility scan ran with the
`color-contrast` rule switched off, so new regressions were invisible.

Text on dark fields (Birch Bark at 66-75%) passes at its current values and is
not part of this.

## Decision

Text on cream is a solid colour. Two named tiers carry everything that used to
be an alpha:

| Tier | Value | On Birch Bark | Replaces |
| --- | --- | --- | --- |
| `ink-soft` | `oklch(44.5% 0.034 133)` | 6.5:1 | text alpha 75-85% |
| `ink-muted` | `oklch(50% 0.034 133)` | 5.1:1 | text alpha 45-72% |

Both keep Pine Night's hue (133) and chroma (0.034) and raise only the
lightness, so they read as the same ink, not as a new grey. They are OKLCH
literals, not `color-mix()`, so the value is inspectable in the token file and
identical on both creams. `--color-muted-foreground` is `ink-muted`, which
moves the shadcn-derived components (card descriptions, placeholders,
breadcrumbs, dialog descriptions) onto a tier with no per-component edits.

The target is WCAG 2.2 AA (4.5:1 normal, 3:1 large), with a working margin of
5:1 against Birch Bark, the darker cream. The margin is what keeps a later
nudge to a cream or an ink value from silently failing the bar.

The Translucent Ink Rule survives, narrowed: borders, hairlines, dividers,
backgrounds, and gradient scrims still take the field's text colour at reduced
alpha. Only text left.

A companion rule was added at the same time: Campfire Amber is never text below
large size on cream. It may be a marker, an underline, a border, or a
background behind ink.

## Consequences

- **The whisper tier is gone.** `text-pine-night/45` was a real design tool for
  the quietest labels, and 45% and 70% now land on the same colour. Quiet is
  expressed with size, weight, and tracking from here on, not with fade.
- Around 40 classes across 15 component files moved in one pass. `rg -n
  "text-pine-night/|text-foreground/" frontend/components frontend/app` must
  keep returning nothing; that command is the check that the rule holds.
- Panels on Birch Bark Bright now match their siblings on Birch Bark exactly,
  because the ink no longer takes a tint from the surface.
- Two more names in the design language. The cost is real but small: a new
  component picks a tier instead of guessing a percentage, and the guess was
  the failure mode.
- No mirror tiers for dark fields. Text on dark passes today; add
  `cream-muted` only when a dark-surface text actually fails.
- Restoring alpha text as a "cleanup" would re-break AA. That is the reason
  this record exists.
- The e2e axe scan can turn `color-contrast` back on once the carousel and the
  table-of-contents link are fixed too (issue #163).

## References

- Spec: ovsw/canadianadventurecamp.com-2026#161
- Ticket: ovsw/canadianadventurecamp.com-2026#162
- `frontend/DESIGN.md`, Colors → Ink tiers, and the Named Rules below it.
