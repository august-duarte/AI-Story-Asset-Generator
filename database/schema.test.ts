import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const schemaSql = readFileSync(
  join(process.cwd(), "database", "schema.sql"),
  "utf8",
);

describe("database/schema.sql", () => {
  it("documents enums, all tables, and key relationships", () => {
    expect(schemaSql).toMatch(/user_role/);
    expect(schemaSql).toMatch(/user_status/);

    for (const table of ["users", "stories", "assets", "usage_counters"]) {
      expect(schemaSql).toMatch(new RegExp(`CREATE TABLE ${table}`, "i"));
    }

    expect(schemaSql).toMatch(/REFERENCES users/i);
    expect(schemaSql).toMatch(/REFERENCES stories/i);
    expect(schemaSql).toMatch(/UNIQUE\s*\(\s*user_id\s*,\s*date\s*\)/i);
  });
});
