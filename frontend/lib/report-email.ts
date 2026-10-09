export type ReportEmail = { subject: string; text: string };

/**
 * Sends a job report to Ovi through Resend. Resend's test sender delivers
 * only to the address of the Resend account, so REPORT_EMAIL_TO is that
 * address. Throws when Resend does not accept the email.
 */
export function createReportSender(apiKey: string, to: string) {
  return async ({ subject, text }: ReportEmail) => {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Setebaid jobs <onboarding@resend.dev>", to: [to], subject, text }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`Resend answered HTTP ${response.status}`);
  };
}
