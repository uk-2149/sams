// app/(routes)/admin/classes/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, CheckCircle, Clock, Users, Calendar, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { ClassReportModal } from "@/components/ClassReportModal";
import type { ClassData, Faculty, StudentProfile, ClassAnalytics, Session, Department, Program, Batch } from "@/types";

export default function ClassDetailPage() {
  const params = useParams();
  const classId = params.id as string;

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [allFaculty, setAllFaculty] = useState<Faculty[]>([]);
  const [allStudents, setAllStudents] = useState<StudentProfile[]>([]);
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const [assignTeacherId, setAssignTeacherId] = useState("");
  const [enrollStudentIds, setEnrollStudentIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterBatch, setFilterBatch] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchClass = () => {
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
  };

  const fetchSessions = () => {
    fetch(`/api/sessions?classId=${classId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setSessions(d.data); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchClass();
    fetchSessions();

    fetch("/api/faculty?limit=200", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setAllFaculty(d.data); })
      .catch(() => {});

    fetch("/api/students?limit=200", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setAllStudents(d.data); })
      .catch(() => {});

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

    fetch(`/api/analytics/class/${classId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setAnalytics(d.data); })
      .catch(() => {});
  }, [classId]);

  const assignFaculty = async () => {
    if (!assignTeacherId) return;
    setAssigning(true);
    setError("");
    try {
      const res = await fetch(`/api/classes/${classId}/assign_faculty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: assignTeacherId, isPrimary: false }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAssignTeacherId("");
      toast.success("Faculty assigned");
      fetchClass();
    } catch (e: any) {
      toast.error(e.message);
      setError(e.message);
    } finally {
      setAssigning(false);
    }
  };

  const enrollStudents = async (studentIdToEnroll?: string) => {
    const idsToEnroll = studentIdToEnroll ? [studentIdToEnroll] : enrollStudentIds;
    if (idsToEnroll.length === 0) return;
    setEnrolling(true);
    setError("");
    try {
      const res = await fetch(`/api/classes/${classId}/enroll_students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: idsToEnroll }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEnrollStudentIds([]);
      setIsEnrollOpen(false);
      toast.success("Student enrolled");
      fetchClass();
    } catch (e: any) {
      toast.error(e.message);
      setError(e.message);
    } finally {
      setEnrolling(false);
    }
  };

  const filteredStudents = allStudents.filter((s) => {
    const matchSearch = s.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.rollNumber.includes(searchTerm);
    const matchDept = filterDepartment === "all" || s.batch?.program?.department?.id === filterDepartment;
    const matchProg = filterProgram === "all" || s.batch?.program?.id === filterProgram;
    const matchBatch = filterBatch === "all" || s.batch?.year === filterBatch;
    return matchSearch && matchDept && matchProg && matchBatch;
  });

  const uniqueBatchYears = Array.from(new Set(batches.map((b) => b.year)));

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="h-10 w-64 bg-zinc-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-zinc-100 rounded-xl animate-pulse" />)}
        </div>
        {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-zinc-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  if (!classData) {
    return <div className="text-center py-20 text-zinc-400">Class not found.</div>;
  }

  const completedSessions = sessions.filter((s) => s.isCompleted).length;
  const pendingSessions = sessions.length - completedSessions;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/classes" className="text-zinc-400 hover:text-zinc-900"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl md:text-3xl font-semibold truncate">{classData.name}</h1>
              {classData.code && <Badge variant="secondary">{classData.code}</Badge>}
              {classData.section && <Badge variant="outline">Sec {classData.section}</Badge>}
            </div>
            <p className="text-zinc-500 text-sm mt-0.5">
              {classData.students?.length || 0} students • {classData.teachers?.length || 0} faculty
              {classData.semester ? ` • Sem ${classData.semester}` : ""}
            </p>
          </div>
        </div>
        <div>
          <ClassReportModal classId={classId} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="py-4 text-center">
            <Calendar className="w-5 h-5 text-zinc-400 mx-auto mb-1" />
            <div className="text-2xl font-semibold">{sessions.length}</div>
            <p className="text-xs text-zinc-500">Total Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <div className="text-2xl font-semibold text-emerald-600">{completedSessions}</div>
            <p className="text-xs text-zinc-500">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Users className="w-5 h-5 text-zinc-400 mx-auto mb-1" />
            <div className="text-2xl font-semibold">{analytics?.totalStudents || 0}</div>
            <p className="text-xs text-zinc-500">Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <div className={`text-2xl font-semibold ${(analytics?.overallPercentage ?? 0) >= 75 ? "text-emerald-600" : "text-red-600"}`}>
              {analytics?.overallPercentage ?? "—"}%
            </div>
            <p className="text-xs text-zinc-500">Avg Attendance</p>
          </CardContent>
        </Card>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}

      {/* Sessions — Fix #2 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-zinc-400" /> Sessions ({sessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-zinc-400 text-center py-6">No sessions yet.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {sessions.map((session) => (
                <div key={session.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm">
                        {new Date(session.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      {session.startTime && (
                        <span className="text-xs text-zinc-400">
                          {new Date(session.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                      {session.topic && <span className="text-zinc-500 text-sm truncate">— {session.topic}</span>}
                    </div>
                    <div className="mt-1">
                      {session.isCompleted ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px]">Completed</Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 text-[10px]">Pending</Badge>
                      )}
                    </div>
                  </div>
                  {session.isCompleted && (
                    <Link href={`/faculty/sessions/${session.id}/attendance`}>
                      <Button size="sm" variant="outline" className="gap-1">
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span className="text-xs">View Attendance</span>
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Faculty */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-lg">Assigned Faculty</CardTitle>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={assignTeacherId} onValueChange={setAssignTeacherId}>
              <SelectTrigger className="w-full sm:w-52"><SelectValue placeholder="Select faculty" /></SelectTrigger>
              <SelectContent>
                {allFaculty.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.user.name} ({f.employeeId})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={assignFaculty} disabled={assigning || !assignTeacherId}>
              {assigning ? "..." : "Assign"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {classData.teachers && classData.teachers.length > 0 ? (
            <div className="space-y-2">
              {classData.teachers.map((ct) => (
                <div key={ct.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{ct.teacher.user.name}</span>
                  <div className="flex gap-2">
                    {ct.teacher.employeeId && <Badge variant="outline">{ct.teacher.employeeId}</Badge>}
                    {ct.isPrimary && <Badge>Primary</Badge>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400 text-center py-4">No faculty assigned yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Enrolled Students with Attendance */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-lg">Enrolled Students ({classData.students?.length || 0})</CardTitle>
          <div className="flex gap-2 w-full sm:w-auto">
            <Dialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen}>
              <DialogTrigger asChild>
                <Button size="sm">Enroll Student</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Enroll Student</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4 overflow-hidden">
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      placeholder="Search name or roll..."
                      className="flex h-9 w-full sm:w-auto rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                      <SelectTrigger className="w-full sm:w-[140px] h-9"><SelectValue placeholder="Department" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Depts</SelectItem>
                        {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filterProgram} onValueChange={setFilterProgram}>
                      <SelectTrigger className="w-full sm:w-[140px] h-9"><SelectValue placeholder="Program" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Programs</SelectItem>
                        {programs.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filterBatch} onValueChange={setFilterBatch}>
                      <SelectTrigger className="w-full sm:w-[120px] h-9"><SelectValue placeholder="Batch" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Batches</SelectItem>
                        {uniqueBatchYears.map((year) => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {filteredStudents.length > 0 && (
                    <div className="flex justify-between items-center bg-zinc-50 p-2 px-3 rounded-md border">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="select-all"
                          checked={filteredStudents.every(s => enrollStudentIds.includes(s.id) || analytics?.students.some(e => e.studentId === s.id))}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              const newSelected = filteredStudents.filter(s => !analytics?.students.some(e => e.studentId === s.id)).map(s => s.id);
                              setEnrollStudentIds([...new Set([...enrollStudentIds, ...newSelected])]);
                            } else {
                              const filteredIds = filteredStudents.map(s => s.id);
                              setEnrollStudentIds(enrollStudentIds.filter(id => !filteredIds.includes(id)));
                            }
                          }}
                        />
                        <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">Select All</label>
                      </div>
                      <Button 
                        size="sm" 
                        disabled={enrollStudentIds.length === 0 || enrolling}
                        onClick={() => enrollStudents()}
                      >
                        {enrolling ? "Enrolling..." : `Enroll Selected (${enrollStudentIds.length})`}
                      </Button>
                    </div>
                  )}

                  <div className="overflow-y-auto pr-2 space-y-2 flex-1">
                    {filteredStudents.length === 0 ? (
                      <p className="text-zinc-400 text-center py-4 text-sm">No students found.</p>
                    ) : (
                      filteredStudents.map((s) => {
                        const isEnrolled = analytics?.students.some((enrolled) => enrolled.studentId === s.id);
                        return (
                          <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-zinc-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <Checkbox 
                                checked={isEnrolled || enrollStudentIds.includes(s.id)}
                                disabled={isEnrolled || enrolling}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setEnrollStudentIds([...enrollStudentIds, s.id]);
                                  } else {
                                    setEnrollStudentIds(enrollStudentIds.filter(id => id !== s.id));
                                  }
                                }}
                              />
                              <div>
                                <p className="font-medium text-sm">{s.user.name}</p>
                                <p className="text-xs text-zinc-500">{s.rollNumber} • {s.batch?.program?.name} • {s.batch?.year}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant={isEnrolled ? "outline" : "default"}
                              disabled={isEnrolled || enrolling}
                              onClick={() => {
                                enrollStudents(s.id);
                              }}
                              className={isEnrolled ? "opacity-50" : ""}
                            >
                              {isEnrolled ? "Enrolled" : "Enroll"}
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {analytics && analytics.students.length > 0 ? (
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {analytics.students.map((s) => (
                <div key={s.studentId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${s.percentage >= 75 ? "bg-emerald-500" : "bg-red-500"}`} />
                    <span className="font-medium text-sm">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400">{s.present}/{s.total}</span>
                    <div className={`font-semibold text-sm ${s.percentage >= 75 ? "text-emerald-600" : "text-red-600"}`}>
                      {s.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400 text-center py-4">No students enrolled yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
