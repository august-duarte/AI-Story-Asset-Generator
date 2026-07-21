import { describe, expect, it } from "vitest";

import { authCredentialsSchema, MIN_PASSWORD_LENGTH } from "./auth";

describe("authCredentialsSchema", () => {
  it("accepts a valid email and password of at least 8 characters", () => {
    const result = authCredentialsSchema.safeParse({
      email: "ada@example.com",
      password: "password1",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        email: "ada@example.com",
        password: "password1",
      });
    }
  });

  it("rejects an invalid email format", () => {
    const result = authCredentialsSchema.safeParse({
      email: "not-an-email",
      password: "password1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "email")).toBe(
        true,
      );
    }
  });

  it(`rejects a password shorter than ${MIN_PASSWORD_LENGTH} characters`, () => {
    const result = authCredentialsSchema.safeParse({
      email: "ada@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path[0] === "password"),
      ).toBe(true);
    }
  });
});
