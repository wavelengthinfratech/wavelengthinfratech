import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import PortalIndex from "./pages/portal/PortalIndex.tsx";
import AdminDashboard from "./pages/portal/AdminDashboard.tsx";
import PricingMaster from "./pages/portal/PricingMaster.tsx";
import UsersAdmin from "./pages/portal/UsersAdmin.tsx";
import ProjectsAdmin from "./pages/portal/ProjectsAdmin.tsx";
import ContractorDashboard from "./pages/portal/ContractorDashboard.tsx";
import SubcontractorDashboard from "./pages/portal/SubcontractorDashboard.tsx";
import MistriDashboard from "./pages/portal/MistriDashboard.tsx";
import LabourDashboard from "./pages/portal/LabourDashboard.tsx";
import TileCalculator from "./pages/calculators/TileCalculator.tsx";
import PaintCalculator from "./pages/calculators/PaintCalculator.tsx";
import LabourCalculator from "./pages/calculators/LabourCalculator.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/calculators/tiles" element={<TileCalculator />} />
            <Route path="/calculators/paint" element={<PaintCalculator />} />
            <Route path="/calculators/labour" element={<LabourCalculator />} />

            <Route path="/portal" element={<PortalIndex />} />
            <Route path="/portal/admin" element={<AdminDashboard />} />
            <Route path="/portal/admin/pricing" element={<PricingMaster />} />
            <Route path="/portal/admin/users" element={<UsersAdmin />} />
            <Route path="/portal/admin/projects" element={<ProjectsAdmin />} />
            <Route path="/portal/contractor" element={<ContractorDashboard />} />
            <Route path="/portal/subcontractor" element={<SubcontractorDashboard />} />
            <Route path="/portal/mistri" element={<MistriDashboard />} />
            <Route path="/portal/labour" element={<LabourDashboard />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
