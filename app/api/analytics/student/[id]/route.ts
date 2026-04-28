import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getUserFromRequest } from "../../../../../lib/getUserFromRequest";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const studentId = id;

    // 🔒 Access control
    if (user.role === "STUDENT" && user.id !== studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (user.role === "FACULTY") {
      // optional: restrict only if student belongs to their class (skip for now)
    }

    // 🔥 Get attendance records
    const attendance = await prisma.attendance.findMany({
      where: { studentId },
      include: {
        session: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!attendance.length) {
      return NextResponse.json({
        success: true,
        data: {
          totalSessions: 0,
          present: 0,
          percentage: 0,
          classes: [],
        },
      });
    }

    // 🔥 Overall stats
    const totalSessions = attendance.length;
    const present = attendance.filter(a => a.status === "PRESENT").length;
    const percentage = Math.round((present / totalSessions) * 100);

    // 🔥 Per-class breakdown
    const classMap: Record<string, any> = {};

    attendance.forEach(a => {
      const classId = a.session.classId;
      const className = a.session.class.name;

      if (!classMap[classId]) {
        classMap[classId] = {
          classId,
          className,
          total: 0,
          present: 0,
        };
      }

      classMap[classId].total++;

      if (a.status === "PRESENT") {
        classMap[classId].present++;
      }
    });

    const classes = Object.values(classMap).map((c: any) => ({
      ...c,
      percentage: Math.round((c.present / c.total) * 100),
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalSessions,
        present,
        percentage,
        classes,
      },
    });
  } catch (err) {
    console.error("Student analytics error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}