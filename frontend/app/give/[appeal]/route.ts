import { track } from "@vercel/analytics/server";
import { after, type NextRequest } from "next/server";
import { APPEAL_CODE_PATTERN, GIVING_URL, isRouterRequest } from "@/lib/giving";

/**
 * A "Give now" button on an appeal page links here, for example
 * /give/newsletter. The server counts the click as a give_click event with
 * the appeal's code, then sends the visitor on to Camp Brain's giving form.
 * Counting on the server keeps clicks from visitors who block scripts.
 * The gift itself happens on Camp Brain, which keeps its own reports.
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/give/[appeal]">,
) {
  const { appeal } = await ctx.params;

  // Next answers HEAD with this handler too; link checkers send HEAD.
  if (request.method === "GET" && !isRouterRequest(request.headers)) {
    const code = APPEAL_CODE_PATTERN.test(appeal) ? appeal : "unknown";
    const headers = new Headers(request.headers);
    after(() => track("give_click", { appeal: code }, { headers }));
  }

  return new Response(null, {
    status: 302,
    headers: { Location: GIVING_URL, "Cache-Control": "no-store" },
  });
}
