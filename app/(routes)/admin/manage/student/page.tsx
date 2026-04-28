// app/(routes)/admin/manage/student/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Loader2 } from "lucide-react";
import type { StudentProfile, Batch, Department, Program } from "@/types";

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterBatch, setFilterBatch] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", password: "", rollNumber: "", batchId: "",
    enrollmentYear: new Date().getFullYear().toString(), currentSemester: "",
  });

  const fetchStudents = () => {
    fetch("/api/students?limit=100", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setStudents(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
    fetch("/api/batches?limit=100", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setBatches(d.data); })
      .catch(() => {});
    fetch("/api/departments?limit=100", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setDepartments(d.data); })
      .catch(() => {});
    fetch("/api/departments/programs?limit=100", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setPrograms(d.data); })
      .catch(() => {});
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email, password: form.password,
          rollNumber: form.rollNumber, batchId: form.batchId,
          enrollmentYear: Number(form.enrollmentYear),
          currentSemester: form.currentSemester ? Number(form.currentSemester) : undefined,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm({ name: "", email: "", password: "", rollNumber: "", batchId: "", enrollmentYear: new Date().getFullYear().toString(), currentSemester: "" });
      setIsAddOpen(false);
      fetchStudents();
    } catch (e: any) {
      setError(e.message || "Failed to create");
    } finally {
      setCreating(false);
    }
  };

  const filtered = students.filter((s) => {
    const matchSearch = s.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.rollNumber.includes(searchTerm);
    const matchDept = filterDepartment === "all" || s.batch?.program?.department?.id === filterDepartment;
    const matchProg = filterProgram === "all" || s.batch?.program?.id === filterProgram;
    const matchBatch = filterBatch === "all" || s.batch?.year === filterBatch;
    return matchSearch && matchDept && matchProg && matchBatch;
  });

  const uniqueBatchYears = Array.from(new Set(batches.map((b) => b.year)));

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Students</h2>
          <p className="text-zinc-500 text-sm mt-0.5">{students.length} total</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-zinc-900 hover:bg-black"><Plus className="w-4 h-4 mr-2" />Add Student</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
            <div className="space-y-3 py-4">
              <div className="space-y-1.5"><Label>Full Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Roll Number</Label><Input value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} placeholder="e.g. 22051001" /></div>
              <div className="space-y-1.5">
                <Label>Batch</Label>
                <Select value={form.batchId} onValueChange={(v) => setForm({ ...form, batchId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                  <SelectContent>
                    {batches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.year} {b.program ? `— ${b.program.name}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Enrollment Year</Label><Input type="number" value={form.enrollmentYear} onChange={(e) => setForm({ ...form, enrollmentYear: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Semester (opt)</Label><Input type="number" value={form.currentSemester} onChange={(e) => setForm({ ...form, currentSemester: e.target.value })} /></div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button onClick={handleCreate} className="w-full" disabled={creating}>{creating ? "Creating..." : "Create Student"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 text-zinc-400 w-4 h-4" />
          <Input placeholder="Search by name or roll number..." className="pl-9 h-11" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Depts</SelectItem>
              {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterProgram} onValueChange={setFilterProgram}>
            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Program" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programs.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterBatch} onValueChange={setFilterBatch}>
            <SelectTrigger className="w-full sm:w-[120px]"><SelectValue placeholder="Batch" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {uniqueBatchYears.map((year) => <SelectItem key={year} value={year}>{year}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-zinc-400">{students.length === 0 ? "No students added yet." : "No results found."}</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((s) => (
            <Link key={s.id} href={`/admin/manage/student/${s.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-5 flex items-center gap-4">
                  <Avatar className="w-11 h-11">
                    <AvatarFallback className="bg-emerald-50 text-emerald-700 font-semibold text-sm">
                      {s.user.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-lg">{s.user.name}</div>
                    <div className="text-sm text-zinc-500 flex gap-2">
                      <span className="font-mono">{s.rollNumber}</span>
                      {s.batch?.program && <><span>•</span><span>{s.batch.program.name}</span></>}
                      {s.batch && <><span>•</span><span>{s.batch.year}</span></>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}