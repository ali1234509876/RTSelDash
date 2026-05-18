import { createFileRoute } from "@tanstack/react-router";
import { ProtectedShell } from "@/components/protected-shell";
import { InsightsPage } from "./-insights-page";

export const Route = createFileRoute("/insights")({
  component: InsightsPageWrapper,
});

function InsightsPageWrapper() {
  return (
    <ProtectedShell>
      <InsightsPage />
    </ProtectedShell>
  );
}
