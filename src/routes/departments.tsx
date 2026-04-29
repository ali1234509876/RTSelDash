import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { ProtectedShell } from "@/components/protected-shell";
import { useI18n } from "@/lib/i18n-context";
import { supabase } from "@/integrations/supabase/client";
import { useDepartments, departmentLabel } from "@/hooks/use-departments";
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

function Inner() {
  const { t, lang } = useI18n();
  const { data: departments } = useDepartments();
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");

  const create = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from("departments").insert({
      name: name.trim(),
      name_ar: nameAr.trim() || null,
    });
    if (error) toast.error(error.message);
    else {
      toast.success(t("common.success"));
      setName("");
      setNameAr("");
    }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) toast.error(error.message);
    else toast.success(t("common.success"));
  };

  return (
    <div className="px-10 py-8 max-w-[1200px] mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-light text-foreground">{t("dept.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("dept.subtitle")}</p>
      </header>

      <div className="glass-card rounded-3xl p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
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
              <th className="px-6 py-4 font-semibold text-start">{t("dept.nameAr")}</th>
              <th className="px-6 py-4 font-semibold text-end">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {departments.map((d) => (
              <tr key={d.id} className="hover:bg-accent/40 transition-colors">
                <td className="px-6 py-4 text-sm text-foreground">{d.name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground" dir="rtl">{d.name_ar ?? "—"}</td>
                <td className="px-6 py-4 text-end">
                  <Button variant="ghost" size="sm" onClick={() => remove(d.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-sm text-muted-foreground">
                  {t("dept.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-[10px] text-muted-foreground mt-3 text-end">{lang === "ar" ? "" : ""}</div>
    </div>
  );
}
