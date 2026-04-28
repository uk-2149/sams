import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getUserFromRequest } from "../../../lib/getUserFromRequest";
import { z } from "zod";

const schema = z.object({
  classId: z.string(),
  date: z.string(), // ISO string
  startTime: z.string().optional(),
  topic: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest();

    if (!user || (user.role !== "UNIVERSITY_ADMIN" && user.role !== "FACULTY")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { classId, date, startTime, topic } = schema.parse(body);

    // 🔥 Validate class access
    let classExists;

    if (user.role === "UNIVERSITY_ADMIN") {
      classExists = await prisma.class.findFirst({
        where: { id: classId, universityId: user.id },
      });
    } else {
      // faculty
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
        { success: false, error: "Class not found or access denied" },
        { status: 404 }
      );
    }

    // 🔥 Get teacherId (important for faculty)
    let teacherId: string;

    if (user.role === "FACULTY") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
      });

      if (!teacher) {
        return NextResponse.json(
          { success: false, error: "Teacher not found" },
          { status: 400 }
        );
      }

      teacherId = teacher.id;
    } else {
      // admin creating session → no teacher (optional case)
      teacherId = "";
    }

    const session = await prisma.session.create({
      data: {
        classId,
        teacherId,
        date: new Date(date),
        startTime: startTime ? new Date(startTime) : undefined,
        topic,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Session created",
        data: session,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create session error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json(
        { success: false, error: "classId is required" },
        { status: 400 }
      );
    }

    let where: any = { classId };

    // 🔥 Role-based filtering
    if (user.role === "UNIVERSITY_ADMIN") {
      where.class = { universityId: user.id };
    }

    if (user.role === "FACULTY") {
      where.class = {
        teachers: {
          some: {
            teacher: {
              userId: user.id,
            },
          },
        },
      };
    }

    if (user.role === "STUDENT") {
      where.class = {
        students: {
          some: {
            student: {
              userId: user.id,
            },
          },
        },
      };
    }

    const sessions = await prisma.session.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (err) {
    console.error("Get sessions error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}