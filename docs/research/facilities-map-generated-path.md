# Generated path for the Facilities Map

## Recommendation

Generate one open SVG path from the singleton's ordered Facility placements with `d3-shape`:

```ts
line<Placement>()
  .x(({ x }) => (x / 100) * mapWidth)
  .y(({ y }) => (y / 100) * mapHeight)
  .curve(curveCatmullRom.alpha(0.5))(placements)
```

This is technically straightforward. D3's line generator returns SVG path data from an ordered array, and its centripetal Catmull-Rom curve is the library's recommended choice for reducing spline overshoot and local self-intersection. It also converts the spline to cubic Bezier commands and handles short or coincident runs more carefully than a small custom implementation would. [D3 line generator](https://d3js.org/d3-shape/line), [D3 curve reference](https://d3js.org/d3-shape/curve), [D3 Catmull-Rom source](https://github.com/d3/d3-shape/blob/main/src/curve/catmullRom.js)

Keep a straight `curveLinear` fallback for fewer than three valid placements. Do not expose the curve type to editors. The route should have one predictable house style.

## What the prototype proves

The current [`Homepage.dc.html`](../../frontend/prototype/Homepage.dc.html) already uses the ordered Facility array for progression. Its hand-authored SVG path passes through those same 16 marker coordinates in order. Its `_trailPct()` helper separately samples a uniform Catmull-Rom spline to estimate the highlighted trail length.

That split should not move into production. One generated `d` string should power the visible path, highlighted trail, and moving walker. Otherwise those elements can drift apart after an editor moves or reorders a marker.

The prototype's uniform Catmull-Rom formula is also the less safe parameterization. D3 documents `alpha(0.5)`, the centripetal form, as the recommended setting to reduce overshoot and self-intersections. [D3 curve reference](https://d3js.org/d3-shape/curve#curveCatmullRom_alpha)

## Options considered

| Method | Result for editors | Cost and risk | Decision |
| --- | --- | --- | --- |
| Custom Catmull-Rom-to-Bezier | Smooth path through every ordered marker, with complete control | The endpoint rules, duplicate-point handling, and distance bookkeeping become our code. D3's source has epsilon guards and several point-count branches that a quick implementation can easily miss. | Reject for the first version. |
| D3 `curveCatmullRom.alpha(0.5)` | Smooth path through the ordered tour with safer bends | Adds `d3-shape` and its types, but keeps the math in a focused, maintained library. | Use this. |
| D3 `curveBasis` | Very soft path | It does not pass through every interior control point, so the route can miss Facility markers. | Reject. |
| D3 `curveMonotoneX/Y` | Smooth chart-like line without extra extrema | It assumes monotonic x or y data. A route around an island doubles back on both axes. | Reject. |
| D3 `curveLinear`, or a plain SVG polyline | Exact, non-overshooting route through every marker | Corners are visibly angular. Rounded line joins help, but it will not match the prototype's wandering path. | Keep only as the safe short-data fallback. |

D3 documents each of these curve behaviors in its [official curve reference](https://d3js.org/d3-shape/curve).

## What automatic interpolation cannot do

A spline only knows marker coordinates and array order. It does not know where the lake, buildings, or real woodchip paths are. It also cannot prevent a crossing when the editor's order itself crosses the map.

For this design, that is acceptable if the line means "tour order." The custom input should make mistakes obvious:

- Draw the regenerated path while a marker is dragged or the array is reordered.
- Warn when two Facilities share almost the same point.
- Warn when sampled, non-adjacent path segments cross. Keep this a warning because a crossing may be intentional.
- Require unique Facility references and coordinates from 0 through 100.

Do not silently reorder Facilities to fix crossings. That would change the editor's tour.

If the line must later follow real trails, add optional route waypoints between Facility stops on the map singleton. That is a different content requirement. Facility markers alone cannot infer a geographically accurate route.

## Open path and looping

Use the open `curveCatmullRom`, not `curveCatmullRomClosed`. The ordered array describes a trip from the first Facility to the last. Closing the spline invents a visible last-to-first route that does not exist.

Public autoplay can pause at the last Facility, fade or reset the walker to the first, then start again. Array order remains the only progression order. No separate starting Facility is needed.

## Responsive coordinates

Store each marker as `{x, y}` percentages in the singleton placement item. Percentages survive responsive resizing. They do not survive a replacement map with different geography or cropping, which is why the placements belong beside that map image in the singleton.

At render time:

1. Read the map asset's intrinsic width and height.
2. Give the SVG that exact `viewBox`, such as `0 0 1320 766`.
3. Convert each percentage into viewBox units.
4. Keep the image, path, markers, and labels inside the same aspect-ratio box and apply any pan or zoom to their shared wrapper.

SVG maps its `viewBox` coordinate system to the rendered viewport, so the same path and marker coordinates resize together. [MDN `viewBox`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/viewBox)

The Studio drag input must calculate percentages against the displayed image bounds, excluding any letterbox space. It should patch the placement by its stable `_key`, not by array index. Sanity warns that array indices become unreliable when collaborators insert, remove, or reorder items. [Sanity real-time safe patches](https://www.sanity.io/docs/studio/from-input-components-to-real-time-safe-patches)

## Trail and walker animation

Render the generated `d` on one canonical `<path>` and reuse it for every effect:

- Set `pathLength="100"` on the highlighted path. SVG then normalizes dash calculations, so `stroke-dasharray` can reveal the route from 0 to 100 without knowing its pixel length. [MDN `pathLength`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/pathLength)
- Call `getTotalLength()` once after `d` changes.
- Use `getPointAtLength(progress * totalLength)` to place the walker on that exact path. Both APIs are established browser features. [MDN `getTotalLength()`](https://developer.mozilla.org/en-US/docs/Web/API/SVGPathElement/getTotalLength), [MDN `getPointAtLength()`](https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getPointAtLength)
- Precompute each Facility's distance along the path when `d` changes. A forward-only sampled search is enough for 16 stops because the spline visits them in array order. Refine locally around the nearest sample. This keeps progression, active cards, trail reveal, and walker position tied to the same geometry.

Use one `requestAnimationFrame` loop while the section is visible. Calculate progress from its timestamp, not by counting frames. Browsers usually pause these callbacks in hidden tabs, and `IntersectionObserver` can stop the loop while the section is offscreen. [MDN `requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), [MDN Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

For 16 points, path generation and the one-time distance scan are small. Recompute only when the ordered placements or map dimensions change, not on every animation frame.

## Reduced motion and editor preview

On the Website, autoplay should run only when all three conditions are true:

- The singleton's Website autoplay setting is on.
- The section is visible.
- `matchMedia("(prefers-reduced-motion: reduce)")` does not match.

Listen for changes to the media query so autoplay stops if the visitor changes the operating-system setting. The media query reports that preference, and `matchMedia()` supports both current checks and change events. [MDN `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion), [MDN `matchMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia)

The Studio preview should always start paused, even when Website autoplay is on. Its Play button should change local React state only. It must not call the Sanity input's `onChange`, because that callback writes patches to the field value. Dragging a marker or reordering the array should pause the preview. [Sanity form component API](https://www.sanity.io/docs/studio/form-components-reference)

This gives editors a still map while they work and an explicit way to test the final progression. It does not weaken the public default.

## Repository fit

- The project has no D3 dependency today. Add the focused `d3-shape` package, not the full `d3` bundle.
- Keep the path generator in shared frontend-safe TypeScript so the Website and Studio preview use identical geometry.
- The existing singleton registry in [`studio/singletons.ts`](../../studio/singletons.ts) already supplies the right document behavior.
- The custom input should preserve the normal ordered array editor with `renderDefault(props)` and add the draggable map preview above it. That keeps Sanity's built-in reorder controls available. Sanity's component API explicitly supports composing a custom input around the default one. [Sanity form components](https://www.sanity.io/docs/studio/form-components)
- Follow the Page Builder vertical slice in [`docs/agents/page-builder.md`](../agents/page-builder.md) when implementation is approved.

## Bottom line

Yes, the path can regenerate automatically from editable markers. Use D3's open centripetal Catmull-Rom curve, make the live Studio preview the guardrail, and derive both the trail and walker from the generated SVG path. Treat it as a visual tour route. If it ever needs to trace real trails, marker coordinates alone are not enough.
