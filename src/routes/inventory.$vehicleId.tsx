import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { getVehicleById, LISTING_TYPE_STYLES } from "@/data/vehicles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PhotoCarousel } from "@/components/listing/PhotoCarousel";
import { DisclosureDialog } from "@/components/listing/DisclosureDialog";
import { CarfaxDialog } from "@/components/listing/CarfaxDialog";
import { AskQuestionDialog } from "@/components/listing/AskQuestionDialog";
import { FinanceCalculator } from "@/components/marketing/FinanceCalculator";
import { VEHICLE_FINANCE_FAQS } from "@/data/financing-faqs";
import { checkAllPlanEligibility } from "@/lib/bridgewarranty";
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  MapPin,
  MessageCircle,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Calendar,
  Gauge,
  Banknote,
  HelpCircle,
} from "lucide-react";
import { activeOrderForVehicle } from "@/lib/orders";

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
  const [dealPending, setDealPending] = useState(false);
  const lt = LISTING_TYPE_STYLES[v.listingType as keyof typeof LISTING_TYPE_STYLES];

  useEffect(() => {
    setDealPending(Boolean(activeOrderForVehicle(v.id)));
  }, [v.id]);

  const images = v.images?.length ? v.images : [v.image];
  const label = `${v.year} ${v.make} ${v.model}`;


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        {/* Breadcrumbs */}
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/inventory" className="hover:text-foreground">Inventory</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{label}</span>
          </nav>
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8">
          <div>
            <PhotoCarousel images={images} alt={label} />

            {/* Stat tiles */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <StatTile icon={<Gauge className="h-5 w-5" />} value={`${v.odometer.toLocaleString()} km`} label="Kilometers" />
              <StatTile icon={<Calendar className="h-5 w-5" />} value={String(v.year)} label="Year" />
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-brand" />
                <h2 className="text-xl font-bold">Vehicle Specifications</h2>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  ["Make", v.make],
                  ["Model", v.model],
                  ["Year", v.year],
                  ["Odometer", `${v.odometer.toLocaleString()} km`],
                  ["Transmission", v.transmission],
                  ["Drivetrain", v.drive],
                  ["Fuel", v.fuel],
                  ["Cylinders", v.cylinders || "EV"],
                  ["Colour", v.colour],
                  ["Doors", v.doors],
                  ["VIN", v.vin],
                  ["Stock #", v.stockNumber],
                ].map(([k, val]) => (
                  <div key={k as string} className="rounded-xl border border-border bg-card p-4">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{k}</div>
                    <div className="mt-1 text-sm font-semibold">{val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-xl font-bold">About this vehicle</h2>
              <p className="mt-3 text-muted-foreground">{v.description}</p>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold">Features</h2>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {v.features.map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-brand" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Financing FAQ */}
            <div className="mt-10">
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-brand" />
                <h2 className="text-xl font-bold">Financing — frequently asked</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Quick answers about how financing works on this vehicle. For the full list see our{" "}
                <Link to="/financing" className="font-semibold text-brand hover:underline">financing page</Link>.
              </p>
              <Accordion type="single" collapsible className="mt-4 rounded-2xl border border-border bg-card">
                {VEHICLE_FINANCE_FAQS.map((f, i) => (
                  <AccordionItem key={f.q} value={`q-${i}`} className="border-b border-border last:border-b-0">
                    <AccordionTrigger className="px-5 text-left text-sm font-semibold hover:no-underline">
                      <span className="flex items-start gap-2">
                        <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        {f.q}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pl-11 text-sm text-muted-foreground">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>


          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            {/* Title + price */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h1 className="text-2xl font-bold tracking-tight">{label}</h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> ON
              </p>
              <Badge className="mt-3 bg-brand text-brand-foreground hover:bg-brand">
                {v.certification === "Cert" ? "Certified" : "AS-IS"}
              </Badge>

              <div className="mt-5 flex items-end gap-3">
                <div className="rounded-2xl bg-brand px-5 py-3 text-3xl font-bold text-brand-foreground">
                  ${v.salePrice.toLocaleString()}
                </div>
                {dealPending && (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Deal Pending
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-muted-foreground line-through">
                List ${v.listPrice.toLocaleString()}
              </div>

              {/* Action stack */}
              <div className="mt-5 space-y-2">
                <Button
                  asChild
                  disabled={dealPending}
                  className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
                >
                  <Link to="/checkout/$vehicleId" params={{ vehicleId: v.id }}>
                    {dealPending ? "On Hold" : "Buy Online — $1,000 Deposit"}
                  </Link>
                </Button>

                <CarfaxDialog
                  vin={v.vin}
                  trigger={
                    <Button variant="outline" className="w-full justify-center gap-2 rounded-full border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive">
                      <FileText className="h-4 w-4" /> View CARFAX Report
                    </Button>
                  }
                />

                <DisclosureDialog
                  trigger={
                    <Button variant="outline" className="w-full justify-center gap-2 rounded-full border-amber-300/40 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
                      <ShieldAlert className="h-4 w-4" /> View Important Disclosure
                    </Button>
                  }
                />

                <AskQuestionDialog
                  vehicleLabel={label}
                  trigger={
                    <Button variant="outline" className="w-full justify-center gap-2 rounded-full">
                      <MessageCircle className="h-4 w-4" /> Ask a Question
                    </Button>
                  }
                />

                <Button asChild variant="outline" className="w-full justify-center gap-2 rounded-full">
                  <a href="tel:+16137772395">
                    <Phone className="h-4 w-4" /> Call Us (613) 777-2395
                  </a>
                </Button>
              </div>

              {/* Trust row */}
              <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                <TrustRow icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />}>CARFAX Report Available</TrustRow>
                <TrustRow icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}>Safety Inspected</TrustRow>
                <TrustRow icon={<Banknote className="h-4 w-4 text-emerald-600" />}>Financing Available</TrustRow>
              </div>
            </div>

            {/* BridgeWarranty coverage teaser */}
            {(() => {
              const eligible = checkAllPlanEligibility({
                year: v.year,
                make: v.make,
                model: v.model,
                mileage: v.mileage,
              }).filter((e) => e.eligible);
              return (
                <div className="rounded-3xl border border-border bg-card p-5">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-5 w-5 text-brand" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">Extended warranty available</div>
                      <div className="text-xs text-muted-foreground">
                        {eligible.length > 0
                          ? `${eligible.length} A-Protect plan${eligible.length === 1 ? "" : "s"} qualify for this vehicle.`
                          : "View A-Protect plans and compare coverage."}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link to="/warranty">View plans</Link>
                    </Button>
                    <Button asChild size="sm" className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
                      <Link to="/checkout/$vehicleId" params={{ vehicleId: v.id }}>
                        Add at checkout
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })()}

            {/* Financing calculator */}
            <FinanceCalculator salePrice={v.salePrice} />

            {/* Listing type / seller card */}
            <div className="rounded-3xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Listing type
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${lt.chip}`}>
                  {lt.label}
                </span>
              </div>
              <div className="mt-2 text-sm">Sold by <span className="font-semibold">{v.sellerName}</span></div>
            </div>

          </aside>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

function StatTile({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand">{icon}</div>
      <div className="mt-2 text-lg font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function TrustRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
}
