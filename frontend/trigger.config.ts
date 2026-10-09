import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  // The 'setebaid-website' project from setup section d.
  project: "proj_wvedymrsdowryxqiypcm",
  dirs: ["./trigger"],
  // Seconds of compute for one attempt; storing an entry takes well under one.
  maxDuration: 60,
});
