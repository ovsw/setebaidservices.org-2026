import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const dir = new URL(".", import.meta.url).pathname.replace(/\/$/, "");
// playwright-core is a dependency of frontend/. Its Chromium build must be
// installed once: `pnpm --dir frontend exec playwright install chromium`.
const { chromium } = createRequire(`${dir}/../../../frontend/package.json`)("playwright-core");
const readme = readFileSync(`${dir}/README.md`, "utf8");
const block = readme.match(/```mermaid\n([\s\S]*?)```/);
if (!block) throw new Error(`No \`\`\`mermaid block found in ${dir}/README.md`);
const src = block[1];
const html = `<!doctype html><html><body style="margin:0;background:#fff;padding:24px">
<pre class="mermaid">${src.replace(/</g, "&lt;")}</pre>
<script type="module">
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
mermaid.initialize({ startOnLoad: false, theme: "neutral", flowchart: { htmlLabels: false, curve: "basis" } });
await mermaid.run();
document.body.dataset.done = "1";
</script></body></html>`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1800, height: 1200 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.error("pageerror", e.message));
await page.setContent(html, { waitUntil: "domcontentloaded" });
await page.waitForSelector("body[data-done='1']", { timeout: 60000 });
const svg = await page.$("svg");
if (!svg) {
  await browser.close();
  throw new Error("Mermaid produced no <svg>: the diagram did not render (see pageerror lines above)");
}
writeFileSync(`${dir}/flow.svg`, await svg.evaluate((el) => el.outerHTML));
await svg.screenshot({ path: `${dir}/flow.png` });
const box = await svg.boundingBox();
console.log("rendered", Math.round(box.width), "x", Math.round(box.height));
await browser.close();
