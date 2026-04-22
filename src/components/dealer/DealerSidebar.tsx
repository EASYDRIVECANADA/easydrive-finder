import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Contact,
  Building2,
  Store,
  Car,
  ClipboardList,
  PenTool,
  BarChart3,
  CreditCard,
  UserCog,
  LogOut,
  Car as CarLogo,
} from "lucide-react";

const items = [
  { to: "/dealer" as const, label: "Home", icon: LayoutDashboard, exact: true },
  { to: "/dealer/leads" as const, label: "Leads", icon: Users, exact: false },
  { to: "/dealer/customers" as const, label: "Customers", icon: Contact, exact: false },
  { to: "/dealer/vendors" as const, label: "Vendors", icon: Building2, exact: false },
  { to: "/dealer/marketplace" as const, label: "Marketplace", icon: Store, exact: false },
  { to: "/dealer/inventory" as const, label: "Inventory", icon: Car, exact: false },
  { to: "/dealer/sales" as const, label: "Sales", icon: ClipboardList, exact: false },
  { to: "/dealer/esignature" as const, label: "E-Signature", icon: PenTool, exact: false },
  { to: "/dealer/reports" as const, label: "Reports", icon: BarChart3, exact: false },
  { to: "/dealer/billing" as const, label: "Billing", icon: CreditCard, exact: false },
  { to: "/dealer/directory" as const, label: "Directory", icon: UserCog, exact: false },
];

export function DealerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dealer" className="flex items-center gap-2 px-1.5 py-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
            <CarLogo className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-bold text-sidebar-foreground">EasyDrive</div>
              <div className="text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/60">
                Dealer Portal
              </div>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = item.exact
                  ? path === item.to
                  : path === item.to || path.startsWith(item.to + "/");
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link to={item.to}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Sign out">
              <Link to="/">
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
