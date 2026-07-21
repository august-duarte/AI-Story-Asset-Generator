import { fail } from "@/lib/api/responses";
import { verifyToken } from "@/lib/auth/verify-token";
import { db } from "@/lib/db";
import type { UserDto } from "@/types/user";

export type AuthUser = Pick<UserDto, "id" | "email" | "role" | "status">;

export type AuthContext = {
  user: AuthUser;
};

export type WithAuthOptions = {
  requireApproved?: boolean;
  requireAdmin?: boolean;
};

type AuthenticatedHandler = (
  request: Request,
  auth: AuthContext,
) => Promise<Response> | Response;

export function withAuth(
  handler: AuthenticatedHandler,
  options: WithAuthOptions = {},
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    let userId: string;

    try {
      ({ userId } = await verifyToken());
    } catch {
      return fail("Unauthorized", 401);
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return fail("Unauthorized", 401);
    }

    if (options.requireApproved && user.status !== "approved") {
      return fail("Forbidden", 403);
    }

    if (options.requireAdmin && user.role !== "admin") {
      return fail("Forbidden", 403);
    }

    return handler(request, { user });
  };
}
