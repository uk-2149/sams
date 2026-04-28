import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getUserFromRequest } from "../../../../../lib/getUserFromRequest";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest();

    if (!user || user.role === "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const classId = id;

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // 🔒 Validate access
    let classExists;

    if (user.role === "UNIVERSITY_ADMIN") {
      classExists = await prisma.class.findFirst({
        where: { id: classId, universityId: user.id },
      });
    }

    if (user.role === "FACULTY") {
      classExists = await prisma.class.findFirst({
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

    if (!classExists) {
      return NextResponse.json(
        { error: "Class not found or access denied" },
        { status: 404 }
      );
    }

    // 🔥 Sessions
    const sessionWhere: any = {
      classId,
      isCompleted: true,
    };

    if (startDateParam || endDateParam) {
      sessionWhere.date = {};
      if (startDateParam) sessionWhere.date.gte = new Date(startDateParam);
      if (endDateParam) sessionWhere.date.lte = new Date(endDateParam);
    }

    const sessions = await prisma.session.findMany({
      where: sessionWhere,
      select: { id: true },
    });

    const sessionIds = sessions.map(s => s.id);
    const totalSessions = sessionIds.length;

    // 🔥 Students
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

    // 🔥 Attendance
    const attendance = await prisma.attendance.findMany({
      where: {
        sessionId: { in: sessionIds },
      },
    });

    // 🔥 Per-student stats
    const studentStats = students.map(s => {
      const studentId = s.student.id;

      const records = attendance.filter(a => a.studentId === studentId);

      const present = records.filter(r => r.status === "PRESENT").length;

      const percentage =
        totalSessions === 0
          ? 0
          : Math.round((present / totalSessions) * 100);

      return {
        studentId,
        rollNumber: s.student.rollNumber,
        name: s.student.user.name,
        present,
        total: totalSessions,
        percentage,
      };
    });

    // 🔥 Overall %
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
    console.error("Class analytics error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}