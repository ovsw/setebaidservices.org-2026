import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/sanity/lib/client";
import { token } from "@/sanity/lib/token";

const missingTokenMessage =
  "Missing SANITY_API_READ_TOKEN. Add it to frontend/.env.local to use Sanity Presentation draft previews.";

const draftModeHandler = token
  ? defineEnableDraftMode({
      client: client.withConfig({ token }),
    })
  : {
      GET: () => {
        console.error(missingTokenMessage);
        return new Response(missingTokenMessage, { status: 500 });
      },
    };

// next-sanity (13.1.3+) gives draft-mode cookies the CHIPS `Partitioned`
// attribute when Presentation enables them in its cross-site iframe. A
// partitioned cookie stays inside that iframe, so Presentation's "Open preview"
// window (a top-level tab) loads without draft mode. Hiding the iframe signal
// restores unpartitioned SameSite=None cookies, which Chromium shares with the
// window. Safari rejects those cookies in the iframe; editors use Chromium.
export async function GET(request: Request) {
  const headers = new Headers(request.headers);
  headers.delete("sec-fetch-dest");
  return draftModeHandler.GET(new Request(request.url, { headers }));
}
