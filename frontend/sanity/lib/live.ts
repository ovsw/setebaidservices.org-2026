import { type QueryParams } from "next-sanity";
import {
  defineLive,
  resolvePerspectiveFromCookies,
  type LivePerspective,
} from "next-sanity/live";
import { cookies, draftMode } from "next/headers";
import { client } from "./client";
import { SANITY_CONTENT_TAG } from "./content-tag";
import { token } from "./token";

const live = defineLive({
  client,
  // Required for showing draft content when the Sanity Presentation Tool is used, or to enable the Vercel Toolbar Edit Mode
  serverToken: token || false,
  // Required for stand-alone live previews, the token is only shared to the browser if it's a valid Next.js Draft Mode session
  browserToken: token || false,
  strict: true,
});

export const { SanityLive } = live;

// <SanityLive /> refreshes cached content only while a visitor has a page
// open. Every read also carries SANITY_CONTENT_TAG, which the publish webhook
// expires, so content refreshes when nobody is looking too.
export const sanityFetch = ((options: Parameters<typeof live.sanityFetch>[0]) =>
  live.sanityFetch({
    ...options,
    tags: [SANITY_CONTENT_TAG, ...(options.tags ?? [])],
  })) as typeof live.sanityFetch;

export interface DynamicFetchOptions {
  perspective: LivePerspective;
  stega: boolean;
}

export async function getDynamicFetchOptions(): Promise<DynamicFetchOptions> {
  const { isEnabled: isDraftMode } = await draftMode();
  if (!isDraftMode) {
    return { perspective: "published", stega: false };
  }

  const jar = await cookies();
  const perspective = await resolvePerspectiveFromCookies({ cookies: jar });
  return { perspective: perspective ?? "drafts", stega: true };
}

export async function sanityFetchStaticParams<
  const QueryString extends string,
>({ query, params = {} }: { query: QueryString; params?: QueryParams }) {
  "use cache";
  const { data } = await sanityFetch({
    query,
    params,
    perspective: "published",
    stega: false,
  });
  return { data };
}

export async function sanityFetchMetadata<const QueryString extends string>({
  query,
  params = {},
  perspective,
}: {
  query: QueryString;
  params?: QueryParams;
  perspective: LivePerspective;
}) {
  "use cache";
  const { data } = await sanityFetch({
    query,
    params,
    perspective,
    stega: false,
  });
  return { data };
}
