import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/dealer/PageHeader";
import { vehicles, LISTING_TYPE_STYLES, type ListingType } from "@/data/vehicles";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dealer/marketplace")({
  head: () => ({ meta: [{ title: "Marketplace — Dealer Portal" }] }),
  component: MarketplacePage,
});

const TABS: ("All" | ListingType)[] = [
  "All",
  "EDC Premier",
  "Dealer Select",
  "Fleet Select",
  "Private Seller",
];

function MarketplacePage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const inStock = vehicles.filter((v) => v.status === "In Stock");
  const listings =
    tab === "All" ? inStock : inStock.filter((v) => v.listingType === tab);

  const counts = TABS.reduce<Record<string, number>>((acc, t) => {
    acc[t] = t === "All" ? inStock.length : inStock.filter((v) => v.listingType === t).length;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Marketplace"
        subtitle={`${listings.length} of ${inStock.length} vehicles · published to AutoTrader, Kijiji & Facebook`}
        actions={<Button className="rounded-full">Sync now</Button>}
      />

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="flex flex-wrap gap-1 px-6 py-3">
          {TABS.map((t) => {
            const active = tab === t;
            const style = t !== "All" ? LISTING_TYPE_STYLES[t] : null;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  active
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {style && <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />}
                {t}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    active ? "bg-brand-foreground/20 text-brand-foreground" : "bg-muted text-foreground",
                  )}
                >
                  {counts[t]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((v) => {
          const lt = LISTING_TYPE_STYLES[v.listingType];
          const isPrivate = v.listingType === "Private Seller";
          return (
            <div key={v.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img src={v.image} alt={v.model} className="h-full w-full object-cover" />
                <span className={cn("absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow", lt.chip)}>
                  {lt.label}
                </span>
                {isPrivate && (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{v.year} {v.make} {v.model}</div>
                    <div className="text-xs text-muted-foreground">
                      Stock #{v.stockNumber} · {v.sellerName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">${v.salePrice.toLocaleString()}</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["AutoTrader", "Kijiji", "Facebook"].map((p) => (
                    <span key={p} className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                      {p}
                    </span>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-3 w-full rounded-full">
                  <ExternalLink className="mr-1 h-3.5 w-3.5" /> View listing
                </Button>
              </div>
            </div>
          );
        })}
        {listings.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-12 text-center">
            <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No {tab === "All" ? "" : `${tab} `}listings to show right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
