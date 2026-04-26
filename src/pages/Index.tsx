import { PortfolioHeader } from "@/components/site/PortfolioHeader";
import { PortfolioHero } from "@/components/site/PortfolioHero";
import { ServicesSection } from "@/components/site/ServicesSection";
import { ProjectsSection } from "@/components/site/ProjectsSection";
import { AboutSection } from "@/components/site/AboutSection";
import { ContactSection } from "@/components/site/ContactSection";
import { SocialSection } from "@/components/site/SocialSection";
import { PortfolioFooter } from "@/components/site/PortfolioFooter";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "Wavelength Infratech — Civil Construction, Design & Planning";
    const desc = "Wavelength Infratech: civil construction, in-house design studio, elevation and planning across MP and Dholera, powered by an internal ConTech ERP. Reach us at wavelengthinfratech@gmail.com.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PortfolioHeader />
      <PortfolioHero />
      <ServicesSection />
      <ProjectsSection />
      <AboutSection />
      <SocialSection />
      <ContactSection />
      <PortfolioFooter />
    </main>
  );
};

export default Index;
