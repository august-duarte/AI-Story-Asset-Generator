import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { cookieStore, headerStore, findUnique } = vi.hoisted(() => ({
  cookieStore: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
  headerStore: {
    get: vi.fn(),
  },
  findUnique: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
  headers: vi.fn(async () => headerStore),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique,
    },
  },
}));

import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { sign } from "@/lib/auth/jwt";

import { GET } from "./route";

describe("GET /api/auth/me", () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret-for-signing-tokens";
    cookieStore.get.mockReturnValue(undefined);
    headerStore.get.mockReturnValue(null);
  });

  afterEach(() => {
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  });

  it("returns 401 when no valid session exists", async () => {
    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("returns the current user without the password hash", async () => {
    const token = await sign({
      sub: "user_1",
      email: "ada@example.com",
      role: "user",
      status: "pending",
    });
    cookieStore.get.mockReturnValue({
      name: AUTH_COOKIE_NAME,
      value: token,
    });
    findUnique.mockResolvedValue({
      id: "user_1",
      email: "ada@example.com",
      passwordHash: "$2a$10$secret",
      role: "user",
      status: "pending",
      createdAt: new Date("2026-07-20T12:00:00.000Z"),
    });

    const response = await GET();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      data: {
        id: "user_1",
        email: "ada@example.com",
        role: "user",
        status: "pending",
        createdAt: "2026-07-20T12:00:00.000Z",
      },
    });
    expect(body.data).not.toHaveProperty("passwordHash");
    expect(body.data).not.toHaveProperty("password_hash");
  });
});
