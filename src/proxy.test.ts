import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { sign } from "@/lib/auth/jwt";
import type { UserStatus } from "@/types/user";

import { proxy } from "./proxy";

async function requestWithSession(
  path: string,
  status: UserStatus,
): Promise<NextRequest> {
  const token = await sign({
    sub: "user_1",
    email: "ada@example.com",
    role: "user",
    status,
  });
  const request = new NextRequest(`http://localhost${path}`);
  request.cookies.set(AUTH_COOKIE_NAME, token);
  return request;
}

function redirectPath(response: Response | undefined): string | undefined {
  const location = response?.headers.get("location");
  return location ? new URL(location).pathname : undefined;
}

describe("proxy route protection", () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret-for-signing-tokens";
  });

  afterEach(() => {
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  });

  it("redirects unauthenticated users to /login", async () => {
    const response = await proxy(new NextRequest("http://localhost/library"));

    expect(redirectPath(response)).toBe("/login");
  });

  it("redirects users with an invalid token to /login", async () => {
    const request = new NextRequest("http://localhost/stories/abc");
    request.cookies.set(AUTH_COOKIE_NAME, "not.a.valid.jwt");

    const response = await proxy(request);

    expect(redirectPath(response)).toBe("/login");
  });

  it("redirects pending users to /pending", async () => {
    const response = await proxy(
      await requestWithSession("/library", "pending"),
    );

    expect(redirectPath(response)).toBe("/pending");
  });

  it("redirects rejected users to /pending", async () => {
    const response = await proxy(
      await requestWithSession("/admin", "rejected"),
    );

    expect(redirectPath(response)).toBe("/pending");
  });

  it("lets approved users through", async () => {
    const response = await proxy(
      await requestWithSession("/stories/abc", "approved"),
    );

    expect(redirectPath(response)).toBeUndefined();
  });
});
