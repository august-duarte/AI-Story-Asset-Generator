import { SignJWT, jwtVerify } from "jose";

import type { UserRole, UserStatus } from "@/types/user";

export type TokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

const TOKEN_EXPIRATION = "7d";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  return new TextEncoder().encode(secret);
}

export async function sign(payload: TokenPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
    status: payload.status,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(getJwtSecret());
}

export async function verify(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret());

  if (
    typeof payload.sub !== "string" ||
    typeof payload.email !== "string" ||
    (payload.role !== "admin" && payload.role !== "user") ||
    (payload.status !== "pending" &&
      payload.status !== "approved" &&
      payload.status !== "rejected")
  ) {
    throw new Error("Invalid token payload");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
    status: payload.status,
  };
}
