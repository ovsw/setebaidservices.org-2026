import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({ revalidateTag }));

const { POST } = await import("./route");

const SECRET = "webhook-secret";
const BODY = JSON.stringify({ _id: "page-go-events", _type: "page" });

// The header Sanity sends: a millisecond time and an HMAC-SHA256 of
// "time.body", in URL-safe base64.
function signature(body: string, secret: string) {
  const time = Date.now();
  const hash = createHmac("sha256", secret).update(`${time}.${body}`).digest("base64url");
  return `t=${time},v1=${hash}`;
}

function webhook(headers: Record<string, string>, body = BODY) {
  return new Request("https://example.test/api/revalidate", {
    method: "POST",
    headers,
    body,
  }) as unknown as NextRequest;
}

describe("publish webhook", () => {
  beforeEach(() => {
    revalidateTag.mockReset();
    vi.stubEnv("SANITY_REVALIDATE_SECRET", SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("expires all Sanity content at once for a signed call", async () => {
    const response = await POST(
      webhook({ "sanity-webhook-signature": signature(BODY, SECRET) }),
    );

    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledExactlyOnceWith("sanity-content", { expire: 0 });
  });

  it("refuses a call signed with another secret", async () => {
    const response = await POST(
      webhook({ "sanity-webhook-signature": signature(BODY, "another-secret") }),
    );

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("refuses an unsigned call", async () => {
    const response = await POST(webhook({}));

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("refuses every call when the Website has no secret", async () => {
    vi.stubEnv("SANITY_REVALIDATE_SECRET", "");

    const response = await POST(
      webhook({ "sanity-webhook-signature": signature(BODY, SECRET) }),
    );

    expect(response.status).toBe(500);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
