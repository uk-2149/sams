import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getUserFromRequest } from "../../../../lib/getUserFromRequest";
import { z } from "zod";
import { differenceInDays } from "date-fns";

const updateSchema = z.object({
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  reason: z.string().min(3),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, reason } = updateSchema.parse(body);

    const { id } = await params;

    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: {
        session: true,
      },
    });

    if (!attendance) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const sessionDate = attendance.session.date;
    const daysPassed = differenceInDays(new Date(), sessionDate);

    // 🔥 ADMIN → anytime
    if (user.role === "UNIVERSITY_ADMIN") {
      // allowed
    }

    // 🔥 FACULTY RULE
    else if (user.role === "FACULTY") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
      });

      if (!teacher || attendance.session.teacherId !== teacher.id) {
        return NextResponse.json({ error: "Not your record" }, { status: 403 });
      }

      if (daysPassed > 15) {
        return NextResponse.json(
          { error: "Cannot update after 15 days" },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        status,
        modifiedById: user.id,
        modifiedAt: new Date(),
        notes: reason,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const attendance = await prisma.attendance.findMany({
      where: { sessionId },
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

    return NextResponse.json({
      success: true,
      data: attendance,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}