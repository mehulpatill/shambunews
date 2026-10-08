import type { SiteLanguage } from "@/lib/config";

export function formatDate(
  input: string | Date | null | undefined,
  language: SiteLanguage = "en"
) {
  if (!input) return language === "hi" ? "अप्रकाशित" : "Unpublished";
  return new Intl.DateTimeFormat(language === "hi" ? "hi-IN" : "en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata"
  }).format(new Date(input));
}

export function formatRelative(
  input: string | Date | null | undefined,
  language: SiteLanguage = "en"
) {
  if (!input) return "";
  const date = new Date(input);
  const delta = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(delta / 60000));
  const rtf = new Intl.RelativeTimeFormat(language === "hi" ? "hi-IN" : "en-IN", {
    numeric: "auto"
  });

  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  return rtf.format(-Math.floor(hours / 24), "day");
}

export function slugify(input: string) {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
