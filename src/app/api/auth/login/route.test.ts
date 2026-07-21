import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { cookieStore, findUnique } = vi.hoisted(() => ({
  cookieStore: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
  findUnique: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique,
    },
  },
}));

import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { hash } from "@/lib/auth/hash-password";

import { POST } from "./route";

function request(body: unknown): Request {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret-for-signing-tokens";
  });

  afterEach(() => {
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  });

  it("returns 400 before querying the database when credentials are invalid", async () => {
    const response = await POST(
      request({ email: "not-an-email", password: "short" }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid email or password",
    });
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("returns 401 when the email or password is incorrect", async () => {
    findUnique.mockResolvedValue(null);

    const response = await POST(
      request({ email: "missing@example.com", password: "password1" }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid credentials",
    });
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("returns 401 when the password does not match", async () => {
    findUnique.mockResolvedValue({
      id: "user_1",
      email: "ada@example.com",
      passwordHash: await hash("correct-password"),
      role: "user",
      status: "pending",
      createdAt: new Date("2026-07-20T12:00:00.000Z"),
    });

    const response = await POST(
      request({ email: "ada@example.com", password: "wrong-password" }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid credentials",
    });
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("sets a session cookie for a pending user without returning the token", async () => {
    findUnique.mockResolvedValue({
      id: "user_1",
      email: "ada@example.com",
      passwordHash: await hash("password1"),
      role: "user",
      status: "pending",
      createdAt: new Date("2026-07-20T12:00:00.000Z"),
    });

    const response = await POST(
      request({ email: "ada@example.com", password: "password1" }),
    );

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
    expect(JSON.stringify(body)).not.toContain("token");
    expect(cookieStore.set).toHaveBeenCalledWith(
      AUTH_COOKIE_NAME,
      expect.stringMatching(/^[^.]+\.[^.]+\.[^.]+$/),
      expect.objectContaining({ httpOnly: true }),
    );
  });
});
