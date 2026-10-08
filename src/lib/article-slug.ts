import { db } from "@/lib/db";
import { slugify } from "@/lib/format";

export async function uniqueArticleSlug(title: string, excludeId?: string) {
  const base = slugify(title) || "article";
  let slug = base;
  let suffix = 2;

  while (true) {
    const existing = await db.article.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${suffix++}`;
  }
}
