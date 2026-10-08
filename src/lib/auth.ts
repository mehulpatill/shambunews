import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseConfig } from "@/lib/config";
import { rest, ApiError } from "@/lib/api";

export const ACCESS_COOKIE = "sn_at";
export const REFRESH_COOKIE = "sn_rt";

type Session = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user?: {
    id: string;
    email?: string;
  };
};

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure:
      process.env.NODE_ENV === "production" &&
      (process.env.NEXT_PUBLIC_SITE_URL || "").startsWith("https://"),
    path: "/",
    maxAge
  };
}

export async function signInWithPassword(email: string, password: string) {
  const config = getSupabaseConfig();
  if (!config) throw new ApiError("Supabase is not configured", 503);

  const response = await fetch(
    config.url + "/auth/v1/token?grant_type=password",
    {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        "content-type": "application/json"
      },
      body: JSON.stringify({ email, password })
    }
  );

  const data = (await response.json()) as Session & { error_description?: string };
  if (!response.ok) {
    throw new ApiError(data.error_description || "Invalid login", response.status, data);
  }

  const store = await cookies();
  store.set(ACCESS_COOKIE, data.access_token, cookieOptions(60 * 60));
  store.set(REFRESH_COOKIE, data.refresh_token, cookieOptions(60 * 60 * 24 * 30));

  return data;
}

export async function signOut() {
  const store = await cookies();
  const access = store.get(ACCESS_COOKIE)?.value;

  if (access) {
    try {
      const config = getSupabaseConfig();
      if (config) {
        await fetch(config.url + "/auth/v1/logout", {
          method: "POST",
          headers: { apikey: config.anonKey, authorization: "Bearer " + access }
        });
      }
    } catch {}
  }

  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getAccessToken() {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value || null;
}

export async function getCurrentAuthUser() {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const config = getSupabaseConfig();
    if (!config) return null;

    const response = await fetch(config.url + "/auth/v1/user", {
      headers: {
        apikey: config.anonKey,
        authorization: "Bearer " + token
      },
      cache: "no-store"
    });

    if (!response.ok) return null;
    return (await response.json()) as { id: string; email?: string };
  } catch {
    return null;
  }
}

export async function requireToken() {
  const token = await getAccessToken();
  if (!token) throw new ApiError("UNAUTHORIZED", 401);
  return token;
}

export async function requireAdminPage() {
  const user = await getCurrentAuthUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function refreshAccessToken(refreshToken: string) {
  const config = getSupabaseConfig();
  if (!config) return null;

  try {
    const response = await fetch(
      config.url + "/auth/v1/token?grant_type=refresh_token",
      {
        method: "POST",
        headers: {
          apikey: config.anonKey,
          "content-type": "application/json"
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      }
    );

    if (!response.ok) return null;
    return (await response.json()) as Session;
  } catch {
    return null;
  }
}

export function authCookieOptions(maxAge: number) {
  return cookieOptions(maxAge);
}

export async function adminRest<T = unknown>(
  path: string,
  options: RequestInit = {}
) {
  const token = await requireToken();
  return rest<T>(
    path,
    { cache: "no-store", ...options },
    token
  );
}
