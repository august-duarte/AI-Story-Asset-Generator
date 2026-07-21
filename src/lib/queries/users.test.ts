import { beforeEach, describe, expect, it, vi } from "vitest";

const { create, findUnique, findMany, update } = vi.hoisted(() => ({
  create: vi.fn(),
  findUnique: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      create,
      findUnique,
      findMany,
      update,
    },
  },
}));

import {
  createUser,
  findByEmail,
  findById,
  listUsers,
  setStatus,
} from "./users";

const sampleUser = {
  id: "user_1",
  email: "ada@example.com",
  passwordHash: "$2a$10$hash",
  role: "user" as const,
  status: "pending" as const,
  createdAt: new Date("2026-07-20T12:00:00.000Z"),
};

describe("createUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "11111111-1111-4111-8111-111111111111",
    );
  });

  it("creates a pending user and returns a UserDto without the password hash", async () => {
    create.mockResolvedValue({
      ...sampleUser,
      id: "11111111-1111-4111-8111-111111111111",
    });

    const result = await createUser({
      email: "ada@example.com",
      passwordHash: "$2a$10$hash",
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        email: "ada@example.com",
        passwordHash: "$2a$10$hash",
        role: "user",
        status: "pending",
      },
    });
    expect(result).toEqual({
      id: "11111111-1111-4111-8111-111111111111",
      email: "ada@example.com",
      role: "user",
      status: "pending",
      createdAt: "2026-07-20T12:00:00.000Z",
    });
    expect(result).not.toHaveProperty("passwordHash");
  });
});

describe("findByEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the user record including passwordHash when found", async () => {
    findUnique.mockResolvedValue(sampleUser);

    await expect(findByEmail("ada@example.com")).resolves.toEqual(sampleUser);
    expect(findUnique).toHaveBeenCalledWith({
      where: { email: "ada@example.com" },
    });
  });

  it("returns null when no user matches the email", async () => {
    findUnique.mockResolvedValue(null);

    await expect(findByEmail("missing@example.com")).resolves.toBeNull();
  });
});

describe("findById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a UserDto when found", async () => {
    findUnique.mockResolvedValue(sampleUser);

    await expect(findById("user_1")).resolves.toEqual({
      id: "user_1",
      email: "ada@example.com",
      role: "user",
      status: "pending",
      createdAt: "2026-07-20T12:00:00.000Z",
    });
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "user_1" },
    });
  });

  it("returns null when no user matches the id", async () => {
    findUnique.mockResolvedValue(null);

    await expect(findById("missing")).resolves.toBeNull();
  });
});

describe("listUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns UserDto records ordered by createdAt descending", async () => {
    findMany.mockResolvedValue([
      sampleUser,
      {
        ...sampleUser,
        id: "user_2",
        email: "grace@example.com",
        status: "approved",
        createdAt: new Date("2026-07-19T12:00:00.000Z"),
      },
    ]);

    await expect(listUsers()).resolves.toEqual([
      {
        id: "user_1",
        email: "ada@example.com",
        role: "user",
        status: "pending",
        createdAt: "2026-07-20T12:00:00.000Z",
      },
      {
        id: "user_2",
        email: "grace@example.com",
        role: "user",
        status: "approved",
        createdAt: "2026-07-19T12:00:00.000Z",
      },
    ]);
    expect(findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("setStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates the user status and returns a UserDto", async () => {
    update.mockResolvedValue({
      ...sampleUser,
      status: "approved",
    });

    await expect(setStatus("user_1", "approved")).resolves.toEqual({
      id: "user_1",
      email: "ada@example.com",
      role: "user",
      status: "approved",
      createdAt: "2026-07-20T12:00:00.000Z",
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { status: "approved" },
    });
  });
});
