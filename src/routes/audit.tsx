import { createFileRoute } from "@tanstack/react-router";
import { ProtectedShell } from "@/components/protected-shell";
import { AuditPage } from "./-audit-page";

export const Route = createFileRoute("/audit")({
  component: AuditPageWrapper,
});

function AuditPageWrapper() {
  return (
    <ProtectedShell>
      <AuditPage />
    </ProtectedShell>
  );
}
