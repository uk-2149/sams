---

<div align="center">

# STUDENT ATTENDANCE MANAGEMENT SYSTEM (SAMS)

**ACADEMIC PROJECT REPORT**

**Academic Year:** [Insert Academic Year, e.g., 2023-2024]

**Submitted By:**
[Student Name 1] - [Registration/Roll Number]
[Student Name 2] - [Registration/Roll Number]
[Student Name 3] - [Registration/Roll Number]

**Submitted To:**
[Professor/Guide Name]
[Designation/Department]

**Odisha University of Technology and Research**
[Insert Department Name, e.g., Department of Computer Science and Application]
Bhubaneswar, Odisha

</div>

<div style="page-break-after: always"></div>

## Table of Contents

1. [EXPERIMENT 1: PROBLEM STATEMENT](#experiment-1-problem-statement)
   - 1.1 [Background](#11-background)
   - 1.2 [Problem Statement](#12-problem-statement)
2. [EXPERIMENT 2: SRS (IEEE STYLE)](#experiment-2-srs-ieee-style)
   - 2.1 [Introduction](#21-introduction)
   - 2.2 [Objectives](#22-objectives)
   - 2.3 [Scope of System](#23-scope-of-system)
   - 2.4 [Stakeholders](#24-stakeholders)
   - 2.5 [System Overview](#25-system-overview)
   - 2.6 [Non-Functional Requirements](#26-non-functional-requirements)
   - 2.7 [Functional Requirements](#27-functional-requirements)
   - 2.8 [Risk Management](#28-risk-management)
   - 2.9 [Project Plan](#29-project-plan)
3. [EXPERIMENT 3: USE CASES](#experiment-3-use-cases)
   - 3.1 [Use Case Diagram](#31-use-case-diagram)
   - 3.2 [Activity Diagram](#32-activity-diagram)
4. [EXPERIMENT 4: DESIGN](#experiment-4-design)
   - 4.1 [Class Diagram](#41-class-diagram)
   - 4.2 [Sequence Diagram](#42-sequence-diagram)
5. [EXPERIMENT 5: STATE DIAGRAM](#experiment-5-state-diagram)
6. [EXPERIMENT 6: ARCHITECTURE](#experiment-6-architecture)
7. [EXPERIMENT 7: IMPLEMENTATION](#experiment-7-implementation)
   - 7.1 [Technical Services Layer](#71-technical-services-layer)
   - 7.2 [Domain Objects Layer](#72-domain-objects-layer)
8. [EXPERIMENT 8: UI LAYER](#experiment-8-ui-layer)
9. [EXPERIMENT 9: COMPONENT + DEPLOYMENT](#experiment-9-component--deployment)
   - 9.1 [Component Diagram](#91-component-diagram)
   - 9.2 [Deployment Diagram](#92-deployment-diagram)
10. [EXPERIMENT 10: TESTING](#experiment-10-testing)
    - 10.1 [Test Cases Table](#101-test-cases-table)
    - 10.2 [Test Results](#102-test-results)
    - 10.3 [Final Product Summary](#103-final-product-summary)

<div style="page-break-after: always"></div>

# EXPERIMENT 1: PROBLEM STATEMENT

### 1.1 Background
The traditional method of tracking student attendance in universities relies heavily on manual roll calls and paper-based registers. As educational institutions scale, these manual processes have proven to be increasingly inefficient and error-prone. Faculty members often spend a significant portion of lecture time managing attendance rather than focusing on academic instruction. Furthermore, the lack of centralized and digitized attendance records makes it exceedingly difficult to monitor student regularity, generate real-time reports, and enforce academic policies. The persistence of issues like proxy attendance (buddy punching) and the administrative overhead of calculating aggregate attendance percentages highlight the critical need for a modernized, automated solution.

### 1.2 Problem Statement
The current manual attendance tracking system suffers from several critical operational and technical shortcomings:
1. **High Latency in Data Processing:** Manual aggregation of attendance across multiple subjects and departments is slow, delaying the identification of students with attendance shortages.
2. **Susceptibility to Proxy Attendance:** Paper-based systems lack robust identity verification, making it trivial for students to mark attendance for absent peers.
3. **Data Inconsistency and Loss:** Physical registers are prone to damage, misplacement, and transcription errors when digitizing records at the end of the semester.
4. **Lack of Real-time Analytics:** Administrators and faculty cannot dynamically query attendance trends or generate instantaneous reports without significant manual effort.
5. **Inefficient Session Management:** There is no standardized mechanism to handle ad-hoc classes, rescheduled sessions, or cross-departmental electives seamlessly.
6. **Poor Auditing and Traceability:** Tracking modifications to historical attendance records (e.g., correcting an accidental absence mark) is nearly impossible without a digital audit trail.
7. **Role Definition Ambiguity:** The lack of a structured digital system blurs the lines of authorization, making it difficult to strictly enforce who can create sessions, mark attendance, and view academic analytics.

---

# EXPERIMENT 2: SRS (IEEE STYLE)

### 2.1 Introduction
The Student Attendance Management System (SAMS) is a comprehensive, web-based platform designed to automate and streamline the attendance tracking process in academic institutions. Built with a modern technology stack (Next.js, Prisma, PostgreSQL), SAMS provides a secure, role-based environment for administrators, faculty members, and students. It replaces legacy manual processes with a digital ecosystem that ensures data integrity, real-time reporting, and strict adherence to institutional attendance policies.

### 2.2 Objectives
- **Authentication & Authorization:** Secure login mechanisms with strict role-based access control (RBAC).
- **Attendance Tracking:** Seamless, real-time capturing of student attendance for scheduled academic sessions.
- **Session Management:** End-to-end lifecycle management of classes, from scheduling to completion.
- **Role-Based Dashboards:** Context-aware interfaces tailored for the specific needs of Admins, Faculty, and Students.
- **Analytics & Reporting:** Automated generation of attendance metrics, shortage alerts, and institutional analytics.

### 2.3 Scope of System

| Stakeholder Role | System Scope & Capabilities |
| :--- | :--- |
| **Student** | View personal attendance records, track subject-wise percentages, receive attendance shortage alerts, and view upcoming class schedules. |
| **Faculty** | Create and manage academic sessions, mark/update student attendance, view class-wise statistics, and monitor overall student engagement. |
| **Admin** | Manage master data (Departments, Programs, Users, Classes), oversee system-wide attendance trends, handle role assignments, and audit system activities. |

### 2.4 Stakeholders
1. **University Administrators:** Require high-level oversight, reporting, and system management capabilities.
2. **Faculty Members / Lecturers:** Require efficient tools to conduct classes and record attendance without friction.
3. **Students:** Require transparency regarding their attendance status to meet academic eligibility criteria.
4. **System Administrators:** Responsible for the deployment, maintenance, and scalability of the software infrastructure.

### 2.5 System Overview
SAMS utilizes a robust 3-tier architecture to separate concerns and ensure scalability:
1. **Presentation Layer (Frontend):** Developed using Next.js App Router, Tailwind CSS, and ShadCN UI to deliver a responsive, accessible, and intuitive user interface.
2. **Application Layer (Backend):** Built on Node.js/Next.js API routes, implementing business logic, role validation, and service orchestration.
3. **Data Layer (Database):** Powered by PostgreSQL with Prisma ORM, ensuring ACID compliance, relational integrity, and efficient querying of complex institutional hierarchies.

#### 2.5.1 System Context
[IMAGE: System Context Diagram]

#### 2.5.2 Product Functions

| Module | Core Functions |
| :--- | :--- |
| **Auth Module** | User login, JWT/Session validation, Role-based route protection, Profile management. |
| **Class Management** | Subject assignment, Student enrollment, Faculty allocation, Timetable structuring. |
| **Session Module** | Session creation (scheduled/ad-hoc), Status tracking (Active/Completed/Cancelled). |
| **Attendance Module** | Real-time attendance marking (Present/Absent/Late), 15-day retrospective editing window. |
| **Analytics Module** | Aggregation of attendance percentages, Exporting reports (CSV/PDF), Dashboard widgets. |

### 2.6 Non-Functional Requirements
1. **Security:** All API endpoints must enforce strict RBAC. Passwords must be hashed using bcrypt. Sensitive data must be transmitted over HTTPS.
2. **Performance:** API response times should remain under 200ms for standard queries. The UI must render smoothly with high Lighthouse performance scores.
3. **Scalability:** The architecture must support horizontal scaling to handle concurrent requests during peak hours (e.g., morning classes).
4. **Availability:** The system aims for 99.9% uptime with reliable database backups and graceful error handling.
5. **Usability:** The interface must be responsive across devices (mobile, tablet, desktop) and intuitive enough to require minimal training.

### 2.7 Functional Requirements
1. **FR-01:** The system shall authenticate users and route them to their respective role-based dashboards upon successful login.
2. **FR-02:** The system shall allow an Admin to create, update, and delete Departments, Programs, and Classes.
3. **FR-03:** The system shall allow an Admin to bulk register students and faculty members.
4. **FR-04:** The system shall restrict faculty members to creating sessions only for classes assigned to them.
5. **FR-05:** The system shall allow faculty to initiate a session, changing its status to "Active".
6. **FR-06:** The system shall allow faculty to mark individual students as Present, Absent, or Late during an active session.
7. **FR-07:** The system shall enforce a business rule preventing the modification of attendance records older than 15 days.
8. **FR-08:** The system shall allow a session to be marked as "Completed", finalizing the attendance tally for that instance.
9. **FR-09:** The system shall calculate aggregate attendance percentages for students per subject and overall.
10. **FR-10:** The system shall display visual warnings (e.g., red highlights) for students whose attendance falls below the 75% threshold.
11. **FR-11:** The system shall provide students with a read-only view of their attendance history and current standing.
12. **FR-12:** The system shall prevent students from accessing faculty or administrative API endpoints (Unauthorized Access Prevention).
13. **FR-13:** The system shall allow Admins to generate system-wide attendance summaries across different departments.

### 2.8 Risk Management
| Risk Description | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Attendance Tampering** | High | Strict RBAC; enforcing the 15-day edit lock; comprehensive audit logs for modifications. |
| **Unauthorized Access** | High | Implementation of secure HTTP-only cookies, robust JWT validation, and API-level role checks. |
| **Session Misuse** | Medium | Validation logic ensuring faculty can only create sessions for their allocated subjects. |
| **Data Inconsistency** | High | Utilizing relational database constraints (Foreign Keys) and Prisma ORM transactions to guarantee ACID properties. |

### 2.9 Project Plan
1. **Requirement Phase:** Stakeholder interviews, SRS documentation, feasibility study.
2. **Design Phase:** Database schema design (ERD), UI/UX wireframing, System architecture definition.
3. **Backend Development:** Setting up PostgreSQL, Prisma schema, API endpoints, authentication logic.
4. **Frontend Development:** UI implementation with Next.js and ShadCN, state management, API integration.
5. **Testing Phase:** Unit testing API routes, UI component testing, integration testing, User Acceptance Testing (UAT).
6. **Deployment Phase:** CI/CD pipeline setup, production database migration, application hosting.

[IMAGE: Gantt Chart]

---

# EXPERIMENT 3: USE CASES

### 3.1 Use Case Diagram
[IMAGE: Use Case Diagram]

### 3.2 Activity Diagram
[IMAGE: Activity Diagram]

---

# EXPERIMENT 4: DESIGN

### 4.1 Class Diagram
[IMAGE: Class Diagram]

### 4.2 Sequence Diagram
[IMAGE: Sequence Diagram]

---

# EXPERIMENT 5: STATE DIAGRAM

The state diagram illustrates the lifecycle of an academic session and the corresponding attendance records. A session begins in a "Scheduled" state, transitions to "Active" when a faculty member starts the class, and finally to "Completed." Attendance records evolve dynamically during the "Active" state and are locked based on temporal rules (e.g., the 15-day modification window) post-completion.

[IMAGE: State Diagram]

---

# EXPERIMENT 6: ARCHITECTURE

### Package Diagram
The system is logically partitioned into discrete layers to maintain clean architecture and separation of concerns:
- **Frontend (Presentation):** Contains Next.js Pages/Layouts, React Components, and UI Hooks. Responsible for rendering the interface and capturing user input.
- **API Layer (Controllers):** Next.js Route Handlers (`app/api/*`) that receive HTTP requests, extract parameters, and return JSON responses.
- **Services (Business Logic):** Core logic layer where validation, role checks, and complex business rules (like the 15-day attendance rule) are executed.
- **Database (Persistence):** Prisma Client layer interacting directly with the PostgreSQL database, handling queries, mutations, and transactions.

[IMAGE: Package Diagram]

---

# EXPERIMENT 7: IMPLEMENTATION

### 7.1 Technical Services Layer
- **AuthService:** Handles user authentication, credential verification, JWT generation, and session validation. It ensures that incoming requests belong to verified users.
- **SessionService:** Manages the CRUD operations for academic sessions. It includes logic to verify faculty assignments, handle state transitions (Start/End session), and fetch session histories.
- **AttendanceService:** Encapsulates the core logic for marking and updating attendance. It enforces constraints, such as verifying the session is active and restricting edits to the defined 15-day window.

### 7.2 Domain Objects Layer
| Entity | Description |
| :--- | :--- |
| **University** | The root entity representing the institution. |
| **Department** | Academic divisions within the university (e.g., Computer Science, Mechanical). |
| **Program** | Specific degree programs offered by departments (e.g., B.Tech, MCA). |
| **Student** | Individuals enrolled in programs, associated with specific classes. |
| **Faculty** | Teaching staff assigned to conduct sessions for various classes. |
| **Class** | A grouping of students mapped to a specific subject/course. |
| **Session** | A distinct instance of a class occurring at a specific time and date. |
| **Attendance** | The record of a student's presence (Present, Absent, Late) for a specific session. |

---

# EXPERIMENT 8: UI LAYER

The SAMS user interface is designed with a focus on minimalism, speed, and context-awareness, utilizing Tailwind CSS and ShadCN components for a cohesive design system.

- **Admin Dashboard:** A comprehensive command center providing macroscopic metrics. It features data tables for managing users (Students/Faculty), configuration panels for academic structures (Departments/Programs), and visual analytics on system-wide attendance trends.
- **Faculty Dashboard:** A streamlined interface prioritizing immediate tasks. It displays today's schedule, quick actions to start sessions, and visual indicators of class attendance health.
- **Student Dashboard:** A personalized, read-only portal showing the student's overall attendance percentage, subject-wise breakdowns, and alerts for any impending attendance shortages.

[IMAGE: Admin Dashboard]
[IMAGE: Faculty Dashboard]
[IMAGE: Student Dashboard]
[IMAGE: Attendance Screen]

---

# EXPERIMENT 9: COMPONENT + DEPLOYMENT

### 9.1 Component Diagram
[IMAGE: Component Diagram]

### 9.2 Deployment Diagram
[IMAGE: Deployment Diagram]

---

# EXPERIMENT 10: TESTING

### 10.1 Test Cases Table

| Test ID | Module | Scenario | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Auth | Login with valid Admin credentials | Redirects to `/admin/dashboard` with Admin JWT | Pass |
| **TC-02** | Auth | Login with invalid credentials | Displays "Invalid credentials" error message | Pass |
| **TC-03** | Auth | Student attempts to access `/admin/*` | Returns 403 Forbidden / Redirects to unauthorized page | Pass |
| **TC-04** | Session | Faculty creates session for assigned class | Session created successfully, status set to "Active" | Pass |
| **TC-05** | Session | Faculty creates session for unassigned class | API rejects request with 403 Forbidden | Pass |
| **TC-06** | Attendance | Mark student as "Present" in active session | Database updates record; UI reflects change instantly | Pass |
| **TC-07** | Attendance | Update attendance within 15 days of session | Update successful; audit log recorded | Pass |
| **TC-08** | Attendance | Update attendance strictly AFTER 15 days | API rejects request with "Modification window closed" | Pass |
| **TC-09** | Session | Complete an active session | Session status changes to "Completed"; summary generated | Pass |
| **TC-10** | Analytics | Calculate student aggregate percentage | Computes correctly: (Total Present / Total Sessions) * 100 | Pass |
| **TC-11** | Analytics | Display shortage alert below 75% | UI highlights student record in warning color (red/orange) | Pass |
| **TC-12** | Admin | Create new Department and Program | Records inserted into DB; relational constraints maintained | Pass |

### 10.2 Test Results
The system underwent rigorous unit, integration, and UI testing. All critical paths, including authentication, role-based access control, session lifecycle management, and the core attendance marking engine, successfully passed. Edge cases, particularly temporal constraints (the 15-day rule) and authorization boundaries, were thoroughly validated.

### 10.3 Final Product Summary
The Student Attendance Management System (SAMS) has been successfully architected and implemented as a robust, production-ready web application. By leveraging Next.js, Prisma, and PostgreSQL, the system provides a highly scalable and secure platform for academic attendance tracking. It successfully eliminates the inefficiencies of manual roll calls, mitigates proxy attendance risks, and offers real-time, actionable analytics for all stakeholders. SAMS represents a significant digital transformation step, standardizing academic management processes with modern software engineering practices.
