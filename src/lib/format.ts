export function formatDate(input: string | Date | null | undefined) {
  if (!input) return "Unpublished";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(input));
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
