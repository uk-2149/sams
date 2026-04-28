import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getUserFromRequest } from "../../../lib/getUserFromRequest";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest();

    if (!user || user.role !== "UNIVERSITY_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    const departmentId = searchParams.get("departmentId");
    const programId = searchParams.get("programId");
    const batchId = searchParams.get("batchId");

    const skip = (page - 1) * limit;

    const where: any = {
      user: {
        universityId: user.id, // 🔑 always enforce
      },
    };

    // 🔥 Dynamic filters
    if (batchId) {
      where.batchId = batchId;
    } else if (programId) {
      where.batch = { programId };
    } else if (departmentId) {
      where.batch = {
        program: {
          departmentId,
        },
      };
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          batch: {
            include: {
              program: {
                include: {
                  department: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
      }),

      prisma.student.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get students error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

const createStudentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  rollNumber: z.string().min(3),
  batchId: z.string(),
  enrollmentYear: z.number(),
  currentSemester: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest();

    if (!user || user.role !== "UNIVERSITY_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      password,
      rollNumber,
      batchId,
      enrollmentYear,
      currentSemester,
    } = createStudentSchema.parse(body);

    // 🔥 Validate batch belongs to this university
    const batch = await prisma.batch.findFirst({
      where: {
        id: batchId,
        program: {
          department: {
            universityId: user.id,
          },
        },
      },
    });

    if (!batch) {
      return NextResponse.json(
        { success: false, error: "Invalid batch" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: "STUDENT",
          universityId: user.id,
        },
      });

      const newStudent = await tx.student.create({
        data: {
          userId: newUser.id,
          rollNumber,
          batchId,
          enrollmentYear,
          currentSemester,
        },
      });

      return { user: newUser, student: newStudent };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Student created",
        data: student,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create student error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}