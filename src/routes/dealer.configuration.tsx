import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/dealer/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronRight,
  Search,
  Settings2,
  Pencil,
  X,
  Plus,
  Trash2,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  type WarrantyPlan,
} from "@/lib/bridgewarranty";
import {
  useDealerConfig,
  isPlanEnabled,
  setPlanEnabled,
  setMarkup,
  setShowRetailToCustomers,
  setRetailCell,
  applyMarkupToTier,
  fillEmptyOnTier,
  resetTierOverrides,
  getCost,
  getRetail,
  upsertProduct,
  deleteProduct,
  getAllProviders,
  getAllPlansByProvider,
  getPlanBySlug,
  type DealerProductConfig,
} from "@/lib/dealer-config";
import {
  upsertCustomPlan,
  deleteCustomPlan,
  blankCustomPlan,
  blankTier,
  useCustomWarranty,
} from "@/lib/custom-warranty";

export const Route = createFileRoute("/dealer/configuration")({
  head: () => ({ meta: [{ title: "Configuration — Dealer Portal" }] }),
  component: ConfigurationPage,
});

function ConfigurationPage() {
  const cfg = useDealerConfig();
  return (
    <div>
      <PageHeader
        title="Configuration"
        subtitle="Set retail pricing for warranty plans and dealer-managed add-on products."
      />
      <div className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand/30 bg-brand/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">Dealer Pricing Configuration</div>
              <div className="text-sm text-muted-foreground">
                Mark up dealer cost to your retail price for every base term and add-on. Customers
                only see your retail prices — never your costs.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
            <Label htmlFor="show-retail" className="text-sm font-medium">
              Show Retail to Customers
            </Label>
            <Switch
              id="show-retail"
              checked={cfg.showRetailToCustomers}
              onCheckedChange={setShowRetailToCustomers}
            />
          </div>
        </div>

        <Tabs defaultValue="warranty">
          <TabsList>
            <TabsTrigger value="warranty">Warranty plans</TabsTrigger>
            <TabsTrigger value="products">Add-on products</TabsTrigger>
            <TabsTrigger value="defaults">Defaults</TabsTrigger>
          </TabsList>
          <TabsContent value="warranty" className="mt-4">
            <WarrantyConfigTab />
          </TabsContent>
          <TabsContent value="products" className="mt-4">
            <ProductCatalogTab />
          </TabsContent>
          <TabsContent value="defaults" className="mt-4">
            <DefaultsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ── Warranty config (provider → plan → tier → term grid) ────────

function WarrantyConfigTab() {
  const [providerSlug, setProviderSlug] = useState<string | null>(null);
  const [planSlug, setPlanSlug] = useState<string | null>(null);
  const providers = getAllProviders();

  if (!providerSlug) {
    return (
      <div className="space-y-4">
        <Crumbs items={[{ label: "Providers" }]} />
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Providers ({providers.length})
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((prov) => {
              const plans = getAllPlansByProvider(prov);
              return (
                <button
                  key={prov}
                  type="button"
                  onClick={() => setProviderSlug(prov)}
                  className="flex items-center justify-between rounded-2xl border border-border bg-background p-4 text-left transition hover:border-brand/40 hover:bg-brand/5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-brand">
                      <Settings2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{prov} Warranty</div>
                      <div className="text-xs text-muted-foreground">{plans.length} plans</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (!planSlug) {
    return (
      <div className="space-y-4">
        <Crumbs
          items={[
            { label: "Providers", onClick: () => setProviderSlug(null) },
            { label: providerSlug },
          ]}
        />
        <PlansList provider={providerSlug} onPick={setPlanSlug} />
      </div>
    );
  }

  const plan = getPlanBySlug(planSlug);
  if (!plan) return null;
  return (
    <div className="space-y-4">
      <Crumbs
        items={[
          { label: "Providers", onClick: () => setProviderSlug(null) },
          { label: providerSlug, onClick: () => setPlanSlug(null) },
          { label: plan.name },
        ]}
      />
      <PlanEditor plan={plan} onBack={() => setPlanSlug(null)} />
    </div>
  );
}

function Crumbs({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {it.onClick && !last ? (
              <button
                type="button"
                onClick={it.onClick}
                className="hover:text-foreground"
              >
                {it.label}
              </button>
            ) : (
              <span className={last ? "font-semibold text-foreground" : ""}>{it.label}</span>
            )}
            {!last && <ChevronRight className="h-3.5 w-3.5" />}
          </span>
        );
      })}
    </nav>
  );
}

function PlansList({ provider, onPick }: { provider: string; onPick: (slug: string) => void }) {
  const plans = getAllPlansByProvider(provider);
  const cfg = useDealerConfig();
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => plans.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())),
    [plans, q],
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search plans in ${provider} Warranty…`}
            className="pl-9"
          />
        </div>
        <Badge variant="outline" className="rounded-full">
          {filtered.length} plan{filtered.length === 1 ? "" : "s"}
        </Badge>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {filtered.map((p) => {
          const enabled = isPlanEnabled(cfg, p.slug);
          return (
            <div
              key={p.slug}
              className="flex items-center justify-between rounded-2xl border border-border bg-background p-4"
            >
              <button
                type="button"
                onClick={() => onPick(p.slug)}
                className="flex flex-1 items-start gap-3 text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-brand">
                  <Settings2 className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">Vehicle Service Contract</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.pricingTiers.length > 0 && (
                      <Badge className="bg-muted text-muted-foreground hover:bg-muted">
                        {p.pricingTiers.length} tier{p.pricingTiers.length === 1 ? "" : "s"}
                      </Badge>
                    )}
                  </div>
                </div>
                <ChevronRight className="mt-2 h-4 w-4 text-muted-foreground" />
              </button>
              <div className="ml-3 flex items-center gap-2">
                <Switch
                  checked={enabled}
                  onCheckedChange={(c) => setPlanEnabled(p.slug, c)}
                  aria-label={`Toggle ${p.name}`}
                />
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No plans match your search.
          </div>
        )}
      </div>
    </div>
  );
}

function PlanEditor({ plan, onBack }: { plan: WarrantyPlan; onBack: () => void }) {
  const cfg = useDealerConfig();
  const [tierIndex, setTierIndex] = useState(0);
  const [bulkMarkup, setBulkMarkup] = useState<number>(cfg.warrantyMarkupPct);

  if (!plan.pricingTiers.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <Box className="mx-auto h-10 w-10 text-muted-foreground" />
        <div className="mt-3 font-semibold">{plan.name}</div>
        <div className="mt-1 text-sm text-muted-foreground">
          This plan has no standalone pricing — it's sold as an add-on alongside an existing
          warranty. No retail configuration needed.
        </div>
        <Button className="mt-5 rounded-full" variant="outline" onClick={onBack}>
          Back to plans
        </Button>
      </div>
    );
  }

  const tier = plan.pricingTiers[tierIndex];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Settings2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-bold">{plan.name}</div>
            <div className="text-sm text-muted-foreground">
              Vehicle Service Contract • {plan.provider}
            </div>
            <div className="mt-1">
              <Badge variant="outline" className="rounded-full">
                {plan.pricingTiers.length} tier{plan.pricingTiers.length === 1 ? "" : "s"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {plan.pricingTiers.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {plan.pricingTiers.map((pt, i) => (
            <button
              key={pt.perClaimAmount}
              type="button"
              onClick={() => setTierIndex(i)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                i === tierIndex
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border text-muted-foreground hover:border-foreground/30",
              )}
            >
              ${pt.perClaimAmount.toLocaleString()} Per Claim
            </button>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Badge className="rounded-full bg-muted text-muted-foreground hover:bg-muted">
              Per Claim: ${tier.perClaimAmount.toLocaleString()}
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {tier.terms.length} terms
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Bulk markup</Label>
            <Input
              type="number"
              value={bulkMarkup}
              onChange={(e) => setBulkMarkup(Number(e.target.value) || 0)}
              className="h-9 w-24"
            />
            <span className="text-sm text-muted-foreground">%</span>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                fillEmptyOnTier(plan.slug, tierIndex, bulkMarkup);
                toast.success("Filled empty cells");
              }}
            >
              Fill empty
            </Button>
            <Button
              size="sm"
              className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={() => {
                applyMarkupToTier(plan.slug, tierIndex, bulkMarkup);
                toast.success("Applied to all cells");
              }}
            >
              Apply to all
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full text-destructive"
              onClick={() => {
                resetTierOverrides(plan.slug, tierIndex);
                toast.success("Reset to markup defaults");
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-3 text-left">Coverage / Add-on</th>
                {tier.terms.map((t) => (
                  <th key={t.label} className="px-3 py-3 text-left font-semibold text-foreground">
                    {t.label.replace(" Mo / ", " Months / ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tier.rows.map((row) => {
                const isBase = row.label === "Base Price";
                const isPremium = row.label === "Premium Vehicle Fee";
                return (
                  <tr key={row.label} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-4">
                      {isBase && (
                        <Badge className="mr-2 rounded bg-muted text-[10px] font-bold uppercase text-muted-foreground hover:bg-muted">
                          Base
                        </Badge>
                      )}
                      {isPremium && (
                        <Badge className="mr-2 rounded bg-amber-100 text-[10px] font-bold uppercase text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-200">
                          Fee
                        </Badge>
                      )}
                      <span className="font-semibold">{row.label}</span>
                    </td>
                    {row.values.map((v, termIdx) => (
                      <td key={termIdx} className="px-3 py-4 align-top">
                        <PriceCell
                          plan={plan}
                          tierIndex={tierIndex}
                          termIndex={termIdx}
                          rowLabel={row.label}
                          rawValue={v}
                          markupPct={cfg.warrantyMarkupPct}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Click the pencil on any cell to set a custom retail price. Grey italic values show
          suggested retail (cost × default markup) — customers only see your saved price.
        </p>
      </div>
    </div>
  );
}

function PriceCell({
  plan,
  tierIndex,
  termIndex,
  rowLabel,
  rawValue,
  markupPct,
}: {
  plan: WarrantyPlan;
  tierIndex: number;
  termIndex: number;
  rowLabel: string;
  rawValue: number | string | null;
  markupPct: number;
}) {
  const cfg = useDealerConfig();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  if (typeof rawValue !== "number") {
    return (
      <div className="text-xs text-muted-foreground">
        {rawValue === "Included" ? (
          <span className="rounded-full bg-success/15 px-2 py-0.5 font-medium text-success">
            Included
          </span>
        ) : (
          <span>—</span>
        )}
      </div>
    );
  }

  const cost = getCost(plan, tierIndex, termIndex, rowLabel) ?? rawValue;
  const override =
    cfg.warranty[plan.slug]?.tiers?.[tierIndex]?.rows?.[rowLabel]?.[termIndex]?.retail;
  const retail = override ?? Math.round(cost * (1 + markupPct / 100));
  const markupDelta = cost > 0 ? Math.round(((retail - cost) / cost) * 100) : 0;

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          autoFocus
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            const n = Number(draft);
            if (!isNaN(n) && n > 0) {
              setRetailCell(plan.slug, tierIndex, termIndex, rowLabel, n);
            }
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const n = Number(draft);
              if (!isNaN(n) && n > 0) {
                setRetailCell(plan.slug, tierIndex, termIndex, rowLabel, n);
              }
              setEditing(false);
            } else if (e.key === "Escape") {
              setEditing(false);
            }
          }}
          className="h-8 w-20"
        />
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <div className="text-[11px] text-muted-foreground">Cost ${cost.toLocaleString()}</div>
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "font-bold tabular-nums",
            override != null ? "text-foreground" : "italic text-muted-foreground",
          )}
        >
          ${retail.toLocaleString()}
        </span>
        {override != null && markupDelta !== 0 && (
          <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">
            {markupDelta > 0 ? "+" : ""}
            {markupDelta}%
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            setDraft(String(retail));
            setEditing(true);
          }}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Edit retail price"
        >
          <Pencil className="h-3 w-3" />
        </button>
        {override != null && (
          <button
            type="button"
            onClick={() =>
              setRetailCell(plan.slug, tierIndex, termIndex, rowLabel, null)
            }
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
            aria-label="Reset to markup default"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Add-on product catalog tab ──────────────────────────────────

function ProductCatalogTab() {
  const cfg = useDealerConfig();
  const [editing, setEditing] = useState<DealerProductConfig | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">Add-on products</div>
          <div className="text-xs text-muted-foreground">
            Configure dealer cost, customer-facing retail price, and where each product appears.
          </div>
        </div>
        <Button
          className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
          onClick={() => setAdding(true)}
        >
          <Plus className="mr-1 h-4 w-4" /> Add product
        </Button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-3 text-left">Product</th>
              <th className="px-3 py-3 text-left">Group</th>
              <th className="px-3 py-3 text-right">Cost</th>
              <th className="px-3 py-3 text-right">Retail</th>
              <th className="px-3 py-3 text-center">Customer</th>
              <th className="px-3 py-3 text-center">Dealer</th>
              <th className="px-3 py-3 text-center">Taxable</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cfg.products.map((p) => {
              const margin =
                p.cost > 0 ? Math.round(((p.price - p.cost) / p.cost) * 100) : 0;
              return (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-3 py-3">
                    <div className="font-medium">{p.label}</div>
                    <div className="text-xs text-muted-foreground">{p.description}</div>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{p.group}</td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    ${p.cost.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="font-semibold tabular-nums">
                      ${p.price.toLocaleString()}
                    </div>
                    {margin !== 0 && (
                      <div className="text-[10px] font-semibold text-success">+{margin}%</div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Switch
                      checked={p.customerVisible}
                      onCheckedChange={(c) =>
                        upsertProduct({ ...p, customerVisible: c })
                      }
                    />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Switch
                      checked={p.dealerVisible}
                      onCheckedChange={(c) => upsertProduct({ ...p, dealerVisible: c })}
                    />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Checkbox
                      checked={p.taxable}
                      onCheckedChange={(c) =>
                        upsertProduct({ ...p, taxable: Boolean(c) })
                      }
                    />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setEditing(p)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => {
                          deleteProduct(p.id);
                          toast.success("Product removed");
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {cfg.products.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No products yet. Click "Add product" to create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(editing || adding) && (
        <ProductDialog
          product={editing}
          onClose={() => {
            setEditing(null);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}

function ProductDialog({
  product,
  onClose,
}: {
  product: DealerProductConfig | null;
  onClose: () => void;
}) {
  const isNew = !product;
  const [draft, setDraft] = useState<DealerProductConfig>(
    product ?? {
      id: `custom-${Date.now()}`,
      group: "ceramic",
      label: "",
      description: "",
      price: 0,
      cost: 0,
      taxable: true,
      customerVisible: true,
      dealerVisible: true,
    },
  );

  const save = () => {
    if (!draft.label.trim()) {
      toast.error("Label is required");
      return;
    }
    upsertProduct(draft);
    toast.success(isNew ? "Product added" : "Product updated");
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add product" : "Edit product"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Label</Label>
            <Input
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              placeholder="Nitrogen tire fill"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Reduces tire pressure loss…"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Cost ($)</Label>
              <Input
                type="number"
                value={draft.cost}
                onChange={(e) => setDraft({ ...draft, cost: Number(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Retail ($)</Label>
              <Input
                type="number"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <Label>Taxable (HST applies)</Label>
            <Switch
              checked={draft.taxable}
              onCheckedChange={(c) => setDraft({ ...draft, taxable: c })}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <Label>Visible to customers (online checkout)</Label>
            <Switch
              checked={draft.customerVisible}
              onCheckedChange={(c) => setDraft({ ...draft, customerVisible: c })}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <Label>Available on manual Bills of Sale</Label>
            <Switch
              checked={draft.dealerVisible}
              onCheckedChange={(c) => setDraft({ ...draft, dealerVisible: c })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={save}
          >
            {isNew ? "Add product" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Defaults tab ────────────────────────────────────────────────

function DefaultsTab() {
  const cfg = useDealerConfig();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="font-semibold">Global warranty markup</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Default markup applied to any warranty cell that doesn't have a custom override.
          Changing this updates suggested retails everywhere.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Input
            type="number"
            value={cfg.warrantyMarkupPct}
            onChange={(e) => setMarkup(Number(e.target.value) || 0)}
            className="w-32"
          />
          <span className="text-sm text-muted-foreground">% markup over cost</span>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="font-semibold">Customer pricing visibility</div>
        <p className="mt-1 text-sm text-muted-foreground">
          When OFF, the public warranty page hides retails and shows "Call for pricing" instead.
          Useful while you're still building your price book.
        </p>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-border p-3">
          <Label>Show retail prices to customers</Label>
          <Switch
            checked={cfg.showRetailToCustomers}
            onCheckedChange={setShowRetailToCustomers}
          />
        </div>
      </div>
    </div>
  );
}
