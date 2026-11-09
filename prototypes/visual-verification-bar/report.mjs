#!/usr/bin/env node
// PROTOTYPE, throwaway. Visual verification bar (ovsw/ai-business-os#12).
// Builds EVIDENCE/report.md: one summary row per page and model (verdict,
// findings, time, tokens, dollars), then every finding as a checklist row
// with an empty "Ovi" column, and the Ovi verdict file next to it.
//
//   node prototypes/visual-verification-bar/report.mjs

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PAGES } from "./run-all.mjs";

const EVIDENCE = process.env.VVB_EVIDENCE ?? "/work/dev/stb/visual-verification-bar";
const read = (f) => JSON.parse(readFileSync(f, "utf8"));
const money = (n) => (n == null ? "" : `$${n.toFixed(2)}`);
const secs = (ms) => (ms == null ? "" : `${Math.round(ms / 1000)} s`);
const k = (n) => (n == null ? "" : `${Math.round(n / 1000)}k`);

let md = `# Visual verification bar: agent verdicts on ten STB pages\n\nTicket: https://github.com/ovsw/ai-business-os/issues/12. Generated ${new Date().toISOString().slice(0, 16)} by report.mjs from ${EVIDENCE}.\n\n`;
md += `## Summary per page and model\n\n| Page | Doc | Sections | Capture | Model | Verdict | Findings (blocker/major/minor) | Taste | Turns | Time | Cache read | Output | Cost |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|\n`;
const details = [];
const totals = {};
for (const [slug, folder] of Object.entries(PAGES)) {
  const dir = path.join(EVIDENCE, "pages", folder);
  if (!existsSync(path.join(dir, "capture.json"))) continue;
  const cap = read(path.join(dir, "capture.json"));
  const vdir = path.join(dir, "verdicts");
  const verdicts = existsSync(vdir) ? readdirSync(vdir).filter((f) => f.endsWith(".json")).map((f) => read(path.join(vdir, f))) : [];
  const det = cap.viewports.desktop;
  const detHits = [
    det.axe.violations.length && `axe ${det.axe.violations.map((v) => v.id).join(",")}`,
    det.hydration.length && "hydration",
    det.dom.overflow.pageOverflowPx > 0 && `overflow ${det.dom.overflow.pageOverflowPx}px`,
    cap.viewports.phone.dom.overflow.pageOverflowPx > 0 && `phone overflow ${cap.viewports.phone.dom.overflow.pageOverflowPx}px`,
    det.dom.images.length && `${det.dom.images.length} images`,
    det.dom.placeholders.length && "placeholders",
    det.sectionRules.adjacentAsks.length && "two asks",
    det.sectionRules.duplicateAdjacentTypes.length && "duplicate sections",
    det.sectionRules.lastType !== "ctaBanner" && `ends with ${det.sectionRules.lastType}`,
  ].filter(Boolean);
  if (verdicts.length === 0) {
    md += `| /${slug} | ${cap.isDraft ? "draft" : "published"} | ${cap.blocks.length} | ${secs(cap.timingsMs.total)} | | not judged | | | | | | | |\n`;
  }
  for (const v of verdicts) {
    const f = v.verdict?.findings ?? [];
    const sev = (s) => f.filter((x) => x.severity === s).length;
    const t = (totals[v.label] ??= { pages: 0, cost: 0, ms: 0, findings: 0, fail: 0 });
    t.pages += 1; t.cost += v.run.costUsd ?? 0; t.ms += v.run.wallMs ?? 0; t.findings += f.length; t.fail += v.verdict?.verdict === "fail" ? 1 : 0;
    md += `| /${slug} | ${cap.isDraft ? "draft" : "published"} | ${cap.blocks.length} | ${secs(cap.timingsMs.total)} | ${v.label} | ${v.verdict?.verdict ?? "error"} (${v.verdict?.confidenceInVerdict ?? ""}) | ${f.length} (${sev("blocker")}/${sev("major")}/${sev("minor")}) | ${v.verdict?.tasteSuggestions?.length ?? ""} | ${v.run.numTurns ?? ""} | ${secs(v.run.wallMs)} | ${k(v.run.usage?.cache_read_input_tokens)} | ${k(v.run.usage?.output_tokens)} | ${money(v.run.costUsd)} |\n`;
  }
  let d = `### /${slug} (${cap.documentId}, ${cap.blocks.length} sections, captured ${cap.capturedAt.slice(0, 16)})\n\n`;
  d += `Deterministic layer: ${detHits.length ? detHits.join("; ") : "clean"}. Desktop ${det.pageHeight}px tall, phone ${cap.viewports.phone.pageHeight}px.\n\n`;
  d += `Sections: ${cap.viewports.desktop.sections.map((s, i) => `${i + 1} ${s.type}`).join(", ")}.\n\n`;
  for (const v of verdicts) {
    d += `#### ${v.label}: ${v.verdict?.verdict ?? "error"} (confidence ${v.verdict?.confidenceInVerdict ?? "?"}), ${secs(v.run.wallMs)}, ${money(v.run.costUsd)}\n\n`;
    d += `| # | Sec | Type | View | Class | Sev | Conf | Finding | Evidence | Source | Ovi |\n|---|---|---|---|---|---|---|---|---|---|---|\n`;
    (v.verdict?.findings ?? []).forEach((f, i) => {
      d += `| ${i + 1} | ${f.section} | ${f.sectionType} | ${f.viewport} | ${f.class} | ${f.severity} | ${f.confidence} | ${f.description.replace(/\|/g, "\\|")} | ${f.evidence.replace(/\|/g, "\\|")} | ${f.source} | |\n`;
    });
    if (v.verdict?.tasteSuggestions?.length) {
      d += `\nTaste suggestions:\n\n`;
      for (const t of v.verdict.tasteSuggestions) d += `- s${t.section} (${t.confidence}) ${t.suggestion}\n`;
    }
    d += "\n";
  }
  const oviFile = path.join(EVIDENCE, "ovi", `${folder}.md`);
  if (existsSync(oviFile)) d += `#### Ovi\n\n${readFileSync(oviFile, "utf8").trim()}\n\n`;
  details.push(d);
}
md += `\nTotals per model: ${Object.entries(totals).map(([l, t]) => `${l}: ${t.pages} pages, ${t.fail} fail, ${t.findings} findings, ${money(t.cost)} (${money(t.cost / t.pages)}/page), ${secs(t.ms / t.pages)}/page`).join("; ")}.\n\n`;
md += `Column "Ovi" is filled in the review session: **agree** (Ovi saw it too), **miss** is a row Ovi adds, **false alarm** (Ovi says it is fine or a taste choice), **taste** (real, but a taste change not a defect).\n\n## Findings per page\n\n` + details.join("\n");
writeFileSync(path.join(EVIDENCE, "report.md"), md);
console.log(`wrote ${path.join(EVIDENCE, "report.md")} (${md.length} chars)`);
