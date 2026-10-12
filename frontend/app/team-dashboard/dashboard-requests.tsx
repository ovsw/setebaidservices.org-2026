import { neon } from "@neondatabase/serverless";
import Link from "next/link";
import { ANALYTICS_TIME_ZONE } from "@/lib/analytics-copy";
import { dashboardRange } from "@/lib/team-dashboard-numbers";
import {
  type DashboardRequest,
  isOpenStatus,
  readDashboardRequests,
} from "@/lib/team-dashboard-requests";
import { TEAM_DASHBOARD_PATH } from "@/lib/team-dashboard-session";
import { RequestRow } from "./request-row";

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: SearchParams[string]) => (Array.isArray(value) ? value[0] : value);

const timeFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: ANALYTICS_TIME_ZONE,
  timeZoneName: "short",
});

const dayFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: ANALYTICS_TIME_ZONE,
});

/** The same period as the counts, with or without the called requests. */
function toggleHref(searchParams: SearchParams, openOnly: boolean) {
  const params = new URLSearchParams();
  for (const key of ["range", "from", "to"]) {
    const value = first(searchParams[key]);
    if (value) params.set(key, value);
  }
  if (!openOnly) params.set("open", "1");
  const query = params.toString();
  return `${TEAM_DASHBOARD_PATH}${query ? `?${query}` : ""}#requests`;
}

async function loadRequests(
  searchParams: SearchParams,
  openOnly: boolean,
): Promise<DashboardRequest[] | string> {
  const url = process.env.DATABASE_URL;
  if (!url) return "The requests are not connected yet: DATABASE_URL is missing.";
  const { range } = dashboardRange({
    range: first(searchParams.range),
    from: first(searchParams.from),
    to: first(searchParams.to),
  });
  try {
    return await readDashboardRequests(neon(url, { fullResults: true }), range, { openOnly });
  } catch (error) {
    console.error("Team dashboard requests failed to load.", error);
    return "The requests could not be loaded. Try again in a minute.";
  }
}

function Detail({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="inline font-semibold">{term}: </dt>
      <dd className="inline">{children}</dd>
    </div>
  );
}

/**
 * The "Ask about camp" requests of the chosen period, for the people who call
 * the families. Open requests first, newest first.
 */
export async function DashboardRequests({ searchParams }: { searchParams: SearchParams }) {
  const openOnly = first(searchParams.open) === "1";
  const requests = await loadRequests(searchParams, openOnly);

  return (
    <section id="requests" aria-labelledby="requests-heading" className="mt-16 space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="requests-heading" className="text-2xl font-semibold">
          Requests
          {typeof requests !== "string" && (
            <span className="ml-2 text-base font-normal">
              {requests.filter((request) => isOpenStatus(request.callStatus)).length} open
              {!openOnly && ` of ${requests.length}`}
            </span>
          )}
        </h2>
        <Link href={toggleHref(searchParams, openOnly)} className="underline underline-offset-4">
          {openOnly ? "Show all requests" : "Show only open"}
        </Link>
      </div>

      {typeof requests === "string" ? (
        <p role="alert">{requests}</p>
      ) : requests.length === 0 ? (
        <p>{openOnly ? "No open requests in this period." : "No requests in this period."}</p>
      ) : (
        <ul className="divide-y border-y">
          {requests.map((request) => (
            <li key={request.submissionId}>
              <RequestRow
                submissionId={request.submissionId}
                parentName={request.parentName}
                status={request.callStatus}
                note={request.callNote}
                contact={
                  <>
                    <p>
                      <a
                        href={`tel:${request.phone.replace(/[^\d+]/g, "")}`}
                        className="underline underline-offset-4"
                      >
                        {request.phone}
                      </a>
                    </p>
                    <p className="break-all">
                      <a href={`mailto:${request.email}`} className="underline underline-offset-4">
                        {request.email}
                      </a>
                    </p>
                  </>
                }
                details={
                  <dl className="space-y-1">
                    <Detail term="Child's age">{request.childAge}</Detail>
                    <Detail term="Best time">{request.bestTime || "Any time"}</Detail>
                    <Detail term="Wants to know">
                      {request.interests.length ? request.interests.join(", ") : "—"}
                    </Detail>
                    <Detail term="Source">
                      {request.source} ({request.page})
                    </Detail>
                    <Detail term="Received">{timeFormat.format(request.receivedAt)}</Detail>
                    {request.callStatusAt && (
                      <Detail term="Status changed">{dayFormat.format(request.callStatusAt)}</Detail>
                    )}
                  </dl>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
