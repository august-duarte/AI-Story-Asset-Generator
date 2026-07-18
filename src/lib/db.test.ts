import { afterEach, describe, expect, it } from "vitest";

import { getDatabaseUrl } from "./db";

describe("getDatabaseUrl", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });

  it("throws when DATABASE_URL is missing", () => {
    delete process.env.DATABASE_URL;

    expect(() => getDatabaseUrl()).toThrow("DATABASE_URL is not set");
  });

  it("returns DATABASE_URL when set", () => {
    process.env.DATABASE_URL =
      "postgresql://user:pass@localhost:5432/test?sslmode=require";

    expect(getDatabaseUrl()).toBe(
      "postgresql://user:pass@localhost:5432/test?sslmode=require",
    );
  });
});
