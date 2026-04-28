import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getUserFromRequest } from "../../../../lib/getUserFromRequest";

export async function GET() {
  try {
    const user = await getUserFromRequest();

    if (!user || user.role !== "UNIVERSITY_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [totalFaculty, totalStudents, totalClasses, totalDepartments, totalPrograms, totalSessions14Days] =
      await Promise.all([
        prisma.teacher.count({
          where: { user: { universityId: user.id } },
        }),
        prisma.student.count({
          where: { user: { universityId: user.id } },
        }),
        prisma.class.count({
          where: { universityId: user.id },
        }),
        prisma.department.count({
          where: { universityId: user.id },
        }),
        prisma.program.count({
          where: { department: { universityId: user.id } },
        }),
        prisma.session.count({
          where: {
            class: { universityId: user.id },
            date: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
          },
        }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        totalFaculty,
        totalStudents,
        totalClasses,
        totalDepartments,
        totalPrograms,
        totalSessions14Days,
      },
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
