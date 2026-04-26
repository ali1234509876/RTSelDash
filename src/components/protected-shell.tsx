import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, type Role } from "@/lib/auth-context";
import { AppShell } from "./app-shell";
import { useI18n } from "@/lib/i18n-context";

export function ProtectedShell({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow?: Role[];
}) {
  const { user, loading, primaryRole } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">{t("common.loading")}</div>
      </div>
    );
  }

  if (allow && primaryRole && !allow.includes(primaryRole)) {
    return (
      <AppShell>
        <div className="p-10 text-center text-muted-foreground">⛔ {t("common.error")}</div>
      </AppShell>
    );
  }

  return <AppShell>{children}</AppShell>;
}
