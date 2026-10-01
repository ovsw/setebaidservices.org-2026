"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import styles from "./activity-catalogue.module.css";

export type JumpBarGroup = { id: string; title: string };

/*
 * Sticky jump bar for the Activity Catalogue.
 *
 * A short legend ("Activity Categories") then one text link per place. The link
 * whose group currently fills the reading band (roughly the upper-middle of the
 * viewport) carries aria-current="location" and an underline. On phones the row
 * scrolls sideways and the current link is nudged into view without moving the
 * page.
 *
 * At rest the bar is a rounded slab. Once it sticks under the site header it
 * squares its top corners so it hangs from the header like a tab.
 */
export default function ActivityCatalogueJumpBar({
  dataSanity,
  groups,
}: Readonly<{
  dataSanity?: string;
  groups: JumpBarGroup[];
}>) {
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [stuck, setStuck] = useState(false);
  const trackRef = useRef<HTMLUListElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const sentinel = sentinelRef.current;
    if (!nav || !sentinel) return;

    // The sentinel marks the bar's natural position. While stuck, sticky
    // positioning holds the bar below that point regardless of how far the
    // site header offset is animating.
    let frame = 0;
    const measure = () => {
      frame = 0;
      const navTop = nav.getBoundingClientRect().top;
      const restTop = sentinel.getBoundingClientRect().bottom;
      setStuck(navTop - restTop > 1);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const targets = groups
      .map((group) => document.getElementById(group.id))
      .filter((element): element is HTMLElement => element !== null);
    if (!targets.length) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.boundingClientRect.top);
          } else {
            visible.delete(entry.target.id);
          }
        }
        if (!visible.size) return;
        // The topmost group in the reading band wins.
        const [nextId] = [...visible.entries()].sort((a, b) => a[1] - b[1])[0];
        setCurrentId(nextId);
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: 0 },
    );

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [groups]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !currentId || typeof track.scrollTo !== "function") return;
    const chip = track.querySelector<HTMLElement>(`[data-group-id="${currentId}"]`);
    if (!chip) return;

    const left = chip.offsetLeft - (track.clientWidth - chip.offsetWidth) / 2;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")
      .matches;
    track.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
  }, [currentId]);

  return (
    <>
      <div aria-hidden="true" ref={sentinelRef} />
      <nav
        aria-labelledby="activity-catalogue-jump-bar-label"
        className={cn(
          "sticky z-40 flex items-center gap-4 border border-pine-night/15 bg-navigation-yellow py-3 sm:gap-5",
          stuck ? "rounded-b-lg rounded-t-none" : "rounded-lg",
          styles.jumpBar,
        )}
        data-sanity={dataSanity}
        data-stuck={stuck || undefined}
        ref={navRef}
      >
        <span
          className="shrink-0 border-r border-pine-night/20 pr-4 text-label font-semibold text-ink-muted sm:pr-5"
          id="activity-catalogue-jump-bar-label"
        >
          Activity Categories
        </span>
        <ul
          className={cn(
            "m-0 flex min-w-0 flex-1 list-none gap-6 overflow-x-auto p-0",
            styles.jumpBarTrack,
          )}
          ref={trackRef}
        >
          {groups.map((group) => {
            const current = group.id === currentId;
            return (
              <li className="shrink-0" key={group.id}>
                <a
                  aria-current={current ? "location" : undefined}
                  className={cn(
                    "focus-ring inline-flex min-h-11 items-center whitespace-nowrap py-2 text-base font-semibold text-pine-night underline-offset-4 transition-colors motion-base",
                    current
                      ? "underline decoration-2"
                      : "hover:underline",
                  )}
                  data-group-id={group.id}
                  href={`#${group.id}`}
                >
                  {group.title}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
