import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/dealer/PageHeader";
import { customers, type Customer } from "@/data/customers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Plus, Search } from "lucide-react";

export const Route = createFileRoute("/dealer/customers")({
  head: () => ({ meta: [{ title: "Customers — Dealer Portal" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Customer | null>(null);
  const filtered = customers.filter((c) => `${c.name} ${c.email} ${c.city}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} total customers`}
        actions={<Button className="rounded-full"><Plus className="mr-1 h-4 w-4" /> Add customer</Button>}
      />
      <div className="p-6">
        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers..." className="pl-9" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">City</th>
                  <th className="px-4 py-3 text-left">Vehicles</th>
                  <th className="px-4 py-3 text-left">Lifetime value</th>
                  <th className="px-4 py-3 text-left">Last purchase</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.email}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.city}</td>
                    <td className="px-4 py-3">{c.vehiclesPurchased}</td>
                    <td className="px-4 py-3 font-semibold">${c.lifetimeValue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.lastPurchase}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setActive(c)}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent>
          {active && (
            <>
              <SheetHeader>
                <SheetTitle>{active.name}</SheetTitle>
                <SheetDescription>{active.city}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-3 text-sm">
                <div className="rounded-2xl bg-brand/10 p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Lifetime value</div>
                  <div className="mt-1 text-2xl font-bold text-brand">${active.lifetimeValue.toLocaleString()}</div>
                </div>
                <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Email</span><span>{active.email}</span></div>
                <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Phone</span><span>{active.phone}</span></div>
                <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Vehicles purchased</span><span>{active.vehiclesPurchased}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Last purchase</span><span>{active.lastPurchase}</span></div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
