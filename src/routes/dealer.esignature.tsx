import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dealer/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSignature, Download } from "lucide-react";

export const Route = createFileRoute("/dealer/esignature")({
  head: () => ({ meta: [{ title: "E-Signature — Dealer Portal" }] }),
  component: ESignaturePage,
});

const docs = [
  { id: "D-001", title: "Bill of Sale — BOS-20260418-001", recipient: "Noah Kim", status: "Signed", date: "2026-04-18" },
  { id: "D-002", title: "Financing Agreement", recipient: "James Anderson", status: "Awaiting", date: "2026-04-17" },
  { id: "D-003", title: "Trade-in Authorization", recipient: "Priya Sharma", status: "Awaiting", date: "2026-04-16" },
  { id: "D-004", title: "Bill of Sale — BOS-20260415-004", recipient: "Marcus Johnson", status: "Signed", date: "2026-04-15" },
  { id: "D-005", title: "Privacy Consent", recipient: "Hannah Müller", status: "Signed", date: "2026-04-14" },
  { id: "D-006", title: "Insurance Disclosure", recipient: "Ryan O'Connor", status: "Expired", date: "2026-04-09" },
];

function ESignaturePage() {
  return (
    <div>
      <PageHeader
        title="E-Signature"
        subtitle={`${docs.length} documents`}
        actions={<Button className="rounded-full"><FileSignature className="mr-1 h-4 w-4" /> New document</Button>}
      />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Document</th>
                <th className="px-4 py-3 text-left">Recipient</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {docs.map((d) => (
                <tr key={d.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{d.title}</td>
                  <td className="px-4 py-3">{d.recipient}</td>
                  <td className="px-4 py-3">
                    <Badge className={
                      d.status === "Signed" ? "bg-success/15 text-success hover:bg-success/15" :
                      d.status === "Awaiting" ? "bg-warning/25 text-foreground hover:bg-warning/25" :
                      "bg-muted text-muted-foreground hover:bg-muted"
                    }>{d.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.date}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
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
