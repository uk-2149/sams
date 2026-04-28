// app/(routes)/faculty/sessions/[id]/attendance/page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Check, X, Loader2, Send, Smartphone,
  RotateCcw, Lock, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useAttendanceStore } from "@/stores/attendance";

type Status = "PRESENT" | "ABSENT" | null;
type DisplayMode = "name" | "roll" | "both";

export default function AttendanceMarkingPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const store = useAttendanceStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [canEdit, setCanEdit] = useState(true);
  const [daysOld, setDaysOld] = useState(0);

  useEffect(() => {
    store.reset();
    store.setSessionMeta(sessionId, null);

    // Fetch existing attendance
    fetch(`/api/attendance/${sessionId}?sessionId=${sessionId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data && d.data.length > 0) {
          store.hydrate(
            d.data.map((a: any) => ({
              studentId: a.studentId,
              name: a.student?.user?.name || "—",
              rollNumber: a.student?.rollNumber || "—",
              status: a.status as Status,
            }))
          );

          // Check 15-day rule for faculty editing
          if (d.data[0]?.session?.date) {
            const sessionDate = new Date(d.data[0].session.date);
            const daysDiff = Math.floor((Date.now() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
            setDaysOld(daysDiff);
            setCanEdit(daysDiff <= 15);
            store.setSessionMeta(sessionId, d.data[0].session.date);
          }
          setLoading(false);
          return;
        }
        return fetchClassStudents();
      })
      .catch(() => fetchClassStudents());

    return () => store.reset();
  }, [sessionId]);

  const fetchClassStudents = async () => {
    try {
      const classesRes = await fetch("/api/classes?limit=100", { credentials: "include" });
      const classesData = await classesRes.json();
      if (!classesData.success) { setLoading(false); return; }

      for (const cls of classesData.data) {
        const sRes = await fetch(`/api/sessions?classId=${cls.id}`, { credentials: "include" });
        const sData = await sRes.json();
        if (sData.success) {
          const found = sData.data.find((s: any) => s.id === sessionId);
          if (found) {
            store.setSessionMeta(sessionId, found.date);
            const aRes = await fetch(`/api/analytics/class/${cls.id}`, { credentials: "include" });
            const aData = await aRes.json();
            if (aData.success) {
              store.setStudents(
                aData.data.students.map((s: any) => ({
                  studentId: s.studentId,
                  name: s.name,
                  rollNumber: s.rollNumber || "—",
                }))
              );
            }
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const records = Object.entries(store.statusMap)
      .filter(([, status]) => status !== null)
      .map(([studentId, status]) => ({ studentId, status: status! }));

    if (records.length === 0) {
      setError("Please mark at least one student.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, records }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      store.setSubmitted(true);
      toast.success(`Attendance submitted for ${records.length} students`);
    } catch (e: any) {
      setError(e.message || "Failed to submit");
      toast.error(e.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAttendance = () => {
    if (!canEdit) {
      toast.error("Editing window expired (15 days passed)");
      return;
    }
    store.setEditing(true);
    toast.info("You can now update attendance");
  };

  const presentCount = store.presentCount();
  const absentCount = store.absentCount();
  const unmarkedCount = store.unmarkedCount();
  const isInteractive = !store.isSubmitted || store.isEditing;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-12 bg-zinc-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-zinc-100 rounded-xl animate-pulse" />)}
        </div>
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 bg-zinc-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  // Swipe mode
  if (store.isSwipeMode) {
    return (
      <SwipeMode
        onExit={() => store.toggleSwipeMode()}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-20">
      {/* Header — sticky */}
      <div className="sticky top-0 z-10 bg-zinc-50 pb-3 -mx-4 px-4 md:-mx-6 md:px-6 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-zinc-400 hover:text-zinc-900 p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg md:text-2xl font-semibold">
                {store.isEditing ? "Update Attendance" : store.isSubmitted ? "Attendance" : "Mark Attendance"}
              </h1>
              <p className="text-sm text-zinc-500">{store.students.length} students</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {store.isSubmitted && !store.isEditing && (
              <Badge className="bg-emerald-100 text-emerald-700 text-sm px-3 py-1 hidden sm:flex">
                ✓ Completed
              </Badge>
            )}
            {/* Swipe mode toggle */}
            {isInteractive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => store.toggleSwipeMode()}
                className="gap-1.5"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Swipe Mode</span>
              </Button>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl py-2.5 text-center">
            <div className="text-xl font-semibold text-emerald-600">{presentCount}</div>
            <p className="text-[11px] text-emerald-600">Present</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl py-2.5 text-center">
            <div className="text-xl font-semibold text-red-600">{absentCount}</div>
            <p className="text-[11px] text-red-600">Absent</p>
          </div>
          <div className="bg-zinc-50 border rounded-xl py-2.5 text-center">
            <div className="text-xl font-semibold text-zinc-400">{unmarkedCount}</div>
            <p className="text-[11px] text-zinc-500">Unmarked</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      {isInteractive && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => store.markAll("PRESENT")} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
              All Present
            </Button>
            <Button variant="outline" size="sm" onClick={() => store.markAll("ABSENT")} className="text-red-600 border-red-200 hover:bg-red-50">
              All Absent
            </Button>
            <Button variant="outline" size="sm" onClick={() => store.markAll(null)}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" />Reset
            </Button>
          </div>
          <div className="flex bg-zinc-100 rounded-lg p-0.5">
            {(["name", "roll", "both"] as DisplayMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => store.setDisplayMode(mode)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  store.displayMode === mode ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500"
                }`}
              >
                {mode === "name" ? "Name" : mode === "roll" ? "Roll" : "Both"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Update attendance button (when submitted but editable) */}
      {store.isSubmitted && !store.isEditing && (
        <div className="space-y-2">
          {canEdit ? (
            <Button onClick={handleUpdateAttendance} variant="outline" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Update Attendance
            </Button>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-zinc-100 rounded-xl text-zinc-500 text-sm">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span>Editing window expired ({daysOld} days since session — max 15 days)</span>
            </div>
          )}
        </div>
      )}

      {/* Student List */}
      <div className="space-y-1.5">
        {store.students.map((student, index) => {
          const status = store.statusMap[student.studentId];
          return (
            <button
              key={student.studentId}
              onClick={() => isInteractive && store.cycleStatus(student.studentId)}
              disabled={!isInteractive}
              className={`w-full flex items-center justify-between p-3 md:p-4 rounded-xl border-2 transition-all ${
                status === "PRESENT"
                  ? "border-emerald-300 bg-emerald-50"
                  : status === "ABSENT"
                  ? "border-red-300 bg-red-50"
                  : "border-zinc-200 bg-white"
              } ${isInteractive ? "cursor-pointer hover:shadow-sm active:scale-[0.995]" : "cursor-default"}`}
            >
              <div className="flex items-center gap-3">
                {/* Status indicator dot */}
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  status === "PRESENT" ? "bg-emerald-500" :
                  status === "ABSENT" ? "bg-red-500" :
                  "bg-zinc-300"
                }`} />
                <span className="text-sm font-mono text-zinc-400 w-5">{index + 1}</span>
                <div className="text-left">
                  {(store.displayMode === "name" || store.displayMode === "both") && (
                    <div className="font-medium text-sm md:text-base">{student.name}</div>
                  )}
                  {(store.displayMode === "roll" || store.displayMode === "both") && (
                    <div className={`font-mono text-sm ${store.displayMode === "both" ? "text-zinc-500" : "font-medium text-zinc-900"}`}>
                      {student.rollNumber}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {status === "PRESENT" && (
                  <span className="flex items-center gap-1 text-emerald-600 font-medium text-sm">
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">Present</span>
                  </span>
                )}
                {status === "ABSENT" && (
                  <span className="flex items-center gap-1 text-red-600 font-medium text-sm">
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Absent</span>
                  </span>
                )}
                {status === null && isInteractive && (
                  <span className="text-zinc-400 text-xs">Tap</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Submit / Update Button — sticky */}
      {isInteractive && (
        <div className="fixed bottom-0 left-0 right-0 md:sticky md:bottom-4 p-4 md:p-0 bg-zinc-50 md:bg-transparent">
          {error && <p className="text-sm text-red-500 mb-2 text-center">{error}</p>}
          <Button
            onClick={handleSubmit}
            disabled={submitting || unmarkedCount === store.students.length}
            className="w-full h-12 md:h-14 text-base md:text-lg font-semibold bg-zinc-900 hover:bg-black rounded-2xl"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Send className="w-5 h-5 mr-2" />
            )}
            {submitting
              ? "Submitting..."
              : store.isEditing
              ? `Update (${presentCount + absentCount}/${store.students.length})`
              : `Submit (${presentCount + absentCount}/${store.students.length})`
            }
          </Button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SWIPE MODE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function SwipeMode({ onExit }: { onExit: () => void }) {
  const store = useAttendanceStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [exiting, setExiting] = useState<"left" | "right" | "up" | null>(null);

  const currentStudent = store.students[store.swipeIndex];
  const isComplete = store.swipeIndex >= store.students.length;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragX(e.clientX - startPos.x);
    setDragY(e.clientY - startPos.y);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 80;

    if (dragX > threshold) {
      // Right swipe → PRESENT
      setExiting("right");
      setTimeout(() => {
        store.swipeStudent("PRESENT");
        resetCard();
      }, 200);
    } else if (dragX < -threshold) {
      // Left swipe → ABSENT
      setExiting("left");
      setTimeout(() => {
        store.swipeStudent("ABSENT");
        resetCard();
      }, 200);
    } else if (dragY < -threshold) {
      // Up swipe → SKIP
      setExiting("up");
      setTimeout(() => {
        store.skipStudent();
        resetCard();
      }, 200);
    } else {
      resetCard();
    }
  };

  const resetCard = () => {
    setDragX(0);
    setDragY(0);
    setExiting(null);
  };

  const rotation = dragX * 0.08;
  const opacity = Math.max(0, 1 - Math.abs(dragX) / 300);
  const presentOpacity = Math.max(0, dragX / 150);
  const absentOpacity = Math.max(0, -dragX / 150);

  return (
    <div className="fixed inset-0 bg-zinc-900 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <button onClick={onExit} className="text-zinc-400 hover:text-white p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-sm text-zinc-400">Swipe Attendance</p>
          <p className="font-semibold">
            {isComplete ? "Done!" : `${store.swipeIndex + 1} / ${store.students.length}`}
          </p>
        </div>
        <div className="w-9" />
      </div>

      {/* Progress bar */}
      <div className="px-6">
        <div className="w-full bg-zinc-800 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all"
            style={{ width: `${(store.swipeIndex / store.students.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-6 py-4 text-sm">
        <span className="text-emerald-400">✓ {store.presentCount()}</span>
        <span className="text-red-400">✗ {store.absentCount()}</span>
        <span className="text-zinc-500">{store.students.length - store.swipeIndex} left</span>
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center px-6">
        {isComplete ? (
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-semibold text-white">All Done!</h2>
            <p className="text-zinc-400">
              {store.presentCount()} present, {store.absentCount()} absent
            </p>
            <Button onClick={onExit} className="mt-4">
              Back to Attendance
            </Button>
          </div>
        ) : currentStudent ? (
          <div className="relative w-full max-w-sm">
            {/* Next card (behind) */}
            {store.students[store.swipeIndex + 1] && (
              <div className="absolute inset-0 bg-zinc-800 rounded-3xl scale-95 opacity-50" />
            )}

            {/* Current card */}
            <div
              ref={cardRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative bg-white rounded-3xl p-8 select-none touch-none cursor-grab active:cursor-grabbing"
              style={{
                transform: exiting
                  ? exiting === "right" ? "translateX(120%) rotate(20deg)"
                  : exiting === "left" ? "translateX(-120%) rotate(-20deg)"
                  : "translateY(-120%)"
                  : `translateX(${dragX}px) translateY(${dragY}px) rotate(${rotation}deg)`,
                opacity: exiting ? 0 : opacity,
                transition: isDragging ? "none" : "all 0.3s ease-out",
              }}
            >
              {/* PRESENT overlay */}
              <div
                className="absolute top-6 right-6 text-emerald-500 font-bold text-xl border-4 border-emerald-500 rounded-lg px-3 py-1 rotate-12"
                style={{ opacity: presentOpacity }}
              >
                PRESENT
              </div>

              {/* ABSENT overlay */}
              <div
                className="absolute top-6 left-6 text-red-500 font-bold text-xl border-4 border-red-500 rounded-lg px-3 py-1 -rotate-12"
                style={{ opacity: absentOpacity }}
              >
                ABSENT
              </div>

              <div className="text-center py-8 space-y-3">
                {/* Avatar */}
                <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-semibold text-blue-600">
                    {currentStudent.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>

                <h2 className="text-2xl font-semibold text-zinc-900">{currentStudent.name}</h2>
                <p className="text-zinc-500 font-mono">{currentStudent.rollNumber}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Swipe hints */}
      {!isComplete && (
        <div className="flex justify-between px-12 py-6 text-sm text-zinc-600">
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <X className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-red-400">Absent</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
              <ChevronUp className="w-5 h-5 text-zinc-400" />
            </div>
            <span className="text-zinc-400">Skip</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-emerald-400">Present</span>
          </div>
        </div>
      )}
    </div>
  );
}
