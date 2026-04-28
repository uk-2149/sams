// app/(routes)/admin/manage/student/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { StudentProfile, StudentAnalytics } from "@/types";

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch student data
    fetch("/api/students?limit=100", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const found = d.data.find((s: StudentProfile) => s.id === studentId);
          if (found) setStudent(found);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch analytics
    fetch(`/api/analytics/student/${studentId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAnalytics(d.data);
      })
      .catch(() => {});
  }, [studentId]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>;
  }

  if (!student) {
    return <div className="text-center py-20 text-zinc-400">Student not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/manage/student" className="text-zinc-400 hover:text-zinc-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-semibold">{student.user.name}</h1>
          <p className="text-zinc-500 font-mono">{student.rollNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-500">Attendance</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-emerald-600">{analytics?.percentage ?? "—"}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-500">Total Sessions</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{analytics?.totalSessions ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-500">Present</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-emerald-600">{analytics?.present ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-500">Absent</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-red-600">
              {analytics ? analytics.totalSessions - analytics.present : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle className="text-lg">Personal Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><p className="text-xs text-zinc-400">Email</p><p className="font-medium">{student.user.email}</p></div>
            <div><p className="text-xs text-zinc-400">Roll Number</p><p className="font-mono font-medium">{student.rollNumber}</p></div>
            <div><p className="text-xs text-zinc-400">Enrollment Year</p><p className="font-medium">{student.enrollmentYear}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Academic Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><p className="text-xs text-zinc-400">Program</p><p className="font-medium">{student.batch?.program?.name || "—"}</p></div>
            <div><p className="text-xs text-zinc-400">Batch</p><p className="font-medium">{student.batch?.year || "—"}</p></div>
            {student.currentSemester && (
              <div><p className="text-xs text-zinc-400">Current Semester</p><p className="font-medium">{student.currentSemester}</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per-class breakdown */}
      {analytics && analytics.classes.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Attendance by Class</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.classes.map((c) => (
                <div key={c.classId} className="flex items-center justify-between p-3 border rounded-xl">
                  <div>
                    <div className="font-medium">{c.className}</div>
                    <div className="text-sm text-zinc-500">{c.present}/{c.total} sessions</div>
                  </div>
                  <div className={`text-xl font-semibold ${c.percentage >= 75 ? "text-emerald-600" : "text-red-600"}`}>
                    {c.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}