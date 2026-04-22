import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dealer/PageHeader";
import { sales, type SaleStatus } from "@/data/sales";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/dealer/sales/")({
  head: () => ({ meta: [{ title: "Sales — Dealer Portal" }] }),
  component: SalesPage,
});

const statusBadge: Record<SaleStatus, string> = {
  Draft: "bg-muted text-muted-foreground hover:bg-muted",
  "Pending Signature": "bg-warning/25 text-foreground hover:bg-warning/25",
  Funded: "bg-brand/15 text-brand hover:bg-brand/15",
  Delivered: "bg-success/15 text-success hover:bg-success/15",
};

function SalesPage() {
  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  return (
    <div>
      <PageHeader
        title="Sales"
        subtitle={`${sales.length} bills of sale · $${totalRevenue.toLocaleString()} total`}
        actions={
          <Button asChild className="rounded-full">
            <Link to="/dealer/sales/new">
              <Plus className="mr-1 h-4 w-4" /> New bill of sale
            </Link>
          </Button>
        }
      />
      <div className="p-6">
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Bill of Sale</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Vehicle</th>
                <th className="px-4 py-3 text-right">Sale Price</th>
                <th className="px-4 py-3 text-right">Taxes</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Salesperson</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sales.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{s.billOfSale}</td>
                  <td className="px-4 py-3">{s.customer}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.vehicle}</td>
                  <td className="px-4 py-3 text-right tabular-nums">${s.salePrice.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums">${s.taxes.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">${s.total.toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge className={statusBadge[s.status]}>{s.status}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{s.salesperson}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
