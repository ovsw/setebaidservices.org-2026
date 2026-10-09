/**
 * The parts of the Formspark API the nightly jobs use: read a form's
 * submissions and delete one. The workspace must be upgraded, and the token
 * needs the scopes submissions:read and submissions:write.
 * https://documentation.formspark.io/api/reference.html
 */

const API = "https://api.formspark.io/public/v1";

export type FormsparkSubmission = {
  id: string;
  data: unknown;
  createdAt: string;
};

type SubmissionPage = {
  data: FormsparkSubmission[];
  hasMore: boolean;
  nextCursor: string | null;
};

export type FormsparkApi = {
  /** The form's submissions, newest first. Spam is not included. */
  submissions(): AsyncGenerator<FormsparkSubmission>;
  /** Deleting a submission that is already gone is not an error. */
  deleteSubmission(id: string): Promise<void>;
};

export function createFormsparkApi(token: string, formId: string): FormsparkApi {
  async function call(method: "GET" | "DELETE", path: string, query = "") {
    const response = await fetch(`${API}${path}${query}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok && !(method === "DELETE" && response.status === 404)) {
      // The path only: the query holds a cursor, and the body is not needed.
      throw new Error(`Formspark API answered HTTP ${response.status} to ${method} ${path}`);
    }
    return response;
  }

  return {
    async *submissions() {
      let cursor: string | null = null;
      do {
        const query = `?limit=100${cursor ? `&startingAfter=${encodeURIComponent(cursor)}` : ""}`;
        const response = await call("GET", `/forms/${encodeURIComponent(formId)}/submissions`, query);
        const page = (await response.json()) as SubmissionPage;
        yield* page.data;
        cursor = page.hasMore ? page.nextCursor : null;
      } while (cursor);
    },
    async deleteSubmission(id) {
      await call("DELETE", `/submissions/${encodeURIComponent(id)}`);
    },
  };
}

/** The submissions received at or after `since`, newest first. */
export async function submissionsSince(api: FormsparkApi, since: Date) {
  const recent: FormsparkSubmission[] = [];
  for await (const submission of api.submissions()) {
    if (new Date(submission.createdAt) < since) break;
    recent.push(submission);
  }
  return recent;
}
