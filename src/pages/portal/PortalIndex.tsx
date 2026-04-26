import { Navigate } from "react-router-dom";
import { useAuth, roleHomePath } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const PortalIndex = () => {
  const { user, role, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <Navigate to={roleHomePath(role)} replace />;
};

export default PortalIndex;
