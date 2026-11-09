#!/usr/bin/env node
// PROTOTYPE, throwaway. Visual verification bar (ovsw/ai-business-os#12).
// Runs the Verifier as a headless Claude Code worker (`claude -p`) over the
// evidence capture.mjs wrote for one page, and records its verdict plus the
// run's time, tokens and dollars.
//
//   node prototypes/visual-verification-bar/judge.mjs <page dir> --rules <file> --plan <file> [--model <id>] [--label <name>]
//
// Writes <page dir>/verdicts/<label>.json: { verdict, run: {durationMs, costUsd, usage, numTurns, model} }.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const pageDir = path.resolve(args.find((a) => !a.startsWith("--")) ?? "");
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const model = flag("--model", "claude-opus-5-5");
const label = flag("--label", model);
const rulesFile = flag("--rules");
const planFile = flag("--plan");
if (!existsSync(path.join(pageDir, "capture.json")) || !rulesFile || !planFile) {
  console.error("Usage: judge.mjs <page dir with capture.json> --rules <file> --plan <file> [--model <id>] [--label <name>]");
  process.exit(1);
}

const capture = JSON.parse(readFileSync(path.join(pageDir, "capture.json"), "utf8"));
const list = (dir) => (existsSync(dir) ? readdirSync(dir).sort() : []);
const sectionsDesktop = list(path.join(pageDir, "desktop", "sections"));
const sectionsPhone = list(path.join(pageDir, "phone", "sections"));
const tilesDesktop = list(path.join(pageDir, "desktop", "tiles"));
const tilesPhone = list(path.join(pageDir, "phone", "tiles"));

// The deterministic findings, stripped to what the judge needs to read.
const det = {};
for (const [name, v] of Object.entries(capture.viewports)) {
  det[name] = {
    pageHeight: v.pageHeight,
    overflowPx: v.dom.overflow.pageOverflowPx,
    overflowCulprits: v.dom.overflow.culprits,
    clippedText: v.dom.clippedText,
    flaggedImages: v.dom.images,
    placeholders: v.dom.placeholders,
    headings: { h1Count: v.dom.headings.h1Count, skips: v.dom.headings.skips },
    emptyLinks: v.dom.emptyLinks,
    emptyTextLinks: v.dom.emptyTextLinks,
    fonts: v.dom.fonts,
    sectionRules: v.sectionRules,
    hydration: v.hydration,
    consoleErrorsAndWarnings: v.console,
    failedRequests: v.failedRequests,
    badResponses: v.badResponses,
    axeViolations: v.axe.violations,
    axeIncomplete: v.axe.incomplete,
  };
}
const sections = capture.viewports.desktop.sections.map((s, i) => ({
  n: i + 1,
  type: s.type,
  heading: s.heading,
  desktopFile: sectionsDesktop[i] ? `desktop/sections/${sectionsDesktop[i]}` : null,
  phoneFile: sectionsPhone[i] ? `phone/sections/${sectionsPhone[i]}` : null,
  desktopHeightPx: s.height,
  phoneHeightPx: capture.viewports.phone.sections[i]?.height,
}));
writeFileSync(path.join(pageDir, "deterministic.json"), JSON.stringify(det, null, 2));
writeFileSync(path.join(pageDir, "sections.json"), JSON.stringify(sections, null, 2));
mkdirSync(path.join(pageDir, "ref"), { recursive: true });
writeFileSync(path.join(pageDir, "ref", "section-rules.md"), readFileSync(rulesFile, "utf8"));
writeFileSync(path.join(pageDir, "ref", "page-plan.md"), readFileSync(planFile, "utf8"));

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["page", "verdict", "findings", "tasteSuggestions", "whatIChecked", "confidenceInVerdict"],
  properties: {
    page: { type: "string" },
    verdict: { type: "string", enum: ["pass", "fail"], description: "fail when at least one finding is a defect you are at least 0.6 confident of" },
    confidenceInVerdict: { type: "number", minimum: 0, maximum: 1 },
    findings: {
      type: "array",
      description: "Defects: things that are wrong against the rules, the plan or basic web quality. Not taste.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["section", "sectionType", "viewport", "class", "severity", "confidence", "description", "evidence", "source"],
        properties: {
          section: { type: "integer", description: "1-based section number, 0 for page-level" },
          sectionType: { type: "string" },
          viewport: { type: "string", enum: ["desktop", "phone", "both"] },
          class: {
            type: "string",
            enum: ["layout-break", "overflow-or-clipping", "image-fit-or-quality", "spacing-or-alignment", "typography-or-legibility", "contrast-or-color", "copy-or-placeholder", "section-order-rule", "plan-mismatch", "missing-or-broken-element", "accessibility", "console-or-hydration", "other"],
          },
          severity: { type: "string", enum: ["blocker", "major", "minor"] },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          description: { type: "string", description: "One or two sentences. Name what and where, under 60 words." },
          evidence: { type: "string", description: "The file you saw it in (relative path) or the deterministic key, e.g. desktop/sections/03-featureCards.png or axe:color-contrast" },
          source: { type: "string", enum: ["deterministic", "screenshot", "aria-or-text", "plan-comparison", "rules"] },
        },
      },
    },
    tasteSuggestions: {
      type: "array",
      description: "Changes a designer might make that are not defects: remove an element, reorder, tighten copy, swap a section look. Keep separate from findings.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["section", "suggestion", "confidence"],
        properties: {
          section: { type: "integer" },
          suggestion: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
        },
      },
    },
    whatIChecked: { type: "array", items: { type: "string" }, description: "Short list of the files you opened" },
  },
};

const prompt = `You are the Verifier for a marketing page of a camp website built on the OVS Next.js + Sanity starter. You judge one rendered page against the site's section rules, the page plan and basic web quality, and report evidence. You did not build the page and you do not fix anything. Ovi, the designer, will judge the same page; the goal is a verdict as close to his as you can give.

Page: /${capture.slug} ("${capture.title}"), document ${capture.documentId}${capture.isDraft ? " (a draft)" : " (published)"}. Captured ${capture.capturedAt} on the dev server through draft mode, header hidden in all screenshots after the first tile.

Files in this directory (use the Read tool; read every screenshot, they are the evidence):
- sections.json: the ${sections.length} Page Builder sections in order, each with its type, heading and its screenshot per viewport (desktop 1440 px wide, phone 390 px wide).
- desktop/sections/*.png and phone/sections/*.png: one screenshot per section. Read all of them.
- desktop/tiles/*.png (${tilesDesktop.length} files) and phone/tiles/*.png (${tilesPhone.length} files): the page screen by screen, as a visitor scrolls; the first tile includes the header. Use them to judge the whole-page rhythm, the seams between sections and the end of the page.
- deterministic.json: results of the deterministic checks that ran first (overflow culprits, clipped text, image fit, placeholder copy, heading structure, empty links, section-order rules, hydration and console errors, failed requests, axe-core WCAG 2 A/AA). Report each entry that is a real defect as a finding with source "deterministic"; you may discard an entry as a false alarm if the screenshot shows it is fine, and say so in whatIChecked.
- desktop/aria.yml and phone/aria.yml: the accessibility tree of <main>. text.txt: the page text in order.
- ref/section-rules.md: the site's own rules for sections and page order. ref/page-plan.md: the page plan the page was built from (reader, job, outline). A section the plan asks for that is missing, or content that contradicts the plan, is a finding with source "plan-comparison".

Rubric, one question per defect class; answer each for every section, phone and desktop:
1. Layout: does anything overlap, break the grid, wrap badly (a button label on two lines, a nav item wrapped), or leave an element orphaned?
2. Overflow and clipping: is any text or image cut off, or does the page scroll sideways?
3. Images: is any photo missing, stretched, blurry (upscaled), badly cropped (a face or subject cut), or wrongly placed?
4. Spacing and alignment: are elements inside a section misaligned, is a gap clearly uneven compared with the rest of the page, is there empty color before the footer?
5. Typography and legibility: is text too small, too long per line, or unreadable over a photo?
6. Contrast and color: does text fail against its background? Trust axe for the ratio; you cannot measure it from pixels.
7. Copy: placeholder text, a wrong brand name, a heading that repeats the one before, a sentence that is clearly machine filler, a duplicated section.
8. Section order rules (ref/section-rules.md): one ask at a time, the page ends with one closing ctaBanner, no two CTA sections adjacent, no innerHero without a photo on text pages, layouts used only for their job.
9. Plan: does the page deliver the plan's outline and job for its reader?
10. Missing or broken: a button without a label, a link to nowhere, an empty card, a section with no content.

Rules for reporting:
- A finding is a defect you would send back to the builder. Give its confidence honestly; 0.9 only when the screenshot shows it plainly. Prefer fewer, surer findings over a long list.
- A thing you would merely do differently (remove a card, tighten copy, reorder two sections, change a look) is a tasteSuggestion, never a finding.
- Intentional white space, asymmetric layouts and text over photos are design choices on this site; do not report them unless they break a rule above.
- Name the section number and the viewport, and the evidence file, for every item.
- verdict is "fail" when at least one finding has confidence >= 0.6 and severity blocker or major; otherwise "pass".
- Do not run commands other than Read. Do not edit anything.`;

mkdirSync(path.join(pageDir, "verdicts"), { recursive: true });
const start = Date.now();
const run = spawnSync(
  "claude",
  [
    "-p",
    "--model", model,
    "--output-format", "json",
    "--json-schema", JSON.stringify(schema),
    "--allowedTools", "Read",
    "--max-turns", "80",
    prompt,
  ],
  { cwd: pageDir, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, env: { ...process.env, CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1" } },
);
const wallMs = Date.now() - start;
let out;
try {
  out = JSON.parse(run.stdout);
} catch {
  console.error(run.stdout.slice(0, 2000));
  console.error(run.stderr.slice(0, 2000));
  throw new Error(`claude -p returned no JSON (exit ${run.status})`);
}
const record = {
  page: capture.slug,
  documentId: capture.documentId,
  label,
  model,
  judgedAt: new Date().toISOString(),
  run: {
    wallMs,
    durationMs: out.duration_ms,
    durationApiMs: out.duration_api_ms,
    costUsd: out.total_cost_usd,
    numTurns: out.num_turns,
    usage: out.usage,
    modelUsage: out.modelUsage,
    isError: out.is_error,
    stopReason: out.stop_reason,
    sessionId: out.session_id,
  },
  verdict: out.structured_output ?? null,
  resultText: out.structured_output ? undefined : out.result,
  stderr: run.stderr?.slice(0, 2000) || undefined,
};
writeFileSync(path.join(pageDir, "verdicts", `${label}.json`), JSON.stringify(record, null, 2));
const v = record.verdict;
console.log(
  JSON.stringify({
    page: capture.slug,
    label,
    verdict: v?.verdict,
    findings: v?.findings?.length,
    taste: v?.tasteSuggestions?.length,
    wallS: Math.round(wallMs / 1000),
    costUsd: out.total_cost_usd,
    turns: out.num_turns,
    inputTokens: out.usage?.input_tokens,
    cacheRead: out.usage?.cache_read_input_tokens,
    cacheCreate: out.usage?.cache_creation_input_tokens,
    outputTokens: out.usage?.output_tokens,
    isError: out.is_error,
  }),
);
