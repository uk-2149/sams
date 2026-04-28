import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getUserFromRequest } from "../../../../../lib/getUserFromRequest";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ classid: string }> }
) {
  try {
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classid } = await params;
    const classId = classid;

    // 🔥 Validate access
    let classData;

    if (user.role === "UNIVERSITY_ADMIN") {
      classData = await prisma.class.findFirst({
        where: {
          id: classId,
          universityId: user.id,
        },
      });
    }

    if (user.role === "FACULTY") {
      classData = await prisma.class.findFirst({
        where: {
          id: classId,
          teachers: {
            some: {
              teacher: {
                userId: user.id,
              },
            },
          },
        },
      });
    }

    if (user.role === "STUDENT") {
      return NextResponse.json(
        { error: "Students cannot access class report" },
        { status: 403 }
      );
    }

    if (!classData) {
      return NextResponse.json(
        { error: "Class not found or access denied" },
        { status: 404 }
      );
    }

    // 🔥 Get total sessions
    const sessions = await prisma.session.findMany({
      where: {
        classId,
        isCompleted: true,
      },
      select: { id: true },
    });

    const sessionIds = sessions.map(s => s.id);

    const totalSessions = sessionIds.length;

    // 🔥 Get students in class
    const students = await prisma.classStudent.findMany({
      where: { classId },
      include: {
        student: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    const totalStudents = students.length;

    // 🔥 Get attendance records
    const attendance = await prisma.attendance.findMany({
      where: {
        sessionId: { in: sessionIds },
      },
    });

    // 🔥 Build per-student stats
    const studentStats = students.map(s => {
      const studentId = s.student.id;

      const records = attendance.filter(a => a.studentId === studentId);

      const presentCount = records.filter(r => r.status === "PRESENT").length;

      const percentage =
        totalSessions === 0
          ? 0
          : Math.round((presentCount / totalSessions) * 100);

      return {
        studentId,
        name: s.student.user.name,
        present: presentCount,
        total: totalSessions,
        percentage,
      };
    });

    // 🔥 Overall class percentage
    const totalPresent = attendance.filter(a => a.status === "PRESENT").length;

    const overallPercentage =
      totalSessions * totalStudents === 0
        ? 0
        : Math.round(
            (totalPresent / (totalSessions * totalStudents)) * 100
          );

    return NextResponse.json({
      success: true,
      data: {
        classId,
        totalStudents,
        totalSessions,
        overallPercentage,
        students: studentStats,
      },
    });
  } catch (err) {
    console.error("Class attendance report error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}