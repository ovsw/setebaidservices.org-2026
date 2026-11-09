#!/usr/bin/env node
// PROTOTYPE, throwaway. Visual verification bar (ovsw/ai-business-os#12).
// Captures the evidence a verifier agent judges one page from:
//   - per-section screenshots and viewport-sized tiles at 1440 and 390 px
//   - deterministic DOM rules (overflow culprit, clipped text, broken and
//     distorted images, duplicate adjacent sections, two asks in a row,
//     placeholder copy, console and hydration errors, fonts)
//   - axe-core (wcag2a, wcag2aa)
//   - the accessibility tree (aria snapshot) and the page text
// Renders through the frontend's draft mode, the way `pnpm page:shots` does,
// so the section wrappers carry their Sanity keys; the draft wins when one
// exists, else the published page.
//
//   node --env-file=studio/.env.local prototypes/visual-verification-bar/capture.mjs <slug> --out <dir>
//
// Writes <out>/capture.json plus <out>/<viewport>/{sections,tiles}/*.png,
// <out>/<viewport>/aria.yml and <out>/text.txt.

import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const slug = (args.find((a) => !a.startsWith("--")) ?? "").replace(/^\/+|\/+$/g, "");
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
if (!slug || !flag("--out")) {
  console.error("Usage: capture.mjs <slug> --out <dir>");
  process.exit(1);
}
const outRoot = path.resolve(flag("--out"));
const token = process.env.SANITY_AUTH_TOKEN;
if (!token) {
  console.error("SANITY_AUTH_TOKEN is missing. Run with --env-file=studio/.env.local.");
  process.exit(1);
}
const t0 = Date.now();
const timings = {};
const lap = (name, start) => (timings[name] = (timings[name] ?? 0) + (Date.now() - start));

const portsFile = path.join(root, ".worktree-ports.json");
const ports = existsSync(portsFile)
  ? JSON.parse(readFileSync(portsFile, "utf8"))
  : { frontendPort: 3000, studioPort: 3333 };
// localhost, not 127.0.0.1: Next 16 dev blocks /_next resources from other origins (403).
const frontend = `http://localhost:${ports.frontendPort}`;
const studio = `http://127.0.0.1:${ports.studioPort}`;

const frontendRequire = createRequire(path.join(root, "frontend", "package.json"));
const nextSanityRequire = createRequire(frontendRequire.resolve("next-sanity/package.json"));
const playwrightRequire = createRequire(frontendRequire.resolve("@playwright/test/package.json"));
const { createClient } = await import(pathToFileURL(frontendRequire.resolve("@sanity/client")));
const { createPreviewSecret } = await import(
  pathToFileURL(nextSanityRequire.resolve("@sanity/preview-url-secret/create-secret"))
);
const playwright = await import(pathToFileURL(playwrightRequire.resolve("playwright")));
const chromium = playwright.chromium ?? playwright.default.chromium;
const AxeBuilder = (await import(pathToFileURL(frontendRequire.resolve("@axe-core/playwright")))).default;

const env = readFileSync(path.join(root, "studio", ".env.local"), "utf8");
const envValue = (key) => env.match(new RegExp(`^${key}=["']?([^"'\\n]+)`, "m"))?.[1];
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? envValue("SANITY_STUDIO_PROJECT_ID");
const dataset = process.env.SANITY_STUDIO_DATASET ?? envValue("SANITY_STUDIO_DATASET");
const client = createClient({ projectId, dataset, apiVersion: "2025-01-01", token, useCdn: false });

let t = Date.now();
const pageDoc = await client
  .withConfig({ perspective: "raw" })
  .fetch(
    `*[_type=="page" && slug.current==$slug] | order(select(_id in path("drafts.**") => 0, 1))[0]{
      _id, title, description, "blocks": blocks[]{_key, _type}
    }`,
    { slug },
  );
if (!pageDoc) {
  console.error(`No page has the slug "${slug}".`);
  process.exit(1);
}
const expectedKeys = pageDoc.blocks.map((b) => b._key);
const { secret } = await createPreviewSecret(client, "visual-verification-bar", studio);
lap("sanity", t);
const enableUrl =
  `${frontend}/api/draft-mode/enable?sanity-preview-secret=${encodeURIComponent(secret)}` +
  `&sanity-preview-pathname=${encodeURIComponent(`/${slug}`)}&sanity-preview-perspective=drafts`;

const viewports = {
  desktop: { width: 1440, height: 1000 },
  phone: { width: 390, height: 844 },
};

const STEGA = /[​-‏﻿⁠-⁤]/g;

async function capture(name, viewport) {
  const out = path.join(outRoot, name);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(path.join(out, "sections"), { recursive: true });
  mkdirSync(path.join(out, "tiles"), { recursive: true });
  const report = { viewport, console: [], pageErrors: [], failedRequests: [], badResponses: [] };

  let t = Date.now();
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type()) && !/_next\/hmr|WebSocket connection/.test(m.text())) report.console.push({ type: m.type(), text: m.text().slice(0, 300) });
  });
  page.on("pageerror", (e) => report.pageErrors.push(String(e.message).slice(0, 300)));
  page.on("requestfailed", (r) => report.failedRequests.push({ url: r.url().slice(0, 200), error: r.failure()?.errorText }));
  page.on("response", (r) => {
    const type = r.request().resourceType();
    if (["image", "font", "stylesheet", "script"].includes(type) && r.status() >= 400) {
      report.badResponses.push({ url: r.url().slice(0, 200), status: r.status(), type });
    }
  });
  try {
    await page.goto(enableUrl, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.waitForSelector("[data-sanity]", { timeout: 90_000 });
    report.draftModeCookie = (await context.cookies()).some((c) => c.name === "__prerender_bypass");
    lap("load", t);

    t = Date.now();
    await page.addStyleTag({
      content:
        "*{animation:none!important;transition:none!important;opacity:1!important}" +
        "sanity-visual-editing,nextjs-portal{display:none!important}" +
        // The opacity override above would reveal the visually hidden skip link.
        "a[href='#main-content']{display:none!important}",
    });
    await page.evaluate(() => {
      for (const el of document.querySelectorAll("a,button")) {
        if (/Disable Draft Mode/i.test(el.textContent ?? "")) el.style.display = "none";
      }
    });
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += 600) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(80);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1200);
    await page.evaluate(async () => {
      await document.fonts.ready;
      const pending = [...document.images]
        .filter((img) => !img.complete)
        .map((img) => new Promise((done) => { img.onload = img.onerror = done; }));
      await Promise.race([Promise.all(pending), new Promise((done) => setTimeout(done, 8000))]);
    });
    lap("settle", t);

    // Section wrappers: the page builder puts the Sanity path on each one.
    t = Date.now();
    const sections = await page.evaluate(() => {
      const rows = [];
      for (const el of document.querySelectorAll("[data-sanity]")) {
        const attr = el.getAttribute("data-sanity") ?? "";
        const m = attr.match(/path=blocks\[_key==(?:"|%22)([^"%\]]+)(?:"|%22)\](?:;|$)/) ?? attr.match(/path=blocks:([^.;]+);/);
        if (!m || rows.some((r) => r.key === m[1])) continue;
        const r = el.getBoundingClientRect();
        el.setAttribute("data-vvb-section", String(rows.length));
        const heading = (el.querySelector("h1,h2,h3")?.textContent ?? "").replace(/[\u200B-\u200F\uFEFF\u2060-\u2064]/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
        rows.push({ key: m[1], top: Math.round(r.top + window.scrollY), height: Math.round(r.height), heading });
      }
      return rows;
    });
    const keyToType = Object.fromEntries(pageDoc.blocks.map((b) => [b._key, b._type]));
    for (const s of sections) s.type = keyToType[s.key] ?? "unknown";
    report.sections = sections;
    report.sectionKeysMatchDocument = JSON.stringify(sections.map((s) => s.key)) === JSON.stringify(expectedKeys);
    report.pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);

    // Tiles: what a visitor sees screen by screen, header included on the first.
    const vh = viewport.height;
    let i = 0;
    for (let y = 0; y < report.pageHeight; y += vh) {
      i += 1;
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(150);
      if (i === 2) await page.evaluate(() => document.querySelector("header")?.style.setProperty("display", "none"));
      await page.screenshot({ path: path.join(out, "tiles", `${String(i).padStart(2, "0")}-y${y}.png`) });
    }
    report.tiles = i;
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(() => document.querySelector("header")?.style.setProperty("display", "none"));
    for (const [index, section] of sections.entries()) {
      const file = path.join(out, "sections", `${String(index + 1).padStart(2, "0")}-${section.type}.png`);
      const handle = await page.$(`[data-vvb-section="${index}"]`);
      try {
        await handle.screenshot({ path: file, timeout: 20_000 });
        section.file = path.relative(outRoot, file);
      } catch (e) {
        section.screenshotError = String(e.message).slice(0, 200);
      }
    }
    lap("screenshots", t);

    // Deterministic DOM rules.
    t = Date.now();
    report.dom = await page.evaluate((STEGA_SRC) => {
      const STEGA = new RegExp(STEGA_SRC, "g");
      const clean = (s) => (s ?? "").replace(STEGA, "").replace(/\s+/g, " ").trim();
      const doc = document.documentElement;
      const cw = doc.clientWidth;
      const describe = (el) =>
        `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${el.className && typeof el.className === "string" ? "." + el.className.split(/\s+/).slice(0, 3).join(".") : ""}` +
        (clean(el.textContent) ? ` "${clean(el.textContent).slice(0, 60)}"` : "");
      const sectionOf = (el) => el.closest("[data-vvb-section]")?.getAttribute("data-vvb-section") ?? null;

      const overflow = { pageOverflowPx: doc.scrollWidth - cw, culprits: [] };
      for (const el of document.body.querySelectorAll("*")) {
        if (el.closest("header")) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.right > cw + 1 || r.left < -1) {
          overflow.culprits.push({ el: describe(el), left: Math.round(r.left), right: Math.round(r.right), section: sectionOf(el) });
          if (overflow.culprits.length >= 12) break;
        }
      }

      const clippedText = [];
      for (const el of document.body.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        if (!/hidden|clip/.test(cs.overflowX) && !/hidden|clip/.test(cs.overflowY)) continue;
        if (!clean(el.innerText)) continue;
        if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2) {
          // Ignore wrappers whose clipping is the design (carousels, rounded photo boxes with only images).
          if (!el.querySelector("p,h1,h2,h3,h4,li,span,a") && el.tagName !== "P") continue;
          clippedText.push({ el: describe(el), scrollW: el.scrollWidth, clientW: el.clientWidth, scrollH: el.scrollHeight, clientH: el.clientHeight, section: sectionOf(el) });
          if (clippedText.length >= 12) break;
        }
      }

      const images = [];
      for (const img of document.images) {
        const r = img.getBoundingClientRect();
        const cs = getComputedStyle(img);
        const fit = cs.objectFit;
        const broken = img.complete && img.naturalWidth === 0;
        const rendered = r.width > 0 && r.height > 0;
        let distortion = null;
        if (!broken && rendered && img.naturalWidth && !["cover", "contain", "scale-down", "none"].includes(fit)) {
          distortion = +((img.naturalWidth / img.naturalHeight) / (r.width / r.height)).toFixed(3);
        }
        const upscale = !broken && rendered && img.naturalWidth ? +(r.width * devicePixelRatio / img.naturalWidth).toFixed(2) : null;
        if (!rendered && !broken) continue;
        const flag = broken || (distortion !== null && Math.abs(distortion - 1) > 0.03) || (upscale !== null && upscale > 1.5 && r.width > 120);
        if (flag || !img.alt) {
          images.push({ src: (img.currentSrc || img.src).slice(0, 160), alt: img.alt, broken, natural: `${img.naturalWidth}x${img.naturalHeight}`, rendered: `${Math.round(r.width)}x${Math.round(r.height)}`, objectFit: fit, distortion, upscale, section: sectionOf(img) });
        }
      }

      const text = clean(document.querySelector("main")?.innerText ?? document.body.innerText);
      const placeholderRe = /lorem ipsum|\bTODO\b|\bTBD\b|\bTK\b|placeholder|heading goes here|\[(?:image|photo|name|date|number|link)[^\]]*\]|xxx+|\{\{|\}\}/gi;
      const placeholders = [...text.matchAll(placeholderRe)].slice(0, 10).map((m) => text.slice(Math.max(0, m.index - 40), m.index + 60));

      const headings = [...document.querySelectorAll("main h1, main h2, main h3, main h4")].map((h) => ({ level: +h.tagName[1], text: clean(h.textContent).slice(0, 80) }));
      const h1Count = document.querySelectorAll("h1").length;
      const skips = [];
      for (let i = 1; i < headings.length; i++) if (headings[i].level > headings[i - 1].level + 1) skips.push(`${headings[i - 1].level}→${headings[i].level} at "${headings[i].text}"`);

      const emptyLinks = [...document.querySelectorAll("main a")].filter((a) => !a.getAttribute("href") || a.getAttribute("href") === "#").map((a) => clean(a.textContent).slice(0, 60)).slice(0, 10);
      const emptyTextLinks = [...document.querySelectorAll("main a, main button")].filter((a) => !clean(a.textContent) && !a.getAttribute("aria-label") && !a.querySelector("img[alt]:not([alt=''])")).map((a) => describe(a)).slice(0, 10);

      const fonts = { status: document.fonts.status, families: [...new Set([...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family))] };
      const bodyFont = getComputedStyle(document.body).fontFamily;

      return { viewportWidth: cw, overflow, clippedText, images, placeholders, headings: { h1Count, skips, list: headings.slice(0, 60) }, emptyLinks, emptyTextLinks, fonts, bodyFont, textLength: text.length };
    }, STEGA.source);

    // Section-order rules from docs/agents/pages.md (STB): one ask at a time,
    // a page ends with one ctaBanner closing, never two CTA sections adjacent,
    // never two identical section types adjacent.
    const types = sections.map((s) => s.type);
    const ask = new Set(["ctaBanner", "directorCta"]);
    const adjacency = { duplicateAdjacentTypes: [], adjacentAsks: [], lastType: types.at(-1) ?? null };
    for (let i = 1; i < types.length; i++) {
      if (types[i] === types[i - 1]) adjacency.duplicateAdjacentTypes.push(`${i}:${types[i - 1]} + ${i + 1}:${types[i]}`);
      if (ask.has(types[i]) && ask.has(types[i - 1])) adjacency.adjacentAsks.push(`${i}:${types[i - 1]} + ${i + 1}:${types[i]}`);
    }
    report.sectionRules = adjacency;
    report.hydration = [...report.console.map((c) => c.text), ...report.pageErrors].filter((s) => /hydrat|418|425|did not match|server rendered/i.test(s));
    lap("domRules", t);

    // axe-core
    t = Date.now();
    await page.evaluate(() => document.querySelector("header")?.style.removeProperty("display"));
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    report.axe = {
      violations: axe.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, targets: v.nodes.slice(0, 3).map((n) => n.target.join(" ")), summary: v.nodes[0]?.failureSummary?.slice(0, 200) })),
      incomplete: axe.incomplete.map((v) => ({ id: v.id, nodes: v.nodes.length })),
      passes: axe.passes.length,
    };
    lap("axe", t);

    // Accessibility tree and text
    t = Date.now();
    const aria = await page.locator("main").ariaSnapshot();
    writeFileSync(path.join(out, "aria.yml"), aria.replace(STEGA, "").replace(/ {2,}/g, " ").replace(/ +$/gm, ""));
    report.ariaChars = aria.length;
    if (name === "desktop") {
      const text = await page.evaluate(() => document.querySelector("main")?.innerText ?? document.body.innerText);
      writeFileSync(path.join(outRoot, "text.txt"), text.replace(STEGA, "").replace(/[ \t]{2,}/g, " "));
    }
    lap("aria", t);
  } finally {
    await browser.close();
  }
  return report;
}

mkdirSync(outRoot, { recursive: true });
const result = {
  slug,
  documentId: pageDoc._id,
  isDraft: pageDoc._id.startsWith("drafts."),
  title: pageDoc.title,
  description: pageDoc.description,
  blocks: pageDoc.blocks,
  capturedAt: new Date().toISOString(),
  viewports: {},
};
for (const [name, viewport] of Object.entries(viewports)) {
  result.viewports[name] = await capture(name, viewport);
}
result.timingsMs = { ...timings, total: Date.now() - t0 };
writeFileSync(path.join(outRoot, "capture.json"), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ slug, documentId: pageDoc._id, sections: result.viewports.desktop.sections.length, tiles: { desktop: result.viewports.desktop.tiles, phone: result.viewports.phone.tiles }, timingsMs: result.timingsMs }));
