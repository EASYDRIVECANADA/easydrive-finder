import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/checkout/FileUpload";
import { SignaturePad } from "@/components/checkout/SignaturePad";
import { BillOfSaleContent } from "@/lib/bill-of-sale";
import { DealerGuaranteeContent } from "@/lib/dealer-guarantee";
import { getVehicleById } from "@/data/vehicles";
import {
  computePricing,
  generateOrderId,
  saveOrder,
  activeOrderForVehicle,
  type CustomerInfo,
  type FileRef,
  type Order,
  type SignatureRecord,
  DEPOSIT,
} from "@/lib/orders";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  CreditCard,
  FileSignature,
  IdCard,
  Mail,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout/$vehicleId")({
  loader: ({ params }) => {
    const v = getVehicleById(params.vehicleId);
    if (!v) throw notFound();
    return v;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `Buy ${loaderData.year} ${loaderData.make} ${loaderData.model} — EasyDrive Canada`
          : "Checkout — EasyDrive Canada",
      },
      { name: "description", content: "Secure online checkout for your vehicle purchase." },
    ],
  }),
  component: CheckoutPage,
});

const STEPS = [
  { key: "customer", label: "Your details", icon: User },
  { key: "licence", label: "Driver's licence", icon: IdCard },
  { key: "deposit", label: "Deposit terms", icon: ShieldAlert },
  { key: "etransfer", label: "E-transfer", icon: Mail },
  { key: "bos", label: "Bill of Sale", icon: FileSignature },
  { key: "guarantee", label: "Dealer Guarantee", icon: ShieldCheck },
  { key: "confirm", label: "Confirmation", icon: CheckCircle2 },
] as const;

const customerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().min(10, "Phone required").max(20),
  addressLine1: z.string().trim().min(3, "Address required").max(200),
  city: z.string().trim().min(2, "City required").max(100),
  province: z.string().trim().min(2, "Province required").max(50),
  postalCode: z.string().trim().min(5, "Postal code required").max(10),
  dob: z.string().min(8, "Date of birth required"),
});

function CheckoutPage() {
  const vehicle = Route.useLoaderData();
  const navigate = useNavigate();
  const pricing = useMemo(() => computePricing(vehicle.salePrice), [vehicle.salePrice]);

  // Block if vehicle already has active order
  const existing = typeof window !== "undefined" ? activeOrderForVehicle(vehicle.id) : undefined;

  const [step, setStep] = useState(0);
  const [orderId] = useState(() => generateOrderId());

  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    city: "",
    province: "ON",
    postalCode: "",
    dob: "",
  });
  const [customerErrors, setCustomerErrors] = useState<Record<string, string>>({});

  const [licenceFront, setLicenceFront] = useState<FileRef | null>(null);
  const [licenceBack, setLicenceBack] = useState<FileRef | null>(null);

  const [agreeDeposit, setAgreeDeposit] = useState(false);
  const [agreeDiscretion, setAgreeDiscretion] = useState(false);

  const [etransferSent, setEtransferSent] = useState(false);

  const [bosTyped, setBosTyped] = useState("");
  const [bosDrawn, setBosDrawn] = useState<string | null>(null);
  const [bosAgree, setBosAgree] = useState(false);

  const [dgTyped, setDgTyped] = useState("");
  const [dgDrawn, setDgDrawn] = useState<string | null>(null);
  const [dgAgree, setDgAgree] = useState(false);

  // -- step gates --
  const canNext = (() => {
    switch (STEPS[step].key) {
      case "customer":
        return customerSchema.safeParse(customer).success;
      case "licence":
        return !!licenceFront && !!licenceBack;
      case "deposit":
        return agreeDeposit && agreeDiscretion;
      case "etransfer":
        return etransferSent;
      case "bos":
        return bosTyped.trim().length > 1 && !!bosDrawn && bosAgree;
      case "guarantee":
        return dgTyped.trim().length > 1 && !!dgDrawn && dgAgree;
      default:
        return true;
    }
  })();

  const goNext = () => {
    if (STEPS[step].key === "customer") {
      const r = customerSchema.safeParse(customer);
      if (!r.success) {
        const errs: Record<string, string> = {};
        for (const issue of r.error.issues) {
          errs[issue.path[0] as string] = issue.message;
        }
        setCustomerErrors(errs);
        return;
      }
      setCustomerErrors({});
    }
    if (STEPS[step].key === "guarantee") {
      finalize();
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const finalize = () => {
    const now = new Date().toISOString();
    const sigBoS: SignatureRecord = {
      typedName: bosTyped.trim(),
      drawnDataUrl: bosDrawn!,
      signedAt: now,
    };
    const sigDG: SignatureRecord = {
      typedName: dgTyped.trim(),
      drawnDataUrl: dgDrawn!,
      signedAt: now,
    };
    const order: Order = {
      id: orderId,
      vehicleId: vehicle.id,
      vehicleSnapshot: {
        id: vehicle.id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        trim: vehicle.trim,
        stockNumber: vehicle.stockNumber,
        vin: vehicle.vin,
        salePrice: vehicle.salePrice,
        image: vehicle.image,
      },
      customer,
      pricing,
      documents: { licenceFront, licenceBack, insurance: null },
      signatures: {
        billOfSaleCustomer: sigBoS,
        billOfSaleDealer: null,
        dealerGuaranteeCustomer: sigDG,
      },
      status: "deposit_pending",
      depositSentByCustomerAt: now,
      depositConfirmedAt: null,
      dealerCounterSignedAt: null,
      readyForDeliveryAt: null,
      pickedUpAt: null,
      cancelledAt: null,
      cancelReason: null,
      events: [
        { at: now, type: "order_created", actor: "customer" },
        { at: now, type: "licence_uploaded", actor: "customer" },
        { at: now, type: "deposit_marked_sent", actor: "customer" },
        { at: now, type: "bill_of_sale_signed_customer", actor: "customer" },
        { at: now, type: "dealer_guarantee_signed_customer", actor: "customer" },
      ],
      createdAt: now,
    };
    saveOrder(order);
    toast.success("Sale request submitted! Check your email for next steps.");
    setStep(STEPS.length - 1);
  };

  if (existing && step === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <MarketingHeader />
        <main className="mx-auto max-w-2xl flex-1 px-4 py-20 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-warning" />
          <h1 className="mt-4 text-2xl font-bold">This vehicle is already under contract</h1>
          <p className="mt-2 text-muted-foreground">
            Order {existing.id} is currently active. The vehicle is no longer available for
            checkout.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/inventory">Back to inventory</Link>
            </Button>
            <Button asChild className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
              <Link to="/orders/$orderId" params={{ orderId: existing.id }}>View my order</Link>
            </Button>
          </div>
        </main>
        <MarketingFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to="/inventory/$vehicleId" params={{ vehicleId: vehicle.id }}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to vehicle
            </Link>
          </Button>
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div>
            <Stepper current={step} onJump={(i) => i < step && setStep(i)} />

            <div className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
              {STEPS[step].key === "customer" && (
                <StepCustomer customer={customer} setCustomer={setCustomer} errors={customerErrors} />
              )}

              {STEPS[step].key === "licence" && (
                <StepLicence
                  front={licenceFront}
                  back={licenceBack}
                  onFront={setLicenceFront}
                  onBack={setLicenceBack}
                />
              )}

              {STEPS[step].key === "deposit" && (
                <StepDeposit
                  agreeDeposit={agreeDeposit}
                  setAgreeDeposit={setAgreeDeposit}
                  agreeDiscretion={agreeDiscretion}
                  setAgreeDiscretion={setAgreeDiscretion}
                />
              )}

              {STEPS[step].key === "etransfer" && (
                <StepEtransfer
                  orderId={orderId}
                  customerEmail={customer.email}
                  sent={etransferSent}
                  setSent={setEtransferSent}
                />
              )}

              {STEPS[step].key === "bos" && (
                <StepSign
                  title="Sign your Bill of Sale"
                  contentTitle="Bill of Sale preview"
                  content={
                    <BillOfSaleContent
                      order={{
                        id: orderId,
                        createdAt: new Date().toISOString(),
                        customer,
                        vehicleSnapshot: {
                          id: vehicle.id,
                          year: vehicle.year,
                          make: vehicle.make,
                          model: vehicle.model,
                          trim: vehicle.trim,
                          stockNumber: vehicle.stockNumber,
                          vin: vehicle.vin,
                          salePrice: vehicle.salePrice,
                          image: vehicle.image,
                        },
                        pricing,
                      } as Order}
                    />
                  }
                  agreeLabel="I have read the Bill of Sale and agree to the terms."
                  typed={bosTyped}
                  setTyped={setBosTyped}
                  drawn={bosDrawn}
                  setDrawn={setBosDrawn}
                  agree={bosAgree}
                  setAgree={setBosAgree}
                />
              )}

              {STEPS[step].key === "guarantee" && (
                <StepSign
                  title="Sign the 30-Day Dealer Guarantee"
                  contentTitle="Dealer Guarantee Policy"
                  content={<DealerGuaranteeContent />}
                  agreeLabel="I acknowledge and agree to the 30-Day Dealer Guarantee."
                  typed={dgTyped}
                  setTyped={setDgTyped}
                  drawn={dgDrawn}
                  setDrawn={setDgDrawn}
                  agree={dgAgree}
                  setAgree={setDgAgree}
                />
              )}

              {STEPS[step].key === "confirm" && (
                <StepConfirm orderId={orderId} customerEmail={customer.email} />
              )}

              {STEPS[step].key !== "confirm" && (
                <div className="mt-8 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={goNext}
                    disabled={!canNext}
                    className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
                  >
                    {STEPS[step].key === "guarantee" ? "Submit sale request" : "Continue"}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              )}

              {STEPS[step].key === "confirm" && (
                <div className="mt-8 flex flex-wrap justify-end gap-2">
                  <Button asChild variant="outline" className="rounded-full">
                    <Link to="/inventory">Browse more vehicles</Link>
                  </Button>
                  <Button
                    onClick={() => navigate({ to: "/orders/$orderId", params: { orderId } })}
                    className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
                  >
                    View my order
                  </Button>
                </div>
              )}
            </div>
          </div>

          <SummarySidebar vehicle={vehicle} pricing={pricing} orderId={orderId} step={step} />
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

function Stepper({ current, onJump }: { current: number; onJump: (i: number) => void }) {
  return (
    <ol className="flex items-center gap-1 overflow-x-auto rounded-full border border-border bg-card p-1.5">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.key} className="flex-1 min-w-[110px]">
            <button
              type="button"
              onClick={() => onJump(i)}
              disabled={i >= current}
              className={cn(
                "flex w-full items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition",
                active && "bg-primary text-primary-foreground",
                done && "text-foreground hover:bg-muted",
                !active && !done && "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                  active && "bg-brand text-brand-foreground",
                  done && "bg-success/20 text-success",
                  !active && !done && "bg-muted text-muted-foreground",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className="hidden whitespace-nowrap sm:inline">{s.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function StepCustomer({
  customer,
  setCustomer,
  errors,
}: {
  customer: CustomerInfo;
  setCustomer: (c: CustomerInfo) => void;
  errors: Record<string, string>;
}) {
  const set = (k: keyof CustomerInfo) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCustomer({ ...customer, [k]: e.target.value });
  return (
    <div>
      <h2 className="text-2xl font-bold">Tell us about you</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        We need accurate buyer details for the Bill of Sale.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Full legal name" error={errors.fullName}>
          <Input value={customer.fullName} onChange={set("fullName")} placeholder="Jane Doe" />
        </Field>
        <Field label="Date of birth" error={errors.dob}>
          <Input type="date" value={customer.dob} onChange={set("dob")} />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input type="email" value={customer.email} onChange={set("email")} placeholder="you@example.com" />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <Input type="tel" value={customer.phone} onChange={set("phone")} placeholder="(416) 555-0101" />
        </Field>
        <Field label="Address" error={errors.addressLine1} className="sm:col-span-2">
          <Input value={customer.addressLine1} onChange={set("addressLine1")} placeholder="123 Main St" />
        </Field>
        <Field label="City" error={errors.city}>
          <Input value={customer.city} onChange={set("city")} placeholder="Toronto" />
        </Field>
        <Field label="Province" error={errors.province}>
          <Input value={customer.province} onChange={set("province")} placeholder="ON" />
        </Field>
        <Field label="Postal code" error={errors.postalCode}>
          <Input value={customer.postalCode} onChange={set("postalCode")} placeholder="M5V 2T6" />
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="text-xs font-medium">{label}</Label>
      <div className="mt-1.5">{children}</div>
      {error && <div className="mt-1 text-xs text-destructive">{error}</div>}
    </div>
  );
}

function StepLicence({
  front,
  back,
  onFront,
  onBack,
}: {
  front: FileRef | null;
  back: FileRef | null;
  onFront: (f: FileRef | null) => void;
  onBack: (f: FileRef | null) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold">Upload your driver's licence</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Required for verification. We use these only for this purchase.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <FileUpload label="Licence — front" value={front} onChange={onFront} required />
        <FileUpload label="Licence — back" value={back} onChange={onBack} required />
      </div>
    </div>
  );
}

function StepDeposit({
  agreeDeposit,
  setAgreeDeposit,
  agreeDiscretion,
  setAgreeDiscretion,
}: {
  agreeDeposit: boolean;
  setAgreeDeposit: (b: boolean) => void;
  agreeDiscretion: boolean;
  setAgreeDiscretion: (b: boolean) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold">Deposit terms</h2>
      <p className="mt-1 text-sm text-muted-foreground">Please review and acknowledge before continuing.</p>

      <div className="mt-6 rounded-2xl border border-warning/30 bg-warning/5 p-5">
        <div className="text-3xl font-bold">${DEPOSIT.toLocaleString()}</div>
        <div className="text-sm font-semibold text-foreground">Non-refundable deposit</div>
        <p className="mt-2 text-sm text-muted-foreground">
          To secure a hold on your vehicle, you will send a $1,000 e-transfer to{" "}
          <span className="font-semibold">info@easydrivecanada.com</span>. The deposit is{" "}
          <strong>non-refundable</strong> except at EasyDrive Canada&apos;s discretion.
        </p>
      </div>

      <ul className="mt-6 space-y-3">
        <CheckItem checked={agreeDeposit} onChange={setAgreeDeposit}>
          I understand the $1,000 deposit is <strong>non-refundable</strong>.
        </CheckItem>
        <CheckItem checked={agreeDiscretion} onChange={setAgreeDiscretion}>
          I acknowledge that EasyDrive Canada reserves the right to cancel this transaction and
          refund the deposit at its sole discretion.
        </CheckItem>
        <CheckItem checked disabled>
          After delivery is approved, I have <strong>72 hours</strong> to pay the remaining
          balance and upload proof of insurance, or this purchase is cancelled and the deposit
          is forfeited.
        </CheckItem>
      </ul>
    </div>
  );
}

function CheckItem({
  checked,
  onChange,
  disabled,
  children,
}: {
  checked: boolean;
  onChange?: (b: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onChange?.(!!v)}
        className="mt-0.5"
      />
      <span className="text-sm text-foreground">{children}</span>
    </li>
  );
}

function StepEtransfer({
  orderId,
  customerEmail,
  sent,
  setSent,
}: {
  orderId: string;
  customerEmail: string;
  sent: boolean;
  setSent: (b: boolean) => void;
}) {
  const copy = (text: string, label: string) => {
    void navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };
  return (
    <div>
      <h2 className="text-2xl font-bold">Send your $1,000 e-transfer</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        From your online banking, send an Interac e-transfer using these details.
      </p>

      <div className="mt-6 space-y-3">
        <CopyRow label="Recipient email" value="info@easydrivecanada.com" onCopy={copy} />
        <CopyRow label="Amount (CAD)" value="$1,000.00" onCopy={copy} />
        <CopyRow label="Message / reference" value={`Deposit ${orderId}`} onCopy={copy} />
        <CopyRow label="Security answer" value="EDC2025" onCopy={copy} hint="Use this exact answer (case-sensitive)." />
      </div>

      <div className="mt-6 rounded-xl bg-muted/40 p-4 text-xs text-muted-foreground">
        We&apos;ll send a confirmation to <span className="font-medium text-foreground">{customerEmail || "your email"}</span> when
        we receive your deposit. Most e-transfers process in under 30 minutes.
      </div>

      <div className="mt-6">
        <Button
          type="button"
          variant={sent ? "secondary" : "default"}
          onClick={() => setSent(true)}
          className={cn(
            "rounded-full",
            !sent && "bg-brand text-brand-foreground hover:bg-brand/90",
          )}
        >
          {sent ? (
            <>
              <CheckCircle2 className="mr-1 h-4 w-4" /> Marked as sent
            </>
          ) : (
            <>
              <Mail className="mr-1 h-4 w-4" /> I&apos;ve sent the e-transfer
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function CopyRow({
  label,
  value,
  hint,
  onCopy,
}: {
  label: string;
  value: string;
  hint?: string;
  onCopy: (v: string, label: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-mono text-sm font-semibold">{value}</div>
        {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
      </div>
      <Button variant="ghost" size="sm" onClick={() => onCopy(value, label)}>
        <Copy className="mr-1 h-3.5 w-3.5" /> Copy
      </Button>
    </div>
  );
}

function StepSign({
  title,
  contentTitle,
  content,
  agreeLabel,
  typed,
  setTyped,
  drawn,
  setDrawn,
  agree,
  setAgree,
}: {
  title: string;
  contentTitle: string;
  content: React.ReactNode;
  agreeLabel: string;
  typed: string;
  setTyped: (s: string) => void;
  drawn: string | null;
  setDrawn: (s: string | null) => void;
  agree: boolean;
  setAgree: (b: boolean) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{contentTitle}</p>

      <div className="mt-5 max-h-[420px] overflow-y-auto rounded-2xl border border-border bg-background p-5">
        {content}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-xs font-medium">Type your full name</Label>
          <Input
            className="mt-1.5"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Sign here</Label>
          <div className="mt-1.5">
            <SignaturePad onChange={setDrawn} />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <CheckItem checked={agree} onChange={setAgree}>
          {agreeLabel}
        </CheckItem>
      </div>

      {drawn && (
        <div className="mt-3 text-xs text-success">
          <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> Signature captured
        </div>
      )}
    </div>
  );
}

function StepConfirm({ orderId, customerEmail }: { orderId: string; customerEmail: string }) {
  const [downloading, setDownloading] = useState<"bos" | "guarantee" | null>(null);
  const handleDownload = async (kind: "bos" | "guarantee") => {
    try {
      setDownloading(kind);
      const { getOrder } = await import("@/lib/orders");
      const { downloadOrderPdf } = await import("@/lib/pdf-generator");
      const o = getOrder(orderId);
      if (!o) {
        toast.error("Order not found");
        return;
      }
      await downloadOrderPdf(kind, o);
      toast.success("PDF downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
        <CheckCircle2 className="h-8 w-8 text-success" />
      </div>
      <h2 className="mt-4 text-2xl font-bold">Sale request submitted!</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Order <span className="font-mono font-semibold text-foreground">{orderId}</span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        We&apos;ve recorded your signed Bill of Sale and Dealer Guarantee. A confirmation email
        will go to <span className="font-medium text-foreground">{customerEmail}</span>.
      </p>

      <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-2">
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => handleDownload("bos")}
          disabled={downloading === "bos"}
        >
          <FileSignature className="mr-1.5 h-4 w-4" />
          {downloading === "bos" ? "Generating…" : "Download Bill of Sale"}
        </Button>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => handleDownload("guarantee")}
          disabled={downloading === "guarantee"}
        >
          <ShieldCheck className="mr-1.5 h-4 w-4" />
          {downloading === "guarantee" ? "Generating…" : "Download Dealer Guarantee"}
        </Button>
      </div>

      <div className="mx-auto mt-8 max-w-md text-left">
        <h3 className="text-sm font-semibold">What happens next</h3>
        <ol className="mt-3 space-y-3">
          {[
            "Send the $1,000 e-transfer if you haven't already.",
            "EasyDrive confirms receipt of your deposit.",
            "EasyDrive counter-signs the Bill of Sale.",
            "We send our direct deposit info — pay the remaining balance.",
            "We mark your vehicle ready for delivery (you have 72 hours).",
            "Upload proof of insurance, then come pick up your car.",
          ].map((s, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function SummarySidebar({
  vehicle,
  pricing,
  orderId,
  step,
}: {
  vehicle: ReturnType<typeof getVehicleById> & {};
  pricing: ReturnType<typeof computePricing>;
  orderId: string;
  step: number;
}) {
  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="aspect-[16/10] overflow-hidden bg-muted">
          <img src={vehicle.image} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="p-5">
          <Badge className="bg-brand/15 text-brand hover:bg-brand/15">Order {orderId}</Badge>
          <div className="mt-2 font-semibold">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </div>
          <div className="text-xs text-muted-foreground">
            {vehicle.trim} · Stock #{vehicle.stockNumber}
          </div>

          <div className="mt-4 space-y-1.5 text-sm">
            <Row k="Sale price" v={pricing.salePrice} />
            <Row k="Doc fee" v={pricing.docFee} />
            <Row k="Licensing" v={pricing.licensing} />
            <Row k="HST (13%)" v={pricing.hst} />
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-base font-bold">
              <span>Total</span>
              <span className="tabular-nums">${pricing.total.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Deposit today</span>
              <span className="tabular-nums text-foreground">${pricing.deposit.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Balance due before delivery</span>
              <span className="tabular-nums">${pricing.balanceDue.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
            <CreditCard className="h-4 w-4 text-brand" />
            Step {Math.min(step + 1, STEPS.length)} of {STEPS.length}
          </div>
        </div>
      </div>
    </aside>
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
