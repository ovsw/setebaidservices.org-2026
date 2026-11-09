# Visual verification bar (PROTOTYPE, throwaway)

Answers [ovsw/ai-business-os#12](https://github.com/ovsw/ai-business-os/issues/12): how close is a verifier agent's visual verdict to Ovi's, on real pages, and what does a page cost in time and tokens. Not production code; it lives on the branch `prototype/visual-verification-bar` and never merges.

Shape: deterministic checks first, then a headless Claude Code worker (`claude -p`) judges the screenshots against the site's section rules and the page plan, with structured output. Built on the shortlist in the research note `docs/research/visual-verification-sota.md` of ai-business-os (branch `research/visual-verification-sota`).

## Run

From the repository root, with the frontend dev server on port 3000 (`pnpm --dir frontend dev`; the capture uses `http://localhost:3000`, because Next 16 returns 403 for `/_next` resources requested through `127.0.0.1`):

```sh
# one page: evidence to <dir>
node --env-file=studio/.env.local prototypes/visual-verification-bar/capture.mjs about/alumni --out /work/dev/stb/visual-verification-bar/pages/about-alumni
node prototypes/visual-verification-bar/judge.mjs /work/dev/stb/visual-verification-bar/pages/about-alumni \
  --rules /work/dev/stb/visual-verification-bar/rules/stb-sections.md \
  --plan  /work/dev/stb/visual-verification-bar/plans/about-alumni.md --model claude-opus-5-5 --label opus-5-5

# all ten pages, both models, then the report
node --env-file=studio/.env.local prototypes/visual-verification-bar/run-all.mjs
node prototypes/visual-verification-bar/report.mjs
```

Evidence, plans, rules and the report live outside the repository in `/work/dev/stb/visual-verification-bar/` (the repo is public; page plans are team-only).

## Files

- `capture.mjs`: renders the page through draft mode (draft wins, else published), hides the header after the first tile, removes reveal animations, scrolls for lazy images, then writes per-section screenshots and viewport-sized tiles at 1440 and 390 px, the DOM rules (overflow culprit, clipped text, broken, distorted or upscaled images, placeholder copy, heading structure, empty links, section-order rules, hydration and console errors, failed requests), axe-core `wcag2a,wcag2aa`, the aria snapshot of `main`, and the page text. About 16 s per page.
- `judge.mjs`: runs `claude -p --output-format json --json-schema … --allowedTools Read` in the page's evidence folder with a rubric of ten defect classes, the section rules and the page plan; records the verdict with the run's turns, tokens and `total_cost_usd`.
- `run-all.mjs`: the ten pages and the two models; `report.mjs`: the comparison table with an empty "Ovi" column per finding.
- Ovi's side: one file per page in `/work/dev/stb/visual-verification-bar/ovi/`, with the Studio Presentation link, filled before reading the agent's findings.
