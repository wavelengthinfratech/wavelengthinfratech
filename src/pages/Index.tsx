import { SiteHeader } from "@/components/site/SiteHeader";
import { Hero } from "@/components/site/Hero";
import { TrustBar } from "@/components/site/TrustBar";
import { Modules } from "@/components/site/Modules";
import { LogicFlow } from "@/components/site/LogicFlow";
import { AIEdge } from "@/components/site/AIEdge";
import { UserFlows } from "@/components/site/UserFlows";
import { ArchitectureDocs } from "@/components/site/ArchitectureDocs";
import { TechStack } from "@/components/site/TechStack";
import { Pricing } from "@/components/site/Pricing";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Footer } from "@/components/site/Footer";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "Wavelength Infratech — ConTech ERP for Civil Contractors";
    const meta = document.querySelector('meta[name="description"]');
    const content =
      "Site-to-office ConTech ERP for Indian civil contractors. GPS attendance, PR/PO/GRN procurement, geo-tagged DPR, live P&L, and AI quantity estimation.";
    if (meta) meta.setAttribute("content", content);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = content;
      document.head.appendChild(m);
    }
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <Hero />
      <TrustBar />
      <Modules />
      <LogicFlow />
      <AIEdge />
      <UserFlows />
      <ArchitectureDocs />
      <TechStack />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
};

export default Index;
