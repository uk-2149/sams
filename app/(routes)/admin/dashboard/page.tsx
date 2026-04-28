// app/(routes)/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, LayoutGrid, TrendingUp, Calendar, LayoutList, PieChart as PieChartIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from "recharts";
import type { AdminStats } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [breakdownData, setBreakdownData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/admin/chart", { credentials: "include" }).then((r) => r.json())
    ])
      .then(([statsRes, chartRes]) => {
        if (statsRes.success) setStats(statsRes.data);
        if (chartRes.success) {
          setChartData(chartRes.data.daily.reverse()); // Reverse to show oldest to newest
          setBreakdownData(chartRes.data.breakdown);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Total Faculty",
      value: stats?.totalFaculty ?? "—",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Students",
      value: stats?.totalStudents ?? "—",
      icon: GraduationCap,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Classes",
      value: stats?.totalClasses ?? "—",
      icon: LayoutGrid,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Departments",
      value: stats?.totalDepartments ?? "—",
      icon: BookOpen,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Programs",
      value: stats?.totalPrograms ?? "—",
      icon: LayoutList,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      label: "Sessions (14d)",
      value: stats?.totalSessions14Days ?? "—",
      icon: Calendar,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-zinc-500 mt-1">Overview of your university</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        {statCards.map((s) => (
          <Card key={s.label} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">{s.label}</CardTitle>
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-semibold ${loading ? "animate-pulse text-zinc-300" : ""}`}>
                {loading ? "···" : s.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-zinc-400" />
              Attendance Percentage (Last 14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {chartData.length === 0 ? (
               <div className="h-full flex items-center justify-center text-zinc-400">No data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#a1a1aa' }} dy={10} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#a1a1aa' }} domain={[0, 100]} />
                  <Tooltip
                    cursor={{ fill: '#f4f4f5' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="attendancePercentage" fill="#10b981" radius={[4, 4, 0, 0]} name="Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-zinc-400" />
              Present vs Absent Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
             {chartData.length === 0 ? (
               <div className="h-full flex items-center justify-center text-zinc-400">No data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#a1a1aa' }} dy={10} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#a1a1aa' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} dot={false} name="Present" />
                  <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} dot={false} name="Absent" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-zinc-400" />
              Sessions Conducted (Last 14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
             {chartData.length === 0 ? (
               <div className="h-full flex items-center justify-center text-zinc-400">No data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#a1a1aa' }} dy={10} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#a1a1aa' }} />
                  <Tooltip
                    cursor={{ fill: '#f4f4f5' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="sessions" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-zinc-400" />
              Attendance Breakdown (Today)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
             {breakdownData.length === 0 || breakdownData.every(d => d.value === 0) ? (
               <div className="h-full flex items-center justify-center text-zinc-400">No data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}