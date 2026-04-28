// ========================
// Auth
// ========================

export interface AuthUser {
  id: string;
  role: "UNIVERSITY_ADMIN" | "FACULTY" | "STUDENT";
  userId?: string;
  universityId?: string;
}

// ========================
// Pagination
// ========================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

// ========================
// Models
// ========================

export interface Department {
  id: string;
  name: string;
  code?: string;
  universityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Program {
  id: string;
  name: string;
  durationYears?: number;
  departmentId: string;
  department?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  year: string;
  startYear: number;
  endYear?: number;
  programId: string;
  program?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface Faculty {
  id: string;
  userId: string;
  employeeId?: string;
  designation?: string;
  departmentId?: string;
  user: { id: string; name: string; email: string };
  department?: { id: string; name: string };
}

export interface StudentProfile {
  id: string;
  userId: string;
  rollNumber: string;
  batchId: string;
  enrollmentYear: number;
  currentSemester?: number;
  user: { id: string; name: string; email: string };
  batch?: {
    id: string;
    year: string;
    program?: {
      id: string;
      name: string;
      department?: Department;
    };
  };
}

export interface ClassData {
  id: string;
  name: string;
  code?: string;
  semester?: number;
  section?: string;
  universityId: string;
  createdAt: string;
  teachers?: {
    id: string;
    isPrimary: boolean;
    teacher: {
      id: string;
      employeeId?: string;
      user: { name: string };
    };
  }[];
  students?: { id: string }[];
}

export interface Session {
  id: string;
  classId: string;
  teacherId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  topic?: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  markedById: string;
  modifiedById?: string;
  modifiedAt?: string;
  notes?: string;
  student?: {
    id: string;
    rollNumber: string;
    user: { name: string };
  };
}

export interface AdminStats {
  totalFaculty: number;
  totalStudents: number;
  totalClasses: number;
  totalDepartments: number;
  totalPrograms: number;
  totalSessions14Days: number;
}

export interface ClassAnalytics {
  classId: string;
  totalStudents: number;
  totalSessions: number;
  overallPercentage: number;
  students: {
    studentId: string;
    rollNumber: string;
    name: string;
    present: number;
    total: number;
    percentage: number;
  }[];
}

export interface StudentAnalytics {
  totalSessions: number;
  present: number;
  percentage: number;
  classes: {
    classId: string;
    className: string;
    total: number;
    present: number;
    percentage: number;
  }[];
}
