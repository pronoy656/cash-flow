"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Users as UsersIcon,
  UserPlus,
  Activity,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const revenue = [
  { month: "Jan", value: 12000 },
  { month: "Feb", value: 14500 },
  { month: "Mar", value: 13800 },
  { month: "Apr", value: 16000 },
  { month: "May", value: 17500 },
  { month: "Jun", value: 18200 },
];

const plans = [
  { name: "Free", value: 200 },
  { name: "Basic", value: 420 },
  { name: "Premium", value: 310 },
  { name: "Enterprise", value: 70 },
];

const pieColors = ["#9ca3af", "#3b82f6", "#8b5cf6", "#22c55e"];

export default function Overview() {
  const totalUsers = plans.reduce((a, b) => a + b.value, 0);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
        <p className="text-sm text-white/60">
          Welcome back, here&apos;s what&apos;s happening today.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Revenue",
            value: "$128,430",
            Icon: DollarSign,
            glow: "from-emerald-400/30 to-emerald-500/10",
            iconBg: "from-[#22c55e] to-[#16a34a]",
          },
          {
            label: "Active Users",
            value: "2,543",
            Icon: UsersIcon,
            glow: "from-sky-400/30 to-sky-500/10",
            iconBg: "from-[#60a5fa] to-[#3b82f6]",
          },
          {
            label: "New Subscribers",
            value: "345",
            Icon: UserPlus,
            glow: "from-violet-400/30 to-violet-500/10",
            iconBg: "from-[#a78bfa] to-[#8b5cf6]",
          },
          {
            label: "Total Subscribers",
            value: "42",
            Icon: Activity,
            glow: "from-amber-400/30 to-amber-500/10",
            iconBg: "from-[#f59e0b] to-[#d97706]",
          },
        ].map((s) => (
          <Card
            key={s.label}
            className="bg-[#141f31] border-white/10 relative overflow-hidden"
          >
            <div
              className={`absolute -top-6 -left-6 h-24 w-24 rounded-full rotate-45 bg-gradient-to-br ${s.glow} blur-xl`}
            />
            <div className="absolute -top-10 -left-8 h-28 w-28 rotate-12 bg-gradient-to-b from-white/25 via-white/10 to-transparent rounded-2xl blur-xl" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3">
                <div
                  className={`h-12 w-12 rounded-lg grid place-items-center bg-gradient-to-b ${s.iconBg} shadow-inner`}
                >
                  <s.Icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <CardTitle className="text-white/70">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-white">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#141f31] border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-xl">
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ value: { label: "Revenue", color: "#3b82f6" } }}
              className="h-[400px]"
            >
              <LineChart
                data={revenue}
                // margin={{ top: 8, right: 20, left: 0, bottom: 8 }}
              >
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                    <stop offset="90%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={46}
                  domain={["auto", "auto"]}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="value"
                  type="monotone"
                  stroke="none"
                  fill="url(#revenueGradient)"
                />
                <Line
                  dataKey="value"
                  type="monotone"
                  stroke="var(--color-value)"
                  strokeWidth={3}
                  strokeLinecap="round"
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#141f31] border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-xl">
              Subscription Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <ChartContainer
                config={{
                  Free: { label: "Free", color: pieColors[0] },
                  Basic: { label: "Basic", color: pieColors[1] },
                  Premium: { label: "Premium", color: pieColors[2] },
                  Enterprise: { label: "Enterprise", color: pieColors[3] },
                }}
                className="h-80"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={plans}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    labelLine={false}
                    cx="50%"
                    cy="50%"
                  >
                    {plans.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="mr-43 mb-29">
                  <div className="text-2xl font-semibold text-white">
                    {totalUsers.toLocaleString()}
                  </div>
                  <div className="text-xs text-white/60">Total Users</div>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-sm">
                {[
                  { label: "Free", value: "33%", color: pieColors[0] },
                  { label: "Basic", value: "25%", color: pieColors[1] },
                  { label: "Premium", value: "25%", color: pieColors[2] },
                  { label: "Enterprise", value: "17%", color: pieColors[3] },
                ].map((l) => (
                  <div
                    key={l.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: l.color }}
                      />
                      <span className="text-white/80">{l.label}</span>
                    </div>
                    <span className="text-white/60">{l.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
