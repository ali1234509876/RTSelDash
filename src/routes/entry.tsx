import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { ProtectedShell } from "@/components/protected-shell";
import { useI18n } from "@/lib/i18n-context";
import { useAuth } from "@/lib/auth-context";
import { useProfilesWithRoles } from "@/hooks/use-profiles";
import { queryKeys } from "@/lib/query-keys";
import { addTransaction } from "@/lib/supabase-data";
import { errorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/entry")({
  component: EntryPage,
});

function EntryPage() {
  return (
    <ProtectedShell allow={["ceo", "dept_head", "accountant"]}>
      <EntryForm />
    </ProtectedShell>
  );
}

const schema = z.object({
  fileNumber: z.string().trim().min(1).max(64).regex(/^[A-Za-z0-9_\-/]+$/),
  amount: z.number().min(0).max(1_000_000_000),
  status: z.enum(["completed", "pending", "cancelled"]),
  salesRepId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(500).optional(),
});

interface RepOption {
  id: string;
  full_name: string | null;
}

function EntryForm() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: profiles, loading: loadingReps } = useProfilesWithRoles();
  const reps = useMemo<RepOption[]>(
    () =>
      profiles
        .filter((profile) => profile.roles.includes("sales_rep"))
        .map((profile) => ({ id: profile.id, full_name: profile.full_name })),
    [profiles],
  );
  const [fileNumber, setFileNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"completed" | "pending" | "cancelled">("completed");
  const [salesRepId, setSalesRepId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(t("common.error"));
      return;
    }
    setSubmitting(true);
    try {
      const parsed = schema.parse({
        fileNumber,
        amount: Number(amount),
        status,
        salesRepId,
        date,
        notes: notes || undefined,
      });
      await addTransaction({
        file_number: parsed.fileNumber,
        amount: parsed.amount,
        status: parsed.status,
        sales_rep_id: parsed.salesRepId,
        recorded_by: user.id,
        transaction_date: parsed.date,
        notes: parsed.notes ?? null,
      });
      await qc.invalidateQueries({ queryKey: queryKeys.transactionsAll });
      toast.success(t("common.success"));
      navigate({ to: "/transactions" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues.map((i) => i.message).join(", ") || t("common.error"));
      } else {
        toast.error(errorMessage(err, t("common.error")));
      }
      console.error("[entry] insert failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-10 py-8 max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-light text-foreground">{t("tx.entryTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("tx.entrySubtitle")}</p>
      </header>

      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="fileNumber">{t("tx.fileNumber")}</Label>
            <Input
              id="fileNumber"
              value={fileNumber}
              onChange={(e) => setFileNumber(e.target.value)}
              required
              maxLength={64}
              placeholder="AE-29110"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount">{t("tx.amount")}</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="salesRep">{t("tx.salesRep")}</Label>
            <Select value={salesRepId} onValueChange={setSalesRepId} disabled={loadingReps}>
              <SelectTrigger id="salesRep">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {reps.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.full_name ?? r.id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">{t("tx.status")}</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">{t("status.completed")}</SelectItem>
                <SelectItem value="pending">{t("status.pending")}</SelectItem>
                <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="date">{t("tx.date")}</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="notes">{t("tx.notes")}</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} rows={3} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={() => navigate({ to: "/dashboard" })}>
            {t("tx.cancel")}
          </Button>
          <Button type="submit" disabled={submitting || loadingReps || !salesRepId}>
            {submitting ? t("common.loading") : t("tx.save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
