// app/(routes)/admin/classes/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, ChevronRight, Loader2, Users } from "lucide-react";
import type { ClassData } from "@/types";

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ name: "", code: "", semester: "", section: "" });

  const fetchClasses = () => {
    fetch("/api/classes?limit=100", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setClasses(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleCreate = async () => {
    if (!form.name) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          code: form.code || undefined,
          semester: form.semester ? Number(form.semester) : undefined,
          section: form.section || undefined,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm({ name: "", code: "", semester: "", section: "" });
      setIsOpen(false);
      fetchClasses();
    } catch (e: any) {
      setError(e.message || "Failed to create");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Classes</h2>
          <p className="text-zinc-500 text-sm mt-0.5">{classes.length} classes</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-zinc-900 hover:bg-black"><Plus className="w-4 h-4 mr-2" />Create Class</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Create New Class</DialogTitle></DialogHeader>
            <div className="space-y-3 py-4">
              <div className="space-y-1.5"><Label>Class Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Data Structures" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Code (opt)</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CS201" /></div>
                <div className="space-y-1.5"><Label>Semester (opt)</Label><Input type="number" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label>Section (opt)</Label><Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} placeholder="A" /></div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button onClick={handleCreate} className="w-full" disabled={creating}>{creating ? "Creating..." : "Create Class"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {classes.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-zinc-400"><p className="text-lg">No classes yet. Create your first one.</p></CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {classes.map((cls) => (
            <Link key={cls.id} href={`/admin/classes/${cls.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-lg">{cls.name}</div>
                      {cls.code && <Badge variant="secondary" className="text-xs">{cls.code}</Badge>}
                      {cls.section && <Badge variant="outline" className="text-xs">Sec {cls.section}</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-sm text-zinc-500">
                      {cls.semester && <span>Semester {cls.semester}</span>}
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{cls.students?.length || 0} students</span>
                      <span>{cls.teachers?.length || 0} faculty</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-400" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
