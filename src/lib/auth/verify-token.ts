import { headers } from "next/headers";

import { getAuthToken } from "./cookies";
import { verify } from "./jwt";

function bearerToken(authorization: string | null): string | undefined {
  if (!authorization?.startsWith("Bearer ")) {
    return undefined;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token.length > 0 ? token : undefined;
}

export async function verifyToken(): Promise<{ userId: string }> {
  const headerStore = await headers();
  const token =
    (await getAuthToken()) ?? bearerToken(headerStore.get("authorization"));

  if (!token) {
    throw new Error("Unauthorized");
  }

  const payload = await verify(token);
  return { userId: payload.sub };
}
