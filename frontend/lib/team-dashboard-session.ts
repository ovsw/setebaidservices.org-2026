import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import {
  apiVersion as secretApiVersion,
  SECRET_TTL,
  schemaType as secretSchemaType,
} from "@sanity/preview-url-secret/constants";
import { client } from "@/sanity/lib/client";
import { projectId } from "@/sanity/lib/env";
import { token } from "@/sanity/lib/token";

export const TEAM_DASHBOARD_PATH = "/team-dashboard";
export const TEAM_DASHBOARD_COOKIE = "team-dashboard-session";
export const TEAM_DASHBOARD_SESSION_SECONDS = 24 * 60 * 60;

// The Studio's "Team dashboard" tool creates its preview secrets with this
// source (studio/tools/team-dashboard.tsx). Presentation's secrets and the
// never-expiring "share preview access" secret are refused.
const SECRET_SOURCE = "team-dashboard";
const SECRET_QUERY = `*[_type == $type && source == $source && secret == $secret && dateTime(_updatedAt) > dateTime(now()) - ${SECRET_TTL}][0]{userId}`;

const USER_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const SIGNATURE_PATTERN = /^[A-Za-z0-9_-]{43}$/;

type ProjectMember = {
  isRobot: boolean;
  projectUserId: string;
  roles: unknown[];
};

export type TeamDashboardSession = { userId: string; expiresAt: number };

/**
 * Exchanges a Studio preview secret for a signed session cookie value, or
 * returns null when the secret is missing, expired, forged, or belongs to
 * someone who is not a person on the Sanity project.
 */
export async function startTeamDashboardSession(
  secret: string | null,
  now = Date.now(),
): Promise<string | null> {
  if (!token) {
    console.error("Missing SANITY_API_READ_TOKEN. The team dashboard cannot check Studio secrets.");
    return null;
  }
  if (!secret?.trim()) return null;

  const match = await client
    .withConfig({
      apiVersion: secretApiVersion,
      perspective: "raw",
      stega: false,
      token,
      useCdn: false,
    })
    .fetch<{ userId?: string } | null>(
      SECRET_QUERY,
      { secret, source: SECRET_SOURCE, type: secretSchemaType },
      { cache: "no-store" },
    );
  const userId = match?.userId;
  if (!userId || !USER_ID_PATTERN.test(userId)) return null;

  if (memberCheckIsOn() && !(await isProjectMember(userId, token))) return null;

  return signSession(userId, now + TEAM_DASHBOARD_SESSION_SECONDS * 1000, token);
}

/** Returns the session in a cookie value, or null if it is forged or expired. */
export function readTeamDashboardSession(
  value: string | undefined,
  now = Date.now(),
): TeamDashboardSession | null {
  if (!value || !token) return null;

  const [userId, expiresAtText, signature, ...rest] = value.split(".");
  if (
    rest.length > 0 ||
    !USER_ID_PATTERN.test(userId ?? "") ||
    !/^\d{1,15}$/.test(expiresAtText ?? "") ||
    !SIGNATURE_PATTERN.test(signature ?? "")
  ) {
    return null;
  }

  const expected = sign(`${userId}.${expiresAtText}`, token);
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  const expiresAt = Number(expiresAtText);
  return expiresAt > now ? { userId, expiresAt } : null;
}

// Set TEAM_DASHBOARD_MEMBER_CHECK=off only if the read token loses access to
// the project member list.
function memberCheckIsOn() {
  return process.env.TEAM_DASHBOARD_MEMBER_CHECK !== "off";
}

async function isProjectMember(userId: string, readToken: string) {
  const response = await fetch(
    `https://api.sanity.io/v2021-06-07/projects/${projectId}/acl/`,
    { cache: "no-store", headers: { Authorization: `Bearer ${readToken}` } },
  );
  if (!response.ok) {
    console.error(`Team dashboard member check failed: HTTP ${response.status}`);
    return false;
  }

  const members = (await response.json()) as ProjectMember[];
  return members.some(
    (member) =>
      member.projectUserId === userId &&
      !member.isRobot &&
      member.roles.length > 0,
  );
}

function signSession(userId: string, expiresAt: number, key: string) {
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${sign(payload, key)}`;
}

// The read token is the signing key. Anyone who holds it can already read the
// Studio's live secrets, so a separate session secret would protect nothing
// more. Rotating the token signs everyone out.
function sign(payload: string, key: string) {
  return createHmac("sha256", key)
    .update(`team-dashboard-session\n${payload}`)
    .digest("base64url");
}
