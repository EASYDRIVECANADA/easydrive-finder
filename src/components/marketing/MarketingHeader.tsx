import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EdcLogo } from "./EdcLogo";
import { AccountTypeSwitcher } from "./AccountTypeSwitcher";

const nav = [
  { to: "/" as const, label: "Home" },
  { to: "/inventory" as const, label: "Shop Cars" },
  { to: "/financing" as const, label: "Financing" },
  { to: "/contact" as const, label: "Contact" },
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <EdcLogo />
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "text-foreground bg-muted" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="rounded-full px-4 py-2 text-sm font-medium transition hover:text-foreground"
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <AccountTypeSwitcher />
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to="/login">Dealer Login</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
            <Link to="/financing">Get Pre-Approved</Link>
          </Button>
        </div>
        <button
          className="rounded-md p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            <div className="px-1 pb-2">
              <AccountTypeSwitcher compact />
            </div>
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Dealer Login
            </Link>
            <Link
              to="/financing"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-full bg-brand px-3 py-2 text-center text-sm font-semibold text-brand-foreground"
            >
              Get Pre-Approved
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
