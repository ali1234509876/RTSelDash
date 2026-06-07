import { U as jsxRuntimeExports } from "./worker-entry-LGGiUUMr.js";
import { a as cn } from "./button-C5Miz1Tm.js";
import { u as useI18n } from "./router-C21oMGn1.js";
const accentMap = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  neutral: "text-muted-foreground"
};
function KpiCard({ label, labelSecondary, value, hint, accent = "neutral", className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("glass-card rounded-2xl p-6", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-semibold", children: label }),
      labelSecondary && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground/70 font-medium truncate max-w-[55%] text-end", children: labelSecondary })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-light tabular text-foreground", children: value }),
    hint && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("mt-4 text-xs font-medium", accentMap[accent]), children: hint })
  ] });
}
function RadialProgress({ value, size = 192, thickness = 12 }) {
  const { lang } = useI18n();
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - thickness) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = clamped / 100 * circ;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-center", style: { width: size, height: size }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: size, height: size, className: "rotate-[-90deg]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "circle",
        {
          cx: size / 2,
          cy: size / 2,
          r: radius,
          stroke: "var(--color-border-strong)",
          strokeWidth: thickness,
          fill: "none"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "circle",
        {
          cx: size / 2,
          cy: size / 2,
          r: radius,
          stroke: "url(#progressGradient)",
          strokeWidth: thickness,
          fill: "none",
          strokeLinecap: "round",
          strokeDasharray: `${dash} ${circ - dash}`,
          style: {
            transition: "stroke-dasharray 800ms cubic-bezier(0.16, 1, 0.3, 1)",
            filter: "drop-shadow(0 0 8px var(--color-primary))"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "progressGradient", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "var(--color-primary)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "var(--color-primary-glow)" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-5xl font-light tabular text-foreground", children: [
      new Intl.NumberFormat(lang === "ar" ? "ar-SA" : "en-US", { maximumFractionDigits: 1 }).format(clamped),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl text-muted-foreground", children: "%" })
    ] }) })
  ] });
}
export {
  KpiCard as K,
  RadialProgress as R
};
