import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle2,
  ShieldCheck,
  Clock,
  TrendingUp,
  Quote,
  Users,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { FINANCING_FAQS } from "@/data/financing-faqs";

export const Route = createFileRoute("/financing")({
  head: () => ({
    meta: [
      { title: "Financing & Pre-Approval — EasyDrive Canada" },
      {
        name: "description",
        content:
          "Get pre-qualified for auto financing in 5 minutes. All credit profiles welcome. Soft credit check — no impact on your score.",
      },
      { property: "og:title", content: "Financing & Pre-Approval — EasyDrive Canada" },
      {
        property: "og:description",
        content:
          "One secure application. No obligation. Built for all credit profiles.",
      },
    ],
  }),
  component: FinancingPage,
});

const WHO_ITS_FOR = [
  "Have fair or challenged credit",
  "Are rebuilding credit",
  "Are self-employed or independent contractors",
  "Are new to Canada",
  "Want realistic monthly payments",
  "Prefer everything handled online",
];

const TESTIMONIALS = [
  {
    name: "Nathaniel Brooks",
    quote:
      "EasyDrive was very helpful with my auto financing. The process was smooth, quick, and easy to understand.",
  },
  {
    name: "Olivia Fraser",
    quote:
      "Super easy to deal with and made getting my car sorted a breeze. Highly recommended.",
  },
  {
    name: "Grace Campbell",
    quote:
      "Really happy with the help I got. They explained everything clearly and made financing way less stressful than I expected.",
  },
];

function FinancingPage() {
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Application received! We'll be in touch within 1 business hour.");
      (e.target as HTMLFormElement).reset();
    }, 800);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-primary text-primary-foreground">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> All credit profiles welcome
            </div>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
              Get pre-qualified for auto financing in{" "}
              <span className="text-brand">5 minutes</span>.
            </h1>
            <p className="mt-3 max-w-xl text-primary-foreground/80">
              One secure application. No obligation. Built for all credit profiles.
              Connect with licensed lenders who understand your situation.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-primary-foreground/90">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand" /> One secure application
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand" /> No obligation
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand" /> Soft credit check first
              </li>
            </ul>
          </div>
        </section>

        {/* Form + benefits */}
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <form
            onSubmit={onSubmit}
            className="rounded-3xl border border-border bg-card p-8 shadow-sm"
          >
            <h2 className="text-xl font-semibold">Tell us about you</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We'll review your profile and share it with licensed lenders who can
              explain your options.
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <Label>First name</Label>
                <Input required className="mt-1" />
              </div>
              <div>
                <Label>Last name</Label>
                <Input required className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" required className="mt-1" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input type="tel" required className="mt-1" />
              </div>
              <div>
                <Label>Gross annual income (CAD)</Label>
                <Input type="number" required className="mt-1" />
              </div>
              <div>
                <Label>Employment status</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ft">Full-time</SelectItem>
                    <SelectItem value="pt">Part-time</SelectItem>
                    <SelectItem value="self">Self-employed</SelectItem>
                    <SelectItem value="contract">Contract / Gig</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Residency status</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="citizen">Canadian citizen</SelectItem>
                    <SelectItem value="pr">Permanent resident</SelectItem>
                    <SelectItem value="work">Work permit</SelectItem>
                    <SelectItem value="study">Study permit</SelectItem>
                    <SelectItem value="newcomer">New to Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Credit profile</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent (750+)</SelectItem>
                    <SelectItem value="good">Good (700-749)</SelectItem>
                    <SelectItem value="fair">Fair (600-699)</SelectItem>
                    <SelectItem value="poor">Poor / Building</SelectItem>
                    <SelectItem value="new">New to credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Desired down payment (CAD)</Label>
                <Input type="number" placeholder="$" className="mt-1" />
              </div>
              <div>
                <Label>Co-applicant?</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">Just me</SelectItem>
                    <SelectItem value="yes">Yes — adding co-applicant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="mt-8 w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {submitting ? "Submitting..." : "Get my pre-qualification"}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              By submitting, you agree to our terms. Soft credit check only — no
              impact on your score.
            </p>
          </form>

          <aside className="space-y-4">
            {[
              { icon: ShieldCheck, t: "No credit impact", s: "Soft check only — no surprises" },
              { icon: Clock, t: "Fast decisions", s: "Most approvals within 24 hours" },
              { icon: TrendingUp, t: "All credit accepted", s: "Build, rebuild, or excellent — all welcome" },
              { icon: CheckCircle2, t: "Best available rates", s: "From 5.99% APR OAC" },
              { icon: Users, t: "Co-applicants supported", s: "Add a co-applicant to strengthen approval" },
            ].map((b) => (
              <div
                key={b.t}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <b.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">{b.t}</div>
                  <div className="text-sm text-muted-foreground">{b.s}</div>
                </div>
              </div>
            ))}
          </aside>
        </div>

        {/* What we believe / How it works */}
        <section className="border-t border-border bg-muted/40">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-brand">
                What we believe
              </div>
              <h2 className="mt-2 text-2xl font-bold">
                Car financing shouldn't be confusing or intimidating.
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Traditional auto financing hasn't changed in decades. People are
                still expected to jump through hoops before they understand their
                options. We believe there's a better way — one secure online
                application, then real options explained in plain language.
              </p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-brand">
                How we do it
              </div>
              <h2 className="mt-2 text-2xl font-bold">
                One application. Multiple lender options.
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Complete one online application. Your information is reviewed by
                our finance team and shared with licensed lenders that specialize
                in approvals like yours. No dealership hopping. No repeated
                explanations. No pressure before clarity.
              </p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-brand">
                Who it's for
              </div>
              <h2 className="mt-2 text-2xl font-bold">
                Built for people who want clarity before commitment.
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {WHO_ITS_FOR.map((w) => (
                  <li key={w} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">What our customers say</h2>
            <p className="mt-2 text-muted-foreground">
              Real people. Real approvals. Real cars in the driveway.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="rounded-3xl border border-border bg-card p-6 shadow-sm"
              >
                <Quote className="h-6 w-6 text-brand" />
                <blockquote className="mt-3 text-sm leading-relaxed">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-4 text-sm font-semibold">
                  — {t.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border bg-muted/40">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
                <HelpCircle className="h-3.5 w-3.5" /> Frequently asked
              </div>
              <h2 className="mt-2 text-3xl font-bold">
                Everything you need to know about financing
              </h2>
              <p className="mt-2 text-muted-foreground">
                Honest answers about applications, rates, credit, and approvals.
              </p>
            </div>
            <Accordion
              type="single"
              collapsible
              className="mt-8 rounded-3xl border border-border bg-card"
            >
              {FINANCING_FAQS.map((f, i) => (
                <AccordionItem
                  key={f.q}
                  value={`f-${i}`}
                  className="border-b border-border last:border-b-0"
                >
                  <AccordionTrigger className="px-6 text-left text-sm font-semibold hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 text-sm text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Still have questions? Our finance team is one click away.
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-3 rounded-full"
              >
                <Link to="/contact">Contact our finance team</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
