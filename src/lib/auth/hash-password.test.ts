import { describe, expect, it } from "vitest";

import { compare, hash } from "./hash-password";

describe("hash", () => {
  it("returns a bcrypt hash that is not the plaintext password", async () => {
    const password = "register-me-123";
    const passwordHash = await hash(password);

    expect(passwordHash).not.toBe(password);
    expect(passwordHash).toMatch(/^\$2[aby]\$/);
  });
});

describe("compare", () => {
  it("returns true when the password matches the stored hash", async () => {
    const password = "login-me-456";
    const passwordHash = await hash(password);

    await expect(compare(password, passwordHash)).resolves.toBe(true);
  });

  it("returns false when the password does not match the stored hash", async () => {
    const passwordHash = await hash("correct-password");

    await expect(compare("wrong-password", passwordHash)).resolves.toBe(false);
  });
});
