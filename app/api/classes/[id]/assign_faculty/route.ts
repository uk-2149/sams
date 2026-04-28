import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getUserFromRequest } from "../../../../../lib/getUserFromRequest";
import { z } from "zod";

const schema = z.object({
  teacherId: z.string(), // this is Teacher.id (NOT userId)
  isPrimary: z.boolean().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest();

    // 🔒 Only admin
    if (!user || user.role !== "UNIVERSITY_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const classId = id;

    const body = await req.json();
    const { teacherId, isPrimary } = schema.parse(body);

    // 🔥 Validate class belongs to university
    const existingClass = await prisma.class.findFirst({
      where: {
        id: classId,
        universityId: user.id,
      },
    });

    if (!existingClass) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );
    }

    // 🔥 Validate teacher belongs to same university
    const teacher = await prisma.teacher.findFirst({
      where: {
        id: teacherId,
        user: {
          universityId: user.id,
        },
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: "Invalid teacher" },
        { status: 400 }
      );
    }

    // 🔥 Prevent duplicate assignment
    const alreadyAssigned = await prisma.classTeacher.findUnique({
      where: {
        classId_teacherId: {
          classId,
          teacherId,
        },
      },
    });

    if (alreadyAssigned) {
      return NextResponse.json(
        { success: false, error: "Teacher already assigned to this class" },
        { status: 409 }
      );
    }

    // 🔥 Handle primary teacher logic
    if (isPrimary) {
      await prisma.classTeacher.updateMany({
        where: { classId },
        data: { isPrimary: false },
      });
    }

    const assignment = await prisma.classTeacher.create({
      data: {
        classId,
        teacherId,
        isPrimary: isPrimary ?? false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Teacher assigned to class",
        data: assignment,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Assign teacher error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}