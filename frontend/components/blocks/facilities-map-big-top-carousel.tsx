"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./facilities-map-section.module.css";

export type BigTopSlide = {
  alt: string;
  caption: string;
  key: string;
  lqip?: string;
  url: string;
};

export default function FacilitiesMapBigTopCarousel({
  autoplay,
  slides,
}: {
  autoplay: boolean;
  slides: BigTopSlide[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const resumeTimerRef = useRef<number | undefined>(undefined);
  const paused = hovered || keyboardFocused || manuallyPaused;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(media.matches);
    syncPreference();
    media.addEventListener("change", syncPreference);
    return () => media.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    if (!autoplay || paused || reducedMotion || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [autoplay, paused, reducedMotion, slides.length]);

  useEffect(
    () => () => {
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    },
    [],
  );

  if (!slides.length) return null;
  const activeSlide = slides[activeIndex] ?? slides[0];

  const select = (index: number) => {
    setActiveIndex(index);
    setManuallyPaused(true);
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      setManuallyPaused(false);
    }, 7000);
  };

  return (
    <div
      className={styles.carousel}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setKeyboardFocused(false);
        }
      }}
      onFocus={(event) => {
        if (
          event.target instanceof HTMLElement &&
          event.target.matches(":focus-visible")
        ) {
          setKeyboardFocused(true);
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {slides.map((slide, index) => (
        <div
          aria-hidden={index === activeIndex ? undefined : true}
          className={`${styles.carouselSlide} ${
            index === activeIndex ? styles.carouselSlideActive : ""
          }`}
          key={slide.key}
        >
          <Image
            alt={index === activeIndex ? slide.alt : ""}
            blurDataURL={slide.lqip}
            className={styles.carouselImage}
            fill
            placeholder={slide.lqip ? "blur" : "empty"}
            sizes="(max-width: 1023px) calc(100vw - 64px), 48vw"
            src={slide.url}
          />
        </div>
      ))}
      <div className={styles.carouselShade} />
      <p className={styles.carouselCaption} aria-live="polite">
        {activeSlide.caption}
      </p>

      {slides.length > 1 ? (
        <>
          <button
            aria-label="Previous photo"
            className={`${styles.carouselButton} ${styles.carouselPrevious}`}
            onClick={() => select((activeIndex - 1 + slides.length) % slides.length)}
            type="button"
          >
            ‹
          </button>
          <button
            aria-label="Next photo"
            className={`${styles.carouselButton} ${styles.carouselNext}`}
            onClick={() => select((activeIndex + 1) % slides.length)}
            type="button"
          >
            ›
          </button>
          <div className={styles.carouselDots}>
            {slides.map((slide, index) => (
              <button
                aria-label={`Show photo ${index + 1} of ${slides.length}`}
                aria-pressed={index === activeIndex}
                className={`${styles.carouselDot} ${
                  index === activeIndex ? styles.carouselDotActive : ""
                }`}
                key={slide.key}
                onClick={() => select(index)}
                type="button"
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
