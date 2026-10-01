# Content model

The Website reads structured content from one Sanity project and dataset:
project `o36mi5w4`, dataset `production`. The schemas live in
`studio/schemas/` and are registered in `studio/schema-types.ts`.

## Routed content

- `homePage` owns `/`.
- `page` owns normal page slugs such as `/about/`.
- `blogIndex` owns `/blog/`.
- `post` owns `/blog/<slug>/`.
- `category` owns `/blog/category/<slug>/`.
- `redirect` maps an old path to routed content or an external URL.

## Shared content

- `settings`, `navigation`, `footer`, and `blogPostSettings` are global
  documents. With `homePage` and `blogIndex`, they are singletons: the Studio
  keeps exactly one of each (`studio/singletons.ts`).
- `author`, `faq`, `faqCategory`, `teamMember`, and `testimonial` are reusable
  records.
- Pages compose top-level sections through their `blocks` array.

## Page Builder sections

`studio/schemas/blocks/page-builder.ts` decides which sections each page type
accepts.

- On every page type (content sections): `richTextBlock`, `benefitCards`,
  `storyFeature`, `imageCollageFeature`, `featureCards`, `stackedFeatureRows`,
  `internationalCampersSection`, `latestArticles`, `faqAccordion`,
  `teamMembers`, `ctaBanner`, `journey`, `stackedTimeline`, `includedExtras`,
  `packingChecklist`, `bigImageList`, `directorCta`, `largeSlides`,
  `headingImage`, `quoteWall`, `pricingSingleToggle`.
- `hero` on every page type; `innerHero` on pages and the blog index.
- `faqHub` on pages only.
- `homeHero` on the home page only.

Several sections still carry names from the copied code base. They are
presentation layouts, not topics; use them for any content that fits their
fields.

## Removed from the copied model

The copied code base had more types. These were removed because Setebaid does
not use them; bring one back only if the site map needs it:

- Document types: `activity`, `facility`, `facilitiesMap`, `season`,
  `seasonsConfig`.
- Page Builder sections: `activitySchedule`, `activityCatalogue`,
  `facilitiesMapSection`, `datesRatesSection`.

## Page Builder path

Each section has one shared `_type` across its Studio schema, Page Builder registration, GROQ projection, generated TypeScript type, and React renderer. See `docs/agents/page-builder.md` for the extension steps.

Sanity owns authored content. The repository owns schemas, queries, rendering, routing rules, and generated types.
