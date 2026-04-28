import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export interface AuthUser {
  id: string;
  role: string;
  userId?: string;
  universityId?: string;
}

export async function getUserFromRequest(): Promise<AuthUser | null> {
  const cookieStore = await cookies(); // ✅ FIX
  const token = cookieStore.get("attendify-token")?.value;

  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
  } catch {
    return null;
  }
}