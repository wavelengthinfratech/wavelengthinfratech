import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

interface Props {
  size?: "sm" | "md" | "lg";
  to?: string;
}

export const AppLogo = ({ size = "md", to = "/" }: Props) => {
  const cls = size === "sm" ? "h-8" : size === "lg" ? "h-12" : "h-10";
  return (
    <Link to={to} className="inline-flex items-center" aria-label="Wavelength Infratech">
      <img src={logo} alt="Wavelength Infratech logo" className={`${cls} w-auto`} />
    </Link>
  );
};
