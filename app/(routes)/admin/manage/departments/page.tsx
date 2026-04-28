// app/(routes)/admin/manage/departments/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Department } from "@/types";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchDepartments = () => {
    fetch("/api/departments?limit=50", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setDepartments(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const addDepartment = async () => {
    if (!newDeptName) return;
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDeptName, code: newDeptCode || undefined }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNewDeptName("");
      setNewDeptCode("");
      setIsOpen(false);
      fetchDepartments();
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Departments</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-zinc-900 hover:bg-black">
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Department Name"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
              />
              <Input
                placeholder="Department Code (e.g. CSE)"
                value={newDeptCode}
                onChange={(e) => setNewDeptCode(e.target.value)}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button onClick={addDepartment} className="w-full" disabled={creating}>
                {creating ? "Creating..." : "Create Department"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {departments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-zinc-400">
            <p className="text-lg">No departments yet. Create your first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {departments.map((dept) => (
            <Card key={dept.id} className="hover:shadow-md transition-all group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-xl">{dept.name}</div>
                      {dept.code && (
                        <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-600 text-sm font-medium rounded-full">
                          {dept.code}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">
                      Created {new Date(dept.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <Link href={`/admin/manage/departments/${dept.id}`}>
                    <Button variant="outline" size="sm" className="group-hover:bg-blue-50">
                      View <ChevronRight className="ml-1 w-4 h-4" />
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