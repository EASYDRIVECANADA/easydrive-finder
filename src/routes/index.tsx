import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { VehicleCard } from "@/components/marketing/VehicleCard";
import { vehicles } from "@/data/vehicles";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Shield,
  Truck,
  Lock,
  CheckCircle2,
  Search,
  FileSignature,
  KeyRound,
  Sparkles,
  TrendingDown,
  Award,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EasyDrive Canada — Stress-free car financing & quality used vehicles" },
      {
        name: "description",
        content:
          "Get pre-approved in minutes and drive home a quality used vehicle. EasyDrive Canada makes car buying simple, transparent, and fast.",
      },
      { property: "og:title", content: "EasyDrive Canada — Stress-free car financing" },
      {
        property: "og:description",
        content:
          "Pre-approval in minutes. Quality used vehicles. Transparent pricing. The EasyDrive Promise.",
      },
    ],
  }),
  component: HomePage,
});

const featured = vehicles.slice(0, 6);

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-primary text-primary-foreground">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/85 to-primary" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-2 lg:px-8">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5 text-brand" />
                Canada's stress-free way to drive
              </span>
              <h1 className="text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                Drive home a car you'll <span className="text-brand">love</span>,
                without the dealer drama.
              </h1>
              <p className="max-w-xl text-lg text-primary-foreground/80">
                Get pre-approved in minutes. Browse hand-picked, certified vehicles.
                Drive away the same day — all backed by The EasyDrive Promise.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
                  <Link to="/financing">
                    Get Pre-Approved <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link to="/inventory">Browse Inventory</Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-primary-foreground/70">
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand" /> No impact on credit</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand" /> 5-min application</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand" /> All credit accepted</span>
              </div>
            </div>
            <div className="hidden items-center justify-center lg:flex">
              <div className="relative aspect-[4/3] w-full max-w-lg overflow-hidden rounded-3xl border border-primary-foreground/10 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80"
                  alt="Featured vehicle"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="border-y border-border bg-muted/40">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
            {[
              { icon: Shield, label: "CARFAX Verified", sub: "Every vehicle" },
              { icon: Truck, label: "Free Delivery", sub: "Across Ontario" },
              { icon: Lock, label: "Secure Financing", sub: "Bank-grade rates" },
              { icon: Award, label: "5-Star Rated", sub: "1,200+ reviews" },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <t.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.label}</div>
                  <div className="text-xs text-muted-foreground">{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured vehicles */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Featured Vehicles</h2>
              <p className="mt-2 text-muted-foreground">Hand-picked, certified, ready to drive.</p>
            </div>
            <Button asChild variant="ghost" className="rounded-full">
              <Link to="/inventory">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-muted/40 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
              <p className="mt-3 text-muted-foreground">
                Four simple steps from pre-approval to keys in hand.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: FileSignature, title: "1. Apply", text: "5-minute online form. No credit impact." },
                { icon: CheckCircle2, title: "2. Get approved", text: "Personalized rate within hours." },
                { icon: Search, title: "3. Choose your car", text: "Browse certified inventory." },
                { icon: KeyRound, title: "4. Drive home", text: "Free delivery anywhere in ON." },
              ].map((s) => (
                <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-brand-foreground">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EasyDrive Promise */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand">The EasyDrive Promise</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Save thousands. Skip the showroom.
              </h2>
              <p className="mt-4 text-muted-foreground">
                We cut the dealer markup, the pressure, and the paperwork.
                On average, our customers save <span className="font-semibold text-foreground">$3,200</span> compared to traditional dealerships.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Transparent, no-haggle pricing",
                  "150-point certified inspection",
                  "7-day money-back guarantee",
                  "30-day powertrain warranty included",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-6 w-6 text-brand" />
                <h3 className="text-lg font-semibold">Average savings</h3>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-muted/60 p-5 text-center">
                  <div className="text-xs text-muted-foreground">Traditional dealer</div>
                  <div className="mt-1 text-2xl font-bold line-through opacity-60">$32,500</div>
                </div>
                <div className="rounded-2xl bg-brand/10 p-5 text-center text-brand">
                  <div className="text-xs">EasyDrive</div>
                  <div className="mt-1 text-2xl font-bold">$29,300</div>
                </div>
              </div>
              <div className="mt-4 text-center text-sm font-semibold text-foreground">
                You save $3,200
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-muted/40 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
              Frequently asked questions
            </h2>
            <Accordion type="single" collapsible className="mt-10 rounded-2xl border border-border bg-card">
              {[
                { q: "Will applying hurt my credit?", a: "No. Our pre-approval is a soft credit check and won't affect your score." },
                { q: "What if I have bad credit?", a: "We work with all credit profiles, including new credit, bankruptcy, and consumer proposals." },
                { q: "Do you deliver?", a: "Yes — free delivery anywhere in Ontario. Outside ON, fees may apply." },
                { q: "Are vehicles inspected?", a: "Every vehicle passes a 150-point inspection and comes with a CARFAX report." },
                { q: "Can I return the car?", a: "Yes — we offer a 7-day, no-questions-asked money-back guarantee." },
              ].map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-border px-6">
                  <AccordionTrigger className="text-left text-base font-semibold">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
              Ready to drive? Get pre-approved in 5 minutes.
            </h2>
            <Button asChild size="lg" className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
              <Link to="/financing">
                Start your application <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
