// app/(routes)/student/attendance/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface ClassAttendance {
  classId: string;
  className: string;
  total: number;
  present: number;
  percentage: number;
}

export default function StudentAttendancePage() {
  const [analytics, setAnalytics] = useState<{
    totalSessions: number;
    present: number;
    percentage: number;
    classes: ClassAttendance[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          return fetch(`/api/analytics/student/${d.user.id}`, { credentials: "include" });
        }
      })
      .then((r) => r?.json())
      .then((d) => {
        if (d?.success) setAnalytics(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>;
  }

  if (!analytics) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 text-zinc-400">
        <p className="text-lg">No attendance data available yet.</p>
      </div>
    );
  }

  const absent = analytics.totalSessions - analytics.present;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">My Attendance</h2>
        <p className="text-zinc-500 mt-1">Detailed attendance breakdown</p>
      </div>

      {/* Overall Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-5 text-center">
            <div className={`text-3xl font-semibold ${analytics.percentage >= 75 ? "text-emerald-600" : "text-red-600"}`}>
              {analytics.percentage}%
            </div>
            <p className="text-xs text-zinc-500 mt-1">Overall</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5 text-center">
            <div className="text-3xl font-semibold">{analytics.totalSessions}</div>
            <p className="text-xs text-zinc-500 mt-1">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5 text-center">
            <div className="text-3xl font-semibold text-emerald-600">{analytics.present}</div>
            <p className="text-xs text-zinc-500 mt-1">Present</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5 text-center">
            <div className="text-3xl font-semibold text-red-600">{absent}</div>
            <p className="text-xs text-zinc-500 mt-1">Absent</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-class detail */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Subject-wise Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics.classes.length === 0 ? (
            <p className="text-zinc-400 text-center py-6">No classes to show.</p>
          ) : (
            analytics.classes.map((cls) => {
              const isLow = cls.percentage < 75;
              return (
                <div key={cls.classId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cls.className}</span>
                      {isLow && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                          LOW
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-500">{cls.present}/{cls.total}</span>
                      <span className={`font-semibold ${isLow ? "text-red-600" : "text-emerald-600"}`}>
                        {cls.percentage}%
                      </span>
                      {isLow ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-zinc-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${isLow ? "bg-red-500" : "bg-emerald-500"}`}
                      style={{ width: `${cls.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Low attendance warning */}
      {analytics.classes.some((c) => c.percentage < 75) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800">Subjects Below 75%</p>
              <ul className="text-sm text-amber-700 mt-1 list-disc ml-4">
                {analytics.classes.filter((c) => c.percentage < 75).map((c) => (
                  <li key={c.classId}>{c.className} — {c.percentage}%</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
