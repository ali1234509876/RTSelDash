import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-LGGiUUMr.js";
import { a as useAuth, d as useNavigate, u as useI18n, g as useTheme, t as toast } from "./router-C21oMGn1.js";
import { B as Button, L as Languages, S as Sun, M as Moon } from "./button-C5Miz1Tm.js";
import { I as Input } from "./input-B-lpk3am.js";
import { L as Label, s as stringType, o as objectType } from "./label-CiRgDGLL.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const signinSchema = objectType({
  email: stringType().trim().email().max(255),
  password: stringType().min(6).max(100)
});
const signupSchema = signinSchema.extend({
  fullName: stringType().trim().min(2).max(100)
});
function AuthPage() {
  const {
    user,
    loading,
    signIn,
    signUp
  } = useAuth();
  const navigate = useNavigate();
  const {
    t,
    lang,
    setLang
  } = useI18n();
  const {
    theme,
    toggle
  } = useTheme();
  const [mode, setMode] = reactExports.useState("signin");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [fullName, setFullName] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!loading && user) navigate({
      to: "/dashboard",
      replace: true
    });
  }, [user, loading, navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const parsed = signupSchema.parse({
          email,
          password,
          fullName
        });
        await signUp(parsed.email, parsed.password, parsed.fullName);
        toast.success(t("common.success"));
      } else {
        const parsed = signinSchema.parse({
          email,
          password
        });
        await signIn(parsed.email, parsed.password);
      }
      navigate({
        to: "/dashboard",
        replace: true
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("common.error");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-dvh bg-background text-foreground flex items-center justify-center p-4 relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-4 end-4 flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setLang(lang === "ar" ? "en" : "ar"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Languages, { className: "size-4 me-1.5" }),
        lang === "ar" ? "EN" : "ع"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: toggle, children: theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "size-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-40 start-1/2 -translate-x-1/2 size-[500px] rounded-full opacity-20", style: {
      background: "radial-gradient(circle, var(--color-primary), transparent 60%)"
    } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-semibold tracking-tight text-gradient-primary", children: t("app.brand") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-medium mt-1", children: t("app.tagline") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card rounded-2xl p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold text-foreground", children: mode === "signin" ? t("auth.signin.title") : t("auth.signup.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: mode === "signin" ? t("auth.signin.subtitle") : t("auth.signup.subtitle") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "mt-6 space-y-4", children: [
          mode === "signup" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "fullName", children: t("auth.fullName") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "fullName", value: fullName, onChange: (e) => setFullName(e.target.value), required: true, minLength: 2, maxLength: 100 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: t("auth.email") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, maxLength: 255 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: t("auth.password") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, minLength: 6, maxLength: 100 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: submitting, children: submitting ? t("common.loading") : mode === "signin" ? t("auth.signin.cta") : t("auth.signup.cta") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMode(mode === "signin" ? "signup" : "signin"), className: "mt-5 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors", children: mode === "signin" ? t("auth.toSignup") : t("auth.toSignin") })
      ] })
    ] })
  ] });
}
export {
  AuthPage as component
};
