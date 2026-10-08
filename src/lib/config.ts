export const siteConfig = {
  name: "Shambunews",
  description: "Independent news, sharp analysis, and stories from India and beyond.",
  revalidateSeconds: 300,
  cacheTag: "articles",
  defaultLanguage: "en" as const
};

export type SiteLanguage = "en" | "hi";

export function languageLabel(language: SiteLanguage) {
  return language === "hi" ? "हिंदी" : "English";
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url: url.replace(/\/$/, ""), anonKey };
}
