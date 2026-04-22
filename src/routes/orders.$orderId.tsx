import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState, useSyncExternalStore } from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/checkout/FileUpload";
import { BillOfSaleContent } from "@/lib/bill-of-sale";
import { DealerGuaranteeContent } from "@/lib/dealer-guarantee";
import {
  getOrder,
  updateOrder,
  addEvent,
  deliveryDeadline,
  maybeAutoCancel,
  type Order,
  type OrderStatus,
  type FileRef,
} from "@/lib/orders";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/orders/$orderId")({
  loader: ({ params }) => {
    if (typeof window === "undefined") return null;
    maybeAutoCancel(params.orderId);
    const o = getOrder(params.orderId);
    if (!o) throw notFound();
    return o;
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="mx-auto max-w-md flex-1 px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <p className="mt-2 text-muted-foreground">
          This order doesn&apos;t exist on this device. Orders are saved per browser.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/inventory">Browse inventory</Link>
        </Button>
      </main>
      <MarketingFooter />
    </div>
  ),
  errorComponent: ({ error }) => <div className="p-12 text-center">{error.message}</div>,
  head: ({ params }) => ({
    meta: [{ title: `Order ${params.orderId} — EasyDrive Canada` }],
  }),
  component: OrderPage,
});

function useLiveOrder(orderId: string): Order | undefined {
  return useSyncExternalStore(
    (cb) => {
      const handler = () => cb();
      window.addEventListener("edc.orders.updated", handler);
      window.addEventListener("storage", handler);
      const t = window.setInterval(handler, 1000);
      return () => {
        window.removeEventListener("edc.orders.updated", handler);
        window.removeEventListener("storage", handler);
        window.clearInterval(t);
      };
    },
    () => getOrder(orderId),
    () => undefined,
  );
}

function OrderPage() {
  const initial = Route.useLoaderData();
  const order = useLiveOrder(initial!.id) ?? initial!;
  useEffect(() => {
    maybeAutoCancel(order.id);
  }, [order.id, order.status]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge className="bg-brand/15 text-brand hover:bg-brand/15">{order.id}</Badge>
              <h1 className="mt-2 text-3xl font-bold">
                {order.vehicleSnapshot.year} {order.vehicleSnapshot.make}{" "}
                {order.vehicleSnapshot.model}
              </h1>
              <p className="text-muted-foreground">
                Stock #{order.vehicleSnapshot.stockNumber} · {order.customer.fullName}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              {order.status === "ready_for_delivery" && (
                <DeliveryCountdown order={order} />
              )}

              {order.status === "cancelled" && (
                <Card variant="danger">
                  <h3 className="text-lg font-bold">This order was cancelled</h3>
                  <p className="mt-1 text-sm">{order.cancelReason}</p>
                  <p className="mt-3 text-xs">
                    Cancelled at{" "}
                    {order.cancelledAt && new Date(order.cancelledAt).toLocaleString()}
                  </p>
                </Card>
              )}

              <Timeline order={order} />

              {(order.status === "awaiting_full_payment" ||
                order.status === "ready_for_delivery") && (
                <DirectDepositCard />
              )}

              {(order.status === "awaiting_full_payment" ||
                order.status === "ready_for_delivery") && (
                <InsuranceUpload order={order} />
              )}

              <SignedDocs order={order} />
            </div>

            <aside className="lg:sticky lg:top-20 lg:self-start">
              <Card>
                <img
                  src={order.vehicleSnapshot.image}
                  alt=""
                  className="aspect-[16/10] w-full rounded-xl object-cover"
                />
                <div className="mt-4 space-y-1.5 text-sm">
                  <Row k="Sale price" v={order.pricing.salePrice} />
                  <Row k="HST" v={order.pricing.hst} />
                  <Row k="Doc fee" v={order.pricing.docFee} />
                  <Row k="Licensing" v={order.pricing.licensing} />
                  <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                    <span>Total</span>
                    <span className="tabular-nums">${order.pricing.total.toLocaleString()}</span>
                  </div>
                  <Row k="Deposit paid" v={order.pricing.deposit} />
                  <div className="flex justify-between font-semibold">
                    <span>Balance due</span>
                    <span className="tabular-nums">${order.pricing.balanceDue.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

function Card({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant?: "danger" | "warning";
}) {
  const v =
    variant === "danger"
      ? "border-destructive/30 bg-destructive/5 text-destructive-foreground"
      : variant === "warning"
        ? "border-warning/30 bg-warning/5"
        : "border-border bg-card";
  return <section className={`rounded-2xl border p-6 ${v}`}>{children}</section>;
}

function Row({ k, v }: { k: string; v: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="tabular-nums">${v.toLocaleString()}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; cls: string }> = {
    deposit_pending: { label: "Deposit pending", cls: "bg-warning/20 text-foreground" },
    deposit_confirmed: { label: "Deposit confirmed", cls: "bg-brand/15 text-brand" },
    awaiting_full_payment: { label: "Awaiting full payment", cls: "bg-warning/20 text-foreground" },
    ready_for_delivery: { label: "Ready for delivery", cls: "bg-success/15 text-success" },
    picked_up: { label: "Picked up", cls: "bg-success/15 text-success" },
    cancelled: { label: "Cancelled", cls: "bg-destructive/15 text-destructive" },
  };
  const m = map[status];
  return <Badge className={`${m.cls} hover:${m.cls}`}>{m.label}</Badge>;
}

function Timeline({ order }: { order: Order }) {
  const steps: Array<{ key: OrderStatus; label: string; sub?: string }> = [
    { key: "deposit_pending", label: "Deposit sent (e-transfer)" },
    { key: "deposit_confirmed", label: "Deposit confirmed" },
    { key: "awaiting_full_payment", label: "Bill of Sale counter-signed · pay balance" },
    { key: "ready_for_delivery", label: "Vehicle ready for pickup", sub: "72-hour window starts" },
    { key: "picked_up", label: "Vehicle picked up" },
  ];
  const order_idx = steps.findIndex((s) => s.key === order.status);
  return (
    <Card>
      <h3 className="text-lg font-semibold">Order status</h3>
      <ol className="mt-4 space-y-4">
        {steps.map((s, i) => {
          const done = order.status !== "cancelled" && i <= order_idx;
          const active = order.status !== "cancelled" && i === order_idx;
          return (
            <li key={s.key} className="flex gap-3">
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? "bg-success/20 text-success"
                    : active
                      ? "bg-brand/15 text-brand"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <div>
                <div className={`text-sm font-medium ${!done && !active && "text-muted-foreground"}`}>
                  {s.label}
                </div>
                {s.sub && <div className="text-xs text-muted-foreground">{s.sub}</div>}
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function DeliveryCountdown({ order }: { order: Order }) {
  const dl = deliveryDeadline(order)!;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const ms = dl.getTime() - now.getTime();
  const expired = ms <= 0;
  const hours = Math.max(0, Math.floor(ms / 3_600_000));
  const minutes = Math.max(0, Math.floor((ms % 3_600_000) / 60_000));
  const seconds = Math.max(0, Math.floor((ms % 60_000) / 1000));
  const danger = ms < 24 * 3_600_000;

  return (
    <Card variant={danger ? "danger" : "warning"}>
      <div className="flex items-start gap-3">
        <Clock className={`h-6 w-6 ${danger ? "text-destructive" : "text-warning"}`} />
        <div className="flex-1">
          <h3 className="text-lg font-bold">
            {expired ? "Time expired" : "Time remaining to complete pickup"}
          </h3>
          <p className="mt-1 text-sm">
            Pay the remaining balance and upload proof of insurance before this counter hits zero,
            or your sale will be cancelled and your deposit forfeited.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center font-mono">
            <Stat n={hours} l="hours" />
            <Stat n={minutes} l="minutes" />
            <Stat n={seconds} l="seconds" />
          </div>
          <p className="mt-3 text-xs">Deadline: {dl.toLocaleString()}</p>
        </div>
      </div>
    </Card>
  );
}
function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div className="rounded-xl bg-background/60 p-3">
      <div className="text-3xl font-bold tabular-nums">{String(n).padStart(2, "0")}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</div>
    </div>
  );
}

function DirectDepositCard() {
  const copy = (v: string, l: string) => {
    void navigator.clipboard.writeText(v);
    toast.success(`${l} copied`);
  };
  const fields: Array<[string, string]> = [
    ["Bank", "Royal Bank of Canada (RBC)"],
    ["Account name", "EasyDrive Canada Inc."],
    ["Transit number", "00012"],
    ["Institution number", "003"],
    ["Account number", "1234567"],
    ["SWIFT (international)", "ROYCCAT2"],
  ];
  return (
    <Card variant="warning">
      <div className="flex items-start gap-3">
        <ShieldCheck className="h-6 w-6 text-brand" />
        <div className="flex-1">
          <h3 className="text-lg font-bold">Pay your remaining balance</h3>
          <p className="mt-1 text-sm">
            Send a direct deposit / wire to the account below. Your vehicle will be released only
            after funds clear.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {fields.map(([l, v]) => (
              <button
                key={l}
                type="button"
                onClick={() => copy(v, l)}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background p-3 text-left hover:bg-muted/40"
              >
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
                  <div className="font-mono text-sm font-semibold">{v}</div>
                </div>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function InsuranceUpload({ order }: { order: Order }) {
  const onChange = (f: FileRef | null) => {
    updateOrder(order.id, (o) => ({ ...o, documents: { ...o.documents, insurance: f } }));
    addEvent(order.id, f ? "insurance_uploaded" : "insurance_removed", "customer");
    toast.success(f ? "Insurance uploaded — pending dealer approval" : "Insurance removed");
  };
  return (
    <Card>
      <h3 className="text-lg font-semibold">Proof of insurance</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Required before we can release the vehicle. Upload your insurance pink slip or policy
        confirmation.
      </p>
      <div className="mt-4">
        <FileUpload
          label="Proof of insurance"
          value={order.documents.insurance}
          onChange={onChange}
          required
        />
      </div>
    </Card>
  );
}

function SignedDocs({ order }: { order: Order }) {
  const [show, setShow] = useState<"bos" | "guarantee" | null>(null);
  return (
    <Card>
      <h3 className="text-lg font-semibold">Signed documents</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <DocButton
          icon={FileText}
          label="Bill of Sale"
          status={
            order.signatures.billOfSaleDealer
              ? "Counter-signed"
              : order.signatures.billOfSaleCustomer
                ? "Pending dealer signature"
                : "Unsigned"
          }
          onClick={() => setShow("bos")}
        />
        <DocButton
          icon={ShieldCheck}
          label="30-Day Dealer Guarantee"
          status={order.signatures.dealerGuaranteeCustomer ? "Signed" : "Unsigned"}
          onClick={() => setShow("guarantee")}
        />
      </div>

      {show && (
        <div className="mt-4 max-h-[460px] overflow-y-auto rounded-xl border border-border bg-background p-5">
          {show === "bos" ? (
            <>
              <BillOfSaleContent order={order} />
              <SignatureBlock
                label="Buyer signature"
                sig={order.signatures.billOfSaleCustomer}
              />
              <SignatureBlock
                label="Seller signature (EasyDrive Canada)"
                sig={order.signatures.billOfSaleDealer}
              />
            </>
          ) : (
            <>
              <DealerGuaranteeContent />
              <SignatureBlock
                label="Buyer signature"
                sig={order.signatures.dealerGuaranteeCustomer}
              />
            </>
          )}
        </div>
      )}
    </Card>
  );
}

function DocButton({
  icon: Icon,
  label,
  status,
  onClick,
}: {
  icon: typeof FileText;
  label: string;
  status: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 text-left hover:bg-muted/40"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{status}</div>
      </div>
      <Download className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function SignatureBlock({
  label,
  sig,
}: {
  label: string;
  sig: { typedName: string; drawnDataUrl: string; signedAt: string } | null;
}) {
  return (
    <div className="not-prose mt-6 rounded-lg border border-border bg-muted/20 p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      {sig ? (
        <div className="mt-2 flex items-center gap-4">
          <img src={sig.drawnDataUrl} alt="signature" className="h-14 rounded bg-white p-1" />
          <div className="text-xs">
            <div className="font-semibold text-foreground">{sig.typedName}</div>
            <div className="text-muted-foreground">{new Date(sig.signedAt).toLocaleString()}</div>
          </div>
          <CheckCircle2 className="ml-auto h-5 w-5 text-success" />
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="h-4 w-4 text-warning" /> Awaiting signature
        </div>
      )}
    </div>
  );
}
