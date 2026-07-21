import { describe, expect, it } from "vitest";

import { fail, ok } from "./responses";

describe("ok", () => {
  it("returns JSON { data } with status 200 by default", async () => {
    const response = ok({ id: "user_1" });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: { id: "user_1" } });
  });

  it("returns JSON { data } with a custom status code", async () => {
    const response = ok({ id: "user_1" }, 201);

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ data: { id: "user_1" } });
  });
});

describe("fail", () => {
  it("returns JSON { error } with the given status code", async () => {
    const response = fail("Invalid credentials", 400);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid credentials",
    });
  });
});
