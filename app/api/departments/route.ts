import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getUserFromRequest } from "../../../lib/getUserFromRequest";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest();

    // 🔒 Only admin allowed
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

    // 🔑 IMPORTANT: filter by university
    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where: {
          universityId: user.id, // from JWT
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.department.count({
        where: {
          universityId: user.id,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: departments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get departments error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

const createDepartmentSchema = z.object({
  name: z.string().min(2),
  code: z.string().optional(),
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
    const { name, code } = createDepartmentSchema.parse(body);

    const department = await prisma.department.create({
      data: {
        name,
        code,
        universityId: user.id, // 🔑 critical
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Department created",
        data: department,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create department error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}