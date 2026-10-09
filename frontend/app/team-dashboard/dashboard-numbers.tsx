import { neon } from "@neondatabase/serverless";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ANALYTICS_TIME_ZONE, nextScheduledCopy } from "@/lib/analytics-copy";
import {
  type DashboardCounts,
  type DashboardNumbers as Numbers,
  type DashboardPreset,
  type DashboardRow,
  type DashboardRange,
  dashboardRange,
  readDashboardNumbers,
} from "@/lib/team-dashboard-numbers";
import { TEAM_DASHBOARD_PATH } from "@/lib/team-dashboard-session";
import { UpdateNowButton } from "./update-now-button";

const PRESETS: { preset: Exclude<DashboardPreset, "custom">; label: string; href: string }[] = [
  { preset: "season", label: "This season", href: TEAM_DASHBOARD_PATH },
  { preset: "7d", label: "Last 7 days", href: `${TEAM_DASHBOARD_PATH}?range=7d` },
  { preset: "30d", label: "Last 30 days", href: `${TEAM_DASHBOARD_PATH}?range=30d` },
];

const COLUMNS: { key: keyof DashboardCounts; label: string }[] = [
  { key: "visits", label: "Visits" },
  { key: "scans", label: "QR scans" },
  { key: "callTaps", label: "Call taps" },
  { key: "emailTaps", label: "Email taps" },
  { key: "formRequests", label: "Form requests" },
];

const timeFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: ANALYTICS_TIME_ZONE,
  timeZoneName: "short",
});

function sourceLabel(row: DashboardRow) {
  if (row.card) return row.source;
  if (row.source === "direct") return "No card (website, search, links)";
  return `${row.source} (no card)`;
}

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: SearchParams[string]) => (Array.isArray(value) ? value[0] : value);

async function loadNumbers(range: DashboardRange): Promise<Numbers | string> {
  const url = process.env.DATABASE_URL;
  if (!url) return "The numbers are not connected yet: DATABASE_URL is missing.";
  try {
    return await readDashboardNumbers(neon(url, { fullResults: true }), range);
  } catch (error) {
    console.error("Team dashboard numbers failed to load.", error);
    return "The numbers could not be loaded. Try again in a minute.";
  }
}

/** Counts per Source for a chosen period. Never shows entry details. */
export async function DashboardNumbers({ searchParams }: { searchParams: SearchParams }) {
  const { preset, range } = dashboardRange({
    range: first(searchParams.range),
    from: first(searchParams.from),
    to: first(searchParams.to),
  });
  const numbers = await loadNumbers(range);

  return (
    <div className="mt-8 space-y-8">
      <nav aria-label="Period" className="flex flex-wrap items-end gap-3">
        {PRESETS.map((item) => (
          <Button
            key={item.preset}
            asChild
            size="compact"
            variant={item.preset === preset ? "primary" : "outline"}
          >
            <Link href={item.href} aria-current={item.preset === preset ? "page" : undefined}>
              {item.label}
            </Link>
          </Button>
        ))}
        <form method="get" action={TEAM_DASHBOARD_PATH} className="flex flex-wrap items-end gap-3">
          <div className="grid gap-1">
            <Label htmlFor="dashboard-from">From</Label>
            <Input id="dashboard-from" type="date" name="from" defaultValue={range.from} required />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="dashboard-to">To</Label>
            <Input id="dashboard-to" type="date" name="to" defaultValue={range.to} required />
          </div>
          <Button type="submit" size="compact" variant={preset === "custom" ? "primary" : "outline"}>
            Show
          </Button>
        </form>
      </nav>

      {typeof numbers === "string" ? (
        <p role="alert">{numbers}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left tabular-nums">
              <thead>
                <tr className="border-b">
                  <th scope="col" className="py-2 pr-4">Source</th>
                  {COLUMNS.map((column) => (
                    <th key={column.key} scope="col" className="py-2 pr-4 text-right">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {numbers.rows.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length + 1} className="py-4">
                      No visits or requests in this period.
                    </td>
                  </tr>
                ) : (
                  numbers.rows.map((row) => (
                    <tr key={row.source} className="border-b">
                      <th scope="row" className="py-2 pr-4 font-normal">{sourceLabel(row)}</th>
                      {COLUMNS.map((column) => (
                        <td key={column.key} className="py-2 pr-4 text-right">
                          {column.key === "scans" && !row.card ? (
                            <span aria-label="Not possible without a card">—</span>
                          ) : (
                            row[column.key]
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="font-semibold">
                  <th scope="row" className="py-2 pr-4">Total</th>
                  {COLUMNS.map((column) => (
                    <td key={column.key} className="py-2 pr-4 text-right">
                      {numbers.totals[column.key]}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>

          <dl className="grid gap-2">
            <div>
              <dt className="inline font-semibold">Missing entries: </dt>
              <dd className="inline">
                {numbers.missingEntries}
                {numbers.missingEntries > 0 &&
                  " — requests that reached only one of Formspark and the database."}
              </dd>
            </div>
            <div>
              <dt className="inline font-semibold">Last updated: </dt>
              <dd className="inline">
                {numbers.lastUpdated ? timeFormat.format(numbers.lastUpdated) : "Not yet"}
              </dd>
            </div>
            <div>
              <dt className="inline font-semibold">Next automatic update: </dt>
              <dd className="inline">{timeFormat.format(nextScheduledCopy())}</dd>
            </div>
          </dl>

          <UpdateNowButton />
        </>
      )}
    </div>
  );
}
