import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/dealer/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { vehicles } from "@/data/vehicles";
import { customers } from "@/data/customers";
import { ArrowLeft, Plus, ShieldCheck, Package, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useDealerConfig,
  getCost,
  getRetail,
  getDealerProducts,
  isPlanEnabled,
} from "@/lib/dealer-config";
import { warrantyPlans, getPlanBySlug } from "@/lib/bridgewarranty";

export const Route = createFileRoute("/dealer/sales/new")({
  head: () => ({ meta: [{ title: "New Bill of Sale — Dealer Portal" }] }),
  component: NewSale,
});

// Custom line items added to the bill of sale (warranty + dealer products).
// `taxable` tracks whether HST applies; cost is for dealer reference only.
type ExtraLine = {
  id: string;
  kind: "warranty" | "product";
  label: string;
  cost: number;
  retail: number;
  taxable: boolean;
};

function NewSale() {
  const navigate = useNavigate();
  const [vehicleId, setVehicleId] = useState(vehicles[0].id);
  const [salePrice, setSalePrice] = useState(vehicles[0].salePrice);
  const [tradeIn, setTradeIn] = useState(0);
  const [docFee, setDocFee] = useState(599);
  const [licensing, setLicensing] = useState(120);
  const [extras, setExtras] = useState<ExtraLine[]>([]);

  const vehicle = vehicles.find((v) => v.id === vehicleId)!;
  const extrasTaxable = extras.filter((e) => e.taxable).reduce((s, e) => s + e.retail, 0);
  const extrasNonTax = extras.filter((e) => !e.taxable).reduce((s, e) => s + e.retail, 0);
  const taxableBase = Math.max(salePrice - tradeIn, 0) + extrasTaxable;
  const taxes = useMemo(() => Math.round(taxableBase * 0.13), [taxableBase]);
  const total = taxableBase + extrasNonTax + taxes + docFee + licensing;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Bill of sale created!");
    navigate({ to: "/dealer/sales" });
  };

  return (
    <div>
      <PageHeader
        title="New Bill of Sale"
        subtitle="Build a transaction record"
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/dealer/sales"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Link>
          </Button>
        }
      />
      <form onSubmit={submit} className="grid gap-6 p-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold">Customer</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Customer</Label>
                <Select defaultValue={customers[0].id}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Salesperson</Label>
                <Input defaultValue="Jordan Pierce" className="mt-1" />
              </div>
            </div>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold">Vehicle</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Vehicle</Label>
                <Select value={vehicleId} onValueChange={(id) => { setVehicleId(id); setSalePrice(vehicles.find(v => v.id === id)!.salePrice); }}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} — {v.stockNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>VIN</Label>
                <Input value={vehicle.vin} readOnly className="mt-1 bg-muted/40" />
              </div>
              <div>
                <Label>Stock #</Label>
                <Input value={vehicle.stockNumber} readOnly className="mt-1 bg-muted/40" />
              </div>
            </div>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold">Pricing</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Sale price</Label>
                <Input type="number" value={salePrice} onChange={(e) => setSalePrice(+e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Trade-in allowance</Label>
                <Input type="number" value={tradeIn} onChange={(e) => setTradeIn(+e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Doc fee</Label>
                <Input type="number" value={docFee} onChange={(e) => setDocFee(+e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Licensing</Label>
                <Input type="number" value={licensing} onChange={(e) => setLicensing(+e.target.value)} className="mt-1" />
              </div>
            </div>
          </section>

          {/* Add-on / warranty picker — uses the dealer-managed catalogs in
              Configuration. Costs are visible only to the dealer here. */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">Products & warranty</h3>
                <p className="text-xs text-muted-foreground">
                  Pull from your Configuration catalog. Customer sees retail; cost shown for your reference.
                </p>
              </div>
              <div className="flex gap-2">
                <AddWarrantyDialog onAdd={(line) => setExtras((x) => [...x, line])} />
                <AddProductDialog onAdd={(line) => setExtras((x) => [...x, line])} />
              </div>
            </div>

            {extras.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                No products attached yet.
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
                {extras.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="rounded-full text-[10px]">
                        {e.kind === "warranty" ? "Warranty" : "Product"}
                      </Badge>
                      <div>
                        <div className="text-sm font-medium">{e.label}</div>
                        <div className="text-xs text-muted-foreground">
                          Cost ${e.cost.toLocaleString()} · {e.taxable ? "Taxable" : "Tax-exempt"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold tabular-nums">
                        ${e.retail.toLocaleString()}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setExtras((x) => x.filter((y) => y.id !== e.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold">Notes</h3>
            <Textarea rows={4} placeholder="Internal notes..." className="mt-3" />
          </section>
        </div>
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold">Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <Row k="Sale price" v={salePrice} />
              <Row k="Trade-in" v={-tradeIn} />
              {extras.length > 0 && (
                <>
                  <div className="pt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Products & warranty
                  </div>
                  {extras.map((e) => (
                    <Row key={e.id} k={e.label} v={e.retail} />
                  ))}
                </>
              )}
              <Row k="Taxable base" v={taxableBase} />
              <Row k="HST (13%)" v={taxes} />
              <Row k="Doc fee" v={docFee} />
              <Row k="Licensing" v={licensing} />
              <div className="border-t border-border pt-3 mt-3 flex justify-between text-base font-bold">
                <span>Total</span><span>${total.toLocaleString()}</span>
              </div>
            </div>
            <Button type="submit" className="mt-5 w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
              Create bill of sale
            </Button>
            <BillOfSalePreview
              vehicle={vehicle}
              salePrice={salePrice}
              tradeIn={tradeIn}
              docFee={docFee}
              licensing={licensing}
              extras={extras}
              taxes={taxes}
              total={total}
            />
          </div>
        </aside>
      </form>
    </div>
  );
}

function Row({ k, v }: { k: string; v: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="tabular-nums">${v.toLocaleString()}</span>
    </div>
  );
}

// ── Add Warranty dialog ─────────────────────────────────────────
// Pulls from the live BridgeWarranty catalog (filtered by enabled in
// Configuration) and resolves cost + retail from `dealer-config`.

function AddWarrantyDialog({ onAdd }: { onAdd: (line: ExtraLine) => void }) {
  const cfg = useDealerConfig();
  const [open, setOpen] = useState(false);
  const enabledPlans = warrantyPlans.filter((p) => isPlanEnabled(cfg, p.slug));
  const [planSlug, setPlanSlug] = useState(enabledPlans[0]?.slug ?? "");
  const [tierIndex, setTierIndex] = useState(0);
  const [termIndex, setTermIndex] = useState(0);

  const plan = getPlanBySlug(planSlug);
  const tier = plan?.pricingTiers[tierIndex];
  const cost = plan ? getCost(plan, tierIndex, termIndex, "Base Price") : null;
  const retail = plan ? getRetail(cfg, planSlug, tierIndex, termIndex, "Base Price") : null;

  const submit = () => {
    if (!plan || !tier || cost == null || retail == null) {
      toast.error("Pricing not available for this configuration");
      return;
    }
    const term = tier.terms[termIndex];
    onAdd({
      id: `w-${Date.now()}`,
      kind: "warranty",
      label: `${plan.name} — ${term.label} · $${tier.perClaimAmount.toLocaleString()}/claim`,
      cost,
      retail,
      taxable: true,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="rounded-full">
          <ShieldCheck className="mr-1 h-4 w-4" /> Add warranty
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a warranty plan</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label>Plan</Label>
            <Select value={planSlug} onValueChange={(v) => { setPlanSlug(v); setTierIndex(0); setTermIndex(0); }}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {enabledPlans.map((p) => (
                  <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {plan && plan.pricingTiers.length > 1 && (
            <div>
              <Label>Per-claim limit</Label>
              <Select value={String(tierIndex)} onValueChange={(v) => { setTierIndex(+v); setTermIndex(0); }}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {plan.pricingTiers.map((pt, i) => (
                    <SelectItem key={i} value={String(i)}>
                      ${pt.perClaimAmount.toLocaleString()} / claim · ${pt.deductible} deductible
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {tier && (
            <div>
              <Label>Term</Label>
              <Select value={String(termIndex)} onValueChange={(v) => setTermIndex(+v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {tier.terms.map((t, i) => (
                    <SelectItem key={i} value={String(i)}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="rounded-xl bg-muted/30 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your cost</span>
              <span className="tabular-nums">{cost != null ? `$${cost.toLocaleString()}` : "—"}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Customer price</span>
              <span className="tabular-nums text-brand">{retail != null ? `$${retail.toLocaleString()}` : "—"}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" onClick={submit}>
            <Plus className="mr-1 h-4 w-4" /> Add to bill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Product dialog ──────────────────────────────────────────

function AddProductDialog({ onAdd }: { onAdd: (line: ExtraLine) => void }) {
  const cfg = useDealerConfig();
  const products = getDealerProducts(cfg);
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState(products[0]?.id ?? "");

  const product = products.find((p) => p.id === productId);

  const submit = () => {
    if (!product) return;
    onAdd({
      id: `p-${Date.now()}`,
      kind: "product",
      label: product.label,
      cost: product.cost,
      retail: product.price,
      taxable: product.taxable,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="rounded-full">
          <Package className="mr-1 h-4 w-4" /> Add product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a product or fee</DialogTitle>
        </DialogHeader>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No dealer-visible products in your catalog. Add one in{" "}
            <Link to="/dealer/configuration" className="font-medium text-brand hover:underline">
              Configuration
            </Link>.
          </p>
        ) : (
          <div className="grid gap-4">
            <div>
              <Label>Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {product && (
              <div className="rounded-xl bg-muted/30 p-3 text-sm">
                <div className="text-xs text-muted-foreground">{product.description}</div>
                <div className="mt-2 flex justify-between">
                  <span className="text-muted-foreground">Your cost</span>
                  <span className="tabular-nums">${product.cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Customer price</span>
                  <span className="tabular-nums text-brand">${product.price.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" onClick={submit} disabled={!product}>
            <Plus className="mr-1 h-4 w-4" /> Add to bill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Bill of Sale preview ────────────────────────────────────────
function BillOfSalePreview({
  vehicle,
  salePrice,
  tradeIn,
  docFee,
  licensing,
  extras,
  taxes,
  total,
}: {
  vehicle: ReturnType<typeof vehicles.find> & {};
  salePrice: number;
  tradeIn: number;
  docFee: number;
  licensing: number;
  extras: ExtraLine[];
  taxes: number;
  total: number;
}) {
  const [open, setOpen] = useState(false);
  const today = new Date().toLocaleDateString("en-CA");
  if (!vehicle) return null;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="mt-2 w-full rounded-full">
          Preview digital bill of sale
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bill of Sale — Preview</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="flex justify-between border-b pb-3">
            <div>
              <div className="font-bold text-base">EasyDrive Canada</div>
              <div className="text-xs text-muted-foreground">Toronto, Ontario · info@easydrivecanada.com</div>
            </div>
            <div className="text-right text-xs">
              <div className="font-semibold">DRAFT</div>
              <div className="text-muted-foreground">Date: {today}</div>
            </div>
          </div>
          <section>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vehicle</div>
            <div className="mt-1">{vehicle.year} {vehicle.make} {vehicle.model} — {vehicle.trim}</div>
            <div className="text-xs text-muted-foreground">VIN {vehicle.vin} · Stock #{vehicle.stockNumber}</div>
          </section>
          <section>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pricing</div>
            <table className="mt-1 w-full">
              <tbody className="divide-y divide-border">
                <PRow k="Sale price" v={salePrice} />
                {tradeIn > 0 && <PRow k="Trade-in" v={-tradeIn} />}
                {extras.map((e) => (
                  <PRow key={e.id} k={e.label} v={e.retail} />
                ))}
                <PRow k="Doc fee" v={docFee} />
                <PRow k="Licensing" v={licensing} />
                <PRow k="HST (13%)" v={taxes} />
                <tr className="border-t-2 border-foreground/40">
                  <td className="py-2 font-bold">Total</td>
                  <td className="py-2 text-right font-bold tabular-nums">${total.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </section>
          <section>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Signatures</div>
            <div className="mt-3 grid grid-cols-2 gap-6">
              <div>
                <div className="h-12 border-b border-foreground/40" />
                <div className="mt-1 text-xs text-muted-foreground">Buyer signature</div>
              </div>
              <div>
                <div className="h-12 border-b border-foreground/40" />
                <div className="mt-1 text-xs text-muted-foreground">Dealer signature</div>
              </div>
            </div>
          </section>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PRow({ k, v }: { k: string; v: number }) {
  return (
    <tr>
      <td className="py-1.5 text-muted-foreground">{k}</td>
      <td className="py-1.5 text-right tabular-nums">${v.toLocaleString()}</td>
    </tr>
  );
}
