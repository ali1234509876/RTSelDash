import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-LGGiUUMr.js";
import { u as useI18n, a as useAuth, d as useNavigate, e as useQueryClient, t as toast } from "./router-C21oMGn1.js";
import { P as ProtectedShell, c as addTransaction, q as queryKeys } from "./supabase-data-BRA3oWFj.js";
import { u as useProfilesWithRoles } from "./use-profiles-fTwdOUvA.js";
import { e as errorMessage } from "./errors-NNkPaikQ.js";
import { a as cn, B as Button } from "./button-C5Miz1Tm.js";
import { I as Input } from "./input-B-lpk3am.js";
import { L as Label, Z as ZodError, o as objectType, s as stringType, e as enumType, n as numberType } from "./label-CiRgDGLL.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CwBKop_M.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Bwo-7ceS.js";
import "./chevron-down-CuSiQtmK.js";
const Textarea = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
function EntryPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedShell, { allow: ["ceo", "dept_head", "accountant"], children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntryForm, {}) });
}
const schema = objectType({
  fileNumber: stringType().trim().min(1).max(64).regex(/^[A-Za-z0-9_\-/]+$/),
  amount: numberType().min(0).max(1e9),
  status: enumType(["completed", "pending", "cancelled"]),
  salesRepId: stringType().min(1),
  date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: stringType().max(500).optional()
});
function EntryForm() {
  const {
    t
  } = useI18n();
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const {
    data: profiles,
    loading: loadingReps
  } = useProfilesWithRoles();
  const reps = reactExports.useMemo(() => profiles.filter((profile) => profile.roles.includes("sales_rep")).map((profile) => ({
    id: profile.id,
    full_name: profile.full_name
  })), [profiles]);
  const [fileNumber, setFileNumber] = reactExports.useState("");
  const [amount, setAmount] = reactExports.useState("");
  const [status, setStatus] = reactExports.useState("completed");
  const [salesRepId, setSalesRepId] = reactExports.useState("");
  const [date, setDate] = reactExports.useState(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [notes, setNotes] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const handleSubmit = async (e) => {
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
        notes: notes || void 0
      });
      await addTransaction({
        file_number: parsed.fileNumber,
        amount: parsed.amount,
        status: parsed.status,
        sales_rep_id: parsed.salesRepId,
        recorded_by: user.id,
        transaction_date: parsed.date,
        notes: parsed.notes ?? null
      });
      await qc.invalidateQueries({
        queryKey: queryKeys.transactionsAll
      });
      toast.success(t("common.success"));
      navigate({
        to: "/transactions"
      });
    } catch (err) {
      if (err instanceof ZodError) {
        toast.error(err.issues.map((i) => i.message).join(", ") || t("common.error"));
      } else {
        toast.error(errorMessage(err, t("common.error")));
      }
      console.error("[entry] insert failed:", err);
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-10 py-8 max-w-3xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-light text-foreground", children: t("tx.entryTitle") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: t("tx.entrySubtitle") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "glass-card rounded-3xl p-8 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "fileNumber", children: t("tx.fileNumber") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "fileNumber", value: fileNumber, onChange: (e) => setFileNumber(e.target.value), required: true, maxLength: 64, placeholder: "AE-29110" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "amount", children: t("tx.amount") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "amount", type: "number", step: "0.01", min: "0", value: amount, onChange: (e) => setAmount(e.target.value), required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "salesRep", children: t("tx.salesRep") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: salesRepId, onValueChange: setSalesRepId, disabled: loadingReps, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "salesRep", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: reps.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.id, children: r.full_name ?? r.id.slice(0, 8) }, r.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "status", children: t("tx.status") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: status, onValueChange: (v) => setStatus(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "status", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "completed", children: t("status.completed") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: t("status.pending") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cancelled", children: t("status.cancelled") })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 md:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "date", children: t("tx.date") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "date", type: "date", value: date, onChange: (e) => setDate(e.target.value), required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 md:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "notes", children: t("tx.notes") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "notes", value: notes, onChange: (e) => setNotes(e.target.value), maxLength: 500, rows: 3 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => navigate({
          to: "/dashboard"
        }), children: t("tx.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: submitting || loadingReps || !salesRepId, children: submitting ? t("common.loading") : t("tx.save") })
      ] })
    ] })
  ] });
}
export {
  EntryPage as component
};
