import { beforeEach, describe, expect, it, vi } from "vitest";

const { create, findUnique } = vi.hoisted(() => ({
  create: vi.fn(),
  findUnique: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      create,
      findUnique,
    },
  },
}));

import { POST } from "./route";

function request(body: unknown): Request {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 before querying the database when credentials are invalid", async () => {
    const response = await POST(
      request({ email: "not-an-email", password: "short" }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid email or password",
    });
    expect(findUnique).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("returns 409 when the email is already registered", async () => {
    findUnique.mockResolvedValue({
      id: "existing_user",
      email: "ada@example.com",
    });

    const response = await POST(
      request({ email: "ada@example.com", password: "password1" }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "Email is already registered",
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("hashes the password and creates a pending user with role user", async () => {
    findUnique.mockResolvedValue(null);
    create.mockImplementation(async ({ data }) => ({
      ...data,
      createdAt: new Date("2026-07-20T12:00:00.000Z"),
    }));

    const response = await POST(
      request({ email: "ada@example.com", password: "password1" }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      data: {
        id: expect.any(String),
        email: "ada@example.com",
        role: "user",
        status: "pending",
        createdAt: "2026-07-20T12:00:00.000Z",
      },
    });
    expect(create).toHaveBeenCalledWith({
      data: {
        id: expect.any(String),
        email: "ada@example.com",
        passwordHash: expect.stringMatching(/^\$2[aby]\$/),
        role: "user",
        status: "pending",
      },
    });
  });
});
