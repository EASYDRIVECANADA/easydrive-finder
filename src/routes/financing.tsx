import { createFileRoute } from "@tanstack/react-router";
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
import { CheckCircle2, ShieldCheck, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/financing")({
  head: () => ({
    meta: [
      { title: "Financing & Pre-Approval — EasyDrive Canada" },
      { name: "description", content: "Get pre-approved for car financing in 5 minutes. All credit accepted. No impact on your credit score." },
      { property: "og:title", content: "Financing & Pre-Approval — EasyDrive Canada" },
      { property: "og:description", content: "5-minute application. Soft credit check. Personalized rate within hours." },
    ],
  }),
  component: FinancingPage,
});

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
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
              Get pre-approved in <span className="text-brand">5 minutes</span>.
            </h1>
            <p className="mt-3 max-w-xl text-primary-foreground/80">
              Soft credit check. No impact on your score. Personalized rate within hours.
            </p>
          </div>
        </section>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <form onSubmit={onSubmit} className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h2 className="text-xl font-semibold">Tell us about you</h2>
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
                <Label>Annual income (CAD)</Label>
                <Input type="number" required className="mt-1" />
              </div>
              <div>
                <Label>Employment status</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Choose..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ft">Full-time</SelectItem>
                    <SelectItem value="pt">Part-time</SelectItem>
                    <SelectItem value="self">Self-employed</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Credit profile</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Choose..." /></SelectTrigger>
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
                <Label>Desired down payment</Label>
                <Input type="number" placeholder="$" className="mt-1" />
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="mt-8 w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {submitting ? "Submitting..." : "Get my pre-approval"}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              By submitting, you agree to our terms. Soft credit check only.
            </p>
          </form>
          <aside className="space-y-4">
            {[
              { icon: ShieldCheck, t: "No credit impact", s: "Soft check only" },
              { icon: Clock, t: "Fast approval", s: "Usually within 1 hour" },
              { icon: TrendingUp, t: "All credit accepted", s: "Build or rebuild credit" },
              { icon: CheckCircle2, t: "Best rates", s: "From 5.99% APR OAC" },
            ].map((b) => (
              <div key={b.t} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
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
      </main>
      <MarketingFooter />
    </div>
  );
}
