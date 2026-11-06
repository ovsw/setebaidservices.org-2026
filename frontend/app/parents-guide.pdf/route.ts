import { sanityFetchMetadata } from "@/sanity/lib/live";
import { PARENTS_GUIDE_FILE_QUERY } from "@/sanity/queries/parents-guide-file";

/**
 * The stable address of the parent's guide, which the guide reply email links
 * to (frontend/emails/parents-guide.ts). It redirects to the PDF uploaded on
 * the published Parent's guide form, so a new guide is a Sanity change only.
 * The read is tagged, so a publish expires the cached redirect.
 */
export async function GET() {
  const { data: url } = await sanityFetchMetadata({
    query: PARENTS_GUIDE_FILE_QUERY,
    perspective: "published",
  });

  if (typeof url !== "string" || !url) {
    return new Response("Not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return Response.redirect(url, 307);
}
