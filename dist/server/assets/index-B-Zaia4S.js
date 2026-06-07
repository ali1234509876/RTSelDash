import { U as jsxRuntimeExports } from "./worker-entry-LGGiUUMr.js";
import { a as useAuth, N as Navigate } from "./router-C21oMGn1.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
function Index() {
  const {
    user,
    loading
  } = useAuth();
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-dvh items-center justify-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-sm", children: "Loading…" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: user ? "/dashboard" : "/auth", replace: true });
}
export {
  Index as component
};
