import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "main_admin" | "contractor" | "subcontractor" | "mistri" | "labour";

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

const ROLE_PRIORITY: AppRole[] = ["main_admin", "contractor", "subcontractor", "mistri", "labour"];

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
    // Listener first, then session check (recommended order)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        // Defer to avoid deadlock
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
    case "main_admin": return "/portal/admin";
    case "contractor": return "/portal/contractor";
    case "subcontractor": return "/portal/subcontractor";
    case "mistri": return "/portal/mistri";
    case "labour": return "/portal/labour";
    default: return "/portal";
  }
};

export const roleLabel = (role: AppRole | null): string => {
  switch (role) {
    case "main_admin": return "Main Admin";
    case "contractor": return "Contractor";
    case "subcontractor": return "Subcontractor";
    case "mistri": return "Mistri";
    case "labour": return "Labour";
    default: return "Member";
  }
};
