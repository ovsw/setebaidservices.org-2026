"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";
import { HeaderLink } from "./header-link";
import type {
  HeaderChildLinkModel,
  HeaderNavigationItem,
  HeaderNavigationModel,
} from "./model";
import { NavigationIcon } from "./navigation-icon";

const SINGLE_COLUMN_PANEL_WIDTH = 300;
const TWO_COLUMN_PANEL_WIDTH = 580;
const TWO_COLUMN_MIN_LINKS = 6;
const VIEWPORT_EDGE_GAP = 16;
const CLOSE_DELAY_MS = 120;

function GroupPanelContent({
  label,
  links,
}: {
  label: string;
  links: HeaderChildLinkModel[];
}) {
  const firstColumnLength = Math.ceil(links.length / 2);
  const columns =
    links.length >= TWO_COLUMN_MIN_LINKS
      ? [links.slice(0, firstColumnLength), links.slice(firstColumnLength)]
      : [links];

  return (
    <div className="p-3">
      <p
        className="text-label mb-2 px-2 text-birch-bark/55 header-light:text-ink-muted"
      >
        {label}
      </p>
      <div className={cn("grid gap-3", columns.length === 2 && "grid-cols-2")}>
        {columns.map((column, columnIndex) => (
          <div className="grid content-start gap-1" key={columnIndex}>
            {column.map((child) => (
              <HeaderLink
                className={cn(
                  "group/nav-link flex items-start gap-3 rounded-[var(--radius-md)] px-2 py-2.5 transition-colors motion-fast focus-ring",
                  "hover:bg-birch-bark/6 header-light:hover:bg-cedar/8",
                )}
                key={child.key}
                link={child.link}
              >
                {/* A bare line icon: no disc behind it, and a thinner stroke than
                    the library default, so a column of items stays light. */}
                {child.icon ? (
                  <span
                    className="mt-px flex shrink-0 text-highlight header-light:text-primary [&_svg]:size-5 [&_svg]:stroke-[1.6]"
                  >
                    <NavigationIcon icon={child.icon} />
                  </span>
                ) : null}
                <span className="grid min-w-0 gap-0.5">
                  <span className="flex items-center gap-0.5 text-[15px] font-semibold">
                    {child.label}
                    <ChevronRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-campfire-amber opacity-0 transition-opacity motion-fast group-hover/nav-link:opacity-100 header-light:text-cedar"
                    />
                  </span>
                  {child.description ? (
                    <span className="text-sm leading-snug text-birch-bark/65 header-light:text-ink-muted">
                      {child.description}
                    </span>
                  ) : null}
                </span>
              </HeaderLink>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DesktopNav({ navigation }: { navigation: HeaderNavigationModel }) {
  /** The key of the open group. */
  const [active, setActive] = useState<string | null>(null);
  /** The open panel's left edge, relative to the nav. */
  const [panelX, setPanelX] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const panelId = useId();

  const groups = useMemo(
    () =>
      navigation.items.filter(
        (item): item is Extract<HeaderNavigationItem, { kind: "group" }> =>
          item.kind === "group",
      ),
    [navigation.items],
  );
  const activeItem = groups.find((group) => group.key === active) ?? null;
  const panelWidth =
    activeItem && activeItem.links.length >= TWO_COLUMN_MIN_LINKS
      ? TWO_COLUMN_PANEL_WIDTH
      : SINGLE_COLUMN_PANEL_WIDTH;

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);

  const openGroup = useCallback(
    (key: string) => {
      cancelClose();
      setActive(key);
    },
    [cancelClose],
  );

  const closeGroup = useCallback(() => {
    cancelClose();
    setActive(null);
  }, [cancelClose]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setActive(null), CLOSE_DELAY_MS);
  }, [cancelClose]);

  useEffect(() => cancelClose, [cancelClose]);

  useLayoutEffect(() => {
    if (!active) return;

    const nav = navRef.current;
    const trigger = triggerRefs.current.get(active);
    if (!nav || !trigger) return;

    const measure = () => {
      const navBox = nav.getBoundingClientRect();
      const triggerBox = trigger.getBoundingClientRect();
      const triggerCenter = triggerBox.left - navBox.left + triggerBox.width / 2;
      const centeredX = triggerCenter - panelWidth / 2;
      const minX = VIEWPORT_EDGE_GAP - navBox.left;
      const maxX =
        window.innerWidth - VIEWPORT_EDGE_GAP - navBox.left - panelWidth;
      const x = Math.min(
        Math.max(centeredX, minX),
        maxX,
      );
      setPanelX(x);
    };

    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [active, panelWidth]);

  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) closeGroup();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape" || !active) return;
    event.preventDefault();
    const trigger = triggerRefs.current.get(active);
    closeGroup();
    trigger?.focus();
  };

  // Panels only fade. Moving between groups, the old panel fades out where
  // it is and the new one fades in under its own trigger; nothing slides.
  const fade = { duration: prefersReducedMotion ? 0 : 0.14 };
  // The open trigger and its panel are one surface, so they share a colour.
  // On dark it is the bar's ink, lifted a touch toward cream so the panel
  // still reads as its own layer. Every colour here follows the bar's look
  // through the header-light variant (globals.css), so the bar paints right
  // before the page's script runs.
  const panelSurfaceClassName =
    "bg-[color-mix(in_oklab,var(--color-fill-deep)_94%,var(--color-background))] text-birch-bark header-light:bg-birch-bark-bright header-light:text-pine-night";
  const primaryLinkClassName = cn(
    // px-2 -mx-1 keeps the same flow width as the old px-1 while giving the
    // hover pill room around the label.
    "-mx-1 flex min-h-11 items-center whitespace-nowrap rounded-control px-2 text-[15px] font-medium transition-colors motion-fast focus-ring",
    "text-birch-bark/85 hover:bg-birch-bark/8 hover:text-birch-bark",
    "header-light:text-ink-soft header-light:hover:bg-cedar/10 header-light:hover:text-cedar-deep",
  );

  return (
    <nav
      aria-label="Main navigation"
      className="relative hidden items-center gap-3 xl:flex 2xl:gap-5"
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onMouseLeave={scheduleClose}
      ref={navRef}
    >
      {navigation.items.map((item) => {
        if (item.kind === "link") {
          return (
            <HeaderLink
              className={primaryLinkClassName}
              key={item.key}
              link={item.link}
            />
          );
        }

        const isActive = active === item.key;
        return (
          <button
            aria-controls={isActive ? panelId : undefined}
            aria-expanded={isActive}
            className={cn(
              primaryLinkClassName,
              "mx-0 gap-1.5 px-2.5",
              isActive && [
                panelSurfaceClassName,
                "hover:text-birch-bark header-light:hover:text-pine-night",
              ],
            )}
            key={item.key}
            onClick={(event) => {
              const pointerType = (event.nativeEvent as PointerEvent).pointerType;
              const canToggle =
                event.detail === 0 || pointerType === "touch" || pointerType === "pen";

              if (canToggle && isActive) closeGroup();
              else openGroup(item.key);
            }}
            onMouseEnter={() => openGroup(item.key)}
            ref={(node) => {
              if (node) triggerRefs.current.set(item.key, node);
              else triggerRefs.current.delete(item.key);
            }}
            type="button"
          >
            <span className="leading-none">{item.label}</span>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-3 shrink-0 -translate-y-px",
                isActive && "rotate-180",
              )}
            />
          </button>
        );
      })}

      <AnimatePresence>
        {activeItem ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="absolute top-full z-70 pt-1.5"
            exit={{ opacity: 0 }}
            id={panelId}
            initial={{ opacity: 0 }}
            key={activeItem.key}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            style={{ left: panelX, width: panelWidth }}
            transition={fade}
          >
            <div
              className={cn(
                "relative overflow-hidden rounded-[var(--radius-md)] border",
                panelSurfaceClassName,
                "shadow-overlay border-birch-bark/15 header-light:border-pine-night/12",
              )}
            >
              <GroupPanelContent
                label={activeItem.label}
                links={activeItem.links}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
