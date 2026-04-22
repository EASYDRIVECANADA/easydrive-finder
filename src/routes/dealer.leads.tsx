import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/dealer/PageHeader";
import { leads, type Lead, type LeadStatus } from "@/data/leads";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Search, Plus } from "lucide-react";

export const Route = createFileRoute("/dealer/leads")({
  head: () => ({ meta: [{ title: "Leads — Dealer Portal" }] }),
  component: LeadsPage,
});

const statusVariant: Record<LeadStatus, string> = {
  New: "bg-brand/15 text-brand",
  Contacted: "bg-warning/20 text-warning-foreground",
  Qualified: "bg-primary/10 text-primary",
  "Test Drive": "bg-chart-4/20 text-foreground",
  Won: "bg-success/15 text-success",
  Lost: "bg-muted text-muted-foreground",
};

function LeadsPage() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Lead | null>(null);
  const filtered = leads.filter((l) => `${l.name} ${l.vehicleInterest} ${l.email}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={`${leads.length} total leads · ${leads.filter((l) => l.status === "New").length} new`}
        actions={
          <Button className="rounded-full">
            <Plus className="mr-1 h-4 w-4" /> Add lead
          </Button>
        }
      />
      <div className="p-6">
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search leads..." className="pl-9" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Vehicle interest</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{l.name}</div>
                      <div className="text-xs text-muted-foreground">{l.email}</div>
                    </td>
                    <td className="px-4 py-3">{l.vehicleInterest}</td>
                    <td className="px-4 py-3">
                      <Badge className={`${statusVariant[l.status]} hover:${statusVariant[l.status]}`}>{l.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{l.source}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.date}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setActive(l)}>View</Button>
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
                <SheetDescription>{active.vehicleInterest}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                <Row k="Email" v={active.email} />
                <Row k="Phone" v={active.phone} />
                <Row k="Status" v={active.status} />
                <Row k="Source" v={active.source} />
                <Row k="Date" v={active.date} />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Notes</div>
                  <p className="mt-1">{active.notes || <span className="text-muted-foreground">No notes.</span>}</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-border pb-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
