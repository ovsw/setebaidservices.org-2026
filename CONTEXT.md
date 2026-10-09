# Domain context

Shared language for the Setebaid Services website and content system.

## The site

**Website**

The public Next.js application in `frontend/`: the new setebaidservices.org, the site of Setebaid Services, the Pennsylvania not-for-profit that runs Camp Setebaid for children and teens with diabetes.

**Studio**

The separately deployed Sanity editing application in `studio/`.

**Site settings**

Global editable Website identity and content, including the site name, navigation, footer, and contact details.

## Content editing

**Page Builder**

The ordered section editor used to compose a page.

**Section**

One reusable Page Builder content and layout unit.

**Seam**

A boundary where two neighbouring sections share a background and meet with half the section rhythm on each side.

**Edge**

A boundary where a section meets a different background, a hero, or a tucking section, and keeps the full section rhythm.

**Tuck**

A rounded-top section, or the footer, that overlaps the bottom of the section above by the section radius.

**Run**

A maximal sequence of neighbouring sections of one alternating type that each carry a photo.

**Mirror**

The flipped desktop layout given to odd positions in a run: photo on the right, copy on the left.

**Draft**

Content visible to an authorized editor through preview before publication.

**Published content**

Content available to public Website visitors.

**Redirect**

A route from one public URL to a current page: permanent (301) for an old URL, temporary (302) for a QR redirect.

**QR redirect**

A redirect with a Source name, from a printed `/go/` address. It adds the UTM tags `utm_source` (the Source), `utm_medium=qr-card` and `utm_campaign` (the campaign tag), and is always temporary, so its target page can change without reprinting the code.

**Source**

The name of the card or page that brought a visitor, for example `chop-nurses`. It travels as `utm_source`.

**Delivery gap**

An "Ask about camp" request that reached only one of its two paths: Neon through Trigger.dev (path A) or Formspark (path B). The nightly gap-filler records each one, so the team dashboard can count them and Ovi gets an email.

## Ownership rules

- Code owns layout, rendering rules, validation, and safe fallbacks.
- Sanity owns editor-managed content and site settings.
- This repository owns its Sanity project, dataset, credentials, and hosting.
