import { useI18n } from "@/lib/i18n-context";
import { formatDate } from "@/lib/i18n";
import { useAuditFeed } from "@/hooks/use-transaction-audit";
import type { AuditRow } from "@/lib/supabase-data";
import { Badge } from "@/components/ui/badge";

export function AuditPage() {
  const { t, lang } = useI18n();
  const { data: entries, loading } = useAuditFeed();

  return (
    <div className="px-10 py-8 max-w-[1600px] mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-light text-foreground">{t("audit.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("audit.subtitle")}</p>
      </header>

      <div className="glass-card rounded-3xl overflow-hidden">
        {loading ? (
          <div className="px-8 py-16 text-center text-sm text-muted-foreground">{t("common.loading")}</div>
        ) : entries.length === 0 ? (
          <div className="px-8 py-16 text-center text-sm text-muted-foreground">{t("audit.empty")}</div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry) => <AuditFeedEntry key={entry.id} entry={entry} lang={lang} t={t as (k: string) => string} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function AuditFeedEntry({ entry, lang, t }: { entry: AuditRow; lang: "ar" | "en"; t: (k: string) => string }) {
  const actionLabel = t(`audit.action.${entry.action.toLowerCase() as "insert" | "update" | "delete"}`);
  const actorLabel = entry.actor_name ?? t("audit.actor.unknown");
  const changes = computeChanges(entry);

  return (
    <div className="px-8 py-6 hover:bg-accent/30 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <Badge variant="outline" className="text-[10px] uppercase font-medium">
          {actionLabel}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {t("audit.actor")} {actorLabel} · {formatDate(entry.changed_at, lang)}
        </span>
        {entry.file_number && (
          <span className="text-xs text-primary font-medium">
            #{entry.file_number}
          </span>
        )}
      </div>
      {changes.length > 0 && (
        <div className="mt-2 space-y-1">
          {changes.map(([key, from, to]) => (
            <div key={key} className="text-xs flex items-baseline gap-2">
              <span className="font-medium text-foreground min-w-[120px]">
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
  const before = entry.before_data ?? {};
  const after = entry.after_data ?? {};
  const changes: Array<[string, string | null, string | null]> = [];

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
    if (beforeVal === afterVal) continue;
    const formatVal = (v: unknown): string | null => {
      if (v === null || v === undefined) return null;
      if (field === "amount" && typeof v === "number") return v.toString();
      if (field === "deleted_at" || field === "transaction_date") {
        return typeof v === "string" ? v.substring(0, 10) : null;
      }
      return String(v);
    };
    changes.push([field, formatVal(beforeVal), formatVal(afterVal)]);
  }

  return changes;
}
