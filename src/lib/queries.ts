import { db } from "@/lib/db";
import { demoArticles } from "@/lib/site";

const articleInclude = {
  author: { select: { name: true } },
  categories: { include: { category: true } },
  tags: { include: { tag: true } }
} as const;

export async function getAdSettings() {
  try {
    return await db.adSetting.findUnique({ where: { id: "main" } });
  } catch {
    return null;
  }
}

export async function getPublishedCategories() {
  try {
    return await db.category.findMany({
      where: {
        articles: {
          some: {
            article: { status: "PUBLISHED", publishedAt: { not: null } }
          }
        }
      },
      orderBy: { name: "asc" }
    });
  } catch {
    return [];
  }
}

export async function getPublishedArticles(limit = 12) {
  try {
    return await db.article.findMany({ where: { status: "PUBLISHED", publishedAt: { not: null } }, orderBy: { publishedAt: "desc" }, take: limit, include: articleInclude });
  } catch {
    return demoArticles.slice(0, limit);
  }
}

export async function getFeaturedArticles() {
  try {
    const featured = await db.article.findMany({ where: { status: "PUBLISHED", publishedAt: { not: null }, featured: true }, orderBy: { publishedAt: "desc" }, take: 3, include: articleInclude });
    return featured.length ? featured : await getPublishedArticles(3);
  } catch {
    return demoArticles.slice(0, 3);
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    return await db.article.findFirst({ where: { slug, status: "PUBLISHED", publishedAt: { not: null } }, include: articleInclude });
  } catch {
    return demoArticles.find((item) => item.slug === slug) ?? null;
  }
}

export async function getRelatedArticles(categorySlug?: string, excludeSlug?: string) {
  try {
    return await db.article.findMany({
      where: { status: "PUBLISHED", publishedAt: { not: null }, slug: { not: excludeSlug || "" }, ...(categorySlug ? { categories: { some: { category: { slug: categorySlug } } } } : {}) },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: articleInclude
    });
  } catch {
    return demoArticles.filter((x) => x.slug !== excludeSlug).slice(0, 3);
  }
}

export async function searchArticles(q: string) {
  const query = q.trim();
  if (!query) return [];
  try {
    return await db.article.findMany({
      where: { status: "PUBLISHED", publishedAt: { not: null }, OR: [
        { title: { contains: query, mode: "insensitive" } },
        { excerpt: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
        { tags: { some: { tag: { name: { contains: query, mode: "insensitive" } } } } }
      ]},
      orderBy: { publishedAt: "desc" },
      take: 30,
      include: articleInclude
    });
  } catch {
    return demoArticles.filter((x) => (x.title + " " + x.excerpt).toLowerCase().includes(query.toLowerCase()));
  }
}
