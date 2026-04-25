import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useSyncExternalStore } from "react";
import { PageHeader } from "@/components/dealer/PageHeader";
import { sales, type SaleStatus } from "@/data/sales";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { listOrders, updateOrder, addEvent, type Order, type OrderStatus } from "@/lib/orders";
import { markSalesSeen } from "@/lib/dealer-notifications";
import { CheckCircle2, FileSignature, Plus, Truck, X } from "lucide-react";
import { toast } from "sonner";

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

function useOrders(): Order[] {
  return useSyncExternalStore(
    (cb) => {
      const h = () => cb();
      window.addEventListener("edc.orders.updated", h);
      window.addEventListener("storage", h);
      return () => {
        window.removeEventListener("edc.orders.updated", h);
        window.removeEventListener("storage", h);
      };
    },
    () => listOrders(),
    () => [] as Order[],
  );
}

function SalesPage() {
  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const orders = useOrders();
  const requestCount = orders.filter((o) => o.status !== "picked_up" && o.status !== "cancelled").length;

  return (
    <div>
      <PageHeader
        title="Sales"
        subtitle={`${sales.length} bills of sale · $${totalRevenue.toLocaleString()} total · ${requestCount} active sale requests`}
        actions={
          <Button asChild className="rounded-full">
            <Link to="/dealer/sales/new">
              <Plus className="mr-1 h-4 w-4" /> New bill of sale
            </Link>
          </Button>
        }
      />
      <div className="p-6">
        <Tabs defaultValue="requests">
          <TabsList>
            <TabsTrigger value="requests">
              Sale requests
              {requestCount > 0 && (
                <Badge className="ml-2 h-5 bg-brand text-brand-foreground hover:bg-brand">
                  {requestCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bos">Bills of sale</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-4">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
                No online sale requests yet. When a customer completes the public checkout flow,
                their order appears here.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <SaleRequestCard key={o.id} order={o} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bos" className="mt-4">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

const statusLabel: Record<OrderStatus, string> = {
  deposit_pending: "Deposit pending",
  deposit_confirmed: "Deposit confirmed",
  awaiting_full_payment: "Awaiting full payment",
  ready_for_delivery: "Ready for delivery",
  picked_up: "Picked up",
  cancelled: "Cancelled",
};
const statusCls: Record<OrderStatus, string> = {
  deposit_pending: "bg-warning/20 text-foreground",
  deposit_confirmed: "bg-brand/15 text-brand",
  awaiting_full_payment: "bg-warning/20 text-foreground",
  ready_for_delivery: "bg-success/15 text-success",
  picked_up: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};

function SaleRequestCard({ order }: { order: Order }) {
  const v = order.vehicleSnapshot;

  const confirmDeposit = () => {
    updateOrder(order.id, (o) => ({
      ...o,
      status: "deposit_confirmed",
      depositConfirmedAt: new Date().toISOString(),
    }));
    addEvent(order.id, "deposit_confirmed", "dealer");
    toast.success("Deposit confirmed");
  };
  const counterSign = () => {
    const now = new Date().toISOString();
    updateOrder(order.id, (o) => ({
      ...o,
      status: "awaiting_full_payment",
      dealerCounterSignedAt: now,
      signatures: {
        ...o.signatures,
        billOfSaleDealer: {
          typedName: "EasyDrive Canada",
          drawnDataUrl: o.signatures.billOfSaleCustomer?.drawnDataUrl ?? "",
          signedAt: now,
        },
      },
    }));
    addEvent(order.id, "dealer_counter_signed", "dealer");
    toast.success("Bill of Sale counter-signed — customer notified");
  };
  const markReady = () => {
    updateOrder(order.id, (o) => ({
      ...o,
      status: "ready_for_delivery",
      readyForDeliveryAt: new Date().toISOString(),
    }));
    addEvent(order.id, "ready_for_delivery", "dealer");
    toast.success("Marked ready — 72-hour window started");
  };
  const markPickedUp = () => {
    updateOrder(order.id, (o) => ({
      ...o,
      status: "picked_up",
      pickedUpAt: new Date().toISOString(),
    }));
    addEvent(order.id, "picked_up", "dealer");
    toast.success("Picked up");
  };
  const cancel = () => {
    updateOrder(order.id, (o) => ({
      ...o,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancelReason: "Cancelled by dealer. Deposit forfeited.",
    }));
    addEvent(order.id, "cancelled_by_dealer", "dealer");
    toast.success("Order cancelled");
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid gap-4 p-5 sm:grid-cols-[120px_1fr_auto]">
        <img src={v.image} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold">{order.id}</span>
            <Badge className="bg-brand/15 text-brand hover:bg-brand/15">Online</Badge>
            <Badge className={`${statusCls[order.status]} hover:${statusCls[order.status]}`}>
              {statusLabel[order.status]}
            </Badge>
          </div>
          <div className="mt-1 font-semibold">
            {v.year} {v.make} {v.model} <span className="text-muted-foreground">· {v.trim}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Stock #{v.stockNumber} · VIN {v.vin}
          </div>
          <div className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Buyer:</span>{" "}
              <span className="font-medium">{[order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ")}</span>
            </div>
            <div className="text-muted-foreground">{order.customer.email}</div>
            <div>
              Total:{" "}
              <span className="font-semibold tabular-nums">
                ${order.pricing.total.toLocaleString()}
              </span>
            </div>
            <div>
              Balance:{" "}
              <span className="font-semibold tabular-nums">
                ${order.pricing.balanceDue.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
            <Pill ok={!!order.documents.licenceFront && !!order.documents.licenceBack}>
              Licence
            </Pill>
            <Pill ok={!!order.signatures.billOfSaleCustomer}>BoS signed</Pill>
            <Pill ok={!!order.signatures.dealerGuaranteeCustomer}>Guarantee signed</Pill>
            <Pill ok={!!order.documents.insurance}>Insurance</Pill>
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-2">
          {order.status === "deposit_pending" && (
            <Button size="sm" onClick={confirmDeposit} className="rounded-full">
              <CheckCircle2 className="mr-1 h-4 w-4" /> Confirm deposit
            </Button>
          )}
          {order.status === "deposit_confirmed" && (
            <Button size="sm" onClick={counterSign} className="rounded-full">
              <FileSignature className="mr-1 h-4 w-4" /> Counter-sign BoS
            </Button>
          )}
          {order.status === "awaiting_full_payment" && (
            <Button size="sm" onClick={markReady} className="rounded-full">
              <Truck className="mr-1 h-4 w-4" /> Mark ready (start 72h)
            </Button>
          )}
          {order.status === "ready_for_delivery" && (
            <Button size="sm" onClick={markPickedUp} className="rounded-full">
              <CheckCircle2 className="mr-1 h-4 w-4" /> Mark picked up
            </Button>
          )}
          {order.status !== "cancelled" && order.status !== "picked_up" && (
            <Button size="sm" variant="ghost" onClick={cancel} className="rounded-full text-destructive">
              <X className="mr-1 h-4 w-4" /> Cancel & forfeit
            </Button>
          )}
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link to="/orders/$orderId" params={{ orderId: order.id }}>
              View as customer
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Pill({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 ${
        ok ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
      }`}
    >
      {ok ? "✓ " : ""}
      {children}
    </span>
  );
}
