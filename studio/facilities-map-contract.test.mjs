import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { contentPageBuilderBlockTypes } from "./schemas/blocks/page-builder.ts";
import { singletonDocumentTypes } from "./singletons.ts";

test("Facilities Map is shared and its configuration is a singleton", () => {
  assert.equal(contentPageBuilderBlockTypes.includes("facilitiesMapSection"), true);
  assert.equal(singletonDocumentTypes.has("facilitiesMap"), true);
});

test("the map editor keeps native array editing and opens markers by key", async () => {
  const source = await readFile(
    new URL(
      "./schemas/inputs/facility-map-placements-input.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const canvasSource = await readFile(
    new URL("./schemas/inputs/facility-map-canvas.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /props\.renderDefault\(props\)/);
  assert.match(
    source,
    /props\.onItemOpen\(\[\.\.\.props\.path, \{ _key: key \}\]\)/,
  );
  assert.match(source, /props\.onPathFocus\(\[\{ _key: key \}, "facility"\]\)/);
  assert.match(source, /set\(x, \[\{ _key: key \}, "x"\]\)/);
  assert.match(source, /set\(y, \[\{ _key: key \}, "y"\]\)/);
  assert.match(canvasSource, /onPlacementChange\(current\.key, current\.x, current\.y\)/);
});
