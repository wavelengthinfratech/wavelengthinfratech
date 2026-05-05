import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole =
  | "super_admin"
  | "construction_head"
  | "interior_head"
  | "field_manager"
  | "accounts_manager"
  | "material_manager"
  | "hr_manager"
  | "site_supervisor"
  | "telecaller_manager"
  | "telecaller"
  | "viewer";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

const ROLE_PRIORITY: AppRole[] = [
  "super_admin",
  "construction_head",
  "interior_head",
  "accounts_manager",
  "material_manager",
  "hr_manager",
  "field_manager",
  "site_supervisor",
  "viewer",
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (uid: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    if (!data || data.length === 0) return null;
    const roles = data.map((r) => r.role as AppRole);
    for (const p of ROLE_PRIORITY) if (roles.includes(p)) return p;
    return roles[0];
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        setTimeout(() => {
          fetchRole(newSession.user.id).then(setRole);
        }, 0);
      } else {
        setRole(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      if (existing?.user) {
        fetchRole(existing.user.id).then((r) => {
          setRole(r);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const roleHomePath = (role: AppRole | null): string => {
  switch (role) {
    case "super_admin": return "/portal/admin";
    case "construction_head": return "/portal/construction";
    case "interior_head": return "/portal/interior";
    case "field_manager": return "/portal/field";
    case "accounts_manager": return "/portal/accounts";
    case "material_manager": return "/portal/admin/pricing";
    case "hr_manager": return "/portal/admin/users";
    case "site_supervisor": return "/portal/site";
    case "viewer": return "/portal/viewer";
    default: return "/portal";
  }
};

export const roleLabel = (role: AppRole | null): string => {
  switch (role) {
    case "super_admin": return "Super Admin";
    case "construction_head": return "Construction Head";
    case "interior_head": return "Interior Head";
    case "field_manager": return "Field Manager";
    case "accounts_manager": return "Accounts Manager";
    case "material_manager": return "Material Manager";
    case "hr_manager": return "HR Manager";
    case "site_supervisor": return "Site Supervisor";
    case "viewer": return "Viewer";
    default: return "Member";
  }
};
