import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { upsert } = vi.hoisted(() => ({
  upsert: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      upsert,
    },
  },
}));

import { compare } from "@/lib/auth/hash-password";

import { seedAdmin } from "./seed-admin";

describe("seedAdmin", () => {
  const originalAdminEmail = process.env.ADMIN_EMAIL;
  const originalAdminPassword = process.env.ADMIN_PASSWORD;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalAdminEmail === undefined) {
      delete process.env.ADMIN_EMAIL;
    } else {
      process.env.ADMIN_EMAIL = originalAdminEmail;
    }

    if (originalAdminPassword === undefined) {
      delete process.env.ADMIN_PASSWORD;
    } else {
      process.env.ADMIN_PASSWORD = originalAdminPassword;
    }
  });

  it("fails before querying the database when admin credentials are missing", async () => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;

    await expect(seedAdmin()).rejects.toThrow(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set",
    );
    expect(upsert).not.toHaveBeenCalled();
  });

  it("upserts an approved admin with a hashed password", async () => {
    process.env.ADMIN_EMAIL = "admin@example.com";
    process.env.ADMIN_PASSWORD = "admin-password";
    upsert.mockResolvedValue({ id: "admin_1" });

    await seedAdmin();

    expect(upsert).toHaveBeenCalledOnce();
    const call = upsert.mock.calls[0][0];

    expect(call.where).toEqual({ email: "admin@example.com" });
    expect(call.update).toEqual({
      passwordHash: expect.stringMatching(/^\$2[aby]\$/),
      role: "admin",
      status: "approved",
    });
    expect(call.create).toEqual({
      id: expect.any(String),
      email: "admin@example.com",
      passwordHash: expect.stringMatching(/^\$2[aby]\$/),
      role: "admin",
      status: "approved",
    });
    await expect(
      compare("admin-password", call.create.passwordHash),
    ).resolves.toBe(true);
  });
});
