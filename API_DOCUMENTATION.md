# Next.js Backend API Documentation

## 1. Introduction

This document provides a comprehensive overview of the backend architecture, API endpoints, data relationships, and business logic for the application.

**Tech Stack:**
- **Framework:** Next.js (App Router)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Custom JWT stored in `httpOnly` secure cookies
- **Validation:** Zod
- **API Style:** RESTful API under `/app/api`

---

## 2. Authentication

The system uses a custom JSON Web Token (JWT) flow. 

- **Token Storage:** Tokens are securely stored in an `httpOnly`, `SameSite=strict` cookie named `attendify-token`.
- **Expiration:** Tokens are valid for 1 hour.
- **Roles:** The system enforces strict Role-Based Access Control (RBAC) across 3 main roles:
  - `UNIVERSITY_ADMIN`: Complete control over a specific university's data (departments, programs, faculty, students, classes).
  - `FACULTY`: Access restricted to classes they teach, sessions they create, and attendance they mark.
  - `STUDENT`: Read-only access to their own attendance and class enrollments.

---

## 3. Global Conventions

- **Base URL:** `/api`
- **Request Format:** `application/json`
- **Response Format:**
  - Success: `{ "success": true, "data": ... }` or `{ "success": true, "message": "..." }`
  - Error: `{ "success": false, "error": "Error message" }`
- **Pagination:** Supported endpoints accept `page` and `limit` as query parameters. The response includes a `pagination` object:
  ```json
  {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
  ```

---

## 4. API ROUTES

### Auth Routes

#### Endpoint: `/api/auth/register`
- **Method:** `POST`
- **File Path:** `/app/api/auth/register/route.ts`
- **Description:** Registers a new University and its primary Admin user.
- **Access Control:** Public
- **Request Body (Zod):**
  ```json
  {
    "name": "string (min 3)",
    "email": "string (valid email)",
    "userId": "string (min 3, lowercase/hyphens)",
    "password": "string (min 8)"
  }
  ```
- **Response Structure:** `{ success: true, message: string, university: object }`
- **Error Cases:** 409 Conflict (Email or User ID taken), 400 Bad Request (Zod Validation)
- **Business Rules:**
  - User IDs are normalized to lowercase.
  - Sets `attendify-token` cookie directly upon successful registration.
  - Currently sets `isVerified: true` (MVP).

#### Endpoint: `/api/auth/login`
- **Method:** `POST`
- **File Path:** `/app/api/auth/login/route.ts`
- **Description:** Authenticates a user and issues a JWT cookie.
- **Access Control:** Public
- **Request Body (Zod):**
  ```json
  {
    "identifier": "string (userId, employeeId, or rollNumber)",
    "password": "string",
    "role": "ADMIN | FACULTY | STUDENT"
  }
  ```
- **Response Structure:** `{ success: true, message: string, user: { id, name, role } }`
- **Error Cases:** 401 Unauthorized (Invalid credentials or role mismatch).
- **Business Rules:**
  - Dynamic login logic maps the `identifier` to `University.userId`, `Teacher.employeeId`, or `Student.rollNumber` depending on the requested `role`.

---

### Department Routes

#### Endpoint: `/api/departments`
- **Method:** `GET`
- **File Path:** `/app/api/departments/route.ts`
- **Description:** Retrieves paginated departments for the admin's university.
- **Access Control:** `UNIVERSITY_ADMIN`
- **Query Params:** `page` (default: 1), `limit` (default: 10)
- **Response Structure:** `{ success: true, data: Department[], pagination: object }`
- **Business Rules:** Users can only access departments belonging to their own university.

#### Endpoint: `/api/departments`
- **Method:** `POST`
- **File Path:** `/app/api/departments/route.ts`
- **Description:** Creates a new department.
- **Access Control:** `UNIVERSITY_ADMIN`
- **Request Body:** `{ "name": "string", "code": "string (optional)" }`
- **Business Rules:** The department is automatically linked to the admin's `universityId`.

---

### Program Routes

#### Endpoint: `/api/departments/programs`
- **Method:** `GET`
- **File Path:** `/app/api/departments/programs/route.ts`
- **Description:** Retrieves paginated programs across departments in the university.
- **Access Control:** `UNIVERSITY_ADMIN`
- **Query Params:** `page`, `limit`

#### Endpoint: `/api/departments/programs`
- **Method:** `POST`
- **File Path:** `/app/api/departments/programs/route.ts`
- **Description:** Creates a new program under a department.
- **Access Control:** `UNIVERSITY_ADMIN`
- **Request Body:** `{ "name": "string", "durationYears": "number (optional)", "departmentId": "string" }`
- **Error Cases:** 400 Invalid department.
- **Business Rules:** 
  - Validates that the provided `departmentId` actually belongs to the requesting admin's university to prevent cross-tenant data insertion.

---

### Faculty Routes

#### Endpoint: `/api/faculty`
- **Method:** `GET`
- **File Path:** `/app/api/faculty/route.ts`
- **Description:** Retrieves a paginated list of faculty members.
- **Access Control:** `UNIVERSITY_ADMIN`
- **Query Params:** `page`, `limit`

#### Endpoint: `/api/faculty`
- **Method:** `POST`
- **File Path:** `/app/api/faculty/route.ts`
- **Description:** Creates a new faculty member (User + Teacher Profile).
- **Access Control:** `UNIVERSITY_ADMIN`
- **Request Body:**
  ```json
  {
    "name": "string", "email": "string", "password": "string",
    "employeeId": "string", "departmentId": "string", "designation": "string (optional)"
  }
  ```
- **Error Cases:** 400 Invalid department.
- **Business Rules:**
  - Wrapped in a Prisma `$transaction` to ensure both `User` and `Teacher` records are created atomically.
  - Validates the target department belongs to the university.

---

### Student Routes

#### Endpoint: `/api/students`
- **Method:** `GET`
- **File Path:** `/app/api/students/route.ts`
- **Description:** Retrieves a paginated, filterable list of students.
- **Access Control:** `UNIVERSITY_ADMIN`
- **Query Params:** `page`, `limit`, `departmentId`, `programId`, `batchId`

#### Endpoint: `/api/students`
- **Method:** `POST`
- **File Path:** `/app/api/students/route.ts`
- **Description:** Creates a new student (User + Student Profile).
- **Access Control:** `UNIVERSITY_ADMIN`
- **Request Body:**
  ```json
  {
    "name": "string", "email": "string", "password": "string",
    "rollNumber": "string", "batchId": "string", 
    "enrollmentYear": "number", "currentSemester": "number (optional)"
  }
  ```
- **Business Rules:** Validates `batchId` resolves to a program/department owned by the university. Uses atomic transactions.

---

### Class Management Routes

#### Endpoint: `/api/classes`
- **Method:** `POST`
- **File Path:** `/app/api/classes/route.ts`
- **Description:** Creates a new class.
- **Access Control:** `UNIVERSITY_ADMIN`
- **Request Body:** `{ "name": "string", "code": "string?", "semester": "number?", "section": "string?" }`

#### Endpoint: `/api/classes`
- **Method:** `GET`
- **File Path:** `/app/api/classes/route.ts`
- **Description:** Retrieves classes based on the user's role.
- **Access Control:** `UNIVERSITY_ADMIN` | `FACULTY` | `STUDENT`
- **Query Params:** `page`, `limit`, `departmentId` (admin), `programId` (admin), `semester` (admin)
- **Business Rules:**
  - Admin: Sees all classes in the university (with optional filters).
  - Faculty: Only sees classes they are assigned to teach.
  - Student: Only sees classes they are enrolled in.

#### Endpoint: `/api/classes/:id/assign_faculty`
- **Method:** `POST`
- **File Path:** `/app/api/classes/[id]/assign_faculty/route.ts`
- **Access Control:** `UNIVERSITY_ADMIN`
- **Request Body:** `{ "teacherId": "string", "isPrimary": "boolean?" }`
- **Business Rules:**
  - Validates class and teacher belong to the admin's university.
  - Prevents duplicate assignments.
  - If `isPrimary` is true, automatically strips `isPrimary` from other assigned teachers for the class.

#### Endpoint: `/api/classes/:id/enroll_students`
- **Method:** `POST`
- **File Path:** `/app/api/classes/[id]/enroll_students/route.ts`
- **Access Control:** `UNIVERSITY_ADMIN`
- **Request Body:** `{ "studentIds": ["string"] }`
- **Business Rules:**
  - Bulk enrollment via `createMany` with `skipDuplicates: true`.
  - Filters out already enrolled students manually to return accurate `addedCount` and `skippedCount`.
  - Validates all provided student IDs belong to the university.

---

### Session Routes

#### Endpoint: `/api/sessions`
- **Method:** `POST`
- **File Path:** `/app/api/sessions/route.ts`
- **Access Control:** `UNIVERSITY_ADMIN` | `FACULTY`
- **Request Body:** `{ "classId": "string", "date": "ISO string", "startTime": "ISO string?", "topic": "string?" }`
- **Business Rules:** 
  - Admins can create sessions for any class in the university.
  - Faculty can only create sessions for classes they are explicitly assigned to.
  - Auto-assigns the creating `FACULTY`'s `teacherId` to the session.

#### Endpoint: `/api/sessions`
- **Method:** `GET`
- **File Path:** `/app/api/sessions/route.ts`
- **Query Params:** `classId` (required)
- **Access Control:** `UNIVERSITY_ADMIN` | `FACULTY` | `STUDENT`
- **Business Rules:** Strict role-based isolation similar to `/api/classes`.

#### Endpoint: `/api/sessions/:id/complete`
- **Method:** `PATCH`
- **File Path:** `/app/api/sessions/[id]/complete/route.ts`
- **Access Control:** `UNIVERSITY_ADMIN` | `FACULTY`
- **Business Rules:**
  - Sets `isCompleted: true` and records `endTime`.
  - Faculty can only complete their *own* sessions. Admin can complete any.

---

### Attendance Routes

#### Endpoint: `/api/attendance/mark`
- **Method:** `POST`
- **File Path:** `/app/api/attendance/mark/route.ts`
- **Access Control:** `FACULTY`
- **Request Body:**
  ```json
  {
    "sessionId": "string",
    "records": [{ "studentId": "string", "status": "PRESENT|ABSENT|LATE|EXCUSED" }]
  }
  ```
- **Business Rules:**
  - **Attendance can only be marked after the session is completed.**
  - Faculty can only mark attendance for their *own* sessions.
  - Validates that the submitted students are actually enrolled in the class. Uses `skipDuplicates`.

#### Endpoint: `/api/attendance`
- **Method:** `GET`
- **File Path:** `/app/api/attendance/route.ts`
- **Query Params:** `sessionId`
- **Description:** Returns attendance records for a session.

#### Endpoint: `/api/attendance/:id`
*(Note: File implementation exists in `/app/api/attendance/route.ts` which expects `params.id`. This may require moving to `/app/api/attendance/[id]/route.ts` to function properly in Next.js App Router).*
- **Method:** `PATCH`
- **File Path:** `/app/api/attendance/route.ts`
- **Access Control:** `UNIVERSITY_ADMIN` | `FACULTY`
- **Request Body:** `{ "status": "PRESENT|ABSENT|LATE|EXCUSED", "reason": "string (min 3)" }`
- **Business Rules:**
  - Admin can update attendance anytime.
  - **Faculty can only update attendance within 15 days of the session date.**
  - Logs `modifiedById`, `modifiedAt`, and the `reason` (`notes`) for auditing.

#### Endpoint: `/api/attendance/class/:classId`
- **Method:** `GET`
- **File Path:** `/app/api/attendance/class/[classid]/route.ts`
- **Access Control:** `UNIVERSITY_ADMIN` | `FACULTY`
- **Response Structure:** Class level aggregation showing total sessions, total students, overall percentage, and a per-student breakdown.
- **Business Rules:**
  - Students are explicitly blocked (`403 Forbidden`) from viewing full class reports.

---

### Analytics Routes

#### Endpoint: `/api/analytics/student/:id`
- **Method:** `GET`
- **File Path:** `/app/api/analytics/student/[id]/route.ts`
- **Access Control:** All Roles
- **Response Structure:** Total sessions, present count, percentage, and a per-class breakdown.
- **Business Rules:** Students can only request their *own* ID.

#### Endpoint: `/api/analytics/class/:id`
- **Method:** `GET`
- **File Path:** `/app/api/analytics/class/[id]/route.ts`
- **Access Control:** `UNIVERSITY_ADMIN` | `FACULTY`
- **Response:** Aggregated class attendance data (similar to attendance/class endpoint).

---

## 5. Data Relationships

The Prisma schema leverages relational integrity extensively:

- **Organizational Hierarchy:** 
  `University → Department → Program → Batch → Student`
  A university owns departments. Programs are scoped to departments. Batches are specific timeline cohorts for programs.
- **User Profiles:** 
  `User` table acts as the base identity model. It uses one-to-one relations with `Teacher` and `Student` profiles to store role-specific data (e.g., `employeeId` vs `rollNumber`).
- **Class Management:**
  `Class` links to `Teacher` via `ClassTeacher` (many-to-many, supporting a `isPrimary` flag).
  `Class` links to `Student` via `ClassStudent` (many-to-many).
- **Session & Attendance Lifecycle:**
  `Class → Session → Attendance`
  A session belongs to a class and a specific teacher. Once completed, `Attendance` records map a `Session` and a `Student` to a specific `AttendanceStatus`.

---

## 6. Security Model

1. **Strict Multi-Tenant Isolation:** Almost every model contains a direct or indirect relationship to `universityId`. API routes consistently extract `user.id` from the JWT and inject it into Prisma `where` clauses. 
2. **Role-Based Routing logic:** Handlers aggressively check `user.role` at the top of the function. For `GET` endpoints, the `where` clause is dynamically built based on the role to return only contextual data.
3. **Atomic Operations:** Endpoints creating multiple linked records (like User + Teacher or User + Student) use Prisma `$transaction` to ensure database consistency if failures occur.
4. **Ownership Verification:** Before updates or writes occur, the APIs verify ownership (e.g. "Is this Faculty member the assigned teacher for this session?", "Does this department belong to this admin's university?").

---

## 7. Future Improvements & Code Quality Suggestions

1. **Route Path Bug Fixes:** The `PATCH /api/attendance` endpoint located in `/app/api/attendance/route.ts` expects a dynamic `params.id`. It must be moved to `/app/api/attendance/[id]/route.ts` to receive URL parameters correctly.
2. **Query Optimization:** 
   - Endpoints like `/api/analytics/class/[id]` fetch all `Attendance` records and process aggregates in memory. As data grows, this should be converted to database-level aggregations using Prisma `groupBy` or `aggregate`.
3. **Database Indexing:** Add `@@index` to frequently queried foreign keys in `schema.prisma`, such as `sessionId` in `Attendance`, `classId` in `Session`, and `universityId` across models, to speed up query times.
4. **Caching:** Attendance aggregates and student analytics should be cached (using Next.js `unstable_cache` or Redis) since they are computationally heavy and do not need strict real-time updates for historical sessions.
5. **Pagination Consistency:** `GET` lists support `page` and `limit`, but endpoints returning nested includes (like Class Analytics) do not currently paginate the nested student lists. This could lead to massive payloads for large classes.
