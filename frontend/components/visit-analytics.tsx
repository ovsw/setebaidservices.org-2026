"use client";

import { track } from "@vercel/analytics";
import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { useEffect } from "react";
import { currentVisitSource, recordVisitSource } from "@/lib/visit-source";

// The landing address before and after its UTM tags were removed. The page
// view may be sent after the removal; Vercel's UTM reports need the tags.
let taggedLanding: { cleaned: string; tagged: string } | undefined;

function restoreLandingTags(event: BeforeSendEvent) {
  if (event.type !== "pageview" || !taggedLanding) return event;
  const { cleaned, tagged } = taggedLanding;
  if (event.url !== cleaned && event.url !== tagged) return event;

  taggedLanding = undefined;
  return { ...event, url: tagged };
}

/** Events carry only the Source and the page: never personal data. */
export function trackVisitEvent(name: "qr_scan" | "call_tap" | "email_tap" | "form_sent") {
  // <Analytics> mounts after this component's effect and creates the event
  // queue only then; `track` drops events sent before it. This is Vercel's
  // documented queue snippet for pages without the package.
  window.va ??= (...params) => {
    (window.vaq ??= []).push(params);
  };
  track(name, {
    source: currentVisitSource().source,
    page: window.location.pathname,
  });
}

function trackContactTap(event: MouseEvent) {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest("a[href]");
  if (!(link instanceof HTMLAnchorElement)) return;

  if (link.protocol === "tel:") trackVisitEvent("call_tap");
  if (link.protocol === "mailto:") trackVisitEvent("email_tap");
}

/**
 * Cookieless Vercel Web Analytics with the visit's Source: records the Source
 * on landing, removes the UTM tags from the address bar, and counts QR scans
 * and taps on phone and email links.
 */
export function VisitAnalytics() {
  useEffect(() => {
    const landing = new URL(window.location.href);
    const { cleanedPath, qrScan } = recordVisitSource(landing);

    if (cleanedPath) {
      const cleaned = new URL(cleanedPath, landing);
      taggedLanding = { cleaned: cleaned.href, tagged: landing.href };
      window.history.replaceState(null, "", cleaned);
    }
    if (qrScan) trackVisitEvent("qr_scan");

    document.addEventListener("click", trackContactTap, { capture: true });
    return () => {
      document.removeEventListener("click", trackContactTap, { capture: true });
    };
  }, []);

  return <Analytics beforeSend={restoreLandingTags} />;
}
