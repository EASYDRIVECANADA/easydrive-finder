import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dealer/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download } from "lucide-react";

export const Route = createFileRoute("/dealer/billing")({
  head: () => ({ meta: [{ title: "Billing — Dealer Portal" }] }),
  component: BillingPage,
});

const invoices = [
  { id: "INV-2026-04", date: "2026-04-01", amount: 499, status: "Paid" },
  { id: "INV-2026-03", date: "2026-03-01", amount: 499, status: "Paid" },
  { id: "INV-2026-02", date: "2026-02-01", amount: 499, status: "Paid" },
  { id: "INV-2026-01", date: "2026-01-01", amount: 499, status: "Paid" },
];

function BillingPage() {
  return (
    <div>
      <PageHeader title="Billing" subtitle="Manage your subscription and invoices" />
      <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-brand">Current plan</div>
                <h2 className="mt-2 text-3xl font-bold">Premier</h2>
                <p className="mt-1 text-sm text-muted-foreground">$499 / month · billed monthly</p>
              </div>
              <Badge className="bg-success/15 text-success hover:bg-success/15">Active</Badge>
            </div>
            <ul className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
              {[
                "Unlimited inventory",
                "Marketplace sync (AutoTrader, Kijiji, FB)",
                "E-signature (unlimited docs)",
                "Multi-user (up to 10 employees)",
                "Advanced reports",
                "Priority support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand" /> {f}</li>
              ))}
            </ul>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" className="rounded-full">Change plan</Button>
              <Button variant="ghost" className="rounded-full text-destructive hover:text-destructive">Cancel subscription</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold">Payment method</h3>
            <div className="mt-4 rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Visa •••• 4242</div>
                  <div className="text-xs text-muted-foreground">Expires 12/27</div>
                </div>
                <Button variant="ghost" size="sm">Update</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="border-b border-border p-5">
              <h3 className="font-semibold">Invoices</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left">Invoice</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((i) => (
                  <tr key={i.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium">{i.id}</td>
                    <td className="px-5 py-3 text-muted-foreground">{i.date}</td>
                    <td className="px-5 py-3 text-right tabular-nums">${i.amount}</td>
                    <td className="px-5 py-3"><Badge className="bg-success/15 text-success hover:bg-success/15">{i.status}</Badge></td>
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
