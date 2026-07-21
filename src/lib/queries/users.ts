import { db } from "@/lib/db";
import type { UserDto, UserRole, UserStatus } from "@/types/user";

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
};

function toUserDto(user: UserRecord): UserDto {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
  role?: UserRole;
}): Promise<UserDto> {
  const user = await db.user.create({
    data: {
      id: crypto.randomUUID(),
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role ?? "user",
      status: "pending",
    },
  });

  return toUserDto(user);
}

export async function findByEmail(email: string): Promise<UserRecord | null> {
  return db.user.findUnique({
    where: { email },
  });
}

export async function findById(id: string): Promise<UserDto | null> {
  const user = await db.user.findUnique({
    where: { id },
  });

  return user ? toUserDto(user) : null;
}

export async function listUsers(): Promise<UserDto[]> {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return users.map(toUserDto);
}

export async function setStatus(
  id: string,
  status: UserStatus,
): Promise<UserDto> {
  const user = await db.user.update({
    where: { id },
    data: { status },
  });

  return toUserDto(user);
}
