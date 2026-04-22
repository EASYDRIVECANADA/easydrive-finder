import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dealer/PageHeader";
import { vehicles } from "@/data/vehicles";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/dealer/marketplace")({
  head: () => ({ meta: [{ title: "Marketplace — Dealer Portal" }] }),
  component: MarketplacePage,
});

function MarketplacePage() {
  const listings = vehicles.filter((v) => v.status === "In Stock");
  return (
    <div>
      <PageHeader
        title="Marketplace"
        subtitle={`${listings.length} vehicles published to AutoTrader, Kijiji & Facebook`}
        actions={<Button className="rounded-full">Sync now</Button>}
      />
      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((v) => (
          <div key={v.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="aspect-[16/10] overflow-hidden bg-muted">
              <img src={v.image} alt={v.model} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{v.year} {v.make} {v.model}</div>
                  <div className="text-xs text-muted-foreground">Stock #{v.stockNumber}</div>
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
        ))}
      </div>
    </div>
  );
}
