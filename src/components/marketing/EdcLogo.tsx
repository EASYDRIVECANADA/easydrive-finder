import { Link } from "@tanstack/react-router";
import { Car } from "lucide-react";

export function EdcLogo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-brand-foreground">
        <Car className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <div className="text-base font-bold tracking-tight">EasyDrive</div>
        <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Canada
        </div>
      </div>
    </Link>
  );
}
