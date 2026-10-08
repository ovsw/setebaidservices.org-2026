import { QR_MEDIUM } from "@/lib/redirects.mjs";
import { isRouteSlug } from "@/lib/routes";

const STORAGE_KEY = "setebaid-visit-source";
const DIRECT_SOURCE = "direct";
const UNKNOWN_SOURCE = "unknown";

/**
 * The Source of this visit: the card or page that brought the visitor. It
 * lives in the tab's session storage, so it ends when the tab closes.
 */
export type VisitSource = {
  source: string;
  medium?: string;
  campaign?: string;
};

export type ResolvedVisit = {
  visit: VisitSource;
  /** The address without its UTM tags, when it had any. */
  cleanedPath?: string;
  /** The visitor landed through a QR redirect. */
  qrScan: boolean;
};

function readTag(params: URLSearchParams, name: string) {
  const value = params.get(name)?.trim().toLowerCase();
  return isRouteSlug(value) ? value : undefined;
}

/** `/go/events` → `go-events`. */
function goPageSource(pathname: string) {
  const segments = pathname.toLowerCase().split("/").filter(Boolean);
  if (segments[0] !== "go" || segments.length < 2) return undefined;
  const name = segments.join("-");
  return isRouteSlug(name) ? name : undefined;
}

function withoutTags(url: URL) {
  const tags = [...url.searchParams.keys()].filter((key) => key.startsWith("utm_"));
  if (tags.length === 0) return undefined;

  const cleaned = new URL(url);
  for (const tag of tags) cleaned.searchParams.delete(tag);
  return `${cleaned.pathname}${cleaned.search}${cleaned.hash}`;
}

/**
 * Decide the Source for a page load. A tagged landing always wins; otherwise
 * the tab keeps the Source it already has; a first untagged visit gets the
 * `/go` page's own name, or `direct`.
 */
export function resolveVisitSource(
  url: URL,
  stored: VisitSource | null,
): ResolvedVisit {
  const cleanedPath = withoutTags(url);

  if (url.searchParams.has("utm_source")) {
    const medium = readTag(url.searchParams, "utm_medium");
    const visit: VisitSource = {
      source: readTag(url.searchParams, "utm_source") ?? UNKNOWN_SOURCE,
    };
    if (medium) visit.medium = medium;
    const campaign = readTag(url.searchParams, "utm_campaign");
    if (campaign) visit.campaign = campaign;
    return { visit, cleanedPath, qrScan: medium === QR_MEDIUM };
  }

  return {
    visit: stored ?? { source: goPageSource(url.pathname) ?? DIRECT_SOURCE },
    cleanedPath,
    qrScan: false,
  };
}

/** Read a stored Source; anything malformed counts as no Source. */
export function parseVisitSource(raw: string | null): VisitSource | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const { source, medium, campaign } = value as Record<string, unknown>;
    if (typeof source !== "string" || !isRouteSlug(source)) return null;

    const visit: VisitSource = { source };
    if (typeof medium === "string" && isRouteSlug(medium)) visit.medium = medium;
    if (typeof campaign === "string" && isRouteSlug(campaign)) {
      visit.campaign = campaign;
    }
    return visit;
  } catch {
    return null;
  }
}

// Fallback for when session storage is blocked.
let pageVisit: VisitSource | null = null;

function readStoredVisitSource() {
  try {
    return parseVisitSource(window.sessionStorage.getItem(STORAGE_KEY));
  } catch {
    // Storage can be blocked by the browser.
    return null;
  }
}

/** Resolve this page load's Source and keep it for the rest of the tab. */
export function recordVisitSource(url: URL) {
  const resolved = resolveVisitSource(url, readStoredVisitSource() ?? pageVisit);
  pageVisit = resolved.visit;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(resolved.visit));
  } catch {
    // Without storage the Source lasts until the next full page load.
  }
  return resolved;
}

/** The one place the form and the analytics events read the Source from. */
export function currentVisitSource(): VisitSource {
  return readStoredVisitSource() ?? pageVisit ?? { source: DIRECT_SOURCE };
}
