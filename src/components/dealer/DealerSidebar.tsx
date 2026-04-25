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
import { useNewOrderCount } from "@/lib/dealer-notifications";
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
  Settings2,
  LogOut,
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
  { to: "/dealer/configuration" as const, label: "Configuration", icon: Settings2, exact: false },
];

export function DealerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (s) => s.location.pathname });
  const newOrders = useNewOrderCount();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dealer" className="flex items-center gap-2 px-1.5 py-1">
          <svg viewBox="0 0 220 110" className="h-9 w-auto shrink-0" aria-label="EDC">
            <g fill="#3b9eff">
              <path d="M8 14 H62 V30 H28 V42 H58 V58 H28 V70 H62 V86 H8 Z" />
              <path d="M76 14 H114 C138 14 152 30 152 50 C152 70 138 86 114 86 H76 Z M96 30 V70 H112 C124 70 132 62 132 50 C132 38 124 30 112 30 Z" />
              <path d="M212 28 C204 18 192 12 178 12 C156 12 140 30 140 50 C140 70 156 88 178 88 C192 88 204 82 212 72 L198 62 C194 68 187 72 178 72 C166 72 158 62 158 50 C158 38 166 28 178 28 C187 28 194 32 198 38 Z" />
            </g>
          </svg>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/60">
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
                        {item.to === "/dealer/sales" && newOrders > 0 && !collapsed && (
                          <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-brand-foreground">
                            {newOrders}
                          </span>
                        )}
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
