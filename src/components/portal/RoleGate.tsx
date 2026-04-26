import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface Props {
  allow: AppRole[];
  children: ReactNode;
}

export const RoleGate = ({ allow, children }: Props) => {
  const { user, role, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!role || !allow.includes(role)) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Access denied</h2>
        <p className="text-muted-foreground">Your role doesn't have access to this section.</p>
      </div>
    );
  }
  return <>{children}</>;
};
