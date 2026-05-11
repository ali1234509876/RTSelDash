import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { ProtectedShell } from "@/components/protected-shell";
import { useI18n } from "@/lib/i18n-context";
import { useDepartments } from "@/hooks/use-departments";
import { useProfilesWithRoles } from "@/hooks/use-profiles";
import {
  addDepartment,
  removeDepartment,
  setDepartmentHead,
  updateDepartment,
} from "@/lib/supabase-data";
import { errorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/departments")({
  component: DepartmentsPage,
});

function DepartmentsPage() {
  return (
    <ProtectedShell allow={["ceo"]}>
      <Inner />
    </ProtectedShell>
  );
}

const NO_HEAD = "__none__";

function Inner() {
  const { t } = useI18n();
  const { data: departments, reload } = useDepartments();
  const { data: profiles } = useProfilesWithRoles();
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [code, setCode] = useState("");

  const create = async () => {
    if (!name.trim()) return;
    try {
      await addDepartment({
        name: name.trim(),
        name_ar: nameAr.trim() || null,
        code: code.trim() ? code.trim().toUpperCase() : null,
      });
      toast.success(t("common.success"));
      reload();
      setName("");
      setNameAr("");
      setCode("");
    } catch (err) {
      toast.error(errorMessage(err, t("common.error")));
      console.error("[departments] create failed:", err);
    }
  };

  const remove = async (id: string) => {
    try {
      await removeDepartment(id);
      toast.success(t("common.success"));
      reload();
    } catch (err) {
      toast.error(errorMessage(err, t("common.error")));
      console.error("[departments] remove failed:", err);
    }
  };

  const changeHead = async (deptId: string, value: string) => {
    try {
      await setDepartmentHead(deptId, value === NO_HEAD ? null : value);
      toast.success(t("common.success"));
      reload();
    } catch (err) {
      toast.error(errorMessage(err, t("common.error")));
      console.error("[departments] changeHead failed:", err);
    }
  };

  const toggleActive = async (deptId: string, nextActive: boolean) => {
    try {
      await updateDepartment(deptId, { is_active: nextActive });
      toast.success(t("common.success"));
      reload();
    } catch (err) {
      toast.error(errorMessage(err, t("common.error")));
      console.error("[departments] toggleActive failed:", err);
    }
  };

  // Eligible heads: anyone with a profile. The migration trigger auto-grants
  // the dept_head role on assignment, so we don't need to pre-filter by role.
  const headOptions = profiles
    .filter((p) => !p.roles.includes("sales_rep") || p.roles.length > 1)
    .concat(profiles.filter((p) => p.roles.length === 1 && p.roles[0] === "sales_rep"))
    .slice(0, 200);

  const nameOf = (id: string | null) => {
    if (!id) return null;
    return profiles.find((p) => p.id === id)?.full_name ?? id.slice(0, 8);
  };

  return (
    <div className="px-10 py-8 max-w-[1400px] mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-light text-foreground">{t("dept.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("dept.subtitle")}</p>
      </header>

      <div className="glass-card rounded-3xl p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_140px_auto] gap-3 items-end">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("dept.name")}
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sales" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("dept.nameAr")}
            </label>
            <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="قسم المبيعات" dir="rtl" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("dept.code")}
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("dept.codePlaceholder")}
              maxLength={8}
            />
          </div>
          <Button onClick={create} disabled={!name.trim()}>
            <Plus className="size-4 me-2" />
            {t("dept.add")}
          </Button>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
              <th className="px-6 py-4 font-semibold text-start">{t("dept.name")}</th>
              <th className="px-4 py-4 font-semibold text-start">{t("dept.nameAr")}</th>
              <th className="px-4 py-4 font-semibold text-start">{t("dept.code")}</th>
              <th className="px-4 py-4 font-semibold text-start">{t("dept.head")}</th>
              <th className="px-4 py-4 font-semibold text-start">{t("dept.active")}</th>
              <th className="px-6 py-4 font-semibold text-end">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {departments.map((d) => {
              const hasHead = !!d.head_id;
              return (
                <tr
                  key={d.id}
                  className={`hover:bg-accent/40 transition-colors ${d.is_active ? "" : "opacity-60"}`}
                >
                  <td className="px-6 py-4 text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <span>{d.name}</span>
                      {!hasHead && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400"
                          title={t("dept.noHead")}
                        >
                          <AlertTriangle className="size-3" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground" dir="rtl">
                    {d.name_ar ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-xs tabular text-muted-foreground">
                    {d.code ?? "—"}
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={d.head_id ?? NO_HEAD}
                      onChange={(e) => changeHead(d.id, e.target.value)}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs min-w-[160px]"
                      aria-label={t("dept.changeHead")}
                    >
                      <option value={NO_HEAD}>{t("dept.headNone")}</option>
                      {headOptions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.full_name ?? nameOf(p.id) ?? p.id.slice(0, 8)}
                        </option>
                      ))}
                    </select>
                    {!hasHead && (
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                        {t("dept.noHead")}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => toggleActive(d.id, !d.is_active)}
                      className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border ${
                        d.is_active
                          ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                          : "border-border text-muted-foreground bg-muted/40"
                      }`}
                    >
                      {d.is_active ? t("dept.active") : t("dept.archived")}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <Button variant="ghost" size="sm" onClick={() => remove(d.id)} title={t("common.delete")}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
            {departments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
                  {t("dept.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
