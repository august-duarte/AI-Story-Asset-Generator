import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { TokenPayload } from "./jwt";
import { sign, verify } from "./jwt";

describe("jwt helpers", () => {
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

  it("sign returns a compact JWT string for the given claims", async () => {
    const payload: TokenPayload = {
      sub: "user_1",
      email: "ada@example.com",
      role: "user",
      status: "pending",
    };

    const token = await sign(payload);

    expect(token.split(".")).toHaveLength(3);
  });

  it("verify returns the claims that were signed", async () => {
    const payload: TokenPayload = {
      sub: "user_2",
      email: "grace@example.com",
      role: "admin",
      status: "approved",
    };

    const token = await sign(payload);

    await expect(verify(token)).resolves.toEqual(payload);
  });

  it("verify rejects a tampered token", async () => {
    const token = await sign({
      sub: "user_3",
      email: "alan@example.com",
      role: "user",
      status: "approved",
    });

    const tampered = `${token.slice(0, -4)}xxxx`;

    await expect(verify(tampered)).rejects.toThrow();
  });

  it("throws when JWT_SECRET is missing", async () => {
    delete process.env.JWT_SECRET;

    await expect(
      sign({
        sub: "user_4",
        email: "kathy@example.com",
        role: "user",
        status: "pending",
      }),
    ).rejects.toThrow("JWT_SECRET is not set");
  });
});
