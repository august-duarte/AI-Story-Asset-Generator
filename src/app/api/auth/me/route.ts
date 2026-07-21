import { fail, ok } from "@/lib/api/responses";
import { verifyToken } from "@/lib/auth/verify-token";
import { findById } from "@/lib/queries/users";

export async function GET(): Promise<Response> {
  let userId: string;

  try {
    ({ userId } = await verifyToken());
  } catch {
    return fail("Unauthorized", 401);
  }

  const user = await findById(userId);

  if (!user) {
    return fail("Unauthorized", 401);
  }

  return ok(user);
}
