import { ok } from "@/lib/api/responses";
import { clearAuthCookie } from "@/lib/auth/cookies";

export async function POST(): Promise<Response> {
  await clearAuthCookie();
  return ok({ loggedOut: true });
}
