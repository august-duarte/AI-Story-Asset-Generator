import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookieStore } = vi.hoisted(() => ({
  cookieStore: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";

import { POST } from "./route";

describe("POST /api/auth/logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears the session cookie", async () => {
    const response = await POST();

    expect(cookieStore.delete).toHaveBeenCalledWith(AUTH_COOKIE_NAME);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: { loggedOut: true },
    });
  });
});
