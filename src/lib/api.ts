import { getSupabaseConfig, siteConfig } from "@/lib/config";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status = 500, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type RestOptions = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  return await response.text();
}

export async function rest<T = unknown>(
  path: string,
  options: RestOptions = {},
  accessToken?: string
): Promise<T> {
  const config = getSupabaseConfig();
  if (!config) throw new ApiError("Supabase is not configured", 503);

  const headers = new Headers(options.headers);
  headers.set("apikey", config.anonKey);
  headers.set("accept", "application/json");

  if (accessToken) {
    headers.set("authorization", "Bearer " + accessToken);
  }

  if (options.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(
    config.url + (path.startsWith("/") ? path : "/" + path),
    { ...options, headers }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message: unknown }).message)
        : typeof data === "object" && data && "error_description" in data
          ? String((data as { error_description: unknown }).error_description)
          : typeof data === "string"
            ? data
            : response.statusText || "Supabase request failed";
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export function publicRest<T = unknown>(path: string, options: RestOptions = {}) {
  return rest<T>(path, {
    ...options,
    next: {
      revalidate: siteConfig.revalidateSeconds,
      tags: [siteConfig.cacheTag],
      ...options.next
    }
  });
}
