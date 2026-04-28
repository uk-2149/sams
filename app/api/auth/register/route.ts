// app/api/university/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../../../lib/prisma";

// Validation schema (matches your registration form)
const registerSchema = z.object({
  name: z.string().min(3, "University name must be at least 3 characters").max(255),
  email: z.string().email("Please enter a valid official email"),
  userId: z
    .string()
    .min(3, "User ID must be at least 3 characters")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "User ID can only contain lowercase letters, numbers and hyphens"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, userId, password } = registerSchema.parse(body);

    // Normalize userId (always lowercase for consistency)
    const normalizedUserId = userId.toLowerCase();

    // 1. Check if university already exists (email or userId)
    const existingByEmail = await prisma.university.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      return NextResponse.json(
        { success: false, error: "This email is already registered" },
        { status: 409 }
      );
    }

    const existingByUserId = await prisma.university.findUnique({
      where: { userId: normalizedUserId },
    });

    if (existingByUserId) {
      return NextResponse.json(
        { success: false, error: "This University User ID is already taken" },
        { status: 409 }
      );
    }

    // 2. Hash password (12 rounds = strong & fast enough for production)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create university (isVerified = true for MVP — change to false when you implement email verification)
    const university = await prisma.university.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        userId: normalizedUserId,
        password: hashedPassword,
        isVerified: true, // ← Set to false when email verification is added in next phase
      },
    });

    // 4. Create JWT (expires in exactly 1 hour)
    const token = jwt.sign(
      {
        id: university.id,
        userId: university.userId,
        role: "UNIVERSITY_ADMIN",
        email: university.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    // 5. Prepare response
    const response = NextResponse.json(
      {
        success: true,
        message: "University registered successfully",
        university: {
          id: university.id,
          name: university.name,
          userId: university.userId,
        },
      },
      { status: 201 }
    );

    // 6. Set secure httpOnly cookie (production-ready)
    response.cookies.set({
      name: "attendify-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour in seconds
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
        },
        { status: 400 }
      );
    }

    console.error("University registration error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}