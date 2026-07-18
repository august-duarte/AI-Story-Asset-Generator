import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationsDir = join(process.cwd(), "database", "migrations");

function readMigration(name: string): string {
  return readFileSync(join(migrationsDir, name), "utf8");
}

describe("database migrations", () => {
  it("001_users creates admin-gated users table", () => {
    const sql = readMigration("001_users.sql");

    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS users/i);
    for (const column of [
      "id",
      "email",
      "password_hash",
      "role",
      "status",
      "created_at",
    ]) {
      expect(sql).toContain(column);
    }
    expect(sql).toMatch(/admin/);
    expect(sql).toMatch(/pending/);
    expect(sql).toMatch(/approved/);
    expect(sql).toMatch(/rejected/);
  });

  it("002_stories creates stories owned by users", () => {
    const sql = readMigration("002_stories.sql");

    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS stories/i);
    for (const column of [
      "id",
      "user_id",
      "theme",
      "tone",
      "style",
      "title",
      "body_json",
      "created_at",
    ]) {
      expect(sql).toContain(column);
    }
    expect(sql).toMatch(/REFERENCES users/i);
  });

  it("003_assets creates assets with excerpt offsets and blob url", () => {
    const sql = readMigration("003_assets.sql");

    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS assets/i);
    for (const column of [
      "id",
      "story_id",
      "excerpt_text",
      "start_offset",
      "end_offset",
      "prompt_used",
      "blob_url",
      "created_at",
    ]) {
      expect(sql).toContain(column);
    }
    expect(sql).toMatch(/REFERENCES stories/i);
  });

  it("004_usage creates daily counters unique on user and date", () => {
    const sql = readMigration("004_usage.sql");

    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS usage_counters/i);
    for (const column of [
      "user_id",
      "date",
      "stories_used",
      "images_used",
    ]) {
      expect(sql).toContain(column);
    }
    expect(sql).toMatch(/UNIQUE\s*\(\s*user_id\s*,\s*date\s*\)/i);
    expect(sql).toMatch(/REFERENCES users/i);
  });
});
