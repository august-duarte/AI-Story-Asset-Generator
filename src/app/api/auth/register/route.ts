import { fail, ok } from "@/lib/api/responses";
import { hash } from "@/lib/auth/hash-password";
import { createUser, findByEmail } from "@/lib/queries/users";
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

  const existingUser = await findByEmail(credentials.data.email);

  if (existingUser) {
    return fail("Email is already registered", 409);
  }

  const passwordHash = await hash(credentials.data.password);
  const user = await createUser({
    email: credentials.data.email,
    passwordHash,
    role: "user",
  });

  return ok(user, 201);
}
