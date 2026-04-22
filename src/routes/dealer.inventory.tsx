import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/dealer/PageHeader";
import { vehicles, type VehicleStatus } from "@/data/vehicles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Search } from "lucide-react";

export const Route = createFileRoute("/dealer/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Dealer Portal" }] }),
  component: InventoryPage,
});

const tabs = ["All", "Premier", "Fleet"] as const;
const statuses: ("All" | VehicleStatus)[] = ["All", "In Stock", "Deal Pending", "Sold"];

const statusBadge: Record<VehicleStatus, string> = {
  "In Stock": "bg-success/15 text-success hover:bg-success/15",
  "Deal Pending": "bg-warning/25 text-foreground hover:bg-warning/25",
  Sold: "bg-muted text-muted-foreground hover:bg-muted",
};

function InventoryPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (status !== "All" && v.status !== status) return false;
      if (q && !`${v.year} ${v.make} ${v.model} ${v.trim} ${v.stockNumber}`.toLowerCase().includes(q.toLowerCase())) return false;
      // tabs are visual only in this mock
      if (tab === "Premier" && v.salePrice < 35000) return false;
      if (tab === "Fleet" && v.salePrice >= 35000) return false;
      return true;
    });
  }, [tab, status, q]);

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle={`${filtered.length} of ${vehicles.length} vehicles`}
        actions={
          <>
            <Button variant="outline" className="rounded-full">
              <Upload className="mr-1 h-4 w-4" /> Import file
            </Button>
            <Button className="rounded-full">
              <Plus className="mr-1 h-4 w-4" /> Add vehicle
            </Button>
          </>
        }
      />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search inventory..." className="w-64 pl-9" />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as (typeof statuses)[number])}
              className="h-9 rounded-md border border-border bg-card px-3 text-sm"
            >
              {statuses.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-3 text-left">Description</th>
                <th className="px-3 py-3 text-left">Trim</th>
                <th className="px-3 py-3 text-left">Type</th>
                <th className="px-3 py-3 text-left">Drive</th>
                <th className="px-3 py-3 text-left">Trans</th>
                <th className="px-3 py-3 text-left">Cyl</th>
                <th className="px-3 py-3 text-left">Colour</th>
                <th className="px-3 py-3 text-right">Odometer</th>
                <th className="px-3 py-3 text-right">Cash Value</th>
                <th className="px-3 py-3 text-right">List Price</th>
                <th className="px-3 py-3 text-right">Sale Price</th>
                <th className="px-3 py-3 text-right">DII</th>
                <th className="px-3 py-3 text-left">Stock #</th>
                <th className="px-3 py-3 text-left">Key #</th>
                <th className="px-3 py-3 text-left">Cert</th>
                <th className="px-3 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-muted/30">
                  <td className="px-3 py-3 font-medium whitespace-nowrap">{v.year} {v.make} {v.model}</td>
                  <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{v.trim}</td>
                  <td className="px-3 py-3">{v.vehicleType}</td>
                  <td className="px-3 py-3">{v.drive}</td>
                  <td className="px-3 py-3">{v.transmission}</td>
                  <td className="px-3 py-3">{v.cylinders || "—"}</td>
                  <td className="px-3 py-3">{v.colour}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{v.odometer.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right tabular-nums">${v.cashValue.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted-foreground line-through">${v.listPrice.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right tabular-nums font-semibold">${v.salePrice.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right tabular-nums">${v.dii.toLocaleString()}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{v.stockNumber}</td>
                  <td className="px-3 py-3">{v.keyNumber}</td>
                  <td className="px-3 py-3">
                    <Badge variant="outline">{v.certification}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <Badge className={statusBadge[v.status]}>{v.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
