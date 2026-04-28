import jwt from "jsonwebtoken";

export interface AuthPayload {
  id: string;
  userId: string;
  role: string;
  email: string;
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
  } catch (err) {
    return null;
  }
}