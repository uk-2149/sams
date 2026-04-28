// app/(routes)/admin/manage/departments/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Department, Program, Faculty } from "@/types";

export default function DepartmentDetailPage() {
  const params = useParams();
  const departmentId = params.id as string;

  const [department, setDepartment] = useState<Department | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  const [newProgramName, setNewProgramName] = useState("");
  const [newProgramDuration, setNewProgramDuration] = useState("");
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch department info from the departments list
    fetch("/api/departments?limit=100", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const dept = d.data.find((dep: Department) => dep.id === departmentId);
          if (dept) setDepartment(dept);
        }
      })
      .catch(() => {});

    // Fetch programs for this department
    fetch("/api/departments/programs?limit=100", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setPrograms(d.data.filter((p: Program) => p.departmentId === departmentId));
        }
      })
      .catch(() => {});

    // Fetch faculty
    fetch("/api/faculty?limit=100", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setFaculty(d.data.filter((f: Faculty) => f.departmentId === departmentId));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [departmentId]);

  const addProgram = async () => {
    if (!newProgramName) return;
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/departments/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProgramName,
          durationYears: newProgramDuration ? Number(newProgramDuration) : undefined,
          departmentId,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNewProgramName("");
      setNewProgramDuration("");
      setIsProgramDialogOpen(false);

      // Re-fetch programs
      const r = await fetch("/api/departments/programs?limit=100", { credentials: "include" });
      const d = await r.json();
      if (d.success) {
        setPrograms(d.data.filter((p: Program) => p.departmentId === departmentId));
      }
    } catch (e: any) {
      setError(e.message || "Failed to create");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/manage/departments" className="text-zinc-400 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {department?.name || "Department"}
            </h1>
            {department?.code && (
              <Badge variant="outline" className="text-sm px-3">
                {department.code}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="py-6 text-center">
            <div className="text-3xl font-semibold text-blue-600">{programs.length}</div>
            <p className="text-sm text-zinc-500 mt-1">Programs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6 text-center">
            <div className="text-3xl font-semibold text-emerald-600">{faculty.length}</div>
            <p className="text-sm text-zinc-500 mt-1">Faculty Members</p>
          </CardContent>
        </Card>
      </div>

      {/* Programs Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Programs</CardTitle>
          <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Program
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Program</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Program Name (e.g. B.Tech CSE)"
                  value={newProgramName}
                  onChange={(e) => setNewProgramName(e.target.value)}
                />
                <Input
                  placeholder="Duration in years (e.g. 4)"
                  type="number"
                  value={newProgramDuration}
                  onChange={(e) => setNewProgramDuration(e.target.value)}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button onClick={addProgram} className="w-full" disabled={creating}>
                  {creating ? "Creating..." : "Create Program"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {programs.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">No programs yet.</p>
          ) : (
            <div className="space-y-3">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className="flex items-center justify-between p-4 border rounded-xl hover:border-blue-200 transition-all"
                >
                  <div>
                    <h3 className="font-medium text-lg">{program.name}</h3>
                    {program.durationYears && (
                      <p className="text-sm text-zinc-500">{program.durationYears} years</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Faculty Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Faculty Members</CardTitle>
        </CardHeader>
        <CardContent>
          {faculty.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">No faculty in this department yet.</p>
          ) : (
            <div className="space-y-3">
              {faculty.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-4 border rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <span className="font-semibold text-blue-700 text-sm">
                        {f.user.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{f.user.name}</div>
                      <div className="text-sm text-zinc-500">
                        {f.employeeId} {f.designation ? `• ${f.designation}` : ""}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}