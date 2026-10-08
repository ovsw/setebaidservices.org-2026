import { defineConfig } from "@trigger.dev/sdk";

const project = process.env.TRIGGER_PROJECT_REF;
if (!project) {
  throw new Error("Set TRIGGER_PROJECT_REF to the Trigger.dev project ref (setup section d).");
}

export default defineConfig({
  project,
  dirs: ["./trigger"],
  // Seconds of compute for one attempt; storing an entry takes well under one.
  maxDuration: 60,
});
