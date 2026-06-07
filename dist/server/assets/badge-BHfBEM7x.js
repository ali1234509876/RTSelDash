import { a as useQuery, l as getTransactionAudit, q as queryKeys, m as getAuditFeed } from "./supabase-data-BRA3oWFj.js";
import { a as useAuth } from "./router-C21oMGn1.js";
import { U as jsxRuntimeExports } from "./worker-entry-LGGiUUMr.js";
import { a as cn, e as cva } from "./button-C5Miz1Tm.js";
function useTransactionAudit(transactionId) {
  const { primaryRole } = useAuth();
  const enabled = !!transactionId && (primaryRole === "ceo" || primaryRole === "accountant" || primaryRole === "dept_head");
  const query = useQuery({
    queryKey: transactionId ? queryKeys.auditByTx(transactionId) : ["audit", "tx", "disabled"],
    enabled,
    queryFn: () => getTransactionAudit(transactionId)
  });
  return { data: query.data ?? [], loading: query.isLoading, error: query.error };
}
function useAuditFeed() {
  const { primaryRole } = useAuth();
  const enabled = primaryRole === "ceo" || primaryRole === "accountant" || primaryRole === "dept_head";
  const query = useQuery({
    queryKey: queryKeys.auditFeed,
    enabled,
    queryFn: () => getAuditFeed()
  });
  return { data: query.data ?? [], loading: query.isLoading, error: query.error };
}
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
export {
  Badge as B,
  useTransactionAudit as a,
  useAuditFeed as u
};
