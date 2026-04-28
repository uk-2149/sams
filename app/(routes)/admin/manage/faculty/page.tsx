// app/(routes)/admin/manage/faculty/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Faculty, Department } from "@/types";

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    departmentId: "",
    designation: "",
  });

  const fetchFaculty = () => {
    fetch("/api/faculty?limit=100", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setFaculty(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFaculty();
    fetch("/api/departments?limit=100", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setDepartments(d.data);
      })
      .catch(() => {});
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          designation: form.designation || undefined,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setForm({ name: "", email: "", password: "", employeeId: "", departmentId: "", designation: "" });
      setIsAddOpen(false);
      fetchFaculty();
    } catch (e: any) {
      setError(e.message || "Failed to create");
    } finally {
      setCreating(false);
    }
  };

  const filtered = faculty.filter(
    (f) =>
      f.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.employeeId || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Faculty Members</h2>
          <p className="text-zinc-500 text-sm mt-0.5">{faculty.length} total</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-zinc-900 hover:bg-black">
              <Plus className="w-4 h-4 mr-2" />
              Add Faculty
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Faculty</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Employee ID</Label>
                <Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} placeholder="e.g. FAC-001" />
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select value={form.departmentId} onValueChange={(v) => setForm({ ...form, departmentId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Designation (optional)</Label>
                <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Professor" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button onClick={handleCreate} className="w-full" disabled={creating}>
                {creating ? "Creating..." : "Create Faculty"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-3 text-zinc-400 w-4 h-4" />
        <Input
          placeholder="Search by name or Employee ID..."
          className="pl-9 h-11"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-zinc-400">
            {faculty.length === 0 ? "No faculty added yet." : "No results found."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((f) => (
            <Link key={f.id} href={`/admin/manage/faculty/${f.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-5 flex items-center gap-4">
                  <Avatar className="w-11 h-11">
                    <AvatarFallback className="bg-blue-50 text-blue-700 font-semibold text-sm">
                      {f.user.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-lg">{f.user.name}</div>
                    <div className="text-sm text-zinc-500 flex gap-2">
                      <span>{f.employeeId || "—"}</span>
                      {f.designation && <><span>•</span><span>{f.designation}</span></>}
                    </div>
                  </div>
                  <div className="text-right">
                    {f.department && (
                      <Badge variant="secondary" className="text-xs">{f.department.name}</Badge>
                    )}
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