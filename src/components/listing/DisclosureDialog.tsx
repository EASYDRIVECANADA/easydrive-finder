import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useState, type ReactNode } from "react";

export function DisclosureDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="rounded-full bg-accent p-2 text-accent-foreground">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <span>
              IMPORTANT DISCLOSURE
              <span className="block text-xs font-normal text-muted-foreground">Please Read Carefully</span>
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p>
            This vehicle is offered by EasyDrive Canada (EDC) as an{" "}
            <span className="font-semibold text-brand">EDC Premier</span> vehicle.
          </p>
          <Section n={1} title="Vehicle Status – EDC Premier">
            <li>This vehicle is owned and stocked by EasyDrive Canada.</li>
            <li>Viewing and test drives are available by appointment.</li>
          </Section>
          <Section n={2} title="Safety & Reconditioning">
            <li>This vehicle will be sold with a valid Ontario Safety Standards Certificate prior to delivery.</li>
            <li>Any required safety or reconditioning work has been completed or will be completed before delivery.</li>
          </Section>
          <Section n={3} title="Fees & Licensing (Mandatory)">
            <li>All transactions are subject to the mandatory OMVIC fee of <strong>$22 + HST</strong> per transaction, shown separately on the Bill of Sale.</li>
            <li>A licensing fee of <strong>$59</strong> applies to every transaction and will be shown separately on the Bill of Sale.</li>
          </Section>
          <Section n={4} title="CARFAX Disclosure">
            <li>A CARFAX report will be provided to the client prior to completion of the sale.</li>
          </Section>
          <p className="border-t border-border pt-3 text-xs italic text-muted-foreground">
            No other promises, representations, or guarantees have been made, written or verbal, other than what is disclosed above and on the Bill of Sale.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} className="w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 font-semibold">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/10 text-xs text-brand">{n}</span>
        {title}
      </div>
      <ul className="mt-1 list-disc space-y-1 pl-9 text-muted-foreground">{children}</ul>
    </div>
  );
}
