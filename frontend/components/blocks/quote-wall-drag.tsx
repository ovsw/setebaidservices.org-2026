"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A sideways-scrolling row that a mouse can drag. Touch and trackpads scroll
 * it natively. On load it scrolls so the column marked `data-featured` starts
 * at the content edge. A click that ends a drag is swallowed, so dragging
 * across a link does not follow it.
 */
export default function QuoteWallDrag({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ left: number; moved: boolean; x: number } | null>(null);
  const wasDrag = useRef(false);

  useEffect(() => {
    const track = ref.current;
    const row = track?.firstElementChild as HTMLElement | null;
    const featured = row?.querySelector<HTMLElement>("[data-featured]");
    if (!track || !row || !featured) return;
    track.scrollLeft = featured.offsetLeft - parseFloat(getComputedStyle(row).paddingLeft);
  }, []);

  return (
    <div
      aria-label={label}
      className="ml-[calc(50%-50vw)] w-screen cursor-grab overflow-x-auto overflow-y-hidden [scrollbar-width:none] select-none focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-scrollbar]:hidden"
      onClickCapture={(event) => {
        if (!wasDrag.current) return;
        event.preventDefault();
        event.stopPropagation();
        wasDrag.current = false;
      }}
      onPointerCancel={() => {
        drag.current = null;
        if (ref.current) ref.current.style.cursor = "";
      }}
      onPointerDown={(event) => {
        wasDrag.current = false;
        if (event.pointerType !== "mouse" || !ref.current) return;
        drag.current = { left: ref.current.scrollLeft, moved: false, x: event.clientX };
        ref.current.setPointerCapture(event.pointerId);
        ref.current.style.cursor = "grabbing";
      }}
      onPointerMove={(event) => {
        if (!drag.current || !ref.current) return;
        const dx = event.clientX - drag.current.x;
        if (Math.abs(dx) > 4) drag.current.moved = true;
        ref.current.scrollLeft = drag.current.left - dx;
      }}
      onPointerUp={() => {
        if (!drag.current || !ref.current) return;
        ref.current.style.cursor = "";
        wasDrag.current = drag.current.moved;
        drag.current = null;
      }}
      ref={ref}
      role="region"
      tabIndex={0}
    >
      {children}
    </div>
  );
}
