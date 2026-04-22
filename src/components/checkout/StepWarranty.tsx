import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Shield, ShieldOff, Info } from "lucide-react";
import {
  warrantyPlans,
  getGroupedPlans,
  getPlansByGroup,
  checkAllPlanEligibility,
  isPremiumVehicle,
  quoteWarranty,
  generateContractNumber,
  WAITING_PERIOD,
  type WarrantyPlan,
  type WarrantyQuote,
} from "@/lib/bridgewarranty";
import type { WarrantySelection } from "@/lib/orders";

type Props = {
  vehicle: { year: number; make: string; model: string; mileage: number };
  selection: WarrantySelection | null;
  setSelection: (s: WarrantySelection | null) => void;
  declined: boolean;
  setDeclined: (b: boolean) => void;
  termsAck: boolean;
  setTermsAck: (b: boolean) => void;
};

export function StepWarranty({
  vehicle,
  selection,
  setSelection,
  declined,
  setDeclined,
  termsAck,
  setTermsAck,
}: Props) {
  const eligibility = useMemo(() => checkAllPlanEligibility(vehicle), [vehicle]);
  const eligibleSlugs = new Set(
    eligibility.filter((e) => e.eligible).map((e) => e.planSlug),
  );
  const ineligible = eligibility.filter((e) => !e.eligible);

  // Powertrain has 4 sub-tiers grouped — show grouped plans, plus expand into
  // sub-plans if Powertrain is the active group.
  const grouped = getGroupedPlans("A-Protect");
  const plansToShow = grouped.filter(
    (p) => p.slug === "top-up" || eligibleSlugs.has(p.slug) || (p.group && getPlansByGroup(p.group).some((sub) => eligibleSlugs.has(sub.slug))),
  );

  const [activeSlug, setActiveSlug] = useState<string | null>(selection?.planSlug ?? null);

  const activePlan: WarrantyPlan | undefined = activeSlug
    ? warrantyPlans.find((p) => p.slug === activeSlug)
    : undefined;

  // For each chosen plan, default to its first pricing tier and first term.
  const [tierIndex, setTierIndex] = useState(0);
  const [termIndex, setTermIndex] = useState(0);
  const [extras, setExtras] = useState<string[]>([]);

  const quote: WarrantyQuote | null = useMemo(() => {
    if (!activePlan) return null;
    if (!activePlan.pricingTiers.length) return null;
    return quoteWarranty({
      plan: activePlan,
      tierIndex,
      termIndex,
      selectedAddOnLabels: extras,
      vehicleMake: vehicle.make,
      vehicleModel: vehicle.model,
      vehicleKm: vehicle.mileage,
    });
  }, [activePlan, tierIndex, termIndex, extras, vehicle]);

  // When user changes selection, persist as a draft selection so pricing/sidebar update live.
  const persistSelection = (q: WarrantyQuote | null) => {
    if (!q || !activePlan) {
      setSelection(null);
      return;
    }
    setSelection({
      planSlug: q.planSlug,
      planName: q.planName,
      perClaimAmount: q.perClaimAmount,
      deductible: q.deductible,
      termMonths: q.termMonths,
      termKm: q.termKm,
      termLabel: q.termLabel,
      basePrice: q.basePrice,
      addOns: q.selectedAddOnLabels,
      addOnTotal: q.addOnTotal,
      premiumVehicleFee: q.premiumVehicleFee,
      total: q.total,
      contractNumber: selection?.contractNumber || generateContractNumber("BW"),
      termsAcknowledgedAt: termsAck ? new Date().toISOString() : null,
    });
  };

  const choosePlan = (plan: WarrantyPlan) => {
    setDeclined(false);
    setActiveSlug(plan.slug);
    setTierIndex(0);
    setTermIndex(0);
    setExtras([]);
    const q = quoteWarranty({
      plan,
      tierIndex: 0,
      termIndex: 0,
      selectedAddOnLabels: [],
      vehicleMake: vehicle.make,
      vehicleModel: vehicle.model,
      vehicleKm: vehicle.mileage,
    });
    persistSelection(q);
  };

  const decline = () => {
    setActiveSlug(null);
    setSelection(null);
    setDeclined(true);
  };

  const tier = activePlan?.pricingTiers[tierIndex];
  const isPremium = isPremiumVehicle(vehicle.make, vehicle.model);

  // Add-on rows (everything except Base Price + Premium Vehicle Fee)
  const addOnRows = tier
    ? tier.rows.filter((r) => r.label !== "Base Price" && r.label !== "Premium Vehicle Fee")
    : [];

  return (
    <div>
      <h2 className="text-2xl font-bold">Extended warranty (BridgeWarranty)</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A-Protect Vehicle Service Contracts — sourced live from your BridgeWarranty plan catalog.
        Every plan below has been filtered against this vehicle's year, mileage, and make.
      </p>

      {/* Eligibility banner */}
      <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 text-brand" />
          <div className="flex-1">
            <div className="text-sm font-semibold">
              {plansToShow.length} plan{plansToShow.length === 1 ? "" : "s"} available for your{" "}
              {vehicle.year} {vehicle.make} {vehicle.model}
            </div>
            <div className="text-xs text-muted-foreground">
              {vehicle.mileage.toLocaleString()} km · {isPremium ? "Premium make — fee may apply on higher tiers." : "Standard make — no premium-vehicle fee."}
            </div>
            {ineligible.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                  Why aren't all plans available?
                </summary>
                <ul className="mt-1.5 space-y-1 pl-4 text-xs text-muted-foreground">
                  {ineligible.map((r) => (
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

      {/* Plan cards */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {plansToShow.map((p) => {
          // For grouped (powertrain), use the highest tier in the group as the "card" headline.
          const groupPlans = p.group ? getPlansByGroup(p.group) : [p];
          const headline = groupPlans[groupPlans.length - 1];
          const on = activeSlug && groupPlans.some((g) => g.slug === activeSlug);
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => choosePlan(headline)}
              className={cn(
                "rounded-2xl border p-4 text-left transition",
                on ? "border-brand bg-brand/5 ring-2 ring-brand/30" : "border-border bg-card hover:border-foreground/20",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{p.group ? "Powertrain" : p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.claimRange}</div>
                </div>
                {p.salesTag && (
                  <Badge className="bg-brand/15 text-brand hover:bg-brand/15">{p.salesTag.label}</Badge>
                )}
              </div>
              <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                {p.highlights.slice(0, 3).map((h) => (
                  <li key={h} className="flex items-start gap-1">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" /> {h}
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                Deductible {p.deductible}
              </div>
            </button>
          );
        })}
      </div>

      {/* Plan configurator */}
      {activePlan && tier && (
        <div className="mt-6 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Selected plan
              </div>
              <div className="text-lg font-bold">{activePlan.name}</div>
              <div className="text-xs text-muted-foreground">{activePlan.eligibility}</div>
            </div>
            <Badge variant="outline" className="rounded-full">A-Protect via BridgeWarranty</Badge>
          </div>

          {/* Sub-tier picker (e.g. Powertrain Bronze/Silver/Gold/Platinum, or Essential $1k/$3k/$5k/$10k) */}
          {activePlan.group && (
            <div className="mt-4">
              <div className="text-xs font-medium text-muted-foreground">Coverage tier</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {getPlansByGroup(activePlan.group).map((sub) => (
                  <button
                    key={sub.slug}
                    type="button"
                    onClick={() => choosePlan(sub)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition",
                      sub.slug === activePlan.slug
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-border text-muted-foreground hover:border-foreground/30",
                    )}
                  >
                    {sub.name.replace(/^Powertrain\s+/, "")} — {sub.claimRange}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activePlan.pricingTiers.length > 1 && (
            <div className="mt-4">
              <div className="text-xs font-medium text-muted-foreground">Per-claim limit</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {activePlan.pricingTiers.map((pt, i) => (
                  <button
                    key={pt.perClaimAmount}
                    type="button"
                    onClick={() => {
                      setTierIndex(i);
                      setTermIndex(0);
                      setExtras([]);
                      const q = quoteWarranty({
                        plan: activePlan,
                        tierIndex: i,
                        termIndex: 0,
                        selectedAddOnLabels: [],
                        vehicleMake: vehicle.make,
                        vehicleModel: vehicle.model,
                        vehicleKm: vehicle.mileage,
                      });
                      persistSelection(q);
                    }}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition",
                      i === tierIndex
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-border text-muted-foreground hover:border-foreground/30",
                    )}
                  >
                    ${pt.perClaimAmount.toLocaleString()} / claim · ${pt.deductible} deductible
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <div className="text-xs font-medium text-muted-foreground">Term</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {tier.terms.map((t, i) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => {
                    setTermIndex(i);
                    const q = quoteWarranty({
                      plan: activePlan,
                      tierIndex,
                      termIndex: i,
                      selectedAddOnLabels: extras,
                      vehicleMake: vehicle.make,
                      vehicleModel: vehicle.model,
                      vehicleKm: vehicle.mileage,
                    });
                    persistSelection(q);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition",
                    i === termIndex
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border text-muted-foreground hover:border-foreground/30",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {addOnRows.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-medium text-muted-foreground">Optional coverage upgrades</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {addOnRows.map((row) => {
                  const v = row.values[termIndex];
                  const numeric = typeof v === "number";
                  const included = v === "Included";
                  const disabled = !numeric && !included;
                  const checked = extras.includes(row.label);
                  return (
                    <label
                      key={row.label}
                      className={cn(
                        "flex items-start gap-2 rounded-xl border p-3 text-sm",
                        disabled
                          ? "border-border/40 bg-muted/20 opacity-50"
                          : checked
                            ? "border-brand bg-brand/5"
                            : "border-border bg-card",
                      )}
                    >
                      <Checkbox
                        disabled={disabled || included}
                        checked={checked || included}
                        onCheckedChange={(c) => {
                          const next = c
                            ? [...extras, row.label]
                            : extras.filter((x) => x !== row.label);
                          setExtras(next);
                          const q = quoteWarranty({
                            plan: activePlan,
                            tierIndex,
                            termIndex,
                            selectedAddOnLabels: next,
                            vehicleMake: vehicle.make,
                            vehicleModel: vehicle.model,
                            vehicleKm: vehicle.mileage,
                          });
                          persistSelection(q);
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{row.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {included ? "Included at no extra cost" : numeric ? `+$${(v as number).toLocaleString()}` : "Not available on this term"}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quote summary */}
          {quote && (
            <div className="mt-5 rounded-2xl bg-muted/30 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base price ({quote.termLabel})</span>
                <span className="tabular-nums">${quote.basePrice.toLocaleString()}</span>
              </div>
              {quote.addOnTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Add-ons ({quote.selectedAddOnLabels.filter((l) => !l.includes("(included)")).length})</span>
                  <span className="tabular-nums">+${quote.addOnTotal.toLocaleString()}</span>
                </div>
              )}
              {quote.premiumVehicleFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Premium vehicle fee</span>
                  <span className="tabular-nums">+${quote.premiumVehicleFee.toLocaleString()}</span>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-base font-bold">
                <span>Plan total</span>
                <span className="tabular-nums text-brand">${quote.total.toLocaleString()}</span>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                ≈ ${quote.monthlyEquivalent.toLocaleString()}/mo over {quote.termMonths} months
              </div>
            </div>
          )}

          <div className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-3.5 w-3.5 text-warning" />
              <span>{WAITING_PERIOD}</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-start gap-2 text-sm">
              <Checkbox
                checked={termsAck}
                onCheckedChange={(c) => setTermsAck(Boolean(c))}
              />
              <span>
                I have reviewed the A-Protect warranty terms, exclusions, and the 30-day / 1,000 km
                waiting period before coverage begins.
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Decline option */}
      <div className="mt-5 flex items-center justify-between rounded-2xl border border-dashed border-border p-4">
        <div className="flex items-center gap-2 text-sm">
          <ShieldOff className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Don't want extended coverage? You can decline and continue to checkout.
          </span>
        </div>
        <Button
          type="button"
          variant={declined ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={decline}
        >
          {declined ? "Coverage declined" : "Decline coverage"}
        </Button>
      </div>
    </div>
  );
}
