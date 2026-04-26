import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProtectedShell } from "@/components/protected-shell";
import { useI18n } from "@/lib/i18n-context";
import { formatCurrency } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useTransactions } from "@/hooks/use-transactions";
import { computeMetrics, efficiencyRatio } from "@/lib/metrics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/team")({
  component: TeamPage,
});

type Role = Database["public"]["Enums"]["app_role"];

interface RepRow {
  id: string;
  full_name: string | null;
  monthly_target: number;
  roles: Role[];
}

function TeamPage() {
  return (
    <ProtectedShell allow={["manager"]}>
      <Inner />
    </ProtectedShell>
  );
}

function Inner() {
  const { t, lang } = useI18n();
  const { data: txs } = useTransactions({ scope: "all" });
  const [reps, setReps] = useState<RepRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const load = async () => {
    const [{ data: profs }, { data: rolesData }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, monthly_target"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const roleMap = new Map<string, Role[]>();
    (rolesData ?? []).forEach((r) => {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    });
    setReps(
      (profs ?? []).map((p) => ({
        id: p.id,
        full_name: p.full_name,
        monthly_target: Number(p.monthly_target),
        roles: roleMap.get(p.id) ?? [],
      })),
    );
  };

  useEffect(() => {
    load();
  }, []);

  const saveTarget = async (id: string) => {
    const value = Number(drafts[id]);
    if (Number.isNaN(value) || value < 0) {
      toast.error(t("common.error"));
      return;
    }
    const { error } = await supabase.from("profiles").update({ monthly_target: value }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(t("manager.targetSaved"));
      setDrafts((d) => ({ ...d, [id]: "" }));
      load();
    }
  };

  return (
    <div className="px-10 py-8 max-w-[1600px] mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-light text-foreground">{t("nav.team")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("manager.subtitle")}</p>
      </header>

      <div className="glass-card rounded-3xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
              <th className="px-6 py-4 font-semibold text-start">{t("tx.salesRep")}</th>
              <th className="px-4 py-4 font-semibold text-start">{t("kpi.totalAchievement")}</th>
              <th className="px-4 py-4 font-semibold text-start">{t("kpi.monthlyTarget")}</th>
              <th className="px-4 py-4 font-semibold text-start">{t("kpi.efficiencyRatio")}</th>
              <th className="px-6 py-4 font-semibold text-end">{t("manager.setTarget")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reps.map((rep) => {
              const repTxs = txs.filter((tx) => tx.sales_rep_id === rep.id);
              const m = computeMetrics(repTxs);
              const ratio = efficiencyRatio(m.totalAchievement, rep.monthly_target);
              return (
                <tr key={rep.id} className="hover:bg-accent/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-foreground">{rep.full_name ?? "—"}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                      {rep.roles.map((r) => t(`role.${r}` as const)).join(" · ")}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm tabular text-foreground">
                    {formatCurrency(m.totalAchievement, lang)} {t("common.currency")}
                  </td>
                  <td className="px-4 py-4 text-sm tabular text-foreground">
                    {formatCurrency(rep.monthly_target, lang)} {t("common.currency")}
                  </td>
                  <td className="px-4 py-4 text-sm tabular text-primary">{ratio.toFixed(1)}%</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-32 h-9"
                        placeholder={String(rep.monthly_target)}
                        value={drafts[rep.id] ?? ""}
                        onChange={(e) => setDrafts((d) => ({ ...d, [rep.id]: e.target.value }))}
                      />
                      <Button size="sm" onClick={() => saveTarget(rep.id)} disabled={!drafts[rep.id]}>
                        {t("tx.save")}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {reps.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">
                  {t("tx.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
