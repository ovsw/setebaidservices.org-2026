import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { SANITY_CONTENT_TAG } from "@/sanity/lib/content-tag";

// The Sanity webhook "Refresh the Website when content is published" calls
// this when published content is created, changed or deleted. It expires all
// cached Sanity content at once: a change can show on many pages (a story on
// the home page and on the stories index), and the next visit to each page
// reads it fresh. parseBody waits a few seconds first, so that the next read
// sees the change.
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "Missing SANITY_REVALIDATE_SECRET" }, { status: 500 });
  }

  const { isValidSignature } = await parseBody(request, secret);
  if (isValidSignature !== true) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  revalidateTag(SANITY_CONTENT_TAG, { expire: 0 });
  return NextResponse.json({ revalidated: true });
}
