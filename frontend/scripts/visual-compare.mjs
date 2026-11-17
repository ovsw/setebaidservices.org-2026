// Visual regression check between two running copies of the site.
//
//   pnpm visual:compare --base http://localhost:3003 --head http://localhost:3001
//   pnpm visual:compare --base … --head … --paths /,/camps --viewports desktop
//
// Screenshots every page in the base site's sitemap (or --paths) on both
// sites, full page, at each viewport, and compares them pixel by pixel with
// ImageMagick (`magick compare`, small colour fuzz). Writes base, head and
// diff images plus report.json and report.md to --out (default
// visual-compare/<timestamp>). Exit code 1 when any page differs.
//
// Use it for work that must not change how pages look: point --base at a
// server running the old code and --head at the new one, both showing the
// same content.
import { chromium } from "playwright-core";
import { execFile } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : fallback;
};

const base = flag("--base");
const head = flag("--head");
if (!base || !head) {
  console.error("Usage: pnpm visual:compare --base <url> --head <url> [--paths /a,/b] [--viewports desktop,mobile] [--out dir] [--fuzz 2%] [--images-from <dataset>]");
  process.exit(2);
}
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 375, height: 812, isMobile: true, hasTouch: true },
};
const viewports = flag("--viewports", "desktop,mobile").split(",");
const fuzz = flag("--fuzz", "2%");
// When head reads a copy of the dataset, Sanity's image CDN can encode the
// same photo slightly differently per dataset. --images-from <dataset> makes
// head load every image from that dataset, so only code differences remain.
const imagesFrom = flag("--images-from");
const out = path.resolve(flag("--out", path.join("visual-compare", new Date().toISOString().replace(/[:.]/g, "-"))));
mkdirSync(out, { recursive: true });

async function sitemapPaths() {
  const xml = await (await fetch(new URL("/sitemap.xml", base))).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}
const paths = flag("--paths") ? flag("--paths").split(",") : await sitemapPaths();

const HIDE_DEV_UI = `nextjs-portal { display: none !important; }
*, *::before, *::after { caret-color: transparent !important; }`;

async function shoot(page, url, file) {
  // Not "networkidle": dev servers hold hot-reload connections open.
  const response = await page.goto(url, { waitUntil: "load", timeout: 60_000 });
  await page.addStyleTag({ content: HIDE_DEV_UI });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const decode = () =>
      Promise.race([
        Promise.allSettled(Array.from(document.images).filter((i) => {
          const r = i.getBoundingClientRect();
          return r.bottom > 0 && r.top < innerHeight && r.width > 0;
        }).map((i) => i.decode())),
        new Promise((r) => setTimeout(r, 5000)),
      ]);
    const step = Math.max(Math.floor(innerHeight * 0.8), 1);
    for (let y = 0, n = 0; y < document.documentElement.scrollHeight && n < 150; y += step, n += 1) {
      scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(r));
      await decode();
    }
    scrollTo(0, 0);
    await decode();
    await new Promise((r) => setTimeout(r, 400));
  });
  await page.screenshot({ path: file, fullPage: true, animations: "disabled" });
  return response?.status() ?? 0;
}

async function size(file) {
  const { stdout } = await run("magick", ["identify", "-format", "%w %h", file]);
  const [w, h] = stdout.trim().split(" ").map(Number);
  return { w, h };
}

/** Pixels that differ beyond the fuzz, after padding both images to one size. */
async function compare(a, b, diff) {
  const [sa, sb] = [await size(a), await size(b)];
  const w = Math.max(sa.w, sb.w);
  const h = Math.max(sa.h, sb.h);
  if (sa.w !== w || sa.h !== h) await run("magick", [a, "-background", "magenta", "-gravity", "north", "-extent", `${w}x${h}`, a]);
  if (sb.w !== w || sb.h !== h) await run("magick", [b, "-background", "magenta", "-gravity", "north", "-extent", `${w}x${h}`, b]);
  const result = await run("magick", ["compare", "-metric", "AE", "-fuzz", fuzz, a, b, diff]).catch((error) => error);
  const pixels = Number.parseFloat(String(result.stderr).trim().split(" ")[0]);
  return { pixels, total: w * h, baseHeight: sa.h, headHeight: sb.h };
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
try {
  for (const name of viewports) {
    const viewport = VIEWPORTS[name];
    const options = { viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, reducedMotion: "reduce", isMobile: viewport.isMobile, hasTouch: viewport.hasTouch };
    const [basePage, headPage] = [await (await browser.newContext(options)).newPage(), await (await browser.newContext(options)).newPage()];
    if (imagesFrom) {
      await headPage.route(/cdn\.sanity\.io\/(images|files)\//, (route) => {
        const url = route.request().url().replace(/(cdn\.sanity\.io\/(?:images|files)\/[^/]+\/)[^/]+\//, `$1${imagesFrom}/`);
        return route.continue({ url });
      });
    }
    for (const route of paths) {
      const slug = route === "/" ? "home" : route.replace(/\W+/g, "-").replace(/^-|-$/g, "");
      const file = (kind) => path.join(out, `${slug}.${name}.${kind}.png`);
      try {
        const [baseStatus, headStatus] = await Promise.all([
          shoot(basePage, new URL(route, base).href, file("base")),
          shoot(headPage, new URL(route, head).href, file("head")),
        ]);
        const c = await compare(file("base"), file("head"), file("diff"));
        const entry = { route, viewport: name, baseStatus, headStatus, ...c, percent: +((100 * c.pixels) / c.total).toFixed(3), base: file("base"), head: file("head"), diff: file("diff") };
        results.push(entry);
        console.log(`${entry.pixels === 0 && baseStatus === headStatus ? "same" : "DIFF"} ${name} ${route} ${entry.pixels}px (${entry.percent}%) heights ${c.baseHeight}/${c.headHeight} status ${baseStatus}/${headStatus}`);
      } catch (error) {
        results.push({ route, viewport: name, error: String(error) });
        console.log(`ERROR ${name} ${route}: ${error}`);
      }
    }
  }
} finally {
  await browser.close();
}

const changed = results.filter((r) => r.error || r.pixels > 0 || r.baseStatus !== r.headStatus);
writeFileSync(path.join(out, "report.json"), JSON.stringify({ base, head, fuzz, results }, null, 2));
writeFileSync(
  path.join(out, "report.md"),
  [`# Visual compare`, ``, `Base ${base}, head ${head}, fuzz ${fuzz}. ${results.length} shots, ${changed.length} differ.`, ``,
    `| Page | Viewport | Differing pixels | Heights base/head | Diff |`, `| --- | --- | --- | --- | --- |`,
    ...changed.map((r) => r.error ? `| ${r.route} | ${r.viewport} | error | | ${r.error} |` : `| ${r.route} | ${r.viewport} | ${r.pixels} (${r.percent}%) | ${r.baseHeight}/${r.headHeight} | ${r.diff} |`),
  ].join("\n") + "\n",
);
console.log(`\n${changed.length} of ${results.length} shots differ. Report: ${path.join(out, "report.md")}`);
process.exit(changed.length ? 1 : 0);
