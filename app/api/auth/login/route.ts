import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../../../lib/prisma";

const loginSchema = z.object({
  identifier: z.string().min(1, "ID is required"), // userId / employeeId / rollNumber
  password: z.string().min(1, "Password is required"),
  role: z.enum(["ADMIN", "FACULTY", "STUDENT"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password, role } = loginSchema.parse(body);

    let userData: any = null;
    let payload: any = null;

    // ================= ADMIN LOGIN =================
    if (role === "ADMIN") {
      const university = await prisma.university.findUnique({
        where: { userId: identifier.toLowerCase() },
      });

      if (!university) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const isValid = await bcrypt.compare(password, university.password);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials" },
          { status: 401 }
        );
      }

      payload = {
        id: university.id,
        role: "UNIVERSITY_ADMIN",
        userId: university.userId,
      };

      userData = {
        id: university.id,
        name: university.name,
        role: "ADMIN",
      };
    }

    // ================= FACULTY LOGIN =================
    if (role === "FACULTY") {
      const teacher = await prisma.teacher.findUnique({
        where: { employeeId: identifier },
        include: { user: true },
      });

      if (!teacher || !teacher.user) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const isValid = await bcrypt.compare(
        password,
        teacher.user.password
      );

      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials" },
          { status: 401 }
        );
      }

      payload = {
        id: teacher.user.id,
        role: "FACULTY",
        universityId: teacher.user.universityId,
      };

      userData = {
        id: teacher.user.id,
        name: teacher.user.name,
        role: "FACULTY",
      };
    }

    // ================= STUDENT LOGIN =================
    if (role === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { rollNumber: identifier },
        include: { user: true },
      });

      if (!student || !student.user) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const isValid = await bcrypt.compare(
        password,
        student.user.password
      );

      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials" },
          { status: 401 }
        );
      }

      payload = {
        id: student.user.id,
        role: "STUDENT",
        universityId: student.user.universityId,
      };

      userData = {
        id: student.user.id,
        name: student.user.name,
        role: "STUDENT",
      };
    }

    // ================= JWT =================
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: userData,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "attendify-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}