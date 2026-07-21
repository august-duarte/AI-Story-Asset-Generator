import { fail, ok } from "@/lib/api/responses";
import { setAuthCookie } from "@/lib/auth/cookies";
import { compare } from "@/lib/auth/hash-password";
import { sign } from "@/lib/auth/jwt";
import { findByEmail } from "@/lib/queries/users";
import { authCredentialsSchema } from "@/lib/validations/auth";

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return fail("Invalid email or password", 400);
  }

  const credentials = authCredentialsSchema.safeParse(body);

  if (!credentials.success) {
    return fail("Invalid email or password", 400);
  }

  const user = await findByEmail(credentials.data.email);

  if (!user || !(await compare(credentials.data.password, user.passwordHash))) {
    return fail("Invalid credentials", 401);
  }

  const token = await sign({
    sub: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
  });
  await setAuthCookie(token);

  return ok({
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  });
}
