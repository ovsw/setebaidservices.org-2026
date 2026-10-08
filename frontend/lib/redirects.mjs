import {
  isApplicationPath,
  isRouteSlug,
  normalizePublicPath,
} from "../../shared/content-routes.ts";

export const QR_MEDIUM = "qr-card";

function normalizePath(value) {
  return typeof value === "string" ? normalizePublicPath(value) : "";
}

function readSlug(value) {
  return typeof value === "string" ? value : value?.current;
}

function getStatusCode(permanent) {
  return permanent === false || permanent === "false" ? 302 : 301;
}

/**
 * Build a QR redirect's tagged destination from its fields. Tags are never
 * free text: both must be lowercase letters, digits and dashes.
 */
function getQrDestination(record, source, path) {
  const { utmCampaign, utmSource } = record;
  if (!utmSource && !utmCampaign) return undefined;
  if (!isRouteSlug(utmSource) || !isRouteSlug(utmCampaign)) {
    throw new Error(`QR redirect has an invalid source name or campaign tag: ${source}`);
  }
  if (!source.startsWith("/go/")) {
    throw new Error(`QR redirect source must start with /go/: ${source}`);
  }

  const query = new URLSearchParams({
    utm_source: utmSource,
    utm_medium: QR_MEDIUM,
    utm_campaign: utmCampaign,
  });
  return `${path}?${query}`;
}

/**
 * Convert active Sanity redirect records into explicit Next.js redirect rules.
 * Conflicting sources, chains, cycles, and self-redirects fail the build.
 * QR redirects get UTM tags and are always temporary, so a printed code's
 * target can change without browsers caching the old one.
 */
export function compileNextRedirects(records) {
  const redirectsBySource = new Map();

  for (const record of records) {
    if (record.status && record.status !== "active") continue;

    const source = normalizePath(readSlug(record.source));
    const destination = normalizePath(readSlug(record.destination));
    if (!source || !destination) {
      throw new Error("Active redirect is missing a valid internal source or destination");
    }
    if (isApplicationPath(source)) {
      throw new Error(`Redirect source is reserved by the application: ${source}`);
    }
    if (source === normalizePath(destination)) {
      throw new Error(`Redirect source and destination are the same: ${source}`);
    }

    const qrDestination = getQrDestination(record, source, destination);
    const target = qrDestination ?? destination;
    const statusCode = qrDestination ? 302 : getStatusCode(record.permanent);
    const existing = redirectsBySource.get(source);
    if (existing) {
      if (existing.destination !== target || existing.statusCode !== statusCode) {
        throw new Error(`Conflicting redirects share the source ${source}`);
      }
      continue;
    }

    redirectsBySource.set(source, { destination: target, path: destination, statusCode });
  }

  for (const [source, redirect] of redirectsBySource) {
    if (redirectsBySource.has(redirect.path)) {
      throw new Error(`Redirect chain or cycle detected: ${source} -> ${redirect.path}`);
    }
  }

  return [...redirectsBySource].map(([source, redirect]) => ({
    source,
    destination: redirect.destination,
    statusCode: redirect.statusCode,
  }));
}
