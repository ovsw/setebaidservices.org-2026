import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import {
  readTeamDashboardSession,
  TEAM_DASHBOARD_COOKIE,
} from "@/lib/team-dashboard-session";

// Private team page: never indexed, not in the sitemap, no analytics.
export const metadata: Metadata = {
  title: "Team dashboard",
  robots: { index: false, follow: false },
};

export default function TeamDashboardPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Suspense fallback={null}>
        <TeamDashboard />
      </Suspense>
    </main>
  );
}

async function TeamDashboard() {
  const session = readTeamDashboardSession(
    (await cookies()).get(TEAM_DASHBOARD_COOKIE)?.value,
  );

  if (!session) {
    return <p className="text-lg">Open this from the Studio.</p>;
  }

  return (
    <>
      <h1 className="text-3xl font-semibold">Team dashboard</h1>
      <p className="mt-4 text-lg">You are signed in.</p>
    </>
  );
}
