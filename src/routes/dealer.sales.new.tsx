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
import { vehicles } from "@/data/vehicles";
import { customers } from "@/data/customers";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dealer/sales/new")({
  head: () => ({ meta: [{ title: "New Bill of Sale — Dealer Portal" }] }),
  component: NewSale,
});

function NewSale() {
  const navigate = useNavigate();
  const [vehicleId, setVehicleId] = useState(vehicles[0].id);
  const [salePrice, setSalePrice] = useState(vehicles[0].salePrice);
  const [tradeIn, setTradeIn] = useState(0);
  const [docFee, setDocFee] = useState(599);
  const [licensing, setLicensing] = useState(120);

  const vehicle = vehicles.find((v) => v.id === vehicleId)!;
  const taxableBase = Math.max(salePrice - tradeIn, 0);
  const taxes = useMemo(() => Math.round(taxableBase * 0.13), [taxableBase]);
  const total = taxableBase + taxes + docFee + licensing;

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
