import { AppLogo } from "@/components/AppLogo";

export const PortfolioFooter = () => {
  return (
    <footer className="border-t border-border py-10">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Wavelength Infratech. All rights reserved.
        </div>
        <AppLogo size="sm" />
      </div>
    </footer>
  );
};
