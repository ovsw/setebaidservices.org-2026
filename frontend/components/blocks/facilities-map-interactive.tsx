"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./facilities-map-section.module.css";
import {
  createFacilitiesMapPath,
  createFacilitiesMapTrailPath,
  type FacilitiesMapRouteSample,
} from "./facilities-map-path";

export type PublicFacilityPlacement = {
  description: string;
  descriptionDataAttribute?: string;
  featuredImage?: {
    alt: string;
    lqip?: string;
    url: string;
  };
  id: string;
  key: string;
  labelPosition: "above" | "auto" | "below" | "left" | "right";
  name: string;
  nameDataAttribute?: string;
  placementDataAttribute?: string;
  prominent: boolean;
  x: number;
  y: number;
};

type Point = { x: number; y: number };

type RouteMeasurements = {
  distances: number[];
  samples: FacilitiesMapRouteSample[];
  total: number;
};

const labelClassNames = {
  above: styles.labelAbove,
  auto: styles.labelAuto,
  below: styles.labelBelow,
  left: styles.labelLeft,
  right: styles.labelRight,
} satisfies Record<PublicFacilityPlacement["labelPosition"], string>;

function getRouteMeasurements(
  path: SVGPathElement,
  placements: PublicFacilityPlacement[],
): RouteMeasurements {
  const total = path.getTotalLength();
  if (!total || !placements.length) {
    return {
      distances: [],
      samples: [],
      total: 0,
    };
  }
  // 300 samples across a 100x100 viewBox is ~0.3-unit resolution, plenty for
  // both stop snapping and a smooth trail. Each sample is a getPointAtLength
  // call, and this survey blocks the main thread at mount.
  const sampleCount = Math.max(300, placements.length * 40);
  const samples: RouteMeasurements["samples"] = [];

  for (let index = 0; index <= sampleCount; index += 1) {
    const distance = (total * index) / sampleCount;
    const point = path.getPointAtLength(distance);
    samples.push({ distance, point });
  }

  const distances: number[] = [];
  let minimumSampleIndex = 0;

  for (const placement of placements) {
    let closestSampleIndex = minimumSampleIndex;
    let closestDelta = Number.POSITIVE_INFINITY;
    for (let index = minimumSampleIndex; index < samples.length; index += 1) {
      const sample = samples[index];
      if (!sample) continue;
      const delta = Math.hypot(
        sample.point.x - placement.x,
        sample.point.y - placement.y,
      );
      if (delta < closestDelta) {
        closestDelta = delta;
        closestSampleIndex = index;
      }
    }
    const closestSample = samples[closestSampleIndex];
    distances.push(closestSample?.distance ?? 0);
    minimumSampleIndex = Math.min(samples.length - 1, closestSampleIndex + 1);
  }

  return { distances, samples, total };
}

export default function FacilitiesMapInteractive({
  mapAlt,
  mapAspectRatio,
  mapDataAttribute,
  mapLocationDataAttribute,
  mapLocationLabel,
  mapLqip,
  mapUrl,
  placements,
  stopLabel,
  stopLabelDataAttribute,
  websiteAutoplay,
}: {
  mapAlt: string;
  /** CSS aspect-ratio ("width / height") of the uploaded map image. */
  mapAspectRatio?: string;
  mapDataAttribute?: string;
  mapLocationDataAttribute?: string;
  mapLocationLabel: string;
  mapLqip?: string;
  mapUrl: string;
  placements: PublicFacilityPlacement[];
  stopLabel: string;
  stopLabelDataAttribute?: string;
  websiteAutoplay: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const trailGlowRef = useRef<SVGPathElement>(null);
  const trailProgressRef = useRef<SVGPathElement>(null);
  const walkerRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const animationRef = useRef<number | undefined>(undefined);
  const walkerDistanceRef = useRef(0);
  const previousIndexRef = useRef(0);
  const manuallyPausedRef = useRef(false);
  const resumeTimerRef = useRef<number | undefined>(undefined);
  const [activeIndex, setActiveIndex] = useState(0);
  const [coordinate, setCoordinate] = useState("46.9455° N · 80.0585° W");
  const [routeMeasurements, setRouteMeasurements] =
    useState<RouteMeasurements>();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tourPaused, setTourPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [walkerPoint, setWalkerPoint] = useState<Point>(() => ({
    x: placements[0]?.x ?? 0,
    y: placements[0]?.y ?? 0,
  }));
  const [trailDistance, setTrailDistance] = useState(0);
  const pathData = useMemo(
    () => createFacilitiesMapPath(placements),
    [placements],
  );
  const trailPath = useMemo(
    () =>
      routeMeasurements
        ? createFacilitiesMapTrailPath(routeMeasurements.samples, trailDistance)
        : undefined,
    [routeMeasurements, trailDistance],
  );
  const activePlacement = placements[activeIndex] ?? placements[0];

  /** Write one in-flight animation frame straight to the DOM. Routing 60fps
      updates through React re-rendered the whole map every frame; state is
      synced once per hop instead, when the walker settles. */
  const applyTrailFrame = useCallback(
    (
      measured: RouteMeasurements,
      point: Point,
      distance: number,
    ) => {
      const d = createFacilitiesMapTrailPath(measured.samples, distance) ?? "";
      trailGlowRef.current?.setAttribute("d", d);
      trailProgressRef.current?.setAttribute("d", d);
      const walker = walkerRef.current;
      if (walker) {
        walker.style.left = `${point.x}%`;
        walker.style.top = `${point.y}%`;
      }
    },
    [],
  );

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(media.matches);
    syncPreference();
    media.addEventListener("change", syncPreference);
    return () => media.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { rootMargin: "100px", threshold: 0.05 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path || !pathData) return;
    const measure = () => {
      const measured = getRouteMeasurements(path, placements);
      const index = activeIndexRef.current;
      const distance = measured.distances[index] ?? 0;
      setRouteMeasurements(measured);
      walkerDistanceRef.current = distance;
      setTrailDistance(distance);
      setWalkerPoint({
        x: placements[index]?.x ?? 0,
        y: placements[index]?.y ?? 0,
      });
    };
    // The path lives in a fixed 0-100 viewBox, so its measured geometry never
    // changes when the element resizes. Survey once per path; no resize
    // handling needed (re-measuring on resize used to block for ~350ms).
    const frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [pathData, placements]);

  useEffect(() => {
    if (
      !websiteAutoplay ||
      tourPaused ||
      reducedMotion ||
      !visible ||
      placements.length < 2
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      if (manuallyPausedRef.current) return;
      setActiveIndex((current) => (current + 1) % placements.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [placements.length, reducedMotion, tourPaused, visible, websiteAutoplay]);

  useEffect(() => {
    const path = pathRef.current;
    const targetDistance = routeMeasurements?.distances[activeIndex];
    if (!path || targetDistance === undefined || !routeMeasurements) return;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const wrapping =
      previousIndexRef.current === placements.length - 1 && activeIndex === 0;
    previousIndexRef.current = activeIndex;
    if (wrapping || reducedMotion) {
      walkerDistanceRef.current = targetDistance;
      const point = path.getPointAtLength(targetDistance);
      setWalkerPoint(point);
      setTrailDistance(targetDistance);
      return;
    }

    const startDistance = walkerDistanceRef.current;
    const startedAt = performance.now();
    const duration = 900;
    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const distance = startDistance + (targetDistance - startDistance) * eased;
      walkerDistanceRef.current = distance;
      const point = path.getPointAtLength(distance);
      if (progress < 1) {
        applyTrailFrame(routeMeasurements, point, distance);
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setWalkerPoint(point);
        setTrailDistance(distance);
      }
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [activeIndex, applyTrailFrame, placements.length, reducedMotion, routeMeasurements]);

  const activate = (index: number) => {
    manuallyPausedRef.current = true;
    if (resumeTimerRef.current !== undefined) {
      window.clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = window.setTimeout(() => {
      manuallyPausedRef.current = false;
    }, 12_000);
    setActiveIndex(index);
  };

  const toggleTour = () => {
    if (tourPaused) {
      manuallyPausedRef.current = false;
      if (resumeTimerRef.current !== undefined) {
        window.clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = undefined;
      }
    }
    setTourPaused((paused) => !paused);
  };

  useEffect(
    () => () => {
      if (resumeTimerRef.current !== undefined) {
        window.clearTimeout(resumeTimerRef.current);
      }
    },
    [],
  );

  if (!activePlacement) return null;

  return (
    <div className={styles.mapArea} ref={rootRef}>
      <div className={styles.mapScroller}>
        <div
          className={styles.mapViewport}
          style={mapAspectRatio ? { aspectRatio: mapAspectRatio } : undefined}
          onPointerMove={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width;
            const y = (event.clientY - bounds.top) / bounds.height;
            const latitude = 46.9455 + (0.5 - y) * 0.006;
            const longitude = 80.0585 + (x - 0.5) * 0.01;
            setCoordinate(
              `${latitude.toFixed(4)}° N · ${longitude.toFixed(4)}° W`,
            );
          }}
        >
          <div className={styles.mapInner}>
            <Image
              alt={mapAlt}
              blurDataURL={mapLqip}
              className={styles.mapImage}
              data-sanity={mapDataAttribute}
              fill
              placeholder={mapLqip ? "blur" : "empty"}
              priority={false}
              sizes="(max-width: 639px) 800px, (max-width: 1023px) 1120px, 1320px"
              src={mapUrl}
            />
            <div className={styles.mapShade} />

            {pathData ? (
              <svg
                aria-hidden="true"
                className={styles.mapPath}
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <path
                  className={styles.mapPathShadow}
                  d={pathData}
                  ref={pathRef}
                />
                <path className={styles.mapPathDashed} d={pathData} />
                <path
                  className={styles.mapPathGlow}
                  d={trailPath ?? ""}
                  ref={trailGlowRef}
                />
                <path
                  className={styles.mapPathProgress}
                  d={trailPath ?? ""}
                  ref={trailProgressRef}
                />
              </svg>
            ) : null}

            {placements.map((placement, index) => (
              <button
                aria-label={`Explore ${placement.name}`}
                aria-pressed={index === activeIndex}
                className={`${styles.stop} ${
                  placement.prominent ? styles.stopProminent : ""
                } ${index === activeIndex ? styles.stopActive : ""}`}
                data-sanity={placement.placementDataAttribute}
                key={placement.key}
                onClick={() => activate(index)}
                onFocus={() => activate(index)}
                onMouseEnter={() => activate(index)}
                style={{ left: `${placement.x}%`, top: `${placement.y}%` }}
                type="button"
              >
                <span className={styles.stopDot} />
                <span
                  className={`${styles.stopLabel} ${
                    labelClassNames[placement.labelPosition]
                  }`}
                >
                  <span className={styles.stopLabelText}>{placement.name}</span>
                </span>
              </button>
            ))}

            <div
              className={styles.walker}
              ref={walkerRef}
              style={{ left: `${walkerPoint.x}%`, top: `${walkerPoint.y}%` }}
            >
              <span className={styles.walkerDot} />
            </div>
          </div>

          <div className={styles.mapTopBar}>
            <span
              className={styles.mapChip}
              data-sanity={mapLocationDataAttribute}
            >
              {mapLocationLabel}
            </span>
            <span className={styles.coordinateChip}>{coordinate}</span>
          </div>
          <div aria-label="North" className={styles.compass}>
            <span>
              <span className={styles.compassArrow}>▲</span>N
            </span>
          </div>
        </div>
      </div>

      <div className={styles.facilityCard}>
        <div className={styles.facilityCardMeta}>
          <span data-sanity={stopLabelDataAttribute}>{stopLabel}</span>
          <span className={styles.facilityNumber}>
            {String(activeIndex + 1).padStart(2, "0")} / {placements.length}
          </span>
          <span className={styles.facilityRule} />
          {websiteAutoplay && !reducedMotion ? (
            <button
              className={styles.tourControl}
              onClick={toggleTour}
              type="button"
            >
              {tourPaused ? (
                <Play aria-hidden="true" size={15} strokeWidth={2.25} />
              ) : (
                <Pause aria-hidden="true" size={15} strokeWidth={2.25} />
              )}
              <span>{tourPaused ? "Resume tour" : "Pause tour"}</span>
            </button>
          ) : null}
        </div>
        <div
          className={styles.facilityName}
          data-sanity={activePlacement.nameDataAttribute}
        >
          {activePlacement.name}
        </div>
        <p
          className={styles.facilityDescription}
          data-sanity={activePlacement.descriptionDataAttribute}
        >
          {activePlacement.description}
        </p>
      </div>

      {activePlacement.featuredImage ? (
        <figure className={`top-0 right-0 ${styles.facilityPhoto}`}>
          <div className={styles.facilityPhotoImage}>
            <Image
              alt={activePlacement.featuredImage.alt || ""}
              blurDataURL={activePlacement.featuredImage.lqip}
              className={styles.facilityImage}
              fill
              placeholder={
                activePlacement.featuredImage.lqip ? "blur" : "empty"
              }
              sizes="244px"
              src={activePlacement.featuredImage.url}
            />
          </div>
          <figcaption>{activePlacement.name.toUpperCase()}</figcaption>
        </figure>
      ) : null}
    </div>
  );
}
