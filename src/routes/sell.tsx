import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PRIVATE_SELLER_DOCS,
  isPrivateSellerVerified,
  setPrivateSellerVerification,
  usePrivateSellerVerification,
  useAccountType,
  setAccountType,
} from "@/lib/account";
import {
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Upload,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Sell Your Car — EasyDrive Canada" },
      {
        name: "description",
        content:
          "Sell your car privately on EasyDrive Canada. Private sellers can list one vehicle at a time after a quick document verification.",
      },
      { property: "og:title", content: "Sell Your Car — EasyDrive Canada" },
      {
        property: "og:description",
        content:
          "List your car on the EasyDrive marketplace after document verification.",
      },
    ],
  }),
  component: SellPage,
});

function SellPage() {
  const account = useAccountType();
  const verification = usePrivateSellerVerification();
  const verified = isPrivateSellerVerified(verification);

  const [vin, setVin] = useState("");
  const [askingPrice, setAskingPrice] = useState("");

  const toggle = (key: keyof typeof verification) => {
    setPrivateSellerVerification({ ...verification, [key]: !verification[key] });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verified) {
      toast.error("Please complete document verification first.");
      return;
    }
    toast.success("Listing submitted for review. We'll notify you within 24 hours.");
    setVin("");
    setAskingPrice("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
              Sell your car on EasyDrive — <span className="text-brand">verified</span> &amp; trusted.
            </h1>
            <p className="mt-3 max-w-2xl text-primary-foreground/80">
              Private sellers can list <strong>one vehicle at a time</strong>. To
              protect buyers and keep our marketplace high-trust, every Private
              Seller must complete document verification before their listing
              goes live.
            </p>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          {/* Verification + listing */}
          <div className="space-y-6">
            {account !== "Private Seller" && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-300/40 bg-amber-50 p-5 text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="flex-1 text-sm">
                  <div className="font-semibold">You're browsing as “{account}”.</div>
                  <p className="mt-1">
                    Private listing requires a Private Seller account. Switch to
                    Private Seller to continue.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    setAccountType("Private Seller");
                    toast.success("Switched to Private Seller (demo).");
                  }}
                >
                  Switch
                </Button>
              </div>
            )}

            {/* Verification checklist */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    verified
                      ? "bg-emerald-500/15 text-emerald-600"
                      : "bg-amber-500/15 text-amber-600"
                  }`}
                >
                  {verified ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">
                    {verified ? "Verified — you can list" : "Document verification required"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Upload all four documents. Information must match across all
                    documents (name, VIN, plate).
                  </p>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {PRIVATE_SELLER_DOCS.map((d) => {
                  const done = verification[d.key];
                  return (
                    <li
                      key={d.key}
                      className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
                        done
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-border bg-background"
                      }`}
                    >
                      <Checkbox
                        checked={done}
                        onCheckedChange={() => toggle(d.key)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          {d.label}
                          {done && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{d.help}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => toggle(d.key)}
                      >
                        <Upload className="mr-1 h-3.5 w-3.5" />
                        {done ? "Replace" : "Upload"}
                      </Button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-[11px] text-muted-foreground">
                Demo only — clicking Upload simulates a successful upload. Real
                document OCR &amp; identity matching coming soon.
              </p>
            </div>

            {/* Listing form */}
            <form
              onSubmit={submit}
              className={`rounded-3xl border border-border bg-card p-6 shadow-sm transition ${
                verified ? "" : "opacity-60"
              }`}
            >
              <h2 className="text-xl font-semibold">Your vehicle</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Private Sellers may have only <strong>one active listing</strong> at a time.
              </p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <Label>VIN</Label>
                  <Input
                    value={vin}
                    onChange={(e) => setVin(e.target.value)}
                    placeholder="17-character VIN"
                    disabled={!verified}
                    className="mt-1 font-mono uppercase"
                  />
                </div>
                <div>
                  <Label>Asking price (CAD)</Label>
                  <Input
                    type="number"
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(e.target.value)}
                    placeholder="$"
                    disabled={!verified}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={!verified}
                className="mt-6 w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
              >
                {verified ? (
                  <>
                    Submit listing for review <ArrowRight className="ml-1.5 h-4 w-4" />
                  </>
                ) : (
                  "Complete verification first"
                )}
              </Button>
            </form>
          </div>

          {/* Side info */}
          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-brand">
                Why we verify
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  Buyers know your identity matches the vehicle ownership.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  Curbsiders &amp; unverified resellers stay off our marketplace.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  CARFAX upfront means fewer surprises &amp; faster sales.
                </li>
              </ul>
            </div>
            <div className="rounded-3xl border border-border bg-muted/40 p-5 text-sm">
              <div className="font-semibold">Have multiple cars to sell?</div>
              <p className="mt-1 text-muted-foreground">
                Dealer Select, EDC Premier and Fleet Select accounts can list
                unlimited vehicles without per-listing verification.
              </p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-3 rounded-full"
              >
                <Link to="/contact">Talk to our dealer team</Link>
              </Button>
            </div>
          </aside>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
