"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { HeaderTheme } from "./theme";

export const SITE_HEADER_OFFSET_PROPERTY = "--site-header-offset";

/**
 * The value a hero puts in `data-header-overlay`. An empty value keeps the
 * configured theme (light text over a photo); "light" asks for dark text,
 * for a hero on a light ground such as the home page.
 */
function readOverlayTheme(overlay: Element | null): HeaderTheme | null {
  if (!overlay) return null;
  return overlay.getAttribute("data-header-overlay") === "light" ? "light" : "dark";
}

export function SiteHeaderShell({
  children,
  theme,
}: {
  /** Receives the theme in effect: the overlay theme at the top, else the configured one. */
  children: (theme: HeaderTheme) => ReactNode;
  theme: HeaderTheme;
}) {
  const [visible, setVisible] = useState(true);
  const [atTop, setAtTop] = useState(true);
  /** True while the bar fades between looks in view. */
  const [fading, setFading] = useState(false);
  const [overlayTheme, setOverlayTheme] = useState<HeaderTheme | null>(null);
  /** Read by the scroll handler, which is set up once. */
  const lightOverlay = useRef(false);
  const overlayElement = useRef<Element | null>(null);
  const visibleRef = useRef(true);
  const atTopRef = useRef(true);
  const pathname = usePathname();
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // The hero is rendered by the page, so look it up again after navigation.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      overlayElement.current = document.querySelector("[data-header-overlay]");
      const next = readOverlayTheme(overlayElement.current);
      lightOverlay.current = next === "light";
      setOverlayTheme(next);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let fadeTimer: number | undefined;

    /** Page offset where the light hero ends, less the bar's height. */
    const lightHeroBottom = (scrollY: number) => {
      const overlay = overlayElement.current;
      if (!overlay) return 0;
      const headerHeight = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--header-height"),
      );
      return overlay.getBoundingClientRect().bottom + scrollY - (headerHeight || 0);
    };

    const update = () => {
      const current = window.scrollY;
      const delta = current - lastScrollY.current;

      // Over a light hero the see-through bar would cover the hero's text as
      // soon as the page moves, so it hides on the first scroll down past the
      // top. Elsewhere it hides after 120px.
      const hideAfter = lightOverlay.current ? 24 : 120;
      const nextAtTop = current <= 24;
      let nextVisible = visibleRef.current;
      if (current <= 8) nextVisible = true;
      // Leaving the top over a light hero, it hides in the same frame. Kept
      // in view for a few more pixels, it would flash dark over the hero.
      else if (lightOverlay.current && atTopRef.current && !nextAtTop) nextVisible = false;
      // Scrolling back up a light hero, a hidden bar stays hidden until it
      // reaches the top, then fades in already see-through. Revealed on the
      // way up, it would fade in dark and then turn see-through in view.
      else if (lightOverlay.current && !visibleRef.current && current < lightHeroBottom(current))
        nextVisible = nextAtTop;
      else if (Math.abs(delta) >= 8) nextVisible = delta < 0 || current <= hideAfter;

      // The look changes while the bar stays in view: fade all of it. A bar
      // that fades in or out changes its colours at once, while unseen.
      if (visibleRef.current && nextVisible && atTopRef.current !== nextAtTop) {
        setFading(true);
        window.clearTimeout(fadeTimer);
        fadeTimer = window.setTimeout(() => setFading(false), 250);
      }

      visibleRef.current = nextVisible;
      atTopRef.current = nextAtTop;
      setVisible(nextVisible);
      setAtTop(nextAtTop);

      if (Math.abs(delta) >= 8 || current <= 8) lastScrollY.current = current;
      ticking.current = false;
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(update);
    };

    const initialFrame = window.requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.clearTimeout(fadeTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      SITE_HEADER_OFFSET_PROPERTY,
      visible ? "calc(var(--header-height) + var(--header-gap))" : "0px",
    );
    return () => {
      document.documentElement.style.removeProperty(SITE_HEADER_OFFSET_PROPERTY);
    };
  }, [visible]);

  // At the top the bar takes the overlay's look. A light overlay also keeps
  // it while the bar fades out, so it never turns dark in view on the way
  // down; whenever the bar comes back below the top, it is the dark bar.
  const overlayActive = atTop || (overlayTheme === "light" && !visible);
  const effectiveTheme = overlayActive && overlayTheme ? overlayTheme : theme;

  return (
    <header
      className={cn(
        // The bar floats: a rounded panel a little wider than the content,
        // held --header-gap below the top of the window, with the page
        // showing all round it. Its height includes the border, so a hero
        // pulled up by --header-height + --header-gap meets the window top.
        "sticky top-(--header-gap) z-60 mx-auto mt-(--header-gap) h-(--header-height) w-[calc(100%-2*var(--header-gap))] max-w-[calc(var(--container-content)+var(--gutter))] rounded-md border shadow-raised ease-reveal motion-reduce:transition-none",
        // The bar fades in and out in place over 300ms; it never moves.
        // Colours fade over 200ms, the same as every part inside the bar
        // (see data-color-fade in globals.css), and only while the bar
        // stays in view.
        fading
          ? "transition-[opacity,background-color,border-color,color,box-shadow] [transition-duration:300ms,200ms,200ms,200ms,200ms]"
          : "transition-opacity duration-300",
        effectiveTheme === "dark"
          ? "border-birch-bark/15 bg-pine-night text-birch-bark"
          : "border-pine-night/15 bg-birch-bark text-pine-night",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      data-at-top={overlayActive}
      data-color-fade={fading}
      data-site-header
      data-theme={effectiveTheme}
      data-visible={visible}
      onFocusCapture={() => {
        visibleRef.current = true;
        setVisible(true);
      }}
    >
      {children(effectiveTheme)}
    </header>
  );
}
