// app/(routes)/admin/manage/faculty/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { Faculty } from "@/types";

export default function FacultyDetailPage() {
  const params = useParams();
  const facultyId = params.id as string;

  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/faculty?limit=100", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const found = d.data.find((f: Faculty) => f.id === facultyId);
          if (found) setFaculty(found);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [facultyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!faculty) {
    return <div className="text-center py-20 text-zinc-400">Faculty not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/manage/faculty" className="text-zinc-400 hover:text-zinc-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-semibold">{faculty.user.name}</h1>
          <p className="text-zinc-500">
            {faculty.employeeId || "—"} {faculty.designation ? `• ${faculty.designation}` : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-500">Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium">{faculty.user.email}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-500">Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium">{faculty.department?.name || "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-500">Employee ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono font-medium">{faculty.employeeId || "—"}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}