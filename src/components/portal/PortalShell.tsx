import { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AppLogo } from "@/components/AppLogo";
import { useAuth, roleLabel, AppRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LogOut, LayoutDashboard, IndianRupee, Calculator, Users, Building2,
  ClipboardList, MapPin, Wallet, Hammer, Sofa, FileText, UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const NAV_BY_ROLE: Record<AppRole, NavItem[]> = {
  super_admin: [
    { to: "/portal/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/portal/admin/pricing", label: "Material Rates", icon: IndianRupee },
    { to: "/portal/admin/users", label: "Users & Roles", icon: Users },
    { to: "/portal/admin/projects", label: "Projects", icon: Building2 },
    { to: "/calculators/tiles", label: "Calculators", icon: Calculator },
  ],
  construction_head: [
    { to: "/portal/construction", label: "Dashboard", icon: LayoutDashboard },
    { to: "/portal/admin/projects", label: "Projects", icon: Building2 },
    { to: "/calculators/tiles", label: "Calculators", icon: Calculator },
  ],
  interior_head: [
    { to: "/portal/interior", label: "Dashboard", icon: Sofa },
    { to: "/portal/admin/projects", label: "Projects", icon: Building2 },
  ],
  field_manager: [
    { to: "/portal/field", label: "Dashboard", icon: LayoutDashboard },
    { to: "/portal/field", label: "Leads & Visits", icon: MapPin },
  ],
  accounts_manager: [
    { to: "/portal/accounts", label: "Dashboard", icon: Wallet },
    { to: "/portal/admin/pricing", label: "Material Rates", icon: IndianRupee },
  ],
  material_manager: [
    { to: "/portal/admin/pricing", label: "Material Rates", icon: IndianRupee },
  ],
  hr_manager: [
    { to: "/portal/admin/users", label: "Users & Roles", icon: UserCheck },
  ],
  site_supervisor: [
    { to: "/portal/site", label: "Dashboard", icon: LayoutDashboard },
    { to: "/portal/site", label: "Site Updates", icon: Hammer },
  ],
  viewer: [
    { to: "/portal/viewer", label: "Reports", icon: FileText },
    { to: "/portal/viewer", label: "Activity", icon: ClipboardList },
  ],
};

export const PortalShell = ({ children }: { children: ReactNode }) => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const items = role ? NAV_BY_ROLE[role] ?? [] : [];

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline">← Site</Link>
            <span className="text-xs font-mono uppercase text-muted-foreground border-l border-border pl-3">
              {roleLabel(role)} Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button onClick={handleSignOut} variant="ghost" size="sm">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
            <AppLogo />
          </div>
        </div>
      </header>

      <div className="pt-16 flex">
        <aside className="hidden lg:flex w-64 flex-col gap-1 fixed left-0 top-16 bottom-0 border-r border-border bg-card/50 p-4">
          <div className="text-xs font-mono uppercase text-muted-foreground px-3 py-2">Navigate</div>
          {items.map((it, i) => (
            <NavLink
              key={`${it.to}-${i}`}
              to={it.to}
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )
              }
            >
              <it.icon className="size-4" />
              {it.label}
            </NavLink>
          ))}
        </aside>

        <nav className="lg:hidden fixed top-16 inset-x-0 z-40 border-b border-border bg-background/90 backdrop-blur overflow-x-auto">
          <div className="flex gap-1 p-2 min-w-max">
            {items.map((it, i) => (
              <NavLink
                key={`${it.to}-${i}`}
                to={it.to}
                end
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-xs whitespace-nowrap transition-colors",
                    isActive ? "bg-primary/15 text-primary" : "text-muted-foreground",
                  )
                }
              >
                <it.icon className="size-3.5" />
                {it.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <main className="flex-1 lg:ml-64 pt-12 lg:pt-0">
          <div className="container py-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
