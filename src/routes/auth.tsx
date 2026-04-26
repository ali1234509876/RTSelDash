import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { useTheme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Languages, Sun, Moon } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

const signinSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(100),
});

const signupSchema = signinSchema.extend({
  fullName: z.string().trim().min(2).max(100),
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const parsed = signupSchema.parse({ email, password, fullName });
        const { error } = await supabase.auth.signUp({
          email: parsed.email,
          password: parsed.password,
          options: {
            data: { full_name: parsed.fullName },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        toast.success(t("common.success"));
      } else {
        const parsed = signinSchema.parse({ email, password });
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.email,
          password: parsed.password,
        });
        if (error) throw error;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("common.error");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background text-foreground flex items-center justify-center p-4 relative">
      <div className="absolute top-4 end-4 flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => setLang(lang === "ar" ? "en" : "ar")}>
          <Languages className="size-4 me-1.5" />
          {lang === "ar" ? "EN" : "ع"}
        </Button>
        <Button variant="ghost" size="sm" onClick={toggle}>
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 start-1/2 -translate-x-1/2 size-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, var(--color-primary), transparent 60%)" }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-3xl font-semibold tracking-tight text-gradient-primary">{t("app.brand")}</div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-medium mt-1">
            {t("app.tagline")}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-foreground">
            {mode === "signin" ? t("auth.signin.title") : t("auth.signup.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" ? t("auth.signin.subtitle") : t("auth.signup.subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} maxLength={100} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} maxLength={100} />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? t("common.loading") : mode === "signin" ? t("auth.signin.cta") : t("auth.signup.cta")}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-5 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {mode === "signin" ? t("auth.toSignup") : t("auth.toSignin")}
          </button>
        </div>
      </div>
    </div>
  );
}
