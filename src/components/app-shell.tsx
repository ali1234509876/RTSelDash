import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Receipt, Users, FilePlus2, LogOut, Languages, Sun, Moon, Building2 } from "lucide-react";
import { useAuth, type Role } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { useTheme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  labelKey: "nav.dashboard" | "nav.transactions" | "nav.team" | "nav.entry" | "nav.departments";
  icon: typeof LayoutDashboard;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, roles: ["ceo", "dept_head", "manager", "accountant", "sales_rep"] },
  { to: "/transactions", labelKey: "nav.transactions", icon: Receipt, roles: ["ceo", "dept_head", "manager", "accountant", "sales_rep"] },
  { to: "/entry", labelKey: "nav.entry", icon: FilePlus2, roles: ["ceo", "dept_head", "manager", "accountant"] },
  { to: "/team", labelKey: "nav.team", icon: Users, roles: ["ceo", "dept_head", "manager"] },
  { to: "/departments", labelKey: "nav.departments", icon: Building2, roles: ["ceo"] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { profile, primaryRole, signOut } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const location = useLocation();

  const items = NAV_ITEMS.filter((i) => primaryRole && i.roles.includes(primaryRole));

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <aside className="w-64 shrink-0 border-e border-sidebar-border bg-sidebar flex flex-col">
        <div className="p-7">
          <div className="text-xl font-semibold tracking-tight text-gradient-primary">{t("app.brand")}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mt-0.5">
            {t("app.tagline")}
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {items.map((item) => {
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
                )}
              >
                <Icon className="size-4" />
                <span className="font-medium">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="size-9 rounded-full bg-accent border border-border-strong flex items-center justify-center text-xs font-semibold text-foreground">
              {(profile?.full_name ?? "·").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{profile?.full_name ?? "—"}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {primaryRole ? t(`role.${primaryRole}` as const) : ""}
              </div>
            </div>
          </div>

          <div className="flex gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            >
              <Languages className="size-3.5 me-1.5" />
              {lang === "ar" ? "EN" : "ع"}
            </Button>
            <Button type="button" variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={toggle}>
              {theme === "dark" ? <Sun className="size-3.5 me-1.5" /> : <Moon className="size-3.5 me-1.5" />}
              {theme === "dark" ? t("common.theme.light") : t("common.theme.dark")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={signOut}
              title={t("auth.signout")}
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}
