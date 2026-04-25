import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DealerSidebar } from "@/components/dealer/DealerSidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNewOrderCount, useOrderArrivalToasts } from "@/lib/dealer-notifications";

export const Route = createFileRoute("/dealer")({
  head: () => ({
    meta: [
      { title: "Dealer Portal — EasyDrive Canada" },
      { name: "description", content: "Manage inventory, leads, customers, and sales." },
    ],
  }),
  component: DealerLayout,
});

function DealerLayout() {
  // Surface a sonner toast whenever a brand-new customer order lands.
  useOrderArrivalToasts();
  const newCount = useNewOrderCount();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <DealerSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="hidden flex-1 md:flex">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search vehicles, leads, customers..." className="pl-9" />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button className="relative rounded-full p-2 hover:bg-muted" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                {newCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground">
                    {newCount}
                  </span>
                )}
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                MR
              </div>
            </div>
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
