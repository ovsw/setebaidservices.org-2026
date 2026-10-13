import { syncTagInvalidateEventHandler } from "@sanity/functions";

// Runs in Sanity after each publish, when the change can be queried. It sends
// the sync tags of the changed content to the Website, which expires the
// cached pages that used it. Then it calls done(), which releases the change
// to pages open in a browser (<SanityLive waitFor="function" />).
//
// Function environment variables (`sanity functions env add`):
// REVALIDATE_TAGS_URL, the Website's /api/revalidate-tags address, and
// SANITY_REVALIDATE_SECRET, the same secret the Website has.
export const handler = syncTagInvalidateEventHandler(async ({ event, done }) => {
  const { syncTags } = event.data;

  try {
    const url = process.env.REVALIDATE_TAGS_URL;
    const secret = process.env.SANITY_REVALIDATE_SECRET;
    if (!url || !secret) {
      throw new Error("Missing REVALIDATE_TAGS_URL or SANITY_REVALIDATE_SECRET");
    }
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ tags: syncTags }),
    });
    console.log(`The Website expired ${syncTags.length} sync tags: HTTP ${response.status}`);
  } catch (error) {
    console.error("The Website did not expire the sync tags", error);
  }

  // Always release the change. Without done(), open pages never hear about it.
  try {
    const response = await done(syncTags);
    console.log("Released the change to open pages: HTTP", response.status);
  } catch (error) {
    console.error("Sanity did not accept done()", error);
  }
});
