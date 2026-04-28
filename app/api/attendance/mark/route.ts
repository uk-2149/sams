import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getUserFromRequest } from "../../../../lib/getUserFromRequest";
import { z } from "zod";

const schema = z.object({
  sessionId: z.string(),
  records: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest();

    if (!user || user.role !== "FACULTY") {
      return NextResponse.json({ error: "Only faculty can mark attendance" }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, records } = schema.parse(body);

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { class: true },
    });

    if (!session || !session.isCompleted) {
      return NextResponse.json(
        { error: "Attendance can only be marked after session is completed" },
        { status: 400 }
      );
    }

    // 🔥 Check teacher owns session
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
    });

    if (!teacher || session.teacherId !== teacher.id) {
      return NextResponse.json({ error: "Not your session" }, { status: 403 });
    }

    // 🔥 Validate students belong to class
    const classStudents = await prisma.classStudent.findMany({
      where: { classId: session.classId },
      select: { studentId: true },
    });

    const validStudentIds = new Set(classStudents.map(s => s.studentId));

    const filtered = records.filter(r => validStudentIds.has(r.studentId));

    await prisma.attendance.createMany({
      data: filtered.map(r => ({
        sessionId,
        studentId: r.studentId,
        status: r.status,
        markedById: user.id,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}