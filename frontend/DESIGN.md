---
name: Setebaid Services
description: Sunlit Camp. Warm cream ground, camp green, a marigold sun and lake sky, with a handwritten note in the margin.
colors:
  cream: "#FBF7EC"
  white: "#FFFFFF"
  sand: "#F1E7CE"
  ink: "#1C3B2C"
  ink-soft: "#3E5A4B"
  mist: "#CFD9D0"
  camp-green: "#1A7F52"
  camp-green-deep: "#14653F"
  logo-green: "#1A8B5A"
  marigold: "#F2B93D"
  marigold-deep: "#E0A529"
  marigold-ink: "#86580A"
  lake-sky: "#7CBBDD"
  lake-ink: "#2C6587"
  error: "#A93A23"
  line: "rgb(28 59 44 / 0.14)"
  line-on-dark: "rgb(251 247 236 / 0.15)"
typography:
  display:
    fontFamily: "Work Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3rem, 1.6rem + 5vw, 5.25rem)"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Work Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.5rem + 2.2vw, 3.125rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.02em"
  title-lg:
    fontFamily: "Work Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.625rem, 1.25rem + 1vw, 2rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Work Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  statement:
    fontFamily: "Work Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 0.9rem + 1vw, 1.625rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  quote:
    fontFamily: "Work Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.4
  lead:
    fontFamily: "Merriweather, Georgia, serif"
    fontSize: "clamp(1.125rem, 1rem + 0.4vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Merriweather, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  small:
    fontFamily: "Merriweather, Georgia, serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  eyebrow:
    fontFamily: "Work Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0.08em"
  label:
    fontFamily: "Work Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.35
  note:
    fontFamily: "Caveat, cursive"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.1
rounded:
  xs: "2px"
  sm: "8px"
  md: "12px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "7": "28px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "16": "64px"
  "24": "96px"
  "30": "120px"
  gutter: "clamp(20px, 5vw, 32px)"
  section: "clamp(64px, 9vw, 96px)"
components:
  button-primary:
    backgroundColor: "{colors.camp-green}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.camp-green-deep}"
  button-highlight:
    backgroundColor: "{colors.marigold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
    height: "44px"
  button-highlight-hover:
    backgroundColor: "{colors.marigold-deep}"
  button-outline:
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
    height: "44px"
  button-hero:
    padding: "16px 28px"
    height: "52px"
  card-light:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "32px"
  card-tint:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "28px"
  card-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
    rounded: "{rounded.md}"
    padding: "28px"
  date-badge:
    backgroundColor: "{colors.marigold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
---

# Design System: Setebaid Services

## Overview

**Creative North Star: "Sunlit Camp"**

The site feels like a bright afternoon at camp: a warm cream ground, deep camp green, and one marigold sun. Lake sky shows up as the cool shade, and a counselor's handwritten note sits in the margin. It is warm and plain-spoken, and the photographs of children at camp carry it. Parents read calm, sturdy type. Kids see the energy in the photos, the handwritten notes and the scribbled arrows.

The system grew from the Claude Design prototype (`frontend/prototype/Home-Page-Prototype.html`). It takes the colours of direction 1A "Sunlit camp" and the type of direction 1C "Warm nonprofit". Earlier versions of the prototype are in `frontend/prototype/exports/SetebaidServices.org/`.

Density is moderate. Sections are full-width fields of cream, sand or dark forest green, with soft glows pooling in the corners and a fine grain over them. Content sits on a 1240px measure. Cards are flat fills with no outline. Depth comes from tone and glow, and shadows appear only under things that float over another layer.

Confirmed rejections (from PRODUCT.md and the homepage brief): no clinic or hospital look, no generic stock summer camp, no wall of text at the top, and cost and campership are never hidden.

**Key Characteristics:**
- Cream ground, camp green for action, marigold for warmth and giving, lake sky as the cool second colour.
- Work Sans 800 for headlines, Merriweather for every sentence, Caveat for the handwritten note.
- One accent phrase per headline, set in the `emphasis` colour: logo green on Cream, camp green deep on Sand, marigold on Forest.
- 8px buttons, 12px cards, circles for portraits and the photo ring.
- Glow and grain on the fields; flat fill cards; four elevation levels, and shadows only on the top two.

## Colors

A summer afternoon: cream paper, deep greens, one marigold sun, and a lake.

Colour has two layers, both in `frontend/app/globals.css`:

1. **Brand colours** (`--brand-*` in `:root`). This is the palette described below and in the frontmatter. It sits outside Tailwind's `@theme`, so Tailwind makes no classes for it, and component code cannot use it.
2. **Job tokens** (`--color-*` in `@theme`). Each one says what a colour is for (background, foreground, primary, link…) and points at a brand colour. Tailwind makes classes for them (`bg-primary`, `text-link`, `border-border`). Component code uses only these.

### Primary
- **Camp Green** (#1A7F52): the main action colour: Register buttons, links, small labels on cream and white. White text on it passes AA (5.0:1). **Camp Green Deep** (#14653F) is its hover, and it replaces camp green for small text on sand.
- **Logo Green** (#1A8B5A): the green of the logo. Use it for the photo rings, thick rules, the brand mark, and the accent phrase in a headline. It is under 4.5:1 on cream, so never use it for small text.

### Secondary
- **Marigold** (#F2B93D): the warm accent. Donate and other giving buttons, the date badge, highlight fills, links and the accent phrase on the dark field, decorative dots. Always set ink on top of it (6.9:1). **Marigold Deep** (#E0A529) is its hover. **Marigold Ink** (#86580A) is marigold as small text on light.

### Tertiary
- **Lake Sky** (#7CBBDD): the cool second colour. Quote and event card fills, rules, the Tier IV campership strip tint. Ink on top (5.9:1). **Lake Ink** (#2C6587) is lake sky as small text on light.

### Neutral
- **Cream** (#FBF7EC): the page ground and the default field. Text colour on the dark field.
- **White** (#FFFFFF): cards, the pricing panel, inputs, popovers.
- **Sand** (#F1E7CE): the second light field and quiet fills; photo placeholders.
- **Ink** (#1C3B2C): headings and primary text, and the dark field ("Forest").
- **Ink Soft** (#3E5A4B): body and secondary text on light fields (7.1:1 on cream).
- **Mist** (#CFD9D0): secondary text on the dark field (8.5:1 on ink).
- **Line** (ink at 14%): hairlines and button outlines on light. **Line on Dark** (cream at 15%) on the dark field.
- **Error** (#A93A23): errors and destructive actions only.

### Job tokens

**Field tokens.** These follow the section's field (see Fields below). The `@theme` defaults are the Cream values.
- `background`: the section ground.
- `foreground`: headings and primary text.
- `muted`: a quiet fill for placeholders and table stripes.
- `muted-foreground`: body and secondary text.
- `card`, `card-foreground`: cards and panels on the field, and their text.
- `popover`, `popover-foreground`: menus and popovers. White with ink text on every field.
- `border`: hairlines, outlines and dividers.
- `input`: form field borders.
- `ring`: focus rings (the `focus-ring` utility).
- `link`: links, eyebrows and small accent text.
- `emphasis`: the accent phrase in a headline. Heading sizes only.
- `accent`, `accent-foreground`: the shadcn meaning, a quiet hover or selected background. It is not marigold.
- `secondary`, `secondary-foreground`: the shadcn subtle fill.

**Action tokens.** These are the same on every field.
- `primary`, `primary-foreground`, `primary-hover`: camp green with white text, camp green deep on hover. The main action, such as Register.
- `highlight`, `highlight-foreground`, `highlight-hover`: marigold with ink text, marigold deep on hover. Giving actions, badges and text selection.
- `destructive`, `destructive-foreground`: error red with white text.
- `mark`: logo green. Brand marks, photo rings and thick rules.

**Card fills.** These are the same on every field: decorative fills for rows of cards. Make a coloured card with a `card-*` utility, which paints the fill and re-points the text tokens inside it (`foreground`, `muted-foreground`, `link`, `emphasis`, `border`, `ring`), so the card reads correctly on any field. The bare `fill-*` tokens are for bars, dots and rules.
- `card-quiet` (`fill-quiet`): sand with ink text; links and emphasis in camp green deep.
- `card-warm` (`fill-warm`): marigold with ink text; links, emphasis and secondary text all ink (only ink passes on marigold).
- `card-cool` (`fill-cool`): lake sky with ink text; links, emphasis and secondary text all ink.
- `card-deep` (`fill-deep`): ink with cream text, mist secondary text, marigold links and emphasis.
- `card-bold` (`fill-bold`): camp green with white text throughout.
- `warm-text`, `cool-text`: marigold ink and lake ink, for small warm or cool text on a light background.

**Deprecated CAC aliases.** `pine-night`, `birch-bark`, `birch-bark-bright`, `campfire-amber`, `cedar`, `forest-floor`, `forest-panel`, `forest-900`, `lake-night`, `moss`, `sunlit-moss`, `navigation-yellow`, `ember-red`, `cream`, `ink-soft`, `ink-muted` and their `-deep` forms point at fixed brand colours, because CAC code used them as literal colours. They do not follow the field. Never use them in new code; delete each one when the last block that uses it is rebuilt. The same applies to `--section-accent` and `--section-surface`, which CAC blocks still read.

### Fields

A field is a section background. Editors pick Cream, Sand or Forest for each section in Studio; the stored values are `white`, `cream` and `green`. `sectionThemeClass()` in `frontend/components/blocks/section-theme.ts` maps them to the utilities `field-cream`, `field-sand` and `field-forest`. Each utility paints the ground and re-points the field tokens for everything inside the section, so the same markup is correct on all three fields with no "on dark" variants. The last section before the dark footer cannot be Forest.

| Token | Cream | Sand | Forest |
| --- | --- | --- | --- |
| `background` | cream | sand | ink |
| `foreground` | ink | ink | cream |
| `muted-foreground` | ink soft | ink soft | mist |
| `card` | white | white | cream 7% over ink |
| `border`, `input` | line | line | line on dark |
| `ring` | camp green | camp green deep | marigold |
| `link` | camp green | camp green deep | marigold |
| `emphasis` | logo green | camp green deep | marigold |
| `muted`, `accent`, `secondary` | sand | cream | cream 8 to 10% over ink |

### Named Rules
**The Job Token Rule.** Component code uses only job tokens (`bg-primary`, `text-link`, `card-warm`…). Brand colours exist only in `globals.css`, and Tailwind generates no classes for them. A rebrand changes one file.

**The Ink-on-Colour Rule.** Marigold, lake sky and sand always carry ink text: use `highlight-foreground` and the `card-*` utilities. Only camp green, camp green deep, error and ink (the Forest field and `fill-deep`) carry light text.

**The Big Green Rule.** Logo green (`mark`, and `emphasis` on Cream) is for marks, rings, rules and heading-size words. Small green text uses `text-link`, which is camp green on Cream and camp green deep on Sand. Never use `text-emphasis` or `text-mark` for small text.

**The Sun Rule.** Marigold is the sun: one or two `highlight` or `card-warm` elements per screen (a Donate button, a badge, a dot). A page where everything is marigold has no sun.

## Typography

**Display Font:** Work Sans (variable; fallback system sans)
**Body Font:** Merriweather (variable with optical size; fallback Georgia)
**Note Font:** Caveat 600 (fallback cursive)

**Character:** Work Sans at 800 is plain, strong and friendly, with no decoration. Merriweather is built for long reading on screens and gives sentences a calm, established voice. Caveat is the counselor's hand.

### Hierarchy
- **Display** (800, clamp 48px to 84px, line-height 0.96, -0.03em): the hero headline and the name-story words. Utility `text-display-hero`.
- **Headline** (800, clamp 36px to 50px, 1.04, -0.02em): section openers. One phrase may switch to the emphasis colour (`text-emphasis`). Utility `text-headline`.
- **Title Large** (800, clamp 26px to 32px, 1.1, -0.015em): camp names, the featured news title, prices. Utility `text-title-lg`.
- **Title** (800, 22px, 1.2, -0.01em): card, event and news titles. Utility `text-title`.
- **Figure** (800, 40px, 1, tabular numbers): a date that anchors a card. Utility `text-figure`.
- **Statement** (800, clamp 20px to 26px, 1.15) and **Statement Small** (700, clamp 18px to 22px, 1.3): short claims inside a card. Utilities `text-statement`, `text-statement-sm`.
- **Quote** (700, 18px, 1.4): testimonial text, in Work Sans. Utility `text-quote`.
- **Lead** (Merriweather 400, clamp 18px to 20px, 1.6): the paragraph under a hero or section headline, 40 to 64ch wide. Utility `text-lead`.
- **Body** (Merriweather 400, 16px, 1.7): running text, at most about 65ch. Utility `text-body`.
- **Small** (Merriweather 400, 15px, 1.6): card blurbs and notes under a table. Utility `text-small`.
- **Eyebrow** (Work Sans 600, 14px, 0.08em, uppercase): a short label of one to three words above a heading or at the top of a card. Utility `text-eyebrow`.
- **Label** (Work Sans 600, 14px, sentence case): dates, places, roles, chips. Utility `text-label`.
- **Note** (Caveat 600, 28px, or 24px for `text-note-sm`): captions, signatures, margin notes, often rotated 2 to 3 degrees. Utilities `text-note`, `text-note-sm`.

Buttons use Work Sans 600 at 15px (`typo-button`) or 17px (`typo-button-lg`).

### Named Rules
**The Sentence Rule.** Every sentence is Merriweather; every heading, label, button and link is Work Sans. The base stylesheet sets `p` to Merriweather; a paragraph that is really interface text opts out with `font-ui`.

**The One Hand Rule.** Caveat appears once or twice per section, as a short note of a few words, never as a heading and never for interface text.

**The Short Caps Rule.** Uppercase is for eyebrows of one to three words only. Status lines and sentences stay in sentence case.

## Layout

Content sits on a 1240px container with a fluid gutter (`container-content`): 20px on a phone, 32px on a desktop. Sections are full-width fields. The block dispatcher sets section padding from `--section-pad` (64px on a phone, 96px on a desktop) and halves it at a seam between two sections on the same field.

**Spacing scale.** A 4px base, written as Tailwind steps: 1 (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px), 6 (24px), 7 (28px), 8 (32px), 10 (40px), 12 (48px), 16 (64px), 24 (96px), 30 (120px). Do not use other values.

**Rhythm.**
- 40px between a section's heading block and its content.
- 16px between an eyebrow and its headline.
- 24px between a headline and its lead.
- 16px gaps in photo mosaics and quote rows, 20px in card grids, 32px between feature columns.
- 28px inside small cards, 32px inside large cards and panels.

**Grids from the prototype.** Text and media pairs at 11fr/9fr or 5fr/7fr. Card rows in two, three or four equal columns. A bento of 4 columns and 2 rows for staff and news. Pricing rows at 170px / 1fr / 260px. Photo strips at 5fr 4fr 6fr 4fr 5fr with alternate photos dropped 40px.

**Responsive.** The prototype is desktop only; each section decides its own small-screen layout when it is built. Breakpoints the content needed in a trial: 640px (two-up cards), 768px (two-column text and media), 900px (pricing rows, news and footer grids), 960px (hero two columns), 1024px (four-up cards, staff grid), 1080px (full header navigation; below it, a menu button). Wide rows of cards or photos become horizontal swipe rows on phones.

## Elevation & Depth

The system is flat with tonal layering. Fields change colour; cards sit on the field as flat fills. Glows give the fields light and warmth, and a fine grain sits over them. Shadows belong only to the two upper levels below.

**Glows.** Soft radial light in the corners of a field, at 90% strength (`--glow-intensity`). The dark field uses marigold at the top right, a green glow rising from the bottom left, and a shade at the bottom (`--band-glow`, `--band-glow-green`, `--band-shade`); the section system paints these over each dark band. Light fields use sun (`--glow-sun`), peach (`--glow-peach`) and daylight (`--glow-daylight`), placed differently in each section so the page does not repeat. Light-field glows belong to each section's own background when the section is built.

**Grain.** A fine noise over the glows (`--grain-image`), soft-light on dark fields.

### Elevation Levels
- **0, Page:** the fields and the section edges. No shadow. Sections that overlap at a tuck or a smile stay at this level; the shape carries the overlap.
- **1, Resting:** cards on a field: fill cards, light cards, flip cards, quote cards, pricing panels, inputs and badges. No shadow and no outline; the fill separates them from the field. A light card on a light field may take a 1.5px `border-border` edge when the fill alone does not show.
- **2, Raised** (`shadow-raised`): an element that floats over another layer: the floating nav, the date badge over a photo, photo tiles, the staff card. A cut-out image (the director portrait) takes `drop-shadow-raised`, which follows its outline; on a dark field it takes `drop-shadow-raised/55`, because a shadow reads less on dark.
- **3, Overlay** (`shadow-overlay`): a short-lived layer above the page: the nav menus, dropdowns, dialogs, sheets, toasts and the video lightbox.

### Shadow Vocabulary
- **Raised** (`--shadow-raised`: `0 1px 2px` ink 8%, `0 12px 28px -12px` ink 32%): level 2.
- **Overlay** (`--shadow-overlay`: `0 2px 6px` ink 8%, `0 24px 56px -16px` ink 40%): level 3.
- **Raised drop** (`--drop-shadow-raised`: `0 28px 34px rgb(13 18 8 / .22)`): level 2 for a cut-out image.
- **Lift** (`--shadow-lift`): a button or a linked card on hover. An interaction, not a level.
- **CTA** (`--shadow-cta`): the one emphasised primary action on a page.
- **Highlight** (`--shadow-highlight`): the same emphasis for a highlight (giving) button.

Shadows mix brand colours (`color-mix` with `--brand-ink`, `--brand-camp-green`, `--brand-marigold`), so a palette change carries into them. Use only these tokens: no stock `shadow-sm` to `shadow-2xl`, and no one-off shadow values.

### Named Rules
**The Flat-at-Rest Rule.** Levels 0 and 1 have no shadow. A shadow appears only on an element that floats over another layer (level 2), on a short-lived layer (level 3), or on hover.

## Shapes

Gentle corners and full circles. Buttons, inputs and small fills are 8px (`rounded-sm`, `rounded-control`). Cards, photos and panels are 12px (`rounded-md`). Portraits, the play button, dots and the photo ring are circles. Bars and rules are 2px.

**The photo ring.** A round photo inside a thick logo-green ring (`mark`) that is open on one side (the left quarter is transparent), turned to a different angle each time. It echoes the turning arrow of "turn diabetes around". Large faint rings in the background repeat it.

**The Straight Photo Rule.** Photos are never tilted, skewed or set at an angle, in any section. They sit square, so the page feels steady for parents making a decision; the children in the photos carry the energy. Only the handwritten notes tilt, 2 to 3 degrees.

**The ticket edge.** The Tier IV campership row is cut off from the panel by a dashed line with two half-circle notches, like a ticket stub.

## Components

### Buttons
Clear, solid and friendly. The variants are in `frontend/components/ui/button.tsx`.
- **Shape:** 8px corners (`rounded-control`).
- **Primary** (`primary`; the CMS calls it `default`): `bg-primary` with `text-primary-foreground`, 44px tall, 20px side padding, Work Sans 600 15px. Hover: `bg-primary-hover`. Used for Register and the main action of a section.
- **Highlight** (`highlight`; stored `copper` renders the same): `bg-highlight` with `text-highlight-foreground`. Hover: `bg-highlight-hover`. Used for Donate and giving actions. This variant was called "accent" before.
- **Outline** (`outline`; the CMS calls it `secondary`): transparent, with a 1.5px `border-border` edge and `text-foreground`. Hover: `bg-card` and a half-strength `link` border. The tokens follow the field, so the outline is correct on Forest with no extra flag.
- **Ghost:** `text-foreground`, with a `bg-accent` hover.
- **Link:** `text-link`, underlined on hover.
- **Destructive:** `bg-destructive` with `text-destructive-foreground`.
- **On a photograph:** a photograph is not a field, so the outline and ghost variants take `onDark` there to get a light edge and white text. Do not use `onDark` on the Forest field.
- **Hero size:** 52px tall, 28px side padding, 17px text. Use it for the main action in a hero or the donate band.
- **Focus:** the `focus-ring` utility: a 2px ring, 3px offset, in `ring` (camp green on Cream, camp green deep on Sand, marigold on Forest).
- **Arrows:** a trailing "→" after the label for actions that go somewhere ("Register →").

### Eyebrow + Headline (signature)
An optional eyebrow (uppercase, `text-link`), 16px, then a headline in `text-foreground`. One phrase of the headline is an `<em>` with `heading-emphasis text-emphasis` ("Two camps, *one week*, same woods."): same font and weight as the headline, colour only, never Caveat and never italic. On a photo or a fixed dark ground, use `heading-emphasis text-highlight`. The field sets both colours. The headline never carries more than one accent phrase.

### Handwritten note (signature)
Caveat 600 at 24 to 28px, rotated 2 to 3 degrees, in `text-muted-foreground`, or white on photos. It can carry a hand-drawn arrow (2px stroke, round caps) that points at what it describes. Used for photo captions, quote signatures and margin asides ("watch a week at camp").

### Cards / Containers
- **Light card:** `bg-card` with `text-card-foreground`, 12px corners, 32px padding. Flat at rest (level 1); it takes `shadow-raised` only when it floats over another layer, as in the image collage.
- **Fill cards:** `card-quiet`, `card-warm`, `card-cool`, `card-deep` or `card-bold`, 28px padding and no border. Inside, use the ordinary job tokens (`text-foreground`, `text-muted-foreground`, `text-link`); the card utility makes them right for its fill. In a row, the fills alternate so no two neighbours match.
- **Photo tile:** 12px corners, the photo covers the tile, a dark gradient at the bottom carries a white note.

### Date badge
A `bg-highlight` tile with `text-highlight-foreground` (or `bg-primary` with `text-primary-foreground`), 12px corners, a small uppercase month (eyebrow) and a large day range (Title Large), overlapping the bottom edge of a photo by 24px, with `shadow-raised`.

### Pricing tiers (signature)
A `bg-card` panel with rows of: tier eyebrow and name, a 44px bar that shows what the family pays (`fill-bold`) and what donors cover (diagonal `fill-warm` stripes on `card`), then the price (Title Large, tabular numbers) and a button. The campership tier sits below a dashed ticket edge on a `fill-cool` tint. Prices and the donor share are always visible.

### Flip card (signature)
A card that turns over on click (0.8s, `--ease-flip`). The front is a fill card with a "worry" statement and a Caveat "turn it around" note with the turn icon. The back is a solid fill with the camp answer. When the row first scrolls into view, the cards peek open in sequence, unless the visitor prefers reduced motion.

### Quote cards
Fill cards with a large quote mark (Work Sans 800, 56px, `text-mark` on `fill-quiet`, otherwise the fill's foreground), the quote in the Quote role, and a Caveat signature over a Label role line. One featured quote per row is a larger light card with a round portrait.

### Inputs / Fields (provisional; not in the prototype)
`bg-card` fill, 1.5px `border-input` border, 8px corners, Work Sans 16px `text-card-foreground`. Focus: border and 2px ring in `ring`. Error: border and message in `destructive`, linked with `aria-describedby`.

### Navigation
The logo at 42px tall on the left, six links in Work Sans 600 16px, then Donate (highlight) and Register (primary) buttons. Below 1080px the links move into a menu button; Register stays visible.

The bar floats: a panel a little wider than the content measure, 12px corners on all four sides, `--header-gap` (12px) below the top of the window and beside it on narrow screens, with `shadow-raised`. At the top of a page that opens with a hero it is see-through, with no edge and no shadow. Over a light hero it hides on the first scroll down, and it comes back only at the top, already see-through. Its menus are level 3 (`shadow-overlay`).

## Do's and Don'ts

### Do:
- **Do** use job tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `text-link`, `text-emphasis`, `bg-primary`, `bg-highlight`, `card-warm`…) and the role utilities (`text-headline`, `text-lead`, `text-eyebrow`, `text-note`…).
- **Do** set a section's background with its field, through `sectionThemeClass()`, and let the field tokens adapt the content.
- **Do** put the matching `-foreground` text on every fill: ink on marigold, lake sky and sand, and white on camp green.
- **Do** set every sentence in Merriweather and every interface word in Work Sans.
- **Do** take spacing from the 4px scale, and section padding from the section system.
- **Do** lead with big photographs of children at camp.
- **Do** show cost, the donor share and the campership tier openly.

### Don't:
- **Don't** use brand colour names in component code. If a job is missing, add a job token in `globals.css`.
- **Don't** use the deprecated CAC names (`pine-night`, `birch-bark`, `campfire-amber`, `cedar`, `forest-floor`, `forest-panel`, `moss`, `ink-muted`…) in new code. They are aliases that will be deleted.
- **Don't** add "on dark" variants for the Forest field; the field tokens already handle it.
- **Don't** use `text-emphasis`, `text-mark` or marigold for small text on light fields.
- **Don't** add a second accent phrase to a headline or a second handwritten note to a small section.
- **Don't** use pill-shaped buttons; buttons are 8px.
- **Don't** tilt, rotate or skew a photo. Only handwritten notes tilt.
- **Don't** set a status line or sentence in uppercase.
- **Don't** make it look like a clinic: no clinical blues, no stock photos, no icon-card rows as the page structure.
