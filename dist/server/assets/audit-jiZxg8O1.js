import { U as jsxRuntimeExports } from "./worker-entry-LGGiUUMr.js";
import { P as ProtectedShell } from "./supabase-data-BRA3oWFj.js";
import { u as useI18n, b as formatDate } from "./router-C21oMGn1.js";
import { u as useAuditFeed, B as Badge } from "./badge-BHfBEM7x.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./button-C5Miz1Tm.js";
function AuditPage() {
  const { t, lang } = useI18n();
  const { data: entries, loading } = useAuditFeed();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-10 py-8 max-w-[1600px] mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-light text-foreground", children: t("audit.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: t("audit.subtitle") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-card rounded-3xl overflow-hidden", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-8 py-16 text-center text-sm text-muted-foreground", children: t("common.loading") }) : entries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-8 py-16 text-center text-sm text-muted-foreground", children: t("audit.empty") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: entries.map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsx(AuditFeedEntry, { entry, lang, t }, entry.id)) }) })
  ] });
}
function AuditFeedEntry({ entry, lang, t }) {
  const actionLabel = t(`audit.action.${entry.action.toLowerCase()}`);
  const actorLabel = entry.actor_name ?? t("audit.actor.unknown");
  const changes = computeChanges(entry);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-8 py-6 hover:bg-accent/30 transition-colors", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] uppercase font-medium", children: actionLabel }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
        t("audit.actor"),
        " ",
        actorLabel,
        " · ",
        formatDate(entry.changed_at, lang)
      ] }),
      entry.file_number && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-primary font-medium", children: [
        "#",
        entry.file_number
      ] })
    ] }),
    changes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-1", children: changes.map(([key, from, to]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs flex items-baseline gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground min-w-[120px]", children: [
        t(`audit.field.${key}`) ?? key,
        ":"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground line-through", children: from ?? t("audit.value.empty") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "→" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: to ?? t("audit.value.empty") })
    ] }, key)) })
  ] });
}
function computeChanges(entry) {
  if (entry.action === "INSERT") return [];
  if (entry.action === "DELETE") return [];
  const before = entry.before_data ?? {};
  const after = entry.after_data ?? {};
  const changes = [];
  const FIELDS = [
    "amount",
    "status",
    "notes",
    "deleted_at",
    "transaction_date",
    "sales_rep_id",
    "file_number"
  ];
  for (const field of FIELDS) {
    const beforeVal = before[field];
    const afterVal = after[field];
    if (beforeVal === afterVal) continue;
    const formatVal = (v) => {
      if (v === null || v === void 0) return null;
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
function AuditPageWrapper() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuditPage, {}) });
}
export {
  AuditPageWrapper as component
};
