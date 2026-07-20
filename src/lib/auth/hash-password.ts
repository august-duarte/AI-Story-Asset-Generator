import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export function hash(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function compare(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
