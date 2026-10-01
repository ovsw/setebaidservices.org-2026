# Plan: stop off-screen animations on `Homepage.dc.html`

## Problem

Sitting idle at the top of the page costs ~40% CPU (renderer) + ~34% GPU on a 120Hz Mac.
Cause: 29 forever-looping CSS animations run all the time, 27 of them off-screen, plus the
globe's JS frame loop runs 120×/s even while the globe itself is paused. Any live animation
forces the browser to redraw 120×/s, so the page never idles.

Measured (page's own share, idle at top, DPR 1):

| State | CPU | GPU |
|---|---|---|
| as shipped | 40% | 34% |
| all loops paused + globe loop stopped | 3% | ~20% floor |

Per group (only that group running): marquees +15%, blink dots +11%, map dashed path +8%,
map pings +6%, globe loop +5%. Any single animation keeps the screen awake for ~+11%.

Not the cause: globe WebGL (already paused off-screen), hero video (hero is a photo),
backdrop-filter blur (removing all 60 changed nothing).

## Goal

- Off-screen sections: zero running animations, no rAF loop.
- On-screen: unchanged look and behaviour.
- Target: idle at top ≈ 15% (hero cue + ticker remain), ≈ 3% once scrolled past the hero.

## Files

Only `prototype/Homepage.dc.html`. `responsive/base.css:30` already pauses everything under
`prefers-reduced-motion`; leave it.

## Steps

### 1. Add a section-level animation gate (component JS, next to the other IntersectionObservers in `componentDidMount`, ~line 1378)

One `IntersectionObserver` with `rootMargin: "20% 0px"`, `threshold: 0`, observing every
`<section>` inside the page root (`document.querySelectorAll("section")`).

Callback per entry:

```js
const anims = entry.target.getAnimations({ subtree: true })
  .filter(a => a instanceof CSSAnimation && a.effect.getTiming().iterations === Infinity);
anims.forEach(a => entry.isIntersecting ? a.play() : a.pause());
```

Why the filter: scroll-driven `riseUp` / `parallaxY` entries (`animation-timeline: view()`)
must NOT be touched; pausing freezes their progress. Infinite iterations is the exact set
we want: `marqL` (244, 861-921), `blink` (479, 487, 975, 1025, 1057), `mapPing` (574),
`wanderDash` (566), `spinSlow` (286), `cueDrop` (238).

Run the gate once on mount and again in `componentDidUpdate` after any re-render that
swaps DOM (the `getAnimations` call re-queries, so calling it again is cheap).
Store as `this._aio`; disconnect in `componentWillUnmount`.

Careful: `[data-r="rivers"]:hover [data-triver]` (line 61) pauses rivers via CSS
`animation-play-state`. `Animation.play()` from JS overrides that until the next style
change. Keep hover working by making the gate only call `play()` if
`a.playState === "paused"` **and** the section was previously marked off-screen
(`entry.target.dataset.offscreen === "1"`); set/clear that flag in the callback.

### 2. Start/stop the globe's JS loop with visibility (`_initWorld`, ~lines 1680-1696)

Today: `loop()` starts unconditionally at line 1695-1696 and `_setGlobeRunning` only
toggles cobe. Change:

```js
this._startWorldLoop = () => { if (this._wRaf) return; const loop = () => { this._stepWorld(); this._wRaf = requestAnimationFrame(loop); }; loop(); };
this._stopWorldLoop  = () => { if (this._wRaf) cancelAnimationFrame(this._wRaf); this._wRaf = null; };
```

In the existing `_wio` callback (line 1685): on intersect call `_startWorldLoop()`, else
`_stopWorldLoop()`. Remove the unconditional `loop()` call. If `IntersectionObserver` is
missing, start the loop unconditionally (existing fallback behaviour).

`_stepWorld` keeps advancing `_phiCur` only while running, so the globe resumes from where
it stopped instead of jumping. That is fine and matches "framing byte-identical".

### 3. Hero cue line (line 238, `cueDrop`)

Optional, Ovi's call: leave as is, or add `animation-iteration-count: 4` so the hero goes
fully idle after ~9s. Ticker (line 244) stays infinite; it is the one intentional
always-on element while the hero is visible.

### 4. Do not touch

- `riseUp` / `parallaxY` scroll-driven animations.
- `slot.anim` (`entryPop`, line 486/1782), `stampIn`, `slideDown`: finite, one-shot.
- cobe config, `_drawArcs`, backdrop-filters.

## Verify (required, not optional)

Open `http://localhost:4173/Homepage.dc.html?v=10` (reuse the running server on 4173).

1. In console at scroll 0:
   `document.getAnimations().filter(a=>a.playState==='running'&&a.effect.getTiming().iterations===Infinity).length`
   → must be `2` (cue + hero ticker). Was 29.
2. Scroll to `#world`: globe spins and arcs fly; scroll away; `inst._wRaf` is null and
   `inst._globePaused` is true (find the instance via the canvas's React fiber →
   `stateNode.logic`).
3. Scroll to testimonials: all four rivers drift; hovering still pauses them; scroll away
   and back: they resume.
4. Scroll the whole page once: `riseUp` entrances still play on every section.
5. CPU: sample the preview renderer process with `top -l 6 -s 1 -pid <renderer>` idle at
   top; expect ≈ 15% vs 40% before, ≈ 3% when parked on a section with no loops
   (e.g. `#rates`).
6. Visually check hero, map, rivers, globe screenshots against current look.
