// app/(routes)/student/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";
import type { ClassData } from "@/types";

interface ClassWithAttendance {
  classId: string;
  className: string;
  total: number;
  present: number;
  percentage: number;
}

interface AnalyticsData {
  totalSessions: number;
  present: number;
  percentage: number;
  classes: ClassWithAttendance[];
}

export default function StudentDashboardPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Get enrolled classes
        const classesRes = await fetch("/api/classes?limit=50", { credentials: "include" });
        const classesData = await classesRes.json();
        if (classesData.success) setClasses(classesData.data);

        // Get user info to find student profile
        const meRes = await fetch("/api/auth/me", { credentials: "include" });
        const meData = await meRes.json();
        if (!meData.success) return;

        // Try to get analytics — the backend uses the Student table ID,
        // but we're passing the User ID. The admin calling this with a student ID
        // works differently. For student self-access, we need to try matching.
        // Let's fetch students and find our profile
        // For students, their classes endpoint works with their JWT,
        // so we can compute analytics from classes
        const analyticsRes = await fetch(`/api/analytics/student/${meData.user.id}`, { credentials: "include" });
        const analyticsData = await analyticsRes.json();
        if (analyticsData.success) setAnalytics(analyticsData.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">My Dashboard</h2>
        <p className="text-zinc-500 mt-1">{classes.length} enrolled classes</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-5 text-center">
            <div className={`text-3xl font-semibold ${(analytics?.percentage ?? 100) >= 75 ? "text-emerald-600" : "text-red-600"}`}>
              {analytics?.percentage ?? "—"}%
            </div>
            <p className="text-sm text-zinc-500 mt-1">Overall Attendance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5 text-center">
            <div className="text-3xl font-semibold text-emerald-600">{analytics?.present ?? "—"}</div>
            <p className="text-sm text-zinc-500 mt-1">Present</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5 text-center">
            <div className="text-3xl font-semibold">{analytics?.totalSessions ?? "—"}</div>
            <p className="text-sm text-zinc-500 mt-1">Total Sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Attendance Alert */}
      {analytics && analytics.percentage < 75 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800">Low Attendance Warning</p>
              <p className="text-sm text-amber-700">Your overall attendance is below 75%. Please attend more classes to avoid penalties.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-class breakdown */}
      {analytics && analytics.classes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Attendance by Class</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.classes.map((c) => (
                <div key={c.classId} className="flex items-center justify-between p-4 border rounded-xl">
                  <div>
                    <div className="font-medium">{c.className}</div>
                    <div className="text-sm text-zinc-500">{c.present}/{c.total} sessions attended</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {c.percentage < 75 && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />Low
                      </Badge>
                    )}
                    <div className={`text-xl font-semibold ${c.percentage >= 75 ? "text-emerald-600" : "text-red-600"}`}>
                      {c.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enrolled Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">My Classes</CardTitle>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <p className="text-zinc-400 text-center py-6">You are not enrolled in any classes yet.</p>
          ) : (
            <div className="space-y-2">
              {classes.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{cls.name}</span>
                    {cls.code && <Badge variant="secondary" className="ml-2 text-xs">{cls.code}</Badge>}
                  </div>
                  {cls.semester && <span className="text-sm text-zinc-500">Sem {cls.semester}</span>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
