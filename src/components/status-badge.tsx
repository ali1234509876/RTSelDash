import { useI18n } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

export type TxStatus = Database["public"]["Enums"]["transaction_status"];

const styles: Record<TxStatus, string> = {
  completed: "bg-success/10 text-success border-success/20",
  pending: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
};

export function StatusBadge({ status }: { status: TxStatus }) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded text-[10px] uppercase tracking-tight border font-medium",
        styles[status],
      )}
    >
      {t(`status.${status}` as const)}
    </span>
  );
}
