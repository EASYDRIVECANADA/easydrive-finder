import { Link } from "@tanstack/react-router";
import { EdcLogo } from "./EdcLogo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <div className="text-primary-foreground">
            <EdcLogo />
          </div>
          <p className="max-w-xs text-sm text-primary-foreground/70">
            Canada's stress-free way to finance and drive home a quality used vehicle.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Shop</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><Link to="/inventory" className="hover:text-primary-foreground">All Inventory</Link></li>
            <li><Link to="/financing" className="hover:text-primary-foreground">Financing</Link></li>
            <li><Link to="/warranty" className="hover:text-primary-foreground">Extended Warranty</Link></li>
            <li><Link to="/contact" className="hover:text-primary-foreground">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><Link to="/" className="hover:text-primary-foreground">About</Link></li>
            <li><Link to="/login" className="hover:text-primary-foreground">Dealer Portal</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Contact</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li>1-800-555-EASY</li>
            <li>hello@easydrivecanada.com</li>
            <li>Toronto, ON</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-primary-foreground/60 sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} EasyDrive Canada. All rights reserved.</span>
          <span>Template — for demo purposes only.</span>
        </div>
      </div>
    </footer>
  );
}
