import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getUserFromRequest } from "../../../lib/getUserFromRequest";
import { z } from "zod";

const createClassSchema = z.object({
  name: z.string().min(2),
  code: z.string().optional(),
  semester: z.number().optional(),
  section: z.string().optional(),
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
    const { name, code, semester, section } =
      createClassSchema.parse(body);

    const newClass = await prisma.class.create({
      data: {
        name,
        code,
        semester,
        section,
        universityId: user.id, // 🔑 critical
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Class created",
        data: newClass,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create class error:", err);
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

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    const departmentId = searchParams.get("departmentId");
    const programId = searchParams.get("programId");
    const semester = searchParams.get("semester");

    const skip = (page - 1) * limit;

    let where: any = {};

    // ================= ROLE-BASED ACCESS =================

    if (user.role === "UNIVERSITY_ADMIN") {
      where.universityId = user.id;
    }

    if (user.role === "FACULTY") {
      where = {
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
      where = {
        students: {
          some: {
            student: {
              userId: user.id,
            },
          },
        },
      };
    }

    // ================= FILTERS (ONLY FOR ADMIN) =================

    if (user.role === "UNIVERSITY_ADMIN") {
      if (semester) {
        where.semester = Number(semester);
      }

      if (departmentId) {
        where.students = {
          some: {
            student: {
              batch: {
                program: {
                  departmentId,
                },
              },
            },
          },
        };
      }

      if (programId) {
        where.students = {
          some: {
            student: {
              batch: {
                programId,
              },
            },
          },
        };
      }
    }

    // ================= QUERY =================

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        include: {
          teachers: {
            include: {
              teacher: {
                include: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          students: {
            select: {
              id: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),

      prisma.class.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: classes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get classes error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}