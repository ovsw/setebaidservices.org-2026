"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./facilities-map-section.module.css";

export default function FacilitiesMapBigTopMetric({
  area,
  tagline,
  unit,
}: {
  area: number;
  tagline: string;
  unit: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [displayArea, setDisplayArea] = useState(area);

  useEffect(() => {
    const element = ref.current;
    let frame: number | undefined;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!element || reducedMotion) {
      setDisplayArea(area);
      return;
    }

    setDisplayArea(0);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const startedAt = performance.now();
        const duration = 1500;

        const tick = (now: number) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplayArea(Math.round(area * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [area]);

  return (
    <div className={styles.metric} ref={ref}>
      <div className={styles.metricRow}>
        <span className={styles.metricNumber}>{displayArea.toLocaleString()}</span>
        <span className={styles.metricUnit}>{unit}</span>
      </div>
      <span className={styles.metricTagline}>{tagline}</span>
    </div>
  );
}
