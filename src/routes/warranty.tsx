import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Shield, Info, Download, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  warrantyPlans,
  getGroupedPlans,
  getPlansByGroup,
  PLAN_COLUMNS,
  coverageMatrix,
  checkAllPlanEligibility,
  isPremiumVehicle,
  quoteWarranty,
  WAITING_PERIOD,
  COVERAGE_TERRITORY,
  GENERAL_TERMS,
  GENERAL_EXCLUSIONS,
  type WarrantyPlan,
  type CoverageStatus,
} from "@/lib/bridgewarranty";
import { useDealerConfig, toRetailQuote, isPlanEnabled } from "@/lib/dealer-config";

export const Route = createFileRoute("/warranty")({
  head: () => ({
    meta: [
      { title: "Extended Warranty — A-Protect via BridgeWarranty | EasyDrive Canada" },
      {
        name: "description",
        content:
          "Browse A-Protect Vehicle Service Contracts: Powertrain, Essential, Premium Special, Luxury, Diamond Plus, and Top Up. Compare coverage, get an instant quote, and add at checkout.",
      },
      { property: "og:title", content: "Extended Warranty — A-Protect via BridgeWarranty" },
      {
        property: "og:description",
        content: "Compare plans, see real pricing, and add coverage to your purchase.",
      },
    ],
  }),
  component: WarrantyPage,
});

function WarrantyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <Hero />
        <QuoteSection />
        <PlanGrid />
        <CoverageMatrix />
        <TermsBlock />
      </main>
      <MarketingFooter />
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="border-b border-border bg-gradient-to-br from-brand/5 via-background to-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Badge className="mb-4 rounded-full bg-brand/10 text-brand hover:bg-brand/10">
          Powered by BridgeWarranty · A-Protect V25
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Extended warranty,
          <span className="text-brand"> on your terms.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Browse the full A-Protect Vehicle Service Contract brochure: every plan, every term,
          every price. Get an instant quote for your car and add coverage at checkout — no
          phone calls, no pressure.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
            <a href="#quote">
              Get an instant quote <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <a href="#plans">Browse all plans</a>
          </Button>
          <Button asChild variant="ghost" size="lg" className="rounded-full">
            <a href="#matrix">
              <Download className="mr-1 h-4 w-4" /> Coverage matrix
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ── Quote section ────────────────────────────────────────────────
function QuoteSection() {
  const search = Route.useSearch() as { year?: number; km?: number; make?: string; model?: string };
  const [year, setYear] = useState<number | "">(search.year ?? "");
  const [km, setKm] = useState<number | "">(search.km ?? "");
  const [make, setMake] = useState<string>(search.make ?? "");
  const [model, setModel] = useState<string>(search.model ?? "");

  const ready = typeof year === "number" && typeof km === "number" && make.trim().length > 1;
  const vehicle = ready ? { year: Number(year), mileage: Number(km), make, model } : null;

  const eligibility = useMemo(
    () => (vehicle ? checkAllPlanEligibility(vehicle) : []),
    [vehicle],
  );
  const eligibleSlugs = new Set(eligibility.filter((e) => e.eligible).map((e) => e.planSlug));

  return (
    <section id="quote" className="border-b border-border bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Get a quote in 10 seconds</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We'll filter the catalog by your vehicle's age, mileage, and make so you only see
              plans you actually qualify for.
            </p>
            <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-5">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Year">
                  <Input
                    type="number"
                    placeholder="2020"
                    value={year}
                    onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}
                  />
                </Field>
                <Field label="Mileage (km)">
                  <Input
                    type="number"
                    placeholder="65000"
                    value={km}
                    onChange={(e) => setKm(e.target.value ? Number(e.target.value) : "")}
                  />
                </Field>
              </div>
              <Field label="Make">
                <Input placeholder="Toyota" value={make} onChange={(e) => setMake(e.target.value)} />
              </Field>
              <Field label="Model (optional)">
                <Input placeholder="Camry" value={model} onChange={(e) => setModel(e.target.value)} />
              </Field>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Tip: shopping a specific car?{" "}
              <Link to="/inventory" className="font-medium text-brand hover:underline">
                Browse inventory
              </Link>{" "}
              and add coverage at checkout.
            </div>
          </div>

          <div>
            {!vehicle ? (
              <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
                Enter your vehicle to see eligible plans and live pricing.
              </div>
            ) : (
              <QuoteResults
                vehicle={vehicle}
                eligibleSlugs={eligibleSlugs}
                ineligibleReasons={eligibility.filter((e) => !e.eligible)}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function QuoteResults({
  vehicle,
  eligibleSlugs,
  ineligibleReasons,
}: {
  vehicle: { year: number; mileage: number; make: string; model: string };
  eligibleSlugs: Set<string>;
  ineligibleReasons: { planSlug: string; reason?: string }[];
}) {
  const grouped = getGroupedPlans("A-Protect");
  const visible = grouped.filter(
    (p) =>
      p.slug === "top-up" ||
      eligibleSlugs.has(p.slug) ||
      (p.group && getPlansByGroup(p.group).some((sub) => eligibleSlugs.has(sub.slug))),
  );
  const premium = isPremiumVehicle(vehicle.make, vehicle.model);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 text-brand" />
          <div>
            <div className="text-sm font-semibold">
              {visible.length} plan{visible.length === 1 ? "" : "s"} available for your{" "}
              {vehicle.year} {vehicle.make} {vehicle.model || ""}
            </div>
            <div className="text-xs text-muted-foreground">
              {vehicle.mileage.toLocaleString()} km ·{" "}
              {premium ? "Premium make — fee may apply on higher tiers." : "Standard make — no premium-vehicle fee."}
            </div>
            {ineligibleReasons.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                  Why aren't all plans available?
                </summary>
                <ul className="mt-1.5 space-y-1 pl-4 text-xs text-muted-foreground">
                  {ineligibleReasons.map((r) => (
                    <li key={r.planSlug}>
                      <strong>{r.planSlug}:</strong> {r.reason}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
      </div>

      {visible.map((p) => (
        <QuoteCard key={p.slug} plan={p} vehicle={vehicle} />
      ))}
    </div>
  );
}

function QuoteCard({
  plan,
  vehicle,
}: {
  plan: WarrantyPlan;
  vehicle: { year: number; mileage: number; make: string; model: string };
}) {
  const groupPlans = plan.group ? getPlansByGroup(plan.group) : [plan];
  const [activeSlug, setActiveSlug] = useState<string>(groupPlans[groupPlans.length - 1].slug);
  const active = groupPlans.find((g) => g.slug === activeSlug) ?? plan;
  const [tierIndex, setTierIndex] = useState(0);
  const [termIndex, setTermIndex] = useState(0);

  const quote = useMemo(
    () =>
      quoteWarranty({
        plan: active,
        tierIndex,
        termIndex,
        selectedAddOnLabels: [],
        vehicleMake: vehicle.make,
        vehicleModel: vehicle.model,
        vehicleKm: vehicle.mileage,
      }),
    [active, tierIndex, termIndex, vehicle],
  );

  const tier = active.pricingTiers[tierIndex];

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{plan.group ? "Powertrain" : plan.name}</div>
          <div className="text-xs text-muted-foreground">{plan.claimRange} per claim · Deductible {plan.deductible}</div>
        </div>
        {plan.salesTag && (
          <Badge className="bg-brand/15 text-brand hover:bg-brand/15">{plan.salesTag.label}</Badge>
        )}
      </div>

      {plan.group && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {groupPlans.map((sub) => (
            <button
              key={sub.slug}
              type="button"
              onClick={() => {
                setActiveSlug(sub.slug);
                setTierIndex(0);
                setTermIndex(0);
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                sub.slug === active.slug
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border text-muted-foreground",
              )}
            >
              {sub.name.replace(/^Powertrain\s+/, "")}
            </button>
          ))}
        </div>
      )}

      {active.pricingTiers.length > 1 && (
        <div className="mt-3">
          <div className="text-xs font-medium text-muted-foreground">Per-claim limit</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {active.pricingTiers.map((pt, i) => (
              <button
                key={pt.perClaimAmount}
                type="button"
                onClick={() => {
                  setTierIndex(i);
                  setTermIndex(0);
                }}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs",
                  i === tierIndex
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border text-muted-foreground",
                )}
              >
                ${pt.perClaimAmount.toLocaleString()} / claim
              </button>
            ))}
          </div>
        </div>
      )}

      {tier && (
        <div className="mt-3">
          <div className="text-xs font-medium text-muted-foreground">Term</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {tier.terms.map((t, i) => (
              <button
                key={t.label}
                type="button"
                onClick={() => setTermIndex(i)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs",
                  i === termIndex
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border text-muted-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {quote ? (
        <div className="mt-4 flex items-end justify-between rounded-xl bg-muted/30 p-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Your price</div>
            <div className="text-2xl font-bold text-brand">${quote.total.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              ≈ ${quote.monthlyEquivalent.toLocaleString()}/mo · {quote.termLabel}
            </div>
          </div>
          <Button asChild size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
            <Link to="/inventory">
              Pick a car & add coverage <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-4 rounded-xl bg-muted/30 p-3 text-xs text-muted-foreground">
          Pricing not available for this configuration. Try a different term or per-claim limit.
        </div>
      )}
    </div>
  );
}

// ── Plan grid (browse all) ────────────────────────────────────────
function PlanGrid() {
  const grouped = getGroupedPlans("A-Protect");
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const open = openSlug ? warrantyPlans.find((p) => p.slug === openSlug) : null;

  return (
    <section id="plans" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">Every A-Protect plan</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Six product families covering everything from powertrain-only protection to comprehensive
          luxury coverage.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grouped.map((p) => (
            <div key={p.slug} className="flex flex-col rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{p.group ? "Powertrain" : p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.claimRange}</div>
                </div>
                {p.salesTag && (
                  <Badge className="bg-brand/15 text-brand hover:bg-brand/15">{p.salesTag.label}</Badge>
                )}
              </div>
              <ul className="mt-3 flex-1 space-y-1 text-xs text-muted-foreground">
                {p.highlights.slice(0, 4).map((h) => (
                  <li key={h} className="flex items-start gap-1">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" /> {h}
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                {p.eligibility} · Deductible {p.deductible}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full rounded-full"
                onClick={() => setOpenSlug(p.slug)}
              >
                View full coverage
              </Button>
            </div>
          ))}
        </div>
      </div>
      {open && <PlanDetailModal plan={open} onClose={() => setOpenSlug(null)} />}
    </section>
  );
}

function PlanDetailModal({ plan, onClose }: { plan: WarrantyPlan; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              A-Protect plan
            </div>
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            <p className="text-sm text-muted-foreground">{plan.eligibility}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
            Close
          </Button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <Stat label="Per-claim" value={plan.claimRange} />
          <Stat label="Deductible" value={plan.deductible} />
          <Stat label="Premium fees" value={plan.premiumFees ? "May apply" : "None"} />
        </div>

        <div className="mt-5">
          <h4 className="text-sm font-semibold">What's covered</h4>
          <div className="mt-2 space-y-2">
            {plan.coverageDetails.map((c) => (
              <div key={c.name} className="rounded-xl border border-border bg-muted/20 p-3 text-sm">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.parts}</div>
              </div>
            ))}
          </div>
        </div>

        {plan.benefits.length > 0 && (
          <div className="mt-5">
            <h4 className="text-sm font-semibold">Included benefits</h4>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {plan.benefits.map((b) => (
                <div key={b.name} className="rounded-xl border border-border bg-card p-3 text-sm">
                  <div className="font-medium">{b.name}</div>
                  <div className="text-xs text-muted-foreground">{b.description}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-brand">{b.limit}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {plan.importantNotes && plan.importantNotes.length > 0 && (
          <div className="mt-5 rounded-xl border border-warning/30 bg-warning/5 p-3 text-xs text-muted-foreground">
            <div className="mb-1 flex items-center gap-1 font-semibold text-warning">
              <Info className="h-3.5 w-3.5" /> Important notes
            </div>
            <ul className="list-disc space-y-1 pl-4">
              {plan.importantNotes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

// ── Coverage matrix ──────────────────────────────────────────────
function CoverageMatrix() {
  const symbol = (s: CoverageStatus) => {
    if (s === "included") return <span className="text-success">✓</span>;
    if (s === "available") return <span className="text-warning">●</span>;
    if (s === "specific") return <span className="text-brand">◉</span>;
    return <span className="text-muted-foreground/40">—</span>;
  };

  return (
    <section id="matrix" className="border-b border-border bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">Coverage comparison</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Side-by-side matrix from the A-Protect V25 brochure.{" "}
          <span className="text-success">✓</span> Included ·{" "}
          <span className="text-warning">●</span> Available add-on ·{" "}
          <span className="text-brand">◉</span> Term-specific
        </p>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="bg-muted/40">
                <th className="sticky left-0 z-10 bg-muted/40 px-3 py-3 text-left text-xs font-semibold">
                  Coverage
                </th>
                {PLAN_COLUMNS.map((c) => (
                  <th key={c.key} className="px-2 py-3 text-center text-xs">
                    <div className="font-semibold">{c.label}</div>
                    <div className="text-[10px] text-muted-foreground">{c.claimRange}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coverageMatrix.map((row) => (
                <tr key={row.category} className="border-t border-border">
                  <td className="sticky left-0 z-10 bg-card px-3 py-2 text-xs font-medium">
                    {row.category}
                  </td>
                  {PLAN_COLUMNS.map((c) => (
                    <td key={c.key} className="px-2 py-2 text-center text-sm">
                      {symbol(row.values[c.key] ?? "none")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ── Terms / FAQ ──────────────────────────────────────────────────
function TermsBlock() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">The fine print</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              These terms apply to every A-Protect plan. Read them before adding coverage.
            </p>
            <div className="mt-4 rounded-2xl border border-warning/30 bg-warning/5 p-4 text-sm">
              <div className="mb-1 flex items-center gap-1 font-semibold text-warning">
                <Info className="h-4 w-4" /> Waiting period
              </div>
              <p className="text-muted-foreground">{WAITING_PERIOD}</p>
            </div>
            <div className="mt-3 rounded-2xl border border-border bg-card p-4 text-sm">
              <div className="mb-1 font-semibold">Coverage territory</div>
              <p className="text-xs text-muted-foreground">{COVERAGE_TERRITORY}</p>
            </div>
          </div>
          <div className="space-y-4">
            {GENERAL_TERMS.map((g) => (
              <details key={g.heading} className="rounded-2xl border border-border bg-card p-4">
                <summary className="cursor-pointer text-sm font-semibold">{g.heading}</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                  {g.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </details>
            ))}
            <details className="rounded-2xl border border-border bg-card p-4">
              <summary className="cursor-pointer text-sm font-semibold">General exclusions</summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                {GENERAL_EXCLUSIONS.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </details>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-border bg-gradient-to-br from-brand/5 via-card to-card p-8 text-center">
          <h3 className="text-xl font-bold">Ready to add coverage to your purchase?</h3>
          <p className="max-w-xl text-sm text-muted-foreground">
            Pick a vehicle from inventory — your selected A-Protect plan will be waiting at the
            warranty step of checkout.
          </p>
          <Button asChild size="lg" className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
            <Link to="/inventory">
              Browse inventory <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// Bypass strict search validator — we only read query strings as soft hints.
declare module "@tanstack/react-router" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Register {}
}
