import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getUserFromRequest } from "../../../../../lib/getUserFromRequest";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest();

    if (!user || (user.role !== "UNIVERSITY_ADMIN" && user.role !== "FACULTY")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const sessionId = id;

    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
      },
      include: {
        class: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    // 🔥 Access control
    if (user.role === "UNIVERSITY_ADMIN") {
      if (session.class.universityId !== user.id) {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        );
      }
    }

    if (user.role === "FACULTY") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
      });

      if (!teacher || session.teacherId !== teacher.id) {
        return NextResponse.json(
          { success: false, error: "Not your session" },
          { status: 403 }
        );
      }
    }

    const updated = await prisma.session.update({
      where: { id: sessionId },
      data: {
        isCompleted: true,
        endTime: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Session completed",
      data: updated,
    });
  } catch (err) {
    console.error("Complete session error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}