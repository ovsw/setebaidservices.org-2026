#!/usr/bin/env node
// PROTOTYPE, throwaway. Visual verification bar (ovsw/ai-business-os#12).
// Captures every page in PAGES (unless capture.json exists) and judges it
// with each model in MODELS, in parallel per page. Evidence lives outside the
// repo, in EVIDENCE (default /work/dev/stb/visual-verification-bar).
//
//   node --env-file=studio/.env.local prototypes/visual-verification-bar/run-all.mjs [--only <slug>] [--models a,b] [--recapture]

import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const EVIDENCE = process.env.VVB_EVIDENCE ?? "/work/dev/stb/visual-verification-bar";
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const only = flag("--only");
const recapture = args.includes("--recapture");
const MODELS = (flag("--models", "claude-opus-5-5,claude-sonnet-5-5")).split(",").map((m) => m.trim()).filter(Boolean);
const labelOf = (m) => m.replace(/^claude-/, "");

// slug → folder name (also the plan file name under EVIDENCE/plans)
export const PAGES = {
  "about/alumni": "about-alumni",
  "parents/guide": "parents-guide",
  "get-involved": "get-involved",
  "donate/impact": "donate-impact",
  "donate/memorial": "donate-memorial",
  "donate/camperships": "donate-camperships",
  "camps/family-camp": "camps-family-camp",
  "volunteer/positions": "volunteer-positions",
  "dates-and-prices": "dates-and-prices",
  "parents/medical-care": "parents-medical-care",
};

function runSync(cmd, cmdArgs) {
  const r = spawnSync(cmd, cmdArgs, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`${cmd} ${cmdArgs.join(" ")} failed:\n${r.stdout}\n${r.stderr}`);
  return r.stdout.trim().split("\n").at(-1);
}
function runAsync(cmd, cmdArgs) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, cmdArgs, { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => (code === 0 ? resolve(out.trim().split("\n").at(-1)) : reject(new Error(`${cmdArgs.join(" ")}\n${out}\n${err}`))));
  });
}

for (const [slug, folder] of Object.entries(PAGES)) {
  if (only && only !== slug && only !== folder) continue;
  const dir = path.join(EVIDENCE, "pages", folder);
  const plan = path.join(EVIDENCE, "plans", `${folder}.md`);
  const rules = path.join(EVIDENCE, "rules", "stb-sections.md");
  if (recapture || !existsSync(path.join(dir, "capture.json"))) {
    console.log(`[${new Date().toISOString()}] capture ${slug}`);
    console.log("  " + runSync("node", ["--env-file=studio/.env.local", path.join(here, "capture.mjs"), slug, "--out", dir]));
  }
  const judges = MODELS.filter((m) => recapture || !existsSync(path.join(dir, "verdicts", `${labelOf(m)}.json`))).map((m) => {
    console.log(`[${new Date().toISOString()}] judge ${slug} with ${m}`);
    return runAsync("node", [path.join(here, "judge.mjs"), dir, "--rules", rules, "--plan", plan, "--model", m, "--label", labelOf(m)]).then(
      (line) => console.log("  " + line),
      (e) => console.log(`  FAILED ${m}: ${String(e.message).slice(0, 500)}`),
    );
  });
  await Promise.all(judges);
}
console.log(`[${new Date().toISOString()}] done`);
