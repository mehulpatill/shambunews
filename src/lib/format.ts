export function formatDate(input: string | Date | null | undefined) {
  if (!input) return "Unpublished";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(input));
}

export function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}
