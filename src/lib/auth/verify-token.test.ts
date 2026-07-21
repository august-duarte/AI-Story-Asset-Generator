import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { cookieStore, headerStore } = vi.hoisted(() => ({
  cookieStore: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
  headerStore: {
    get: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
  headers: vi.fn(async () => headerStore),
}));

import { AUTH_COOKIE_NAME } from "./cookies";
import { sign } from "./jwt";
import { verifyToken } from "./verify-token";

describe("verifyToken", () => {
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

  it("returns userId from a valid auth cookie", async () => {
    const token = await sign({
      sub: "user_42",
      email: "ada@example.com",
      role: "user",
      status: "approved",
    });
    cookieStore.get.mockReturnValue({
      name: AUTH_COOKIE_NAME,
      value: token,
    });

    await expect(verifyToken()).resolves.toEqual({ userId: "user_42" });
  });

  it("returns userId from a Bearer Authorization header when cookie is missing", async () => {
    const token = await sign({
      sub: "user_7",
      email: "grace@example.com",
      role: "admin",
      status: "approved",
    });
    headerStore.get.mockReturnValue(`Bearer ${token}`);

    await expect(verifyToken()).resolves.toEqual({ userId: "user_7" });
    expect(headerStore.get).toHaveBeenCalledWith("authorization");
  });

  it("prefers the auth cookie over the Authorization header", async () => {
    const cookieToken = await sign({
      sub: "cookie_user",
      email: "cookie@example.com",
      role: "user",
      status: "approved",
    });
    const headerToken = await sign({
      sub: "header_user",
      email: "header@example.com",
      role: "user",
      status: "approved",
    });
    cookieStore.get.mockReturnValue({
      name: AUTH_COOKIE_NAME,
      value: cookieToken,
    });
    headerStore.get.mockReturnValue(`Bearer ${headerToken}`);

    await expect(verifyToken()).resolves.toEqual({ userId: "cookie_user" });
  });

  it("throws Unauthorized when no token is present", async () => {
    await expect(verifyToken()).rejects.toThrow("Unauthorized");
  });

  it("throws when the token is invalid", async () => {
    cookieStore.get.mockReturnValue({
      name: AUTH_COOKIE_NAME,
      value: "not.a.valid.jwt",
    });

    await expect(verifyToken()).rejects.toThrow();
  });
});
