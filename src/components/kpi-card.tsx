import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  labelSecondary?: string;
  value: string;
  hint?: ReactNode;
  accent?: "primary" | "success" | "warning" | "destructive" | "neutral";
  className?: string;
}

const accentMap = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  neutral: "text-muted-foreground",
} as const;

export function KpiCard({ label, labelSecondary, value, hint, accent = "neutral", className }: KpiCardProps) {
  return (
    <div className={cn("glass-card rounded-2xl p-6", className)}>
      <div className="flex justify-between items-start mb-4 gap-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
        {labelSecondary && (
          <div className="text-[10px] text-muted-foreground/70 font-medium truncate max-w-[55%] text-end">
            {labelSecondary}
          </div>
        )}
      </div>
      <div className="text-3xl font-light tabular text-foreground">{value}</div>
      {hint && <div className={cn("mt-4 text-xs font-medium", accentMap[accent])}>{hint}</div>}
    </div>
  );
}
