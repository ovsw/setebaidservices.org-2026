---
name: Canadian Adventure Camp
description: A field guide to a private island camp. Dark forest greens, map-legend labels, campfire-amber handwriting.
colors:
  campfire-amber: "#E8A23B"
  campfire-amber-deep: "#C9861F"
  pine-night: "#16200F"
  forest-floor: "#35491F"
  forest-panel: "#24331A"
  cedar: "#527033"
  cedar-deep: "#3A5222"
  birch-bark: "#F3EFE2"
  birch-bark-bright: "#FAF7EE"
  sunlit-moss: "#C7DD96"
  moss: "#A9C46C"
  lake-night: "#0D1626"
  ember-red: "#B4441F"
typography:
  display:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "clamp(3rem, 8vw, 6.5rem)"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "-0.025em"
    fontVariation: "'opsz' 96"
  headline:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.625rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  script:
    fontFamily: "Caveat, cursive"
    fontSize: "1.15em"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0"
  body:
    fontFamily: "Archivo, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  body-small:
    fontFamily: "Archivo, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "ui-monospace, Menlo, monospace"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0.01em"
  eyebrow:
    fontFamily: "ui-monospace, Menlo, monospace"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0.02em"
rounded:
  xs: "3px"
  sm: "8px"
  md: "14px"
  lg: "22px"
  xl: "26px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "14px"
  md: "26px"
  lg: "34px"
  xl: "46px"
  section: "120px"
  gutter: "56px"
components:
  button-primary:
    backgroundColor: "{colors.campfire-amber}"
    textColor: "{colors.pine-night}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "16px 30px"
  button-primary-hover:
    backgroundColor: "{colors.campfire-amber-deep}"
    textColor: "{colors.pine-night}"
  button-primary-small:
    backgroundColor: "{colors.campfire-amber}"
    textColor: "{colors.pine-night}"
    rounded: "{rounded.pill}"
    padding: "11px 22px"
  button-ghost-dark:
    backgroundColor: "transparent"
    textColor: "{colors.birch-bark}"
    rounded: "{rounded.pill}"
    padding: "18px 30px"
  button-ghost-light:
    backgroundColor: "transparent"
    textColor: "{colors.pine-night}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  chip-label:
    backgroundColor: "transparent"
    textColor: "{colors.birch-bark}"
    typography: "{typography.label}"
    rounded: "0"
    padding: "0"
  card-light:
    backgroundColor: "{colors.birch-bark}"
    textColor: "{colors.pine-night}"
    rounded: "{rounded.lg}"
    padding: "34px 30px"
  card-dark:
    backgroundColor: "{colors.forest-panel}"
    textColor: "{colors.birch-bark}"
    rounded: "{rounded.xl}"
    padding: "46px 46px 40px"
  input:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.pine-night}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "15px 16px"
---

# Design System: Canadian Adventure Camp

## Overview

**Creative North Star: "The Island Field Guide"**

The site reads like a trail map of Adventure Island that a parent can trust and a kid wants to read. Deep forest greens are the paper; readable annotations are the map legend; a handwritten Campfire Amber script is the note scrawled in the margin by someone who has actually been there. Photos are the terrain. The voice is bold, warm, and confident: big type that says the thing plainly, then a wink in amber.

Density is high but never cramped. Sections are full-bleed colour fields (dark green, pine black, birch cream) that alternate like day and night on the lake, with content sitting on a wide 1320px measure. Inside those fields, information is packed tight: hairline-divided grids, marked chips, session bars, numbered programs. Every interactive thing moves a little when touched. Nothing is decorative for its own sake; the map legend, the stamp, the script all carry meaning.

Confirmed rejections: no soft pastel "summer camp" palette, no rounded-bubbly kid branding, no stock-photo hero with a gradient overlay and centred text. The old site's logo and colours are not binding.

**Key Characteristics:**
- Forest-dark fields as the default canvas; cream fields for money, trust, and forms.
- One accent, Campfire Amber, reserved for action, emphasis, and handwritten notes.
- Three voices of type: Bricolage display, Archivo body, optional monospace for data, plus Caveat script for the human aside.
- Pills are reserved for buttons and nothing else; a label is a mark and a word, with no container; large soft radii belong to media and cards; hairline borders use translucent cream.
- Tonal layering for depth; shadows appear only on lift or under hero media.
- Motion on scroll and hover is constant but short and eased; it reveals, never loops.

## Colors

A forest at dusk, lit by one fire.

### Primary
- **Campfire Amber** (`{colors.campfire-amber}`): the only accent. Primary buttons, the handwritten script word in a headline, eyebrow labels on dark fields, hover fills on arrows and bars, "sold out" stamps, text selection. **Campfire Amber Deep** (`{colors.campfire-amber-deep}`) is its pressed/hover state.

### Secondary
- **Cedar** (`{colors.cedar}`): links on light fields, eyebrow labels on cream, focus borders on inputs, the script word when it sits on cream, hover tint on cabin bunks. **Cedar Deep** (`{colors.cedar-deep}`) is link hover.
- **Sunlit Moss** (`{colors.sunlit-moss}`) and **Moss** (`{colors.moss}`): small positive signals on dark fields (open session markers, availability dots, map trails). Never large areas.

### Neutral
- **Pine Night** (`{colors.pine-night}`): body text on cream; the darkest section field (facilities, world globe); text on amber.
- **Forest Floor** (`{colors.forest-floor}`): the default dark section field (hero, programs, activities, safety).
- **Forest Panel** (`{colors.forest-panel}`): cards and panels sitting on Forest Floor or Pine Night.
- **Birch Bark** (`{colors.birch-bark}`): page background, text on dark fields, light cards. **Birch Bark Bright** (`{colors.birch-bark-bright}`) for the testimonial field.
- **Lake Night** (`{colors.lake-night}`): the globe container only; near-black blue.
- **Ember Red** (`{colors.ember-red}`): one use, the "Full" session marker. Error red if ever needed.

### Ink tiers (secondary text on cream)

Secondary text on cream is a solid ink tier, never Pine Night at reduced alpha.
Each tier keeps Pine Night's hue and chroma and raises the lightness, so it
reads the same on Birch Bark and on Birch Bark Bright.

| Tier | Value | On Birch Bark | Use |
| --- | --- | --- | --- |
| **Ink** (`{colors.pine-night}`) | `oklch(22.8% 0.034 133)` | 14.6:1 | body text, headings, anything primary |
| **Ink Soft** (`ink-soft`) | `oklch(44.5% 0.034 133)` | 6.5:1 | prices, dates, check items, near-primary supporting text |
| **Ink Muted** (`ink-muted`) | `oklch(50% 0.034 133)` | 5.1:1 | card descriptions, labels, captions, nav sub-lines, FAQ answers |

`--color-muted-foreground` is Ink Muted, so shadcn-derived components (card
descriptions, placeholders, breadcrumbs, dialog descriptions) land on a tier
without per-component edits.

**Contrast margin.** Every piece of text on cream reaches at least 5:1 against
Birch Bark, the darker of the two creams. WCAG 2.2 AA asks for 4.5:1; the extra
margin means a small change to a cream or to an ink tier cannot quietly drop the
site below the bar. Birch Bark Bright is lighter, so it always clears the same
text by more.

Translucent neutrals still do the quiet work everywhere text is not involved:
hairlines are Birch Bark at 12-22% on dark and Pine Night at 10-18% on cream.
Text on dark fields stays Birch Bark at 66-75%; it passes at those values.

### Named Rules
**The One Fire Rule.** Campfire Amber touches at most a few elements per viewport: one button, one script word, one label. Its scarcity is what makes it read as "act here."

**Section backgrounds.** Editors choose White (Birch Bark Bright), Cream (Birch Bark), or Green (Forest Floor) with a compact select. Use adjacent backgrounds to separate content where needed. The final section above the dark footer must be White or Cream. Maps, globes, and media heroes keep their fixed backgrounds; maps and globes must be followed by a light section.

**The Translucent Ink Rule.** Borders, hairlines, and dividers are never a new
grey. They are the field's text colour at reduced alpha. Text is not: secondary
text on cream picks an ink tier from the table above, and secondary text on dark
fields is Birch Bark at reduced alpha. Alpha on cream text depends on whatever
sits behind it, which is how the site drifted below AA; see
`docs/adr/0002-solid-ink-tiers-for-text-on-cream.md`.

**The Amber-Is-Not-Text Rule.** Campfire Amber, either tint, is never text below
large size (24px, or 19px bold) on cream. It may be a marker, an underline, a
border, or a background with ink on top. Large amber headings on cream stay
amber where they reach 3:1.

## Typography

**Display Font:** Bricolage Grotesque (variable, opsz 12-96, wght 300-800; fallback sans-serif)
**Body Font:** Archivo (400-700; fallback sans-serif)
**Label/Mono Font:** ui-monospace, Menlo, monospace (system; no webfont)
**Script Font:** Caveat (500, 600; fallback cursive)

**Character:** Bricolage at 800 with tight tracking is loud and a little quirky, like a hand-painted camp sign. Archivo underneath is plain and legible, the parent-facing voice. Annotations stay readable and sentence case; system monospace is reserved for data where it improves scanning. Caveat is one human hand writing over all of it.

### Hierarchy
- **Display** (800, clamp 3rem to 6.5rem, line-height 0.96, tracking -0.025em): hero headline only. One word or phrase of it is swapped to Script in Campfire Amber.
- **Headline** (800, 58px desktop, line-height 1.02, tracking -0.02em): section openers. Pine Night on cream, Birch Bark on dark.
- **Title** (700, 19-30px, line-height 1-1.1): card and program titles, stat numbers, nav wordmark at 15px with +0.04em tracking. Use `text-title` at 22px, or `text-title-lg` at 28px for row headings that can wrap. Both tokens use line-height 1.1 and tracking -0.01em.
- **Script** (Caveat 600, roughly 1.15x the surrounding headline size, up to 118px in the hero): the aside inside a headline, a pull quote signature, a margin note. Always Campfire Amber on dark, Cedar on cream.
- **Body** (Archivo 400, 16-17px, line-height 1.6): paragraphs, max 520-620px wide. Secondary body at 15px / 1.55 in `ink-muted` on cream, or Birch Bark at reduced alpha on dark.
- **Eyebrow** (Archivo, 14px, 600 weight, tracking 0.02em): supporting context above a headline, Campfire Amber on dark, Cedar on cream, 20px below it.
- **Label** (Archivo, 14px, 500 weight, tracking 0.01em): chips, map markers, stamps, metadata, and nav sub-lines.

### Named Rules
**The Annotation Rule.** Supporting text stays at least 14px, uses normal case and modest tracking, and keeps enough contrast against its field. Use monospace only for coordinates, codes, and other data where alignment helps.

**The One Hand Rule.** Caveat appears at most once per section, as one phrase, never a full sentence and never for UI text.

## Layout

Content sits on a 1320px max-width measure with 56px side gutters; the hero nav and hero text share the same left edge. Sections are full-bleed colour fields with roughly 120px vertical padding; the hero is a full-viewport media field with the nav absolutely positioned over it and a 34px marquee ticker above the nav.

Internal grids are explicit and asymmetric where the content is asymmetric: 1fr 1fr for text/media pairs, 1fr 620px when media must hold a fixed width, 330px 1fr for sidebar-plus-content, repeat(4, 1fr) for program and safety tiles, 150px 1fr 138px for session rows (dates, bar, CTA). Tile grids use 1px gaps over a translucent cream background so the gaps themselves draw hairlines (The Hairline Grid).

Spacing steps observed: 8, 14, 26, 34, 46px inside components; 20px between eyebrow and headline; 120px between sections. Text measures cap at 520-620px.

### Responsive
Three breakpoints: phone below 640px, tablet 640-1023px, desktop 1024px and up. The drama survives on phones; it stacks, it does not shrink away.

- **Phone:** gutters 20px; section padding 72px; every grid one column; hairline-grid tiles two columns; Display 48px, Headline 36px, Script scales with them; body stays 16px; text measures go full width. Session rows become a stacked card per session (dates, bar, CTA). Tilting cards lose the tilt and keep the image scale and metadata on tap. The globe and island walk keep working by touch.
- **Tablet:** gutters 32px; section padding 96px; two-column pairs stay two columns where the media side can hold 320px, else stack; tiles two columns; Display 72px, Headline 46px.
- **Desktop:** as specified above.

**The Stack, Don't Shrink Rule.** Below 1024px, layouts stack and type steps down one size; no section is removed, no interaction is removed.

**The Mirror Rule.** Neighbouring sections of one photo-and-copy type form a run, and odd positions in that run flip on desktop: photo on the far side, copy on the near side. No editor control decides this; the page order does. A bleeding photo in such a section rounds its copy-side corner only where that boundary is a seam and stays square at an edge (see Shapes).

## Elevation & Depth

Depth is tonal. Forest Panel sits on Forest Floor; Forest Floor sits on Pine Night; Birch Bark cards sit on Birch Bark Bright. Hairlines (translucent cream or translucent pine) separate rather than shadows. Shadows exist for two reasons only: something is media-heavy and meant to feel physical (the island map, the globe, the hero video frame), or something has been lifted by the cursor.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 40px 70px -22px rgba(13,18,8,.65)`): hover state for tilting program and activity cards, paired with a -8px translateY and 1.06 image scale.
- **Media rest** (`box-shadow: 0 36px 70px rgba(13,18,8,.45)`): heavy media containers at rest on dark fields (island walk, globe uses `0 42px 84px rgba(0,0,0,.5)`).
- **Card rest, cream** (`box-shadow: 0 22px 44px rgba(22,32,15,.12)`): light cards that float on the cream field (pricing, testimonial portraits).
- **Stamp** (`box-shadow: 0 10px 24px rgba(13,18,8,.35)`): small amber stamps and floating chips.
- **Glass chips** use `backdrop-filter: blur(6-8px)` over a 45-55% Pine Night fill instead of a shadow.

### Named Rules
**The Flat-Until-Touched Rule.** Cards and tiles are flat at rest. The lift shadow is a response to hover or focus, never a resting state. Hairline-grid tiles never lift; they tint (5% cream) instead.

## Shapes

Two silhouettes: the pill and the soft slab. Every button is a full pill (999px). Every media frame, card, and panel is a soft slab at 22-26px, with 14px for inputs and 8px for small inner thumbnails, 3px for bars and ticks. Circles (50%) are reserved for dots, avatars, and icon buttons. The footer and the final CTA band round only their top corners at 44px, like the page being tucked into an envelope.

**The Pill Is a Button Rule.** The pill silhouette means "press me". A chip, label, tag, marker, or badge is never a pill and never carries a border or a fill, because a bordered pill of text is indistinguishable from a ghost button. A label is a small mark (a dot, a check, a number) followed by a word in the label face. Decided 2026-09-15 and retrofitted across the site the same day. Pressable things keep the pill: links styled as ghost buttons, the sample-day activity toggles, the dates-and-rates tabs, the tour control.

A slab is a rectangle with soft corners that sits on a field, so its corners have a surface to rest against. A field is a full-bleed colour or photo that runs to the viewport edge; it has no corners of its own. A photo that bleeds to a section boundary is a field at that boundary and stays square there; it may round a corner only where the boundary is a seam, because the same colour continues past it.

Borders are 1px (1.5px on buttons and inputs) and always translucent: cream at 12-22% on dark, pine at 10-18% on cream. No solid grey borders. Media is always clipped to its slab; images inside a slab may scale on hover but never escape it.

## Components

Tactile and confident. Everything that can be touched answers: pills lift, arrows rotate, bars slide, stamps pop.

### Buttons
- **Shape:** full pill (999px), Archivo 700, 14-17px, inline-flex with 10px gap for an arrow.
- **Primary:** Campfire Amber fill, Pine Night text, 16px 30px padding (18px 34px in the hero with `0 12px 32px rgba(0,0,0,.35)` shadow; 11px 22px for the small nav/ticker variant).
- **Hover:** background to Campfire Amber Deep and -2px translateY over .2s ease.
- **Focus:** see The Field Ring Rule below.
- **Ghost on dark:** transparent, 1.5px Birch Bark at 50%, Birch Bark text, 600 weight, 18px 30px, blur(6px) backdrop; hover brightens the border.
- **Ghost on cream:** transparent, 1.5px Pine Night at 25%, Pine Night text, 600 weight, 12px 24px.
- **Arrow trailing:** "Enroll →" style arrows are text glyphs; in cards the arrow is a 26px circle outline that fills amber and rotates -45deg on hover.

### Chips / Labels
- **Style:** a mark then a word. Archivo 14px, normal case, modest tracking, no container, no border, no fill, no radius. The mark is a 6-8px dot, a 16px check, or a mono number, in the field's accent (Campfire Amber on dark, Cedar on cream); the word is the field's text colour at 70-85%. Chips in a row sit 20px apart with no dividers.
- **On media:** the same, set over a soft Pine Night gradient at the image edge rather than inside a glass capsule.
- **Legacy pill chips** (bordered, 7px 12px, 999px) are retired; see The Pill Is a Button Rule.
- **Stamp:** Campfire Amber fill, Pine Night text, 700 weight, 0.14em, rotated -7deg, pops in with a scale-down from 1.7.

### Cards / Containers
- **Light card:** Birch Bark, 1px Pine Night at 10% border, 22px radius, 34px 30px padding; on hover lifts with the cream rest shadow.
- **Dark panel:** Forest Panel, 1px Birch Bark at 12% border, 26px radius, 46px 46px 40px padding; used for quotes and pricing on dark fields.
- **Media card (tilting):** 26px radius, overflow hidden, 3D tilt up to a few degrees following the cursor, cursor-tracked warm radial glow, a sheen sweep, and metadata chips that rise from the bottom on hover. Image desaturated to .94 at rest, 1.12 on hover.
- **Hairline-grid tile:** no radius, no border; 1px gaps over Birch Bark at 16% draw the grid. Hover tints the tile 5% cream. Program number badge fills amber on hover.

### Inputs / Fields
- **Style:** white fill, 1.5px Pine Night at 18% border, 14px radius, 15px 16px padding, Archivo 16px, Pine Night text.
- **Focus:** border to Cedar plus a 3px Cedar at 25% outer ring.
- **Submit:** full-width primary button, 18px padding, 17px text.
- **Error:** validated on blur, one field at a time. Border to Ember Red, label stays, and a mono 11px Ember Red message appears 8px below in the site's voice ("We need an email to reply to", not "Invalid input"). The message is linked with `aria-describedby`; the field gets `aria-invalid`. Submit re-checks every field and moves focus to the first error. Success replaces the form with a Forest Panel thank-you and the phone number.
- **Disabled:** 45% alpha, no hover.

### Focus
**The Field Ring Rule.** Every focusable element shows a 2px solid ring with 3px offset on `:focus-visible`: Campfire Amber on dark fields, Cedar on cream fields. Inputs use the Cedar border plus soft ring above instead. Never remove outlines without replacing them; never use the browser default blue.

### Navigation
- **Style:** absolute over the hero, 26px 56px padding, wordmark in Bricolage 700 15px +0.04em with a mono 10px sub-line ("Temagami, Ontario · Est. 1975"). Links in Archivo 500 15px, Birch Bark at 85%, hover to 100%. Trailing small primary Enroll pill.
- **Ticker:** 34px Campfire Amber marquee above the nav, Archivo 600 13px, Pine Night, with a dot and an arrowed Enroll link; slides down on load.
- **Mobile (below 1024px):** wordmark (sub-line hidden below 640px), small primary Enroll pill, then a 44px circle menu button with a two-line icon. Menu opens a full-screen Forest Floor sheet sliding down (.35s ease-reveal): links in Bricolage 700 at 32px, Birch Bark, 18px apart; Programs expands inline; at the bottom a mono label row with the phone number and a ghost Request Info pill. Enroll stays visible in the header while the sheet is open. Body scroll locks; Escape and the close circle dismiss.

### Session Rows (signature)
A horizontal calendar: 150px date column in mono, a 1fr track with a positioned bar (3px radius) per session, and a 138px CTA column. Open sessions carry a Moss bar that turns amber on hover while a hidden Enroll link slides in from the left (overshoot ease). Full sessions carry an Ember Red marker and an amber "FULL" stamp. Availability copy comes from the CMS.

### CTA Banner (handoff)
Two weights of one block. **Closing band:** an editor-selected field with the 44px tucked top corners, headline left on an 8/4 grid, actions right: one amber primary with a trailing arrow, one ghost. **Nudge:** a Light card on the cream field, title-sized heading, actions inline on desktop. Buttons stack full-width below 640px in both weights.

### Eyebrow + Headline + Script (signature)
Every section opens the same way: Archivo eyebrow (14px, 600 weight, amber or cedar), 20px, Bricolage 800 headline at 58px, with one phrase swapped into Caveat in the accent colour. This is the most recognisable pattern on the site; reuse it on every inner page.

### Motion grammar
- **Reveal:** `riseUp` (46px translate, fade) driven by `animation-timeline: view()` over entry 0-45%; hero uses `heroRise` (34px) with .9s `cubic-bezier(.2,.7,.2,1)` and staggered delays.
- **Hover:** .2s ease for buttons; .35s `cubic-bezier(.34,1.56,.64,1)` (overshoot) for arrows, dots, and slide-ins; 1s `cubic-bezier(.2,.7,.2,1)` for image scale.
- **Ambient:** marquee ticker (40s linear loop), slow globe spin, map trail dash, and map ping are the only looping animations; they are `transform`/`stroke-dashoffset` only and must pause under `prefers-reduced-motion`.
- **Parallax:** hero media drifts ±6.5% on scroll.

## Do's and Don'ts

### Do:
- **Do** open every section with the eyebrow, headline, script triad; it is the brand's signature.
- **Do** keep Campfire Amber scarce: one button, one script phrase, one label per viewport (The One Fire Rule).
- **Do** derive every border, hairline, and divider from the field's text colour at reduced alpha (The Translucent Ink Rule).
- **Do** pick `ink-muted` or `ink-soft` for secondary text on cream, and keep every cream text at 5:1 or better.
- **Do** set annotations at 14px or larger, in normal case with modest tracking and clear contrast (The Annotation Rule).
- **Do** use pills for buttons only, marks-plus-words for labels, and 22-26px slabs for anything that frames media or content.
- **Do** keep cards flat at rest and lift them only on hover or focus (The Flat-Until-Touched Rule).
- **Do** choose white, cream, or green per section for clear separation, and end with a light section before the footer.
- **Do** drive scroll reveals with `animation-timeline: view()` and provide a no-motion path under `prefers-reduced-motion`.
- **Do** ship real island, Big Top, and camper photography; the terrain is the design.
- **Do** stack below 1024px and keep every section and interaction (The Stack, Don't Shrink Rule).
- **Do** show a 2px ring, 3px offset, amber on dark and cedar on cream, on every `:focus-visible` (The Field Ring Rule).
- **Do** validate form fields on blur with a plain-English mono message in Ember Red.

### Don't:
- **Don't** introduce a second accent or a new grey; the palette is thirteen named colours, the two ink tiers derived from Pine Night, and their alphas.
- **Don't** set cream text with an alpha (`text-pine-night/70` and friends); pick an ink tier instead.
- **Don't** colour small text with Campfire Amber on cream (The Amber-Is-Not-Text Rule).
- **Don't** use Caveat for more than one phrase per section or for any UI text.
- **Don't** drop annotation, prices, dates, or chips below 14px or into uppercase wide tracking.
- **Don't** place resting drop shadows on cards or tiles; only media frames and lifted states carry shadow.
- **Don't** use solid grey borders, square corners on tappable elements, or radii between 3px and 14px except the 8px thumbnail.
- **Don't** add looping animations beyond the ticker, globe, and map trail; no pulse, shimmer, or spinner loops.
- **Don't** fall back to a centred-text-over-gradient hero; the hero is left-aligned type over media with the script aside.
- **Don't** reintroduce the old site's logo or colours.
- **Don't** hide the Enroll pill on any viewport or while the mobile menu is open.
- **Don't** show form errors as a summary box or only on submit.

Activity catalogue navigation uses solid Navigation Yellow (`oklch(84% 0.095 92)`, a muted straw yellow) with normal 16px text links and a 14px "Activity Categories" legend. It is a rounded slab at rest; while stuck under the header it squares its top corners and grows to the viewport edges. This is a specific navigation accent, not the main button colour.
