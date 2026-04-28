import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getUserFromRequest } from "../../../../lib/getUserFromRequest";
import { z } from "zod";

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

    const [programs, total] = await Promise.all([
      prisma.program.findMany({
        where: {
          department: {
            universityId: user.id, // 🔑 CRITICAL
          },
        },
        include: {
          department: {
            select: { id: true, name: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.program.count({
        where: {
          department: {
            universityId: user.id,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: programs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get programs error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

const createProgramSchema = z.object({
  name: z.string().min(2),
  durationYears: z.number().optional(),
  departmentId: z.string(),
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
    const { name, durationYears, departmentId } =
      createProgramSchema.parse(body);

    // 🔥 IMPORTANT SECURITY CHECK
    // Ensure department belongs to this university
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

    const program = await prisma.program.create({
      data: {
        name,
        durationYears,
        departmentId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Program created",
        data: program,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create program error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}