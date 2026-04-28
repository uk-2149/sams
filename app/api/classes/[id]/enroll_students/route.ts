import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getUserFromRequest } from "../../../../../lib/getUserFromRequest";
import { z } from "zod";

const schema = z.object({
  studentIds: z.array(z.string()).min(1), // bulk input
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
    const { studentIds } = schema.parse(body);

    // Validate class belongs to university
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

    // 🔥 Validate all students belong to same university
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        user: {
          universityId: user.id,
        },
      },
      select: { id: true },
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { success: false, error: "Some students are invalid or not in your university" },
        { status: 400 }
      );
    }

    // 🔥 Get already enrolled students (to avoid duplicates)
    const existingEnrollments = await prisma.classStudent.findMany({
      where: {
        classId,
        studentId: { in: studentIds },
      },
      select: { studentId: true },
    });

    const alreadyEnrolledIds = new Set(
      existingEnrollments.map((e) => e.studentId)
    );

    // 🔥 Filter only new students
    const newStudentIds = studentIds.filter(
      (id) => !alreadyEnrolledIds.has(id)
    );

    if (newStudentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "All students already enrolled" },
        { status: 409 }
      );
    }

    // 🔥 Bulk insert
    await prisma.classStudent.createMany({
      data: newStudentIds.map((studentId) => ({
        classId,
        studentId,
      })),
      skipDuplicates: true, // extra safety
    });

    return NextResponse.json(
      {
        success: true,
        message: "Students enrolled successfully",
        addedCount: newStudentIds.length,
        skippedCount: studentIds.length - newStudentIds.length,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Enroll students error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}