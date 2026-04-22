import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { VehicleCard } from "@/components/marketing/VehicleCard";
import { vehicles, LISTING_TYPE_STYLES, type ListingType } from "@/data/vehicles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/inventory/")({
  head: () => ({
    meta: [
      { title: "Inventory — EasyDrive Canada" },
      { name: "description", content: "Browse our full inventory of certified used vehicles. Filter by make, price, year, and body type." },
      { property: "og:title", content: "Inventory — EasyDrive Canada" },
      { property: "og:description", content: "Hand-picked, certified used vehicles. Free delivery across Ontario." },
    ],
  }),
  component: InventoryPage,
});

const allMakes = Array.from(new Set(vehicles.map((v) => v.make))).sort();
const allBodies = Array.from(new Set(vehicles.map((v) => v.bodyType))).sort();
const allListingTypes: ListingType[] = ["EDC Premier", "Dealer Select", "Fleet Select", "Private Seller"];

function InventoryPage() {
  const [search, setSearch] = useState("");
  const [makes, setMakes] = useState<string[]>([]);
  const [bodies, setBodies] = useState<string[]>([]);
  const [listingTypes, setListingTypes] = useState<ListingType[]>([]);
  const [maxPrice, setMaxPrice] = useState(70000);
  const [minYear, setMinYear] = useState(2018);

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (search && !`${v.year} ${v.make} ${v.model} ${v.trim}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (makes.length && !makes.includes(v.make)) return false;
      if (bodies.length && !bodies.includes(v.bodyType)) return false;
      if (listingTypes.length && !listingTypes.includes(v.listingType)) return false;
      if (v.salePrice > maxPrice) return false;
      if (v.year < minYear) return false;
      return true;
    });
  }, [search, makes, bodies, listingTypes, maxPrice, minYear]);

  const toggle = <T extends string>(list: T[], setList: (v: T[]) => void, val: T) => {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <div className="border-b border-border bg-muted/40">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Shop our inventory</h1>
            <p className="mt-2 text-muted-foreground">{filtered.length} vehicles available</p>
          </div>
        </div>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
          <aside className="space-y-6 rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-20 lg:self-start">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search</Label>
              <Input
                placeholder="Make, model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Max Price: ${maxPrice.toLocaleString()}
              </Label>
              <Slider
                value={[maxPrice]}
                min={15000}
                max={70000}
                step={1000}
                onValueChange={(v) => setMaxPrice(v[0])}
                className="mt-3"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Min Year: {minYear}
              </Label>
              <Slider
                value={[minYear]}
                min={2018}
                max={2024}
                step={1}
                onValueChange={(v) => setMinYear(v[0])}
                className="mt-3"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Make</Label>
              <div className="mt-2 max-h-44 space-y-2 overflow-auto pr-1">
                {allMakes.map((m) => (
                  <label key={m} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={makes.includes(m)} onCheckedChange={() => toggle(makes, setMakes, m)} />
                    {m}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Body Type</Label>
              <div className="mt-2 space-y-2">
                {allBodies.map((b) => (
                  <label key={b} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={bodies.includes(b)} onCheckedChange={() => toggle(bodies, setBodies, b)} />
                    {b}
                  </label>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full rounded-full"
              onClick={() => { setSearch(""); setMakes([]); setBodies([]); setMaxPrice(70000); setMinYear(2018); }}
            >
              Reset filters
            </Button>
          </aside>
          <section>
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                No vehicles match your filters.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
              </div>
            )}
          </section>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
