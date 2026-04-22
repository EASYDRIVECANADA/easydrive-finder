import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dealer/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export const Route = createFileRoute("/dealer/reports")({
  head: () => ({ meta: [{ title: "Reports — Dealer Portal" }] }),
  component: ReportsPage,
});

const expenses = [
  { cat: "Marketing", amount: 8400 },
  { cat: "Reconditioning", amount: 14200 },
  { cat: "Salaries", amount: 42500 },
  { cat: "Rent", amount: 9800 },
  { cat: "Utilities", amount: 2100 },
  { cat: "Other", amount: 3300 },
];

const aging = [
  { bucket: "0-30 days", count: 7 },
  { bucket: "31-60 days", count: 3 },
  { bucket: "61-90 days", count: 1 },
  { bucket: "90+ days", count: 1 },
];

const colors = ["var(--brand)", "var(--primary)", "var(--success)", "var(--warning)", "var(--destructive)", "var(--muted-foreground)"];

function ReportsPage() {
  const totalExp = expenses.reduce((a, b) => a + b.amount, 0);
  return (
    <div>
      <PageHeader title="Reports" subtitle="Profit, expenses, and inventory insights" />
      <div className="grid gap-4 p-6 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Revenue (MTD)</div>
            <div className="mt-1 text-2xl font-bold">$337,463</div>
            <div className="mt-1 text-xs text-success">+18% vs last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Expenses (MTD)</div>
            <div className="mt-1 text-2xl font-bold">${totalExp.toLocaleString()}</div>
            <div className="mt-1 text-xs text-warning">+4% vs last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Net profit</div>
            <div className="mt-1 text-2xl font-bold">${(337463 - totalExp).toLocaleString()}</div>
            <div className="mt-1 text-xs text-success">+24% vs last month</div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Expenses by category</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer
              config={{ amount: { label: "Amount", color: "var(--brand)" } }}
              className="h-[280px] w-full"
            >
              <BarChart data={expenses}>
                <CartesianGrid vertical={false} className="stroke-border" />
                <XAxis dataKey="cat" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {expenses.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Inventory aging</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer
              config={{ count: { label: "Vehicles", color: "var(--brand)" } }}
              className="h-[280px] w-full"
            >
              <PieChart>
                <Pie data={aging} dataKey="count" nameKey="bucket" outerRadius={90} label>
                  {aging.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
