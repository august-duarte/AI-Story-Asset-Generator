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

import { ok } from "@/lib/api/responses";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { sign } from "@/lib/auth/jwt";

import { withAuth } from "./with-auth";

describe("withAuth", () => {
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

  it("calls the handler with the authenticated user when the session is valid", async () => {
    const token = await sign({
      sub: "user_1",
      email: "ada@example.com",
      role: "user",
    });
    cookieStore.get.mockReturnValue({
      name: AUTH_COOKIE_NAME,
      value: token,
    });
    findUnique.mockResolvedValue({
      id: "user_1",
      email: "ada@example.com",
      role: "user",
      status: "approved",
    });

    const handler = vi.fn(async (_request, auth) => ok(auth.user));
    const protectedHandler = withAuth(handler);
    const response = await protectedHandler(new Request("http://localhost/api/me"));

    expect(handler).toHaveBeenCalledWith(
      expect.any(Request),
      {
        user: {
          id: "user_1",
          email: "ada@example.com",
          role: "user",
          status: "approved",
        },
      },
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        id: "user_1",
        email: "ada@example.com",
        role: "user",
        status: "approved",
      },
    });
  });

  it("returns 401 when the session is missing", async () => {
    const handler = vi.fn(async () => ok({ ok: true }));
    const response = await withAuth(handler)(new Request("http://localhost/api/me"));

    expect(handler).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns 401 when the user no longer exists", async () => {
    const token = await sign({
      sub: "missing_user",
      email: "gone@example.com",
      role: "user",
    });
    cookieStore.get.mockReturnValue({
      name: AUTH_COOKIE_NAME,
      value: token,
    });
    findUnique.mockResolvedValue(null);

    const handler = vi.fn(async () => ok({ ok: true }));
    const response = await withAuth(handler)(new Request("http://localhost/api/me"));

    expect(handler).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns 403 when requireApproved and the user is not approved", async () => {
    const token = await sign({
      sub: "user_2",
      email: "pending@example.com",
      role: "user",
    });
    cookieStore.get.mockReturnValue({
      name: AUTH_COOKIE_NAME,
      value: token,
    });
    findUnique.mockResolvedValue({
      id: "user_2",
      email: "pending@example.com",
      role: "user",
      status: "pending",
    });

    const handler = vi.fn(async () => ok({ ok: true }));
    const response = await withAuth(handler, { requireApproved: true })(
      new Request("http://localhost/api/stories"),
    );

    expect(handler).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Forbidden" });
  });

  it("returns 403 when requireAdmin and the user is not an admin", async () => {
    const token = await sign({
      sub: "user_3",
      email: "member@example.com",
      role: "user",
    });
    cookieStore.get.mockReturnValue({
      name: AUTH_COOKIE_NAME,
      value: token,
    });
    findUnique.mockResolvedValue({
      id: "user_3",
      email: "member@example.com",
      role: "user",
      status: "approved",
    });

    const handler = vi.fn(async () => ok({ ok: true }));
    const response = await withAuth(handler, { requireAdmin: true })(
      new Request("http://localhost/api/admin"),
    );

    expect(handler).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Forbidden" });
  });

  it("allows an approved admin through requireApproved and requireAdmin", async () => {
    const token = await sign({
      sub: "admin_1",
      email: "admin@example.com",
      role: "admin",
    });
    cookieStore.get.mockReturnValue({
      name: AUTH_COOKIE_NAME,
      value: token,
    });
    findUnique.mockResolvedValue({
      id: "admin_1",
      email: "admin@example.com",
      role: "admin",
      status: "approved",
    });

    const handler = vi.fn(async (_request, auth) => ok(auth.user.id));
    const response = await withAuth(handler, {
      requireApproved: true,
      requireAdmin: true,
    })(new Request("http://localhost/api/admin"));

    expect(handler).toHaveBeenCalled();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: "admin_1" });
  });
});
