import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dealer/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { vehicles } from "@/data/vehicles";
import { leads } from "@/data/leads";
import { sales } from "@/data/sales";
import { Car, Users, DollarSign, TrendingUp } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/dealer/")({
  head: () => ({ meta: [{ title: "Dashboard — Dealer Portal" }] }),
  component: DealerHome,
});

const revenueData = [
  { month: "Nov", revenue: 142000 },
  { month: "Dec", revenue: 168000 },
  { month: "Jan", revenue: 124000 },
  { month: "Feb", revenue: 188000 },
  { month: "Mar", revenue: 215000 },
  { month: "Apr", revenue: 248000 },
];

const leadsData = [
  { day: "Mon", leads: 8 },
  { day: "Tue", leads: 12 },
  { day: "Wed", leads: 7 },
  { day: "Thu", leads: 15 },
  { day: "Fri", leads: 18 },
  { day: "Sat", leads: 22 },
  { day: "Sun", leads: 9 },
];

function DealerHome() {
  const inStock = vehicles.filter((v) => v.status === "In Stock").length;
  const newLeads = leads.filter((l) => l.status === "New" || l.status === "Contacted").length;
  const salesMTD = sales.length;
  const revenueMTD = sales.reduce((acc, s) => acc + s.salePrice, 0);

  const kpis = [
    { label: "Vehicles in stock", value: inStock, icon: Car, accent: "text-brand" },
    { label: "Active leads", value: newLeads, icon: Users, accent: "text-success" },
    { label: "Sales (MTD)", value: salesMTD, icon: TrendingUp, accent: "text-warning" },
    { label: "Revenue (MTD)", value: `$${revenueMTD.toLocaleString()}`, icon: DollarSign, accent: "text-brand" },
  ];

  return (
    <div>
      <PageHeader title="Welcome back, Marcus" subtitle="Here's what's happening today." />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <Card key={k.label}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</div>
                  <div className="mt-1 text-2xl font-bold">{k.value}</div>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted ${k.accent}`}>
                  <k.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue (last 6 months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ revenue: { label: "Revenue", color: "var(--brand)" } }}
                className="h-[260px] w-full"
              >
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Leads this week</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ leads: { label: "Leads", color: "var(--primary)" } }}
                className="h-[260px] w-full"
              >
                <BarChart data={leadsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="leads" fill="var(--color-leads)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {sales.slice(0, 5).map((s) => (
                <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <div className="font-medium">{s.customer} — {s.vehicle}</div>
                    <div className="text-xs text-muted-foreground">{s.billOfSale} · {s.salesperson}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${s.salePrice.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{s.status}</div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
