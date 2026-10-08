import { DashboardIcon } from "@sanity/icons/Dashboard";
import { urlSearchParamPreviewSecret } from "@sanity/preview-url-secret/constants";
import { createPreviewSecret } from "@sanity/preview-url-secret/create-secret";
import { Button, Card, Container, Stack, Text } from "@sanity/ui";
import { useState } from "react";
import { type Tool, useClient, useCurrentUser } from "sanity";

// The Website accepts only preview secrets with this source
// (frontend/lib/team-dashboard-session.ts).
const SECRET_SOURCE = "team-dashboard";

type TeamDashboardOptions = { websiteOrigin: string };

/**
 * Opens the Website's private team dashboard. The person is not asked to log
 * in again: the tool creates the same short-lived preview secret that
 * Presentation uses for draft mode, and the Website trades it for a session.
 */
export function teamDashboardTool(websiteOrigin: string): Tool<TeamDashboardOptions> {
  return {
    name: "team-dashboard",
    title: "Team dashboard",
    icon: DashboardIcon,
    options: { websiteOrigin },
    component: TeamDashboardTool,
  };
}

function TeamDashboardTool({ tool }: { tool: Tool<TeamDashboardOptions> }) {
  const client = useClient({ apiVersion: "2025-02-19" });
  const currentUser = useCurrentUser();
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openDashboard() {
    setError(null);
    setOpening(true);
    // Open the tab during the click, before any await, so pop-up blockers
    // allow it.
    const tab = window.open("", "_blank");
    try {
      const { secret } = await createPreviewSecret(
        client,
        SECRET_SOURCE,
        window.location.href,
        currentUser?.id,
      );
      const url = new URL("/team-dashboard/session", tool.options!.websiteOrigin);
      url.searchParams.set(urlSearchParamPreviewSecret, secret);

      if (!tab) {
        setError("Your browser blocked the new tab. Allow pop-ups for the Studio and try again.");
        return;
      }
      tab.opener = null;
      tab.location.href = url.toString();
    } catch (cause) {
      tab?.close();
      setError(
        `The dashboard could not open: ${cause instanceof Error ? cause.message : String(cause)}`,
      );
    } finally {
      setOpening(false);
    }
  }

  return (
    <Container width={1} padding={5}>
      <Stack space={4}>
        <Text size={3} weight="semibold">
          Team dashboard
        </Text>
        <Text muted>
          Opens the team dashboard on the website in a new tab. You stay signed
          in there for one day.
        </Text>
        <div>
          <Button
            icon={DashboardIcon}
            loading={opening}
            onClick={openDashboard}
            text="Open team dashboard"
            tone="primary"
          />
        </div>
        {error && (
          <Card padding={3} radius={2} tone="critical">
            <Text size={1}>{error}</Text>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
