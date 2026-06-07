import { U as jsxRuntimeExports, r as reactExports } from "./worker-entry-LGGiUUMr.js";
import { u as useI18n, t as toast } from "./router-C21oMGn1.js";
import { P as ProtectedShell, d as addDepartment, e as setDepartmentHead, f as updateDepartment, r as removeDepartment } from "./supabase-data-BRA3oWFj.js";
import { u as useDepartments } from "./use-departments-6m5zH-f5.js";
import { u as useProfilesWithRoles } from "./use-profiles-fTwdOUvA.js";
import { e as errorMessage } from "./errors-NNkPaikQ.js";
import { c as createLucideIcon, B as Button } from "./button-C5Miz1Tm.js";
import { I as Input } from "./input-B-lpk3am.js";
import { P as Plus } from "./plus-BVtooVXg.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const __iconNode$1 = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
];
const Trash2 = createLucideIcon("trash-2", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const TriangleAlert = createLucideIcon("triangle-alert", __iconNode);
function DepartmentsPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedShell, { allow: ["ceo"], children: /* @__PURE__ */ jsxRuntimeExports.jsx(Inner, {}) });
}
const NO_HEAD = "__none__";
function Inner() {
  const {
    t
  } = useI18n();
  const {
    data: departments,
    reload
  } = useDepartments();
  const {
    data: profiles
  } = useProfilesWithRoles();
  const [name, setName] = reactExports.useState("");
  const [nameAr, setNameAr] = reactExports.useState("");
  const [code, setCode] = reactExports.useState("");
  const create = async () => {
    if (!name.trim()) return;
    try {
      await addDepartment({
        name: name.trim(),
        name_ar: nameAr.trim() || null,
        code: code.trim() ? code.trim().toUpperCase() : null
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
  const remove = async (id) => {
    try {
      await removeDepartment(id);
      toast.success(t("common.success"));
      reload();
    } catch (err) {
      toast.error(errorMessage(err, t("common.error")));
      console.error("[departments] remove failed:", err);
    }
  };
  const changeHead = async (deptId, value) => {
    try {
      await setDepartmentHead(deptId, value === NO_HEAD ? null : value);
      toast.success(t("common.success"));
      reload();
    } catch (err) {
      toast.error(errorMessage(err, t("common.error")));
      console.error("[departments] changeHead failed:", err);
    }
  };
  const toggleActive = async (deptId, nextActive) => {
    try {
      await updateDepartment(deptId, {
        is_active: nextActive
      });
      toast.success(t("common.success"));
      reload();
    } catch (err) {
      toast.error(errorMessage(err, t("common.error")));
      console.error("[departments] toggleActive failed:", err);
    }
  };
  const headOptions = profiles.filter((p) => !p.roles.includes("sales_rep") || p.roles.length > 1).concat(profiles.filter((p) => p.roles.length === 1 && p.roles[0] === "sales_rep")).slice(0, 200);
  const nameOf = (id) => {
    if (!id) return null;
    return profiles.find((p) => p.id === id)?.full_name ?? id.slice(0, 8);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-10 py-8 max-w-[1400px] mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-light text-foreground", children: t("dept.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: t("dept.subtitle") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-card rounded-3xl p-6 mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-[1fr_1fr_140px_auto] gap-3 items-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: t("dept.name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "Sales" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: t("dept.nameAr") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: nameAr, onChange: (e) => setNameAr(e.target.value), placeholder: "قسم المبيعات", dir: "rtl" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: t("dept.code") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: code, onChange: (e) => setCode(e.target.value), placeholder: t("dept.codePlaceholder"), maxLength: 8 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: create, disabled: !name.trim(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 me-2" }),
        t("dept.add")
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-card rounded-3xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold text-start", children: t("dept.name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-4 font-semibold text-start", children: t("dept.nameAr") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-4 font-semibold text-start", children: t("dept.code") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-4 font-semibold text-start", children: t("dept.head") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-4 font-semibold text-start", children: t("dept.active") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold text-end", children: t("common.actions") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
        departments.map((d) => {
          const hasHead = !!d.head_id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `hover:bg-accent/40 transition-colors ${d.is_active ? "" : "opacity-60"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-sm text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: d.name }),
              !hasHead && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400", title: t("dept.noHead"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-3" }) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4 text-sm text-muted-foreground", dir: "rtl", children: d.name_ar ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4 text-xs tabular text-muted-foreground", children: d.code ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: d.head_id ?? NO_HEAD, onChange: (e) => changeHead(d.id, e.target.value), className: "h-8 rounded-md border border-input bg-background px-2 text-xs min-w-[160px]", "aria-label": t("dept.changeHead"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: NO_HEAD, children: t("dept.headNone") }),
                headOptions.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p.id, children: p.full_name ?? nameOf(p.id) ?? p.id.slice(0, 8) }, p.id))
              ] }),
              !hasHead && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-amber-600 dark:text-amber-400 mt-1", children: t("dept.noHead") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => toggleActive(d.id, !d.is_active), className: `text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border ${d.is_active ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" : "border-border text-muted-foreground bg-muted/40"}`, children: d.is_active ? t("dept.active") : t("dept.archived") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => remove(d.id), title: t("common.delete"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-3.5" }) }) })
          ] }, d.id);
        }),
        departments.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-6 py-10 text-center text-sm text-muted-foreground", children: t("dept.empty") }) })
      ] })
    ] }) })
  ] });
}
export {
  DepartmentsPage as component
};
