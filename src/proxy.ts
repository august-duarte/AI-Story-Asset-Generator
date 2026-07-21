import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verify } from "@/lib/auth/jwt";

export async function proxy(
  request: NextRequest,
): Promise<NextResponse | undefined> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const payload = await verify(token);

    if (payload.status !== "approved") {
      return NextResponse.redirect(new URL("/pending", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/library/:path*", "/stories/:path*", "/admin/:path*"],
};
