/**
 * Prisma Seed Script — Attendify SAMS
 *
 * Generates realistic, relational data for:
 *   1 University, 2 Departments, 7 Programs, 28 Batches,
 *   18 Faculty, ~250 Students, 14 Classes, ~200 Sessions, ~4000+ Attendance records
 *
 * Run:  npx tsx prisma/seed.ts
 */

import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

// ─── Prisma Client (matches lib/prisma.ts pattern) ────────────────────────────
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Constants ─────────────────────────────────────────────────────────────────
const DEFAULT_PASSWORD = "Password@123";
const ADMIN_PASSWORD = "Admin@123";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pastDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(randomBetween(8, 16), randomBetween(0, 59), 0, 0);
  return d;
}

// ─── Realistic Indian Names ────────────────────────────────────────────────────
const FIRST_NAMES_MALE = [
  "Aarav", "Arjun", "Vivaan", "Aditya", "Vihaan", "Sai", "Reyansh", "Ayaan",
  "Krishna", "Ishaan", "Shaurya", "Atharva", "Advait", "Dhruv", "Kabir",
  "Ritvik", "Anirudh", "Samarth", "Parth", "Yash", "Rohan", "Siddharth",
  "Arnav", "Laksh", "Rudra", "Harsh", "Kartik", "Dev", "Om", "Pranav",
  "Kunal", "Manish", "Ravi", "Suresh", "Vikram", "Nikhil", "Rahul",
  "Amit", "Gaurav", "Deepak", "Rajesh", "Arun", "Karan", "Mohan",
  "Naveen", "Pradeep", "Sachin", "Tushar", "Vishal", "Akash",
];

const FIRST_NAMES_FEMALE = [
  "Ananya", "Diya", "Myra", "Sara", "Aanya", "Aadhya", "Isha", "Pari",
  "Riya", "Navya", "Anika", "Kavya", "Tanya", "Pooja", "Sneha",
  "Priya", "Divya", "Neha", "Shreya", "Simran", "Nisha", "Megha",
  "Swati", "Garima", "Pallavi", "Rashmi", "Sakshi", "Tanvi", "Aditi",
  "Bhavna", "Charu", "Deepika", "Ekta", "Fatima", "Gauri", "Hema",
  "Iti", "Jyoti", "Komal", "Lata",
];

const LAST_NAMES = [
  "Sharma", "Patel", "Singh", "Kumar", "Das", "Reddy", "Rao", "Gupta",
  "Mishra", "Verma", "Joshi", "Nair", "Mehta", "Iyer", "Pillai",
  "Sahu", "Mohanty", "Behera", "Panda", "Nayak", "Sahoo", "Swain",
  "Pradhan", "Biswal", "Rout", "Tripathy", "Jena", "Patnaik", "Hota",
  "Senapati", "Mohapatra", "Majhi", "Dalai", "Barik", "Satapathy",
];

const FACULTY_DESIGNATIONS = [
  "Professor", "Associate Professor", "Assistant Professor",
  "Assistant Professor", "Assistant Professor", "Lecturer",
];

const CS_TOPICS = [
  "Introduction to Data Structures", "Arrays and Linked Lists",
  "Stacks and Queues", "Trees and Graphs", "Hashing Techniques",
  "Sorting Algorithms", "Dynamic Programming", "Greedy Algorithms",
  "Object Oriented Design", "Database Normalization",
  "SQL Joins & Subqueries", "Operating System Concepts",
  "Process Scheduling", "Memory Management", "File Systems",
  "Network Protocols", "TCP/IP Model", "Machine Learning Basics",
  "Neural Networks", "Computer Architecture",
];

const ME_TOPICS = [
  "Thermodynamics Fundamentals", "Heat Transfer Mechanisms",
  "Fluid Mechanics Basics", "Bernoulli's Equation", "Stress and Strain",
  "Material Properties", "Manufacturing Processes", "CNC Programming",
  "Robotics Kinematics", "Control Systems", "Dynamics of Machinery",
  "Engineering Drawing", "Finite Element Analysis", "CAD/CAM",
  "Vibration Analysis", "Mechatronics", "Industrial Automation",
  "PLC Programming", "Hydraulics & Pneumatics", "Power Plant Engineering",
];

// ─── Name generator ────────────────────────────────────────────────────────────
function generateName(): { firstName: string; lastName: string; full: string } {
  const isMale = Math.random() > 0.4;
  const firstName = isMale
    ? randomElement(FIRST_NAMES_MALE)
    : randomElement(FIRST_NAMES_FEMALE);
  const lastName = randomElement(LAST_NAMES);
  return { firstName, lastName, full: `${firstName} ${lastName}` };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SEED
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log("🗑️  Clearing existing data...\n");

  // Delete in dependency order (children first)
  await prisma.attendance.deleteMany();
  await prisma.session.deleteMany();
  await prisma.classStudent.deleteMany();
  await prisma.classTeacher.deleteMany();
  await prisma.class.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.program.deleteMany();
  await prisma.department.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.university.deleteMany();

  console.log("✅  Database cleared.\n");

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. UNIVERSITY
  // ─────────────────────────────────────────────────────────────────────────────
  const hashedAdmin = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const hashedDefault = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  const university = await prisma.university.create({
    data: {
      name: "Odisha University of Technology and Research",
      email: "admin@outr.edu",
      userId: "outr26",
      password: hashedAdmin,
      address: "Ghatikia, Bhubaneswar, Odisha 751003",
      website: "https://outr.ac.in",
      isVerified: true,
    },
  });
  console.log(`🏫  University created: ${university.name}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. DEPARTMENTS
  // ─────────────────────────────────────────────────────────────────────────────
  const deptCS = await prisma.department.create({
    data: {
      name: "School of Computer Sciences",
      code: "SCS",
      universityId: university.id,
    },
  });

  const deptME = await prisma.department.create({
    data: {
      name: "School of Mechanical Sciences",
      code: "SMS",
      universityId: university.id,
    },
  });
  console.log(`🏢  Departments created: ${deptCS.name}, ${deptME.name}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. PROGRAMS
  // ─────────────────────────────────────────────────────────────────────────────
  const programsData = [
    { name: "Information Technology", durationYears: 4, departmentId: deptCS.id },
    { name: "Computer Science Engineering", durationYears: 4, departmentId: deptCS.id },
    { name: "Artificial Intelligence & Machine Learning", durationYears: 4, departmentId: deptCS.id },
    { name: "Mechanical Engineering", durationYears: 4, departmentId: deptME.id },
    { name: "Robotics & AI", durationYears: 4, departmentId: deptME.id },
  ];

  const programs: any[] = [];
  for (const p of programsData) {
    const prog = await prisma.program.create({ data: p });
    programs.push(prog);
  }
  console.log(`📚  Programs created: ${programs.length}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. BATCHES (4 per program = 20 total)
  // ─────────────────────────────────────────────────────────────────────────────
  const batchYears = [2021, 2022, 2023, 2024];
  const batches: any[] = [];

  for (const prog of programs) {
    for (const yr of batchYears) {
      const batch = await prisma.batch.create({
        data: {
          year: `${yr}-${yr + (prog.durationYears || 4)}`,
          startYear: yr,
          endYear: yr + (prog.durationYears || 4),
          programId: prog.id,
        },
      });
      batches.push({ ...batch, programId: prog.id });
    }
  }
  console.log(`📅  Batches created: ${batches.length}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. FACULTY (18 members)
  // ─────────────────────────────────────────────────────────────────────────────
  const facultyNames = [
    { name: "Dr. Rajesh Kumar Sahoo", dept: "CS" },
    { name: "Prof. Sanjay Kumar Panda", dept: "CS" },
    { name: "Dr. Priya Ranjan Dash", dept: "CS" },
    { name: "Prof. Anita Mohapatra", dept: "CS" },
    { name: "Dr. Suresh Chandra Jena", dept: "CS" },
    { name: "Prof. Meera Devi Patnaik", dept: "CS" },
    { name: "Dr. Bikash Ranjan Swain", dept: "CS" },
    { name: "Prof. Snehalata Mishra", dept: "CS" },
    { name: "Dr. Tapan Kumar Nayak", dept: "CS" },
    { name: "Prof. Amrita Das", dept: "CS" },
    { name: "Dr. Debashis Pradhan", dept: "ME" },
    { name: "Prof. Hemant Kumar Rout", dept: "ME" },
    { name: "Dr. Sushree Mohanty", dept: "ME" },
    { name: "Prof. Ranjan Kumar Behera", dept: "ME" },
    { name: "Dr. Jyoti Prasad Biswal", dept: "ME" },
    { name: "Prof. Smita Rani Sahoo", dept: "ME" },
    { name: "Dr. Ashok Kumar Tripathy", dept: "ME" },
    { name: "Prof. Nibedita Senapati", dept: "ME" },
  ];

  const facultyRecords: { user: any; teacher: any }[] = [];

  for (let i = 0; i < facultyNames.length; i++) {
    const f = facultyNames[i];
    const empId = `FAC-${1001 + i}`;
    const email = `${f.name.split(" ").pop()!.toLowerCase()}${1001 + i}@outr.edu`;
    const deptId = f.dept === "CS" ? deptCS.id : deptME.id;

    const user = await prisma.user.create({
      data: {
        name: f.name,
        email,
        password: hashedDefault,
        role: "FACULTY",
        universityId: university.id,
      },
    });

    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        employeeId: empId,
        designation: randomElement(FACULTY_DESIGNATIONS),
        departmentId: deptId,
      },
    });

    facultyRecords.push({ user, teacher });
  }
  console.log(`👨‍🏫  Faculty created: ${facultyRecords.length}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. STUDENTS (~250)
  // ─────────────────────────────────────────────────────────────────────────────
  // Distribution: ~12-13 students per batch across 20 batches
  const studentRecords: { user: any; student: any; batchProgramId: string }[] = [];
  let studentCounter = 0;

  // Program code mapping for roll numbers
  const programCodes: Record<string, string> = {};
  programs.forEach((p, idx) => {
    programCodes[p.id] = String(51 + idx); // 51, 52, 53, 54, 55
  });

  for (const batch of batches) {
    const studentsPerBatch = randomBetween(11, 14);
    const yearPrefix = String(batch.startYear).slice(2); // e.g., "22" for 2022
    const progCode = programCodes[batch.programId];

    for (let s = 0; s < studentsPerBatch; s++) {
      studentCounter++;
      const { full: name } = generateName();
      const rollNumber = `${yearPrefix}0${progCode}${String(s + 1).padStart(3, "0")}`;
      const email = `${rollNumber}@outr.edu`;

      const prog = programs.find((p: any) => p.id === batch.programId);
      const currentSem = Math.min(
        (new Date().getFullYear() - batch.startYear) * 2,
        (prog?.durationYears || 4) * 2
      );

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedDefault,
          role: "STUDENT",
          universityId: university.id,
        },
      });

      const student = await prisma.student.create({
        data: {
          userId: user.id,
          rollNumber,
          batchId: batch.id,
          enrollmentYear: batch.startYear,
          currentSemester: currentSem || 1,
        },
      });

      studentRecords.push({ user, student, batchProgramId: batch.programId });
    }
  }
  console.log(`🎓  Students created: ${studentRecords.length}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. CLASSES (14 classes — mix of subjects)
  // ─────────────────────────────────────────────────────────────────────────────
  const classesData = [
    { name: "Data Structures & Algorithms", code: "CS201", semester: 3, section: "A", dept: "CS" },
    { name: "Data Structures & Algorithms", code: "CS201", semester: 3, section: "B", dept: "CS" },
    { name: "Database Management Systems", code: "CS301", semester: 5, section: "A", dept: "CS" },
    { name: "Operating Systems", code: "CS302", semester: 5, section: "A", dept: "CS" },
    { name: "Computer Networks", code: "CS401", semester: 7, section: "A", dept: "CS" },
    { name: "Machine Learning", code: "AI301", semester: 5, section: "A", dept: "CS" },
    { name: "Deep Learning", code: "AI401", semester: 7, section: "A", dept: "CS" },
    { name: "Web Technologies", code: "IT301", semester: 5, section: "A", dept: "CS" },
    { name: "Software Engineering", code: "CS303", semester: 5, section: "A", dept: "CS" },
    { name: "Engineering Mechanics", code: "ME201", semester: 3, section: "A", dept: "ME" },
    { name: "Thermodynamics", code: "ME301", semester: 5, section: "A", dept: "ME" },
    { name: "Fluid Mechanics", code: "ME302", semester: 5, section: "A", dept: "ME" },
    { name: "Robotics Fundamentals", code: "RO301", semester: 5, section: "A", dept: "ME" },
    { name: "Manufacturing Processes", code: "ME401", semester: 7, section: "A", dept: "ME" },
  ];

  const classRecords: any[] = [];

  for (const c of classesData) {
    const cls = await prisma.class.create({
      data: {
        name: c.name,
        code: c.code,
        semester: c.semester,
        section: c.section,
        universityId: university.id,
      },
    });
    classRecords.push({ ...cls, deptType: c.dept });
  }
  console.log(`📖  Classes created: ${classRecords.length}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. ASSIGN FACULTY TO CLASSES
  // ─────────────────────────────────────────────────────────────────────────────
  const csFaculty = facultyRecords.filter((f) => {
    const fData = facultyNames.find((fn) => fn.name === f.user.name);
    return fData?.dept === "CS";
  });
  const meFaculty = facultyRecords.filter((f) => {
    const fData = facultyNames.find((fn) => fn.name === f.user.name);
    return fData?.dept === "ME";
  });

  const classTeacherAssignments: { classId: string; teacherId: string; classObj: any }[] = [];

  for (let i = 0; i < classRecords.length; i++) {
    const cls = classRecords[i];
    const pool = cls.deptType === "CS" ? csFaculty : meFaculty;
    const teacher = pool[i % pool.length];

    await prisma.classTeacher.create({
      data: {
        classId: cls.id,
        teacherId: teacher.teacher.id,
        isPrimary: true,
      },
    });

    classTeacherAssignments.push({
      classId: cls.id,
      teacherId: teacher.teacher.id,
      classObj: cls,
    });
  }
  console.log(`🔗  Faculty assigned to classes: ${classTeacherAssignments.length}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. ENROLL STUDENTS IN CLASSES
  // ─────────────────────────────────────────────────────────────────────────────
  // Map programs to department type
  const csProgramIds = programs.filter((p: any) => p.departmentId === deptCS.id).map((p: any) => p.id);
  const meProgramIds = programs.filter((p: any) => p.departmentId === deptME.id).map((p: any) => p.id);

  const classStudentMap: Record<string, string[]> = {}; // classId → studentId[]

  for (const cls of classRecords) {
    const deptProgramIds = cls.deptType === "CS" ? csProgramIds : meProgramIds;

    // Get students from matching department who are in the right semester range
    const eligibleStudents = studentRecords.filter((sr) => {
      return deptProgramIds.includes(sr.batchProgramId);
    });

    // Pick a subset of students (15–25 per class)
    const shuffled = [...eligibleStudents].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, randomBetween(15, Math.min(25, shuffled.length)));

    const studentIds: string[] = [];

    for (const s of selected) {
      await prisma.classStudent.create({
        data: {
          classId: cls.id,
          studentId: s.student.id,
        },
      });
      studentIds.push(s.student.id);
    }

    classStudentMap[cls.id] = studentIds;
  }

  const totalEnrollments = Object.values(classStudentMap).reduce((a, b) => a + b.length, 0);
  console.log(`📝  Student enrollments: ${totalEnrollments}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 10. SESSIONS (10–15 per class)
  // ─────────────────────────────────────────────────────────────────────────────
  const sessionRecords: {
    session: any;
    classId: string;
    teacherUserId: string;
  }[] = [];

  for (const cta of classTeacherAssignments) {
    const numSessions = randomBetween(10, 15);
    const topics = cta.classObj.deptType === "CS" ? CS_TOPICS : ME_TOPICS;
    const teacherRecord = facultyRecords.find((f) => f.teacher.id === cta.teacherId);

    for (let i = 0; i < numSessions; i++) {
      const daysAgo = randomBetween(1, 60);
      const sessionDate = pastDate(daysAgo);
      const endDate = new Date(sessionDate.getTime() + 60 * 60 * 1000); // +1hr

      const session = await prisma.session.create({
        data: {
          classId: cta.classId,
          teacherId: cta.teacherId,
          date: sessionDate,
          startTime: sessionDate,
          endTime: endDate,
          topic: topics[i % topics.length],
          isCompleted: true,
        },
      });

      sessionRecords.push({
        session,
        classId: cta.classId,
        teacherUserId: teacherRecord!.user.id,
      });
    }
  }
  console.log(`📆  Sessions created: ${sessionRecords.length}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 11. ATTENDANCE (for every session × enrolled students)
  // ─────────────────────────────────────────────────────────────────────────────
  let totalAttendance = 0;

  for (const sr of sessionRecords) {
    const enrolledStudents = classStudentMap[sr.classId] || [];
    if (enrolledStudents.length === 0) continue;

    const attendanceData = enrolledStudents.map((studentId) => {
      // ~78% present, ~18% absent, ~3% late, ~1% excused
      const roll = Math.random();
      let status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
      if (roll < 0.78) status = "PRESENT";
      else if (roll < 0.96) status = "ABSENT";
      else if (roll < 0.99) status = "LATE";
      else status = "EXCUSED";

      return {
        sessionId: sr.session.id,
        studentId,
        status,
        markedById: sr.teacherUserId,
      };
    });

    await prisma.attendance.createMany({
      data: attendanceData,
    });

    totalAttendance += attendanceData.length;
  }
  console.log(`✅  Attendance records: ${totalAttendance}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 12. SPECIAL TEST STUDENT
  // ─────────────────────────────────────────────────────────────────────────────
  const testUser = await prisma.user.create({
    data: {
      name: "Test Student",
      email: "test@outr.edu",
      password: hashedDefault,
      role: "STUDENT",
      universityId: university.id,
    },
  });

  const testStudent = await prisma.student.create({
    data: {
      userId: testUser.id,
      rollNumber: "TEST123456",
      batchId: batches[0].id,
      enrollmentYear: batches[0].startYear,
      currentSemester: 5,
    },
  });

  console.log(`👤  Test Student created: TEST123456`);

  let testAttendanceCount = 0;
  // Enroll in the first 5 classes
  for (let i = 0; i < 5; i++) {
    const cls = classRecords[i];
    await prisma.classStudent.create({
      data: {
        classId: cls.id,
        studentId: testStudent.id,
      },
    });

    // Generate attendance for all sessions in this class
    const clsSessions = sessionRecords.filter((sr) => sr.classId === cls.id);
    const testAttendanceData = clsSessions.map((sr) => {
      const roll = Math.random();
      let status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
      if (roll < 0.8) status = "PRESENT";
      else if (roll < 0.95) status = "ABSENT";
      else status = "LATE";

      return {
        sessionId: sr.session.id,
        studentId: testStudent.id,
        status,
        markedById: sr.teacherUserId,
      };
    });

    if (testAttendanceData.length > 0) {
      await prisma.attendance.createMany({ data: testAttendanceData });
      testAttendanceCount += testAttendanceData.length;
    }
  }
  console.log(`✅  Test Student enrolled in 5 classes with ${testAttendanceCount} attendance records`);

  // ─────────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(60));
  console.log("🎉  SEED COMPLETE!");
  console.log("═".repeat(60));
  console.log(`   University:    1`);
  console.log(`   Departments:   2`);
  console.log(`   Programs:      ${programs.length}`);
  console.log(`   Batches:       ${batches.length}`);
  console.log(`   Faculty:       ${facultyRecords.length}`);
  console.log(`   Students:      ${studentRecords.length}`);
  console.log(`   Classes:       ${classRecords.length}`);
  console.log(`   Sessions:      ${sessionRecords.length}`);
  console.log(`   Attendance:    ${totalAttendance}`);
  console.log("═".repeat(60));

  // Print sample credentials
  console.log("\n📋  SAMPLE CREDENTIALS:");
  console.log(`\n   Admin:  outr26 / ${ADMIN_PASSWORD}`);
  console.log(`\n   Faculty (first 3):`);
  for (let i = 0; i < 3; i++) {
    const f = facultyRecords[i];
    console.log(`     ${f.teacher.employeeId} / ${DEFAULT_PASSWORD}`);
  }
  console.log(`\n   Test Student: TEST123456 / ${DEFAULT_PASSWORD}`);
  console.log(`\n   Students (first 3):`);
  for (let i = 0; i < 3; i++) {
    const s = studentRecords[i];
    console.log(`     ${s.student.rollNumber} / ${DEFAULT_PASSWORD}`);
  }
}

// ─── Execute ───────────────────────────────────────────────────────────────────
main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("❌  Seed error:", e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
