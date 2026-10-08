import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  authCookieOptions,
  refreshAccessToken
} from "@/lib/auth";
import { getSupabaseConfig } from "@/lib/config";

async function accessTokenIsValid(token: string) {
  const config = getSupabaseConfig();
  if (!config) return false;

  try {
    const response = await fetch(config.url + "/auth/v1/user", {
      headers: {
        apikey: config.anonKey,
        authorization: "Bearer " + token
      },
      cache: "no-store"
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next();
  }

  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  if (access && await accessTokenIsValid(access)) {
    return NextResponse.next();
  }

  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  if (refresh) {
    const session = await refreshAccessToken(refresh);
    if (session?.access_token && session.refresh_token) {
      const response = NextResponse.next();
      response.cookies.set(ACCESS_COOKIE, session.access_token, authCookieOptions(60 * 60));
      response.cookies.set(REFRESH_COOKIE, session.refresh_token, authCookieOptions(60 * 60 * 24 * 30));
      return response;
    }
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin", "/admin/:path*"]
};
