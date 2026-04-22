import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText } from "lucide-react";
import type { ReactNode } from "react";

export function CarfaxDialog({ trigger, vin }: { trigger: ReactNode; vin: string }) {
  // Placeholder CARFAX preview — replace with per-vehicle PDF URL when available.
  const fakeReport = `https://www.carfax.ca/sample-report.pdf`;
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-destructive" />
            CARFAX Report
          </DialogTitle>
          <a
            href={fakeReport}
            target="_blank"
            rel="noreferrer"
            className="mr-8 flex items-center gap-1 text-xs text-brand hover:underline"
          >
            <ExternalLink className="h-3 w-3" /> Open in new tab
          </a>
        </DialogHeader>
        <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-3 font-semibold">Sample CARFAX Canada Report</h3>
          <p className="mt-1 text-xs text-muted-foreground">VIN: {vin}</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            No accident/damage records found · Last registered in Ontario · 5 service records found · No open recalls
          </p>
          <Button asChild variant="outline" className="mt-4 rounded-full">
            <a href={fakeReport} target="_blank" rel="noreferrer">
              View Full Report
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
