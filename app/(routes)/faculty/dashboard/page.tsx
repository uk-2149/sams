// app/(routes)/faculty/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Users } from "lucide-react";
import type { ClassData, Session } from "@/types";

export default function FacultyDashboardPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/classes?limit=50", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setClasses(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">My Classes</h2>
        <p className="text-zinc-500 mt-1">{classes.length} assigned classes</p>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-zinc-400">
            <p className="text-lg">No classes assigned to you yet.</p>
            <p className="text-sm mt-1">Ask your university admin to assign classes.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-xl">{cls.name}</h3>
                      {cls.code && <Badge variant="secondary" className="text-xs">{cls.code}</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-sm text-zinc-500">
                      {cls.semester && <span>Semester {cls.semester}</span>}
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{cls.students?.length || 0} students</span>
                    </div>
                  </div>
                  <Link href={`/faculty/classes/${cls.id}`}>
                    <Button>
                      <Play className="w-4 h-4 mr-1.5" />
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
