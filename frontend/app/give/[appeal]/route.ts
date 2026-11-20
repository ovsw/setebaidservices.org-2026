import { track } from "@vercel/analytics/server";
import { after, type NextRequest } from "next/server";
import { APPEAL_CODE_PATTERN, GIVING_URL, isRouterRequest } from "@/lib/giving";

/**
 * Counts a click on an appeal page's "Give now" button as a give_click event
 * with the appeal's code, for example /give/newsletter.
 *
 * The button links straight to Camp Brain's giving form, and the browser
 * pings this address in the background when it is clicked (POST). Opening the
 * address itself (GET) also counts, then sends the visitor on to the form.
 * Counting on the server keeps clicks from visitors who block scripts.
 * The gift itself happens on Camp Brain, which keeps its own reports.
 */
function countClick(request: NextRequest, appeal: string) {
  const code = APPEAL_CODE_PATTERN.test(appeal) ? appeal : "unknown";
  const headers = new Headers(request.headers);
  after(() => track("give_click", { appeal: code }, { headers }));
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/give/[appeal]">,
) {
  const { appeal } = await ctx.params;
  // The browser sends a link's ping as a POST with a Ping-To header.
  if (request.headers.has("ping-to")) countClick(request, appeal);
  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/give/[appeal]">,
) {
  const { appeal } = await ctx.params;

  // Next answers HEAD with this handler too; link checkers send HEAD.
  if (request.method === "GET" && !isRouterRequest(request.headers)) {
    countClick(request, appeal);
  }

  return new Response(null, {
    status: 302,
    headers: { Location: GIVING_URL, "Cache-Control": "no-store" },
  });
}
