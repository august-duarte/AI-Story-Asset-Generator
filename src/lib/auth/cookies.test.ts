import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookieStore } = vi.hoisted(() => {
  const store = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  };
  return { cookieStore: store };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

import {
  AUTH_COOKIE_NAME,
  clearAuthCookie,
  getAuthToken,
  setAuthCookie,
} from "./cookies";

describe("setAuthCookie", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets an httpOnly session cookie with the token", async () => {
    await setAuthCookie("signed.jwt.token");

    expect(cookieStore.set).toHaveBeenCalledWith(
      AUTH_COOKIE_NAME,
      "signed.jwt.token",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      }),
    );
  });
});

describe("getAuthToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the auth cookie value when present", async () => {
    cookieStore.get.mockReturnValue({
      name: AUTH_COOKIE_NAME,
      value: "signed.jwt.token",
    });

    await expect(getAuthToken()).resolves.toBe("signed.jwt.token");
    expect(cookieStore.get).toHaveBeenCalledWith(AUTH_COOKIE_NAME);
  });

  it("returns undefined when the auth cookie is missing", async () => {
    cookieStore.get.mockReturnValue(undefined);

    await expect(getAuthToken()).resolves.toBeUndefined();
  });
});

describe("clearAuthCookie", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes the auth cookie", async () => {
    await clearAuthCookie();

    expect(cookieStore.delete).toHaveBeenCalledWith(AUTH_COOKIE_NAME);
  });
});
