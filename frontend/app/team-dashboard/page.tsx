import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  readTeamDashboardSession,
  TEAM_DASHBOARD_COOKIE,
} from "@/lib/team-dashboard-session";

// Private team page: never indexed, not in the sitemap, no analytics.
export const metadata: Metadata = {
  title: "Team dashboard",
  robots: { index: false, follow: false },
};

// The session is read before anything renders, so the page has no prerendered
// shell. Without a shell, every response is built for one person and sent as
// `private, no-store`; with one, Vercel marks the shell publicly cacheable.
export const instant = false;

export default async function TeamDashboardPage() {
  const session = readTeamDashboardSession(
    (await cookies()).get(TEAM_DASHBOARD_COOKIE)?.value,
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      {session ? (
        <>
          <h1 className="text-3xl font-semibold">Team dashboard</h1>
          <p className="mt-4 text-lg">You are signed in.</p>
        </>
      ) : (
        <p className="text-lg">Open this from the Studio.</p>
      )}
    </main>
  );
}
