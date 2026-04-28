// app/(routes)/faculty/classes/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Loader2, CheckCircle, ClipboardCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { ClassReportModal } from "@/components/ClassReportModal";
import type { ClassData, Session } from "@/types";

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function currentTime(): string {
  return new Date().toTimeString().slice(0, 5);
}

export default function FacultyClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Fix #4: Default date = today, default time = now
  const [form, setForm] = useState({
    date: todayDate(),
    time: currentTime(),
    topic: "",
  });

  const fetchSessions = () => {
    fetch(`/api/sessions?classId=${classId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setSessions(d.data); })
      .catch(() => {});
  };

  useEffect(() => {
    fetch("/api/classes?limit=100", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const found = d.data.find((c: ClassData) => c.id === classId);
          if (found) setClassData(found);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetchSessions();
  }, [classId]);

  const createSession = async () => {
    if (!form.date) return;
    setCreating(true);
    setError("");
    try {
      // Combine date and time into a single ISO string
      const dateTime = form.time
        ? new Date(`${form.date}T${form.time}:00`).toISOString()
        : new Date(form.date).toISOString();

      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          date: dateTime,
          startTime: dateTime,
          topic: form.topic || undefined,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm({ date: todayDate(), time: currentTime(), topic: "" });
      setIsOpen(false);
      toast.success("Session created");
      fetchSessions();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  // Fix #6: Auto-navigate to attendance after completing session
  const completeSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Session completed! Redirecting to attendance...");
      // Auto-navigate to attendance screen
      router.push(`/faculty/sessions/${sessionId}/attendance`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-zinc-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/faculty/dashboard" className="text-zinc-400 hover:text-zinc-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-semibold truncate">{classData?.name || "Class"}</h1>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span>{sessions.length} sessions</span>
              {classData?.code && <Badge variant="secondary" className="text-xs">{classData.code}</Badge>}
            </div>
          </div>
        </div>
        <div>
          <ClassReportModal classId={classId} />
        </div>
      </div>

      {/* Create Session */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-semibold">Sessions</h3>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (open) setForm({ date: todayDate(), time: currentTime(), topic: "" });
        }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-1.5" />Start Session</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Session</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Topic (optional)</Label>
                <Input
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="e.g. Binary Trees"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button onClick={createSession} className="w-full" disabled={creating}>
                {creating ? "Creating..." : "Create Session"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-zinc-400">
            <Clock className="w-10 h-10 mx-auto mb-3 text-zinc-300" />
            <p className="text-lg">No sessions yet</p>
            <p className="text-sm mt-1">Click "Start Session" to create your first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-sm transition-all">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {new Date(session.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    {session.startTime && (
                      <span className="text-xs text-zinc-400">
                        {new Date(session.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                    {session.topic && <span className="text-zinc-500 truncate">— {session.topic}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {session.isCompleted ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-200">
                        In Progress
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  {!session.isCompleted && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => completeSession(session.id)}
                      className="flex-1 sm:flex-none"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />Complete
                    </Button>
                  )}
                  {session.isCompleted && (
                    <Link href={`/faculty/sessions/${session.id}/attendance`} className="flex-1 sm:flex-none">
                      <Button size="sm" className="w-full">
                        <ClipboardCheck className="w-4 h-4 mr-1" />Attendance
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
