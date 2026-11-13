#!/usr/bin/env node
// Fail the production build when a required environment key is missing.
// A failed build keeps the previous deployment live; a missing key ships a
// broken form. Required = every key set (not commented out) in
// .env.local.example above its "# Optional" line. Runs before `next build`
// and does nothing outside Vercel's production environment.

import { readFileSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";

/** The keys .env.local.example sets above its "# Optional" line. */
export function requiredKeys(example) {
  const keys = [];
  for (const line of example.split("\n")) {
    if (/^#\s*Optional\b/i.test(line)) break;
    const match = /^([A-Z][A-Z0-9_]*)=/.exec(line);
    if (match) keys.push(match[1]);
  }
  return keys;
}

/** One message for each key the production environment gets wrong. */
export function productionEnvProblems(example, env) {
  return requiredKeys(example).flatMap((key) => {
    const value = env[key]?.trim();
    if (!value) return [`${key} is not set.`];
    // "echo" is Formspark's test endpoint: the form works, nobody gets it.
    if (key.startsWith("FORMSPARK_") && value === "echo") {
      return [`${key} is "echo", the test endpoint. Set the real form ID.`];
    }
    return [];
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.env.VERCEL_ENV !== "production") {
    console.log("Environment check: not a Vercel production build; skipped.");
  } else {
    const example = readFileSync(
      new URL("../.env.local.example", import.meta.url),
      "utf8",
    );
    const problems = productionEnvProblems(example, process.env);
    if (problems.length > 0) {
      console.error(
        `Production environment check failed:\n- ${problems.join("\n- ")}\n` +
          "Add the key in Vercel (project setebaid-2026, Production), then redeploy.",
      );
      process.exit(1);
    }
    console.log("Environment check: every required production key is set.");
  }
}
