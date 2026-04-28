import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getUserFromRequest } from "../../../lib/getUserFromRequest";
import { z } from "zod";

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
    const programId = searchParams.get("programId");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 50);
    const skip = (page - 1) * limit;

    const where: any = {
      program: {
        department: {
          universityId: user.id,
        },
      },
    };

    if (programId) {
      where.programId = programId;
    }

    const [batches, total] = await Promise.all([
      prisma.batch.findMany({
        where,
        include: {
          program: {
            select: { id: true, name: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.batch.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: batches,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Get batches error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

const createBatchSchema = z.object({
  year: z.string().min(2),
  startYear: z.number(),
  endYear: z.number().optional(),
  programId: z.string(),
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
    const { year, startYear, endYear, programId } = createBatchSchema.parse(body);

    // Validate program belongs to university
    const program = await prisma.program.findFirst({
      where: {
        id: programId,
        department: { universityId: user.id },
      },
    });

    if (!program) {
      return NextResponse.json(
        { success: false, error: "Invalid program" },
        { status: 400 }
      );
    }

    const batch = await prisma.batch.create({
      data: { year, startYear, endYear, programId },
    });

    return NextResponse.json(
      { success: true, message: "Batch created", data: batch },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create batch error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
