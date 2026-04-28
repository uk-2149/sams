import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getUserFromRequest } from "../../../lib/getUserFromRequest";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest();

    // 🔒 Only admin
    if (!user || user.role !== "UNIVERSITY_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    const skip = (page - 1) * limit;

    const [faculties, total] = await Promise.all([
      prisma.teacher.findMany({
        where: {
          user: {
            universityId: user.id, // 🔑 critical
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take: limit,
      }),

      prisma.teacher.count({
        where: {
          user: {
            universityId: user.id,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: faculties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get faculties error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

const createFacultySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  employeeId: z.string().min(3),
  departmentId: z.string(),
  designation: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest();

    // 🔒 Only admin
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
      employeeId,
      departmentId,
      designation,
    } = createFacultySchema.parse(body);

    // 🔥 Check department belongs to this university
    const department = await prisma.department.findFirst({
      where: {
        id: departmentId,
        universityId: user.id,
      },
    });

    if (!department) {
      return NextResponse.json(
        { success: false, error: "Invalid department" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 Transaction (VERY IMPORTANT)
    const faculty = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: "FACULTY",
          universityId: user.id,
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          userId: newUser.id,
          employeeId,
          designation,
          departmentId,
        },
      });

      return { user: newUser, teacher };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Faculty created",
        data: faculty,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create faculty error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}