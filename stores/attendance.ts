import { create } from "zustand";

type Status = "PRESENT" | "ABSENT" | null;
type DisplayMode = "name" | "roll" | "both";

export interface StudentEntry {
  studentId: string;
  name: string;
  rollNumber: string;
}

interface AttendanceState {
  // Core data
  statusMap: Record<string, Status>;
  students: StudentEntry[];
  displayMode: DisplayMode;

  // Session metadata
  sessionId: string | null;
  isSubmitted: boolean;
  isEditing: boolean;
  sessionDate: string | null;

  // Swipe mode
  swipeIndex: number;
  isSwipeMode: boolean;

  // Actions
  setStudents: (students: StudentEntry[]) => void;
  setSessionMeta: (id: string, date: string | null) => void;
  setStatus: (studentId: string, status: Status) => void;
  cycleStatus: (studentId: string) => void;
  markAll: (status: Status) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setSubmitted: (v: boolean) => void;
  setEditing: (v: boolean) => void;

  // Swipe
  toggleSwipeMode: () => void;
  swipeStudent: (status: Status) => void;
  skipStudent: () => void;
  setSwipeIndex: (i: number) => void;

  // Derived
  presentCount: () => number;
  absentCount: () => number;
  unmarkedCount: () => number;

  // Reset
  reset: () => void;

  // Hydrate from existing attendance
  hydrate: (records: { studentId: string; name: string; rollNumber: string; status: Status }[]) => void;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  statusMap: {},
  students: [],
  displayMode: "both",
  sessionId: null,
  isSubmitted: false,
  isEditing: false,
  sessionDate: null,
  swipeIndex: 0,
  isSwipeMode: false,

  setStudents: (students) => {
    const statusMap: Record<string, Status> = {};
    students.forEach((s) => (statusMap[s.studentId] = null));
    set({ students, statusMap });
  },

  setSessionMeta: (id, date) => set({ sessionId: id, sessionDate: date }),

  setStatus: (studentId, status) =>
    set((state) => ({
      statusMap: { ...state.statusMap, [studentId]: status },
    })),

  cycleStatus: (studentId) =>
    set((state) => {
      const current = state.statusMap[studentId];
      let next: Status;
      if (current === null) next = "PRESENT";
      else if (current === "PRESENT") next = "ABSENT";
      else next = null;
      return { statusMap: { ...state.statusMap, [studentId]: next } };
    }),

  markAll: (status) =>
    set((state) => {
      const statusMap = { ...state.statusMap };
      Object.keys(statusMap).forEach((k) => (statusMap[k] = status));
      return { statusMap };
    }),

  setDisplayMode: (mode) => set({ displayMode: mode }),
  setSubmitted: (v) => set({ isSubmitted: v }),
  setEditing: (v) => set({ isEditing: v, isSubmitted: !v }),

  toggleSwipeMode: () =>
    set((state) => ({ isSwipeMode: !state.isSwipeMode, swipeIndex: 0 })),

  swipeStudent: (status) =>
    set((state) => {
      const student = state.students[state.swipeIndex];
      if (!student) return state;
      const newIndex = Math.min(state.swipeIndex + 1, state.students.length);
      return {
        statusMap: { ...state.statusMap, [student.studentId]: status },
        swipeIndex: newIndex,
      };
    }),

  skipStudent: () =>
    set((state) => {
      // Move current student to end
      const student = state.students[state.swipeIndex];
      if (!student) return state;
      const newStudents = [...state.students];
      newStudents.splice(state.swipeIndex, 1);
      newStudents.push(student);
      return { students: newStudents };
    }),

  setSwipeIndex: (i) => set({ swipeIndex: i }),

  presentCount: () =>
    Object.values(get().statusMap).filter((s) => s === "PRESENT").length,
  absentCount: () =>
    Object.values(get().statusMap).filter((s) => s === "ABSENT").length,
  unmarkedCount: () =>
    Object.values(get().statusMap).filter((s) => s === null).length,

  reset: () =>
    set({
      statusMap: {},
      students: [],
      sessionId: null,
      isSubmitted: false,
      isEditing: false,
      sessionDate: null,
      swipeIndex: 0,
      isSwipeMode: false,
    }),

  hydrate: (records) => {
    const students: StudentEntry[] = records.map((r) => ({
      studentId: r.studentId,
      name: r.name,
      rollNumber: r.rollNumber,
    }));
    const statusMap: Record<string, Status> = {};
    records.forEach((r) => (statusMap[r.studentId] = r.status));
    set({ students, statusMap, isSubmitted: true });
  },
}));
