import { createFileRoute } from "@tanstack/react-router";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — EasyDrive Canada" },
      { name: "description", content: "Get in touch with EasyDrive Canada. We're here to help with financing, inventory, and delivery questions." },
      { property: "og:title", content: "Contact — EasyDrive Canada" },
      { property: "og:description", content: "Reach our team — Toronto-based, serving all of Ontario." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll reply within 1 business day.");
    (e.target as HTMLFormElement).reset();
  };
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Get in touch</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Questions about a vehicle, financing, or delivery? We're here to help.
          </p>
        </div>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8">
          <form onSubmit={onSubmit} className="rounded-3xl border border-border bg-card p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input required className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" required className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <Label>Subject</Label>
                <Input required className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <Label>Message</Label>
                <Textarea required rows={6} className="mt-1" />
              </div>
            </div>
            <Button type="submit" className="mt-6 rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
              Send message
            </Button>
          </form>
          <aside className="space-y-4">
            {[
              { icon: MapPin, t: "Visit us", s: "1247 Lakeshore Blvd, Toronto, ON" },
              { icon: Phone, t: "Call us", s: "1-800-555-EASY" },
              { icon: Mail, t: "Email us", s: "hello@easydrivecanada.com" },
              { icon: Clock, t: "Hours", s: "Mon–Sat 9am–7pm · Sun 11am–5pm" },
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
