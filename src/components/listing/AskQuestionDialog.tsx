import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(1000),
});

export function AskQuestionDialog({ trigger, vehicleLabel }: { trigger: ReactNode; vehicleLabel: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please complete all fields");
      return;
    }
    try {
      const leads = JSON.parse(localStorage.getItem("edc_leads") ?? "[]");
      leads.push({ ...parsed.data, vehicle: vehicleLabel, createdAt: new Date().toISOString() });
      localStorage.setItem("edc_leads", JSON.stringify(leads));
    } catch {
      // ignore quota errors
    }
    toast.success("Thanks! A specialist will reach out shortly.");
    setOpen(false);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ask about {vehicleLabel}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Your name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} />
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} />
          </div>
          <div>
            <Label className="text-xs">Message</Label>
            <Textarea
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              maxLength={1000}
              placeholder="Is this still available? Can I see more photos?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} className="w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
            Send question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
