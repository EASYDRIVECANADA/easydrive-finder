import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { getVehicleById } from "@/data/vehicles";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowLeft, Phone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/inventory/$vehicleId")({
  loader: ({ params }) => {
    const v = getVehicleById(params.vehicleId);
    if (!v) throw notFound();
    return v;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.year} ${loaderData.make} ${loaderData.model} — EasyDrive Canada` },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: `${loaderData.year} ${loaderData.make} ${loaderData.model}` },
          { property: "og:description", content: loaderData.description },
          { property: "og:image", content: loaderData.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Vehicle not found</h1>
        <p className="mt-2 text-muted-foreground">This listing may have sold.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/inventory">Back to inventory</Link>
        </Button>
      </main>
      <MarketingFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-12 text-center">{error.message}</div>
  ),
  component: VehicleDetail,
});

function VehicleDetail() {
  const v = Route.useLoaderData();
  const [down, setDown] = useState(2000);
  const [term, setTerm] = useState(60);
  const rate = 7.99 / 100 / 12;
  const principal = v.salePrice - down;
  const monthly =
    principal > 0 ? (principal * rate) / (1 - Math.pow(1 + rate, -term)) : 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to="/inventory">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to inventory
            </Link>
          </Button>
        </div>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8">
          <div>
            <div className="aspect-[16/10] overflow-hidden rounded-3xl bg-muted">
              <img src={v.image} alt={`${v.make} ${v.model}`} className="h-full w-full object-cover" />
            </div>
            <div className="mt-8">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {v.year} {v.make} {v.model}
              </h1>
              <p className="mt-1 text-muted-foreground">{v.trim} · Stock #{v.stockNumber}</p>
              <Badge className="mt-3 bg-brand text-brand-foreground hover:bg-brand">
                {v.certification === "Cert" ? "Certified" : "AS-IS"}
              </Badge>
            </div>
            <p className="mt-6 text-muted-foreground">{v.description}</p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                ["Year", v.year],
                ["Odometer", `${v.odometer.toLocaleString()} km`],
                ["Drive", v.drive],
                ["Transmission", v.transmission],
                ["Fuel", v.fuel],
                ["Cylinders", v.cylinders || "EV"],
                ["Colour", v.colour],
                ["Doors", v.doors],
                ["VIN", v.vin],
              ].map(([k, val]) => (
                <div key={k as string} className="rounded-xl border border-border bg-card p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{val}</div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-semibold">Features</h2>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {v.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-brand" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="text-xs text-muted-foreground line-through">
                List ${v.listPrice.toLocaleString()}
              </div>
              <div className="text-3xl font-bold">${v.salePrice.toLocaleString()}</div>
              <div className="mt-1 text-xs text-muted-foreground">+ taxes & licensing</div>
              <Button
                asChild
                className="mt-5 w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
              >
                <Link to="/checkout/$vehicleId" params={{ vehicleId: v.id }}>
                  Buy this vehicle
                </Link>
              </Button>
              <Button asChild variant="outline" className="mt-2 w-full rounded-full">
                <Link to="/financing">Get pre-approved</Link>
              </Button>
              <a
                href="tel:18005553279"
                className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Phone className="h-4 w-4" /> 1-800-555-EASY
              </a>
            </div>
            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold">Financing calculator</h3>
              <p className="mt-1 text-xs text-muted-foreground">Estimated at 7.99% APR</p>
              <div className="mt-4 space-y-5">
                <div>
                  <Label className="text-xs">Down payment: ${down.toLocaleString()}</Label>
                  <Slider value={[down]} min={0} max={Math.floor(v.salePrice * 0.5)} step={500} onValueChange={(x) => setDown(x[0])} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs">Term: {term} months</Label>
                  <Slider value={[term]} min={24} max={84} step={12} onValueChange={(x) => setTerm(x[0])} className="mt-2" />
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-brand/10 p-4 text-center">
                <div className="text-xs text-muted-foreground">Estimated monthly</div>
                <div className="text-3xl font-bold text-brand">
                  ${Math.round(monthly).toLocaleString()}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">/ month for {term} months</div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
