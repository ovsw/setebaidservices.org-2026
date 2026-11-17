"use client";

import { useEffect } from "react";

/**
 * Keeps Presentation's zoomed-out drag view working on this site.
 *
 * Holding Shift while dragging a section zooms the page out. Presentation
 * zooms back only when it hears a key release named "Shift". Some keyboard
 * setups name it differently (with the option that makes both Shift keys
 * together toggle Caps Lock, the release arrives as "CapsLock"), and the
 * page then stayed zoomed out. This component notices that Shift is no
 * longer held and tells Presentation so.
 *
 * It also marks the page while it is zoomed out, so the stylesheet can show
 * the sections that otherwise fade in only when scrolled to.
 */
export function PresentationDragZoom() {
  useEffect(() => {
    const root = document.documentElement;
    let zoomedOut = false;

    const onZoomOut = () => {
      zoomedOut = true;
      root.setAttribute("data-drag-zoomed-out", "");
    };
    const onZoomBack = () => {
      zoomedOut = false;
      root.removeAttribute("data-drag-zoomed-out");
    };

    // Every mouse event says whether Shift is held. Once the button is up
    // and Shift is not held, the drag is over.
    const onMouse = (event: MouseEvent) => {
      if (!zoomedOut || event.shiftKey || event.buttons !== 0) return;
      window.dispatchEvent(new KeyboardEvent("keyup", { key: "Shift" }));
    };

    window.addEventListener("unstable_sanity/dragApplyMinimap", onZoomOut);
    window.addEventListener("unstable_sanity/dragResetMinimap", onZoomBack);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mouseup", onMouse);

    return () => {
      window.removeEventListener("unstable_sanity/dragApplyMinimap", onZoomOut);
      window.removeEventListener("unstable_sanity/dragResetMinimap", onZoomBack);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseup", onMouse);
      onZoomBack();
    };
  }, []);

  return null;
}
