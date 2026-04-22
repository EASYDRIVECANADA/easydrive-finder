import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dealer/PageHeader";
import { vendors } from "@/data/vendors";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/dealer/vendors")({
  head: () => ({ meta: [{ title: "Vendors — Dealer Portal" }] }),
  component: VendorsPage,
});

function VendorsPage() {
  return (
    <div>
      <PageHeader
        title="Vendors"
        subtitle={`${vendors.length} active vendors`}
        actions={<Button className="rounded-full"><Plus className="mr-1 h-4 w-4" /> Add vendor</Button>}
      />
      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
        {vendors.map((v) => (
          <div key={v.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{v.name}</div>
                <div className="text-xs text-muted-foreground">{v.category}</div>
              </div>
              {v.outstanding > 0 && (
                <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs font-medium text-foreground">
                  ${v.outstanding.toLocaleString()} due
                </span>
              )}
            </div>
            <div className="mt-4 space-y-1 text-sm">
              <div className="text-muted-foreground">{v.contact}</div>
              <div>{v.phone}</div>
              <div className="text-brand">{v.email}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
