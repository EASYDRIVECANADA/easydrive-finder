import { Link } from "@tanstack/react-router";
import logo from "@/assets/edc-logo.jpg";

export function EdcLogo({
  className = "",
  asLink = true,
}: {
  className?: string;
  variant?: "default" | "light";
  asLink?: boolean;
}) {
  const inner = (
    <div className={`flex items-center ${className}`}>
      <img
        src={logo}
        alt="EasyDrive Canada"
        className="h-10 w-auto select-none"
        draggable={false}
      />
    </div>
  );
  if (!asLink) return inner;
  return (
    <Link to="/" className="inline-flex items-center" aria-label="EasyDrive Canada home">
      {inner}
    </Link>
  );
}
