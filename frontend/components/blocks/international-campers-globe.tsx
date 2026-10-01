"use client";

import { useInView, useReducedMotion } from "motion/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./international-campers-section.module.css";

type Route = {
  readonly code: string;
  readonly city: string;
  readonly country: string;
  readonly lat: number;
  readonly lng: number;
  readonly km: number;
  readonly pickup?: boolean;
};

type Destination = {
  readonly lat: number;
  readonly lng: number;
};

type Props = {
  routes: readonly Route[];
  destination: Destination;
  children: ReactNode;
};

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;

/** Canvas backing-store size. Matches the 620px CSS box at 1x; we accept the
    slight softness on retina in exchange for 1/4 the pixels per frame. */
const SIZE = 620;
const CENTER = SIZE / 2;
const RADIUS = 248;
/** Segments per arc. Each segment is a separate stroke (its alpha depends on
    globe depth), so this number is the per-arc draw-call count per frame. */
const ARC_SEGMENTS = 32;


/** Build arc points between a city and the destination on a great circle. */
function buildArcPoints(
  cityLat: number,
  cityLng: number,
  destLat: number,
  destLng: number,
) {
  const toVec = (lat: number, lng: number) => {
    const la = lat * DEG;
    const lo = lng * DEG;
    return [Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)] as const;
  };
  const av = toVec(cityLat, cityLng);
  const dv = toVec(destLat, destLng);
  const dot = Math.max(-1, Math.min(1, av[0] * dv[0] + av[1] * dv[1] + av[2] * dv[2]));
  const ang = Math.acos(dot);
  const h = 0.05 + 0.3 * (ang / Math.PI);
  const N = ARC_SEGMENTS;
  const pts: [number, number, number][] = [];
  for (let k = 0; k <= N; k++) {
    const tt = k / N;
    const sA = Math.sin((1 - tt) * ang) / Math.sin(ang);
    const sB = Math.sin(tt * ang) / Math.sin(ang);
    const px = sA * av[0] + sB * dv[0];
    const py = sA * av[1] + sB * dv[1];
    const pz = sA * av[2] + sB * dv[2];
    pts.push([
      Math.asin(Math.max(-1, Math.min(1, py))),
      Math.atan2(pz, px),
      h * Math.sin(Math.PI * tt),
    ]);
  }
  return pts;
}

export default function InternationalCampersGlobe({
  routes,
  destination,
  children,
}: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arcsCanvasRef = useRef<HTMLCanvasElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  // Wake only once a meaningful slice of the section is on screen; at the old
  // 2% threshold the globe burned GPU while barely peeking into the viewport.
  const isVisible = useInView(sectionRef, { amount: 0.15 });
  const reducedMotion = useReducedMotion();

  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  /** Click-locked city persists until Escape or re-click; hover is transient. */
  const lockedRef = useRef<number | null>(null);
  const [globeFailed, setGlobeFailed] = useState(false);

  // Mutable refs for the render loop
  const stateRef = useRef({
    phiCur: 5.7,
    thetaCur: 0.3,
    vel: 0,
    dragging: false,
    dragX: 0,
    focusIdx: null as number | null,
    routes: null as ReturnType<typeof buildArcPoints>[] | null,
    routeMeta: null as { per: number; t0: number; mid: [number, number, number] }[] | null,
    globe: null as { destroy: () => void; toggle?: (shouldRender: boolean) => void } | null,
    globePaused: false,
    wRaf: null as number | null,
    gcx: CENTER,
    gcy: CENTER,
    gR: RADIUS,
    isVisible: false,
    reducedMotion: false,
  });

  // Build arc data once
  useEffect(() => {
    const arcPts = routes.map((r) =>
      buildArcPoints(r.lat, r.lng, destination.lat, destination.lng),
    );
    const meta = routes.map((_, i) => ({
      per: 6.5 + (i % 4) * 0.9,
      t0: -(i * 1.7),
      mid: arcPts[i][ARC_SEGMENTS / 2] as [number, number, number],
    }));
    stateRef.current.routes = arcPts;
    stateRef.current.routeMeta = meta;
  }, [routes, destination]);

  // Sync focus index
  useEffect(() => {
    stateRef.current.focusIdx = focusIndex;
  }, [focusIndex]);

  // Sync visibility and reduced motion
  useEffect(() => {
    stateRef.current.isVisible = isVisible;
  }, [isVisible]);

  useEffect(() => {
    stateRef.current.reducedMotion = reducedMotion ?? false;
  }, [reducedMotion]);

  /** Orthographic projection matching cobe's camera model. */
  const project = useCallback(
    (la: number, lo: number, alt: number) => {
      const s = stateRef.current;
      const d = lo + s.phiCur - 4.712389;
      const sc = 1 + alt;
      const x = Math.cos(la) * Math.sin(d) * sc;
      const y = Math.sin(la) * sc;
      const z = Math.cos(la) * Math.cos(d) * sc;
      const y2 = y * Math.cos(s.thetaCur) - z * Math.sin(s.thetaCur);
      const z2 = y * Math.sin(s.thetaCur) + z * Math.cos(s.thetaCur);
      return { x: s.gcx + s.gR * x, y: s.gcy - s.gR * y2, z: z2 };
    },
    [],
  );

  /** Draw arc trails and markers on the overlay canvas. */
  const drawArcs = useCallback(
    (now: number) => {
      const ctx = arcsCanvasRef.current?.getContext("2d");
      const s = stateRef.current;
      if (!ctx || !s.routes || !s.routeMeta) return;
      ctx.clearRect(0, 0, SIZE, SIZE);

      const F = s.focusIdx;
      const amber = (a: number) => `rgba(232,162,59,${a})`;
      const cream = (a: number) => `rgba(243,239,226,${a})`;
      const depth = (z: number) => Math.max(0, Math.min(1, (z + 0.02) / 0.2));
      ctx.lineCap = "round";

      s.routes.forEach((pts, i) => {
        const meta = s.routeMeta![i];
        const dim = F != null && F !== i;
        const hot = F === i;
        const base = dim ? 0.07 : hot ? 0.75 : 0.3;
        const P = pts.map((p) => project(p[0], p[1], p[2]));

        // Static arc
        for (let k = 0; k < P.length - 1; k++) {
          const a = depth(Math.min(P[k].z, P[k + 1].z)) * base;
          if (a < 0.01) continue;
          ctx.strokeStyle = amber(a);
          ctx.lineWidth = hot ? 2.25 : 1.3;
          ctx.beginPath();
          ctx.moveTo(P[k].x, P[k].y);
          ctx.lineTo(P[k + 1].x, P[k + 1].y);
          ctx.stroke();
        }

        // Animated head (skip if reduced motion and no explicit focus).
        // The head position interpolates between segment joints so it glides
        // instead of clicking forward one joint at a time.
        if (!s.reducedMotion || hot) {
          const tt = (((now - meta.t0) / meta.per) % 1 + 1) % 1;
          const headF = tt * (P.length - 1);
          const head = Math.floor(headF);
          const frac = headF - head;
          const next = P[Math.min(head + 1, P.length - 1)];
          const hp = {
            x: P[head].x + (next.x - P[head].x) * frac,
            y: P[head].y + (next.y - P[head].y) * frac,
            z: P[head].z + (next.z - P[head].z) * frac,
          };
          const tail = Math.max(0, head - 5);
          for (let k = tail; k < head; k++) {
            const f = (k - tail) / Math.max(1, head - tail);
            const a = depth(P[k + 1].z) * (dim ? 0.16 : 1) * f;
            if (a < 0.02) continue;
            ctx.strokeStyle = amber(a);
            ctx.lineWidth = (hot ? 3.25 : 2.4) * (0.5 + 0.5 * f);
            ctx.beginPath();
            ctx.moveTo(P[k].x, P[k].y);
            ctx.lineTo(P[k + 1].x, P[k + 1].y);
            ctx.stroke();
          }
          // Partial segment from the last joint to the interpolated head
          const pa = depth(hp.z) * (dim ? 0.16 : 1);
          if (pa >= 0.02 && frac > 0) {
            ctx.strokeStyle = amber(pa);
            ctx.lineWidth = hot ? 3.25 : 2.4;
            ctx.beginPath();
            ctx.moveTo(P[head].x, P[head].y);
            ctx.lineTo(hp.x, hp.y);
            ctx.stroke();
          }
          // Head glow
          const ha = depth(hp.z) * (dim ? 0.15 : 1);
          if (ha > 0.02) {
            ctx.fillStyle = `rgba(255,236,200,${ha})`;
            ctx.beginPath();
            ctx.arc(hp.x, hp.y, hot ? 2.5 : 1.75, 0, TAU);
            ctx.fill();
          }
        }

        // Origin dot
        const o = P[0];
        const oa = depth(o.z);
        if (oa > 0.02) {
          ctx.fillStyle = cream(0.8 * oa * (dim ? 0.3 : 1));
          ctx.beginPath();
          ctx.arc(o.x, o.y, 1.5, 0, TAU);
          ctx.fill();
          if (!s.reducedMotion) {
            const tt = (((now - meta.t0) / meta.per) % 1 + 1) % 1;
            if (tt < 0.12 && !dim) {
              const pr = tt / 0.12;
              ctx.strokeStyle = cream((1 - pr) * 0.55 * oa);
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(o.x, o.y, 2 + pr * 12, 0, TAU);
              ctx.stroke();
            }
          }
        }
      });

      // Destination marker
      const dp = project(destination.lat * DEG, destination.lng * DEG, 0.004);
      const da = depth(dp.z);
      if (da > 0.02) {
        ctx.fillStyle = amber(da);
        ctx.beginPath();
        ctx.arc(dp.x, dp.y, 2.5, 0, TAU);
        ctx.fill();
        if (!s.reducedMotion) {
          for (let j = 0; j < 2; j++) {
            const pr = ((now / 2.2 + j * 0.5) % 1 + 1) % 1;
            ctx.strokeStyle = amber((1 - pr) * 0.5 * da);
            ctx.lineWidth = 1.25;
            ctx.beginPath();
            ctx.arc(dp.x, dp.y, 3.5 + pr * 18, 0, TAU);
            ctx.stroke();
          }
        }
      }

      // Tag label
      const tag = tagRef.current;
      if (tag) {
        // The anchor point is the stem tip, so translate to the projected
        // point exactly; the tag's own wrapper offsets it up and left.
        // The 620px box shrinks below 620px via max-w-full, so map canvas
        // coordinates to displayed CSS pixels before positioning.
        const scale = (canvasRef.current?.clientWidth ?? SIZE) / SIZE;
        tag.style.transform = `translate(${(dp.x * scale).toFixed(1)}px,${(dp.y * scale).toFixed(1)}px)`;
        tag.style.opacity = Math.max(0, Math.min(1, (dp.z - 0.05) * 9)).toFixed(2);
      }
    },
    [project, destination],
  );

  /** Step the globe camera and (on draw ticks) redraw arcs. */
  const stepWorld = useCallback(
    (draw: boolean) => {
      const now = performance.now() / 1000;
      const s = stateRef.current;
      if (!s.dragging) {
        if (s.focusIdx != null && s.routeMeta) {
          const m = s.routeMeta[s.focusIdx].mid;
          const dph =
            (((4.712389 - m[1] - s.phiCur) % TAU) + TAU * 1.5) % TAU -
            Math.PI;
          s.phiCur += dph * 0.06;
          s.thetaCur +=
            (Math.max(0.08, Math.min(0.8, m[0])) - s.thetaCur) * 0.06;
        } else {
          s.vel *= 0.94;
          // Auto-rotate only with no reduced-motion preference
          s.phiCur += (s.reducedMotion ? 0 : 0.0032) + s.vel;
          s.thetaCur += (0.3 - s.thetaCur) * 0.04;
        }
      }
      if (draw && s.isVisible) drawArcs(now);
    },
    [drawArcs],
  );

  // Render loop management. The camera steps every frame (cheap math, keeps
  // rotation speed constant) but the arcs canvas redraws only every other
  // frame - 30fps is indistinguishable on these slow-moving trails.
  const startLoop = useCallback(() => {
    const s = stateRef.current;
    if (s.wRaf != null) return;
    let drawTick = false;
    const loop = () => {
      drawTick = !drawTick;
      stepWorld(drawTick);
      s.wRaf = requestAnimationFrame(loop);
    };
    loop();
  }, [stepWorld]);

  const stopLoop = useCallback(() => {
    const s = stateRef.current;
    if (s.wRaf != null) {
      cancelAnimationFrame(s.wRaf);
      s.wRaf = null;
    }
  }, []);

  // Pause/resume cobe's internal rAF
  const setGlobeRunning = useCallback((run: boolean) => {
    const s = stateRef.current;
    const g = s.globe;
    if (!g || typeof g.toggle !== "function") return;
    if (run && s.globePaused) {
      try { g.toggle(true); } catch {}
      s.globePaused = false;
    } else if (!run && !s.globePaused) {
      try { g.toggle(false); } catch {}
      s.globePaused = true;
    }
  }, []);

  // Visibility-driven start/stop
  useEffect(() => {
    if (isVisible) {
      startLoop();
      setGlobeRunning(true);
    } else {
      stopLoop();
      setGlobeRunning(false);
    }
    return stopLoop;
  }, [isVisible, startLoop, stopLoop, setGlobeRunning]);

  // Initialize cobe globe
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    const s = stateRef.current;

    // Pointer drag handlers
    const onDown = (e: PointerEvent) => {
      s.dragging = true;
      s.dragX = e.clientX;
      s.vel = 0;
      cv.setPointerCapture(e.pointerId);
      cv.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!s.dragging) return;
      const dx = e.clientX - s.dragX;
      s.dragX = e.clientX;
      s.phiCur += dx * 0.005;
      s.vel = dx * 0.002;
    };
    const onUp = () => {
      s.dragging = false;
      cv.style.cursor = "grab";
    };

    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup", onUp);
    cv.addEventListener("pointercancel", onUp);

    const markers = [
      ...routes.map((c) => ({
        location: [c.lat, c.lng] as [number, number],
        size: 0.05,
      })),
      {
        location: [destination.lat, destination.lng] as [number, number],
        size: 0.1,
      },
    ];

    import("cobe").then((m) => {
      if (canvasRef.current !== cv) return;
      try {
        s.globe = m.default(cv, {
          devicePixelRatio: 1,
          width: SIZE,
          height: SIZE,
          phi: s.phiCur,
          theta: s.thetaCur,
          dark: 1,
          diffuse: 1.2,
          mapSamples: 22000,
          mapBrightness: 7.5,
          baseColor: [0.43, 0.52, 0.31],
          markerColor: [0.95, 0.67, 0.26],
          glowColor: [0.1, 0.13, 0.07],
          opacity: 0.92,
          markers,
          onRender: (state: Record<string, number>) => {
            state.phi = s.phiCur;
            state.theta = s.thetaCur;
          },
        });
        if (!s.isVisible) setGlobeRunning(false);
      } catch {
        setGlobeFailed(true);
      }
    }).catch(() => {
      // Offline fallback: draw a simple sphere
      const g = cv.getContext("2d");
      if (g) {
        g.clearRect(0, 0, SIZE, SIZE);
        const grad = g.createRadialGradient(250, 230, 45, CENTER, CENTER, 270);
        grad.addColorStop(0, "#3A4E24");
        grad.addColorStop(1, "#1B2611");
        g.fillStyle = grad;
        g.beginPath();
        g.arc(CENTER, CENTER, RADIUS, 0, TAU);
        g.fill();
      }
    });

    return () => {
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerup", onUp);
      cv.removeEventListener("pointercancel", onUp);
      stopLoop();
      if (s.globe) {
        try { s.globe.destroy(); } catch {}
        s.globe = null;
      }
    };
  }, [routes, destination, stopLoop, setGlobeRunning]);

  /** Resolve a route button from a DOM event target. */
  const resolveRoute = useCallback(
    (target: EventTarget | null) => {
      const button = (target as HTMLElement | null)?.closest?.<HTMLButtonElement>(
        "button[data-route]",
      );
      if (!button) return -1;
      const code = button.dataset.route;
      return routes.findIndex((r) => r.code === code);
    },
    [routes],
  );

  /** Click locks focus on a city (or toggles it off). */
  const handleRouteClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const idx = resolveRoute(e.target);
      if (idx === -1) return;

      lockedRef.current = lockedRef.current === idx ? null : idx;
      setFocusIndex(lockedRef.current);

      // Restart the route animation on re-select
      const s = stateRef.current;
      if (s.routeMeta && lockedRef.current === idx) {
        s.routeMeta[idx].t0 = performance.now() / 1000;
      }
    },
    [resolveRoute],
  );

  /** Hover shows the route temporarily (desktop only). */
  const handleRouteEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const idx = resolveRoute(e.target);
      if (idx !== -1) setFocusIndex(idx);
    },
    [resolveRoute],
  );

  /** Leaving a route row reverts to the click-locked city (or none). */
  const handleRouteLeave = useCallback(() => {
    setFocusIndex(lockedRef.current);
  }, []);

  /** Handle keyboard navigation. */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        lockedRef.current = null;
        setFocusIndex(null);
      }
    },
    [],
  );

  // Set aria-pressed on route buttons
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const focusCode = focusIndex != null ? routes[focusIndex]?.code : null;
    const buttons = section.querySelectorAll<HTMLButtonElement>("button[data-route]");
    buttons.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.route === focusCode));
    });
  }, [focusIndex, routes]);

  return (
    <div
      ref={sectionRef}
      className="grid items-start gap-2 lg:grid-cols-[1fr_620px] lg:gap-10 xl:gap-[70px]"
      onClick={handleRouteClick}
      onMouseOver={handleRouteEnter}
      onMouseOut={handleRouteLeave}
      onKeyDown={handleKeyDown}
    >
      {/* Globe visual */}
      {!globeFailed && (
        <div className={`max-lg:order-first max-lg:mx-auto lg:order-last lg:justify-self-end ${styles.globeContainer}`}>
          <div className="relative w-[620px] h-[620px] max-w-full" style={{ aspectRatio: "1" }}>
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              width={SIZE}
              height={SIZE}
              className="block h-full w-full cursor-grab"
              style={{ contain: "layout paint size" }}
            />
            <canvas
              ref={arcsCanvasRef}
              aria-hidden="true"
              width={SIZE}
              height={SIZE}
              className="pointer-events-none absolute inset-0 h-full w-full"
            />
            {/* Destination tag */}
            <div
              ref={tagRef}
              className="pointer-events-none absolute left-0 top-0 opacity-0"
              style={{ willChange: "transform, opacity" }}
            >
              <div className="-translate-x-1/2 -translate-y-full">
                {/* Counter-scaled on mobile from bottom center, so the stem tip
                    stays pinned to the island while the globe box shrinks. */}
                <div
                  className={`flex flex-col items-center ${styles.islandTagScale}`}
                >
                  {/* Cloned per-line strips, matching the camp map markers: the
                      outer span is the block holder, the inner one repeats its
                      background on each line. */}
                  <span className="block text-center font-mono text-[14px] font-bold leading-[1.35] tracking-[.01em] [filter:drop-shadow(0_6px_18px_rgba(0,0,0,.4))]">
                    <span className="bg-campfire-amber px-[11px] py-1 text-pine-night [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">
                      ADVENTURE ISLAND<br />LAKE TEMAGAMI
                    </span>
                  </span>
                  <span className="h-[13px] w-[1.5px] bg-campfire-amber/75" />
                </div>
              </div>
            </div>
          </div>
          <noscript>
            <p className="mt-2 text-center font-mono text-[14px] leading-snug tracking-[.01em] text-birch-bark/65">
              Enable JavaScript to interact with the globe.
            </p>
          </noscript>
        </div>
      )}

      {/* Route list (children from server component) */}
      {children}
    </div>
  );
}
