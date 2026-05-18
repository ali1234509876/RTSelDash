import { useI18n } from "@/lib/i18n-context";
import { formatDate } from "@/lib/i18n";
import { useTransactionAudit } from "@/hooks/use-transaction-audit";
import type { AuditRow } from "@/lib/supabase-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Props {
  transactionId: string | null;
  open: boolean;
  onClose: () => void;
}

export function AuditHistoryModal({ transactionId, open, onClose }: Props) {
  const { t, lang } = useI18n();
  const { data: entries, loading } = useTransactionAudit(transactionId);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("tx.historyTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {loading ? (
            <div className="text-sm text-muted-foreground py-8 text-center">{t("common.loading")}</div>
          ) : entries.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">{t("audit.empty")}</div>
          ) : (
            entries.map((entry) => <AuditEntry key={entry.id} entry={entry} lang={lang} t={t as (k: string) => string} />)
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AuditEntry({ entry, lang, t }: { entry: AuditRow; lang: "ar" | "en"; t: (k: string) => string }) {
  const actionLabel = t(`audit.action.${entry.action.toLowerCase() as "insert" | "update" | "delete"}`);
  const actorLabel = entry.actor_name ?? t("audit.actor.unknown");
  const changes = computeChanges(entry);

  return (
    <div className="border-l-2 border-border pl-4 relative">
      <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-border" />
      <div className="flex items-center gap-2 mb-1">
        <Badge variant="outline" className="text-[10px] uppercase font-medium">
          {actionLabel}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {t("audit.actor")} {actorLabel} · {formatDate(entry.changed_at, lang)}
        </span>
      </div>
      {changes.length > 0 && (
        <div className="mt-2 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            {t("audit.changedFields")}
          </div>
          {changes.map(([key, from, to]) => (
            <div key={key} className="text-xs flex items-baseline gap-2">
              <span className="font-medium text-foreground min-w-[100px]">
                {(t as (k: string) => string)(`audit.field.${key}`) ?? key}:
              </span>
              <span className="text-muted-foreground line-through">{from ?? t("audit.value.empty")}</span>
              <span className="text-foreground">→</span>
              <span className="text-foreground">{to ?? t("audit.value.empty")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function computeChanges(entry: AuditRow): Array<[string, string | null, string | null]> {
  if (entry.action === "INSERT") return [];
  if (entry.action === "DELETE") return [];
  // UPDATE: compare before vs after
  const before = entry.before_data ?? {};
  const after = entry.after_data ?? {};
  const changes: Array<[string, string | null, string | null]> = [];

  // Fields we care about diffing (ignore noise like updated_at)
  const FIELDS = [
    "amount",
    "status",
    "notes",
    "deleted_at",
    "transaction_date",
    "sales_rep_id",
    "file_number",
  ] as const;

  for (const field of FIELDS) {
    const beforeVal = before[field];
    const afterVal = after[field];
    // Skip if unchanged
    if (beforeVal === afterVal) continue;
    // Format values for display
    const formatVal = (v: unknown): string | null => {
      if (v === null || v === undefined) return null;
      if (field === "amount" && typeof v === "number") return v.toString();
      if (field === "deleted_at" || field === "transaction_date") {
        // ISO string from JSONB
        return typeof v === "string" ? v.substring(0, 10) : null;
      }
      return String(v);
    };
    changes.push([field, formatVal(beforeVal), formatVal(afterVal)]);
  }

  return changes;
}
