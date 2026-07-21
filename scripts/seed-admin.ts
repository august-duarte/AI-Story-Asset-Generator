import "dotenv/config";

import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { hash } from "@/lib/auth/hash-password";
import { db } from "@/lib/db";

export async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
  }

  const passwordHash = await hash(password);
  const admin = {
    passwordHash,
    role: "admin" as const,
    status: "approved" as const,
  };

  await db.user.upsert({
    where: { email },
    update: admin,
    create: {
      id: crypto.randomUUID(),
      email,
      ...admin,
    },
  });
}

async function main(): Promise<void> {
  try {
    await seedAdmin();
    console.log("Admin user seeded.");
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await db.$disconnect();
  }
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRun) {
  void main();
}
