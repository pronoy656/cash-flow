"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Users as UsersIcon,
  UserPlus,
  Activity,
  Loader2,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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

import { useState, useEffect } from "react";
import axiosSecure from "@/components/hook/axiosSecure";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatsData = {
  totalRevenue: number;
  totalActiveUsers: number;
  totalSubscribers: number;
  newSubscribersLast60Days: number;
  subscriptionDistribution: {
    plan: string;
    count: number;
    percentage: number;
  }[];
};

type RevenueData = {
  month: string;
  value: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_REVENUE = [
  { month: "Jan", value: 0 },
  { month: "Feb", value: 0 },
  { month: "Mar", value: 0 },
  { month: "Apr", value: 0 },
  { month: "May", value: 0 },
  { month: "Jun", value: 0 },
];

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#9ca3af"];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Overview() {
  const [revenue, setRevenue] = useState<RevenueData[]>(DEFAULT_REVENUE);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Revenue
        const currentYear = new Date().getFullYear();
        const revenueRes = await axiosSecure.get(`/admin/monthly-revenue?year=${currentYear}`);
        if (revenueRes.data?.success && revenueRes.data?.data) {
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const formatted = revenueRes.data.data.map((item: any) => ({
            month: monthNames[item.month - 1] || "???",
            value: item.revenue
          }));
          if (formatted.length > 0) setRevenue(formatted);
        }

        // 2. Fetch Dashboard Stats
        const dashRes = await axiosSecure.get("/admin/dashboard");
        if (dashRes.data?.success) {
          setStats(dashRes.data.data);
        }
      } catch (error) {
        console.error("Dashboard data fetch failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare UI data
  const statCards = [
    {
      label: "Total Revenue",
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : "$0",
      Icon: DollarSign,
      glow: "from-emerald-400/30 to-emerald-500/10",
      iconBg: "from-[#22c55e] to-[#16a34a]",
    },
    {
      label: "Active Users",
      value: stats ? stats.totalActiveUsers.toLocaleString() : "0",
      Icon: UsersIcon,
      glow: "from-sky-400/30 to-sky-500/10",
      iconBg: "from-[#60a5fa] to-[#3b82f6]",
    },
    {
      label: "New Subscribers",
      value: stats ? stats.newSubscribersLast60Days.toLocaleString() : "0",
      Icon: UserPlus,
      glow: "from-violet-400/30 to-violet-500/10",
      iconBg: "from-[#a78bfa] to-[#8b5cf6]",
    },
    {
      label: "Total Subscribers",
      value: stats ? stats.totalSubscribers.toLocaleString() : "0",
      Icon: Activity,
      glow: "from-amber-400/30 to-amber-500/10",
      iconBg: "from-[#f59e0b] to-[#d97706]",
    },
  ];

  const pieData = stats?.subscriptionDistribution.map(item => ({
    name: item.plan,
    value: item.count,
    percentage: item.percentage
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
          <p className="text-sm text-white/60">
            Welcome back, here&apos;s what&apos;s happening today.
          </p>
        </div>
        {loading && (
          <div className="flex items-center text-white/40 text-xs gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Syncing data...
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} className="bg-[#141f31] border-white/10 relative overflow-hidden group">
            <div className={`absolute -top-6 -left-6 h-24 w-24 rounded-full rotate-45 bg-gradient-to-br ${s.glow} blur-xl group-hover:scale-125 transition-transform duration-500`} />
            <CardHeader className="relative">
              <div
                className={`h-10 w-10 rounded-lg grid place-items-center bg-gradient-to-b ${s.iconBg} shadow-lg mb-2`}
              >
                <s.Icon className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-white/50 text-xs uppercase tracking-wider">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && !stats ? (
                <div className="h-8 w-24 bg-white/5 animate-pulse rounded" />
              ) : (
                <div className="text-3xl font-semibold text-white tracking-tight">{s.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-[#141f31] border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-xl">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ value: { label: "Revenue", color: "#3b82f6" } }} className="h-[400px]">
              <LineChart data={revenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#ffffff0a" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#ffffff40", fontSize: 12 }} dy={10} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#ffffff40", fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area dataKey="value" type="monotone" fill="url(#revGrad)" stroke="none" />
                <Line dataKey="value" type="monotone" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#141f31" }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Subscription Distribution Chart */}
        <Card className="bg-[#141f31] border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-xl">Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <ChartContainer config={{}} className="h-80">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={75}
                    outerRadius={110}
                    paddingAngle={2}
                    cx="50%"
                    cy="50%"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>

              {/* Middle Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4 mr-40 mb-10">
                <div className="text-4xl font-bold text-white leading-none">
                  {stats?.totalSubscribers || 0}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-medium mt-1">
                  Subscribers
                </div>
              </div>

              {/* Legend List */}
              <div className="mt-6 space-y-2 px-4 pb-4">
                {pieData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-sm group">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-white/70 group-hover:text-white transition-colors">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">{item.value}</span>
                      <span className="text-white/20 w-12 text-right">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
                {pieData.length === 0 && !loading && (
                  <div className="text-center text-white/30 text-xs py-4 italic">No distribution data available</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
