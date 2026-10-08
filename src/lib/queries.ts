import { db } from "@/lib/db";
import { demoArticles } from "@/lib/site";
import { ArticleLanguage } from "@/generated/prisma/enums";

export type SiteLanguage = "en" | "hi";

const articleInclude = {
  author: { select: { name: true } },
  categories: { include: { category: true } },
  tags: { include: { tag: true } }
} as const;

function languageValue(language?: SiteLanguage) {
  return language === "hi"
    ? ArticleLanguage.HI
    : language === "en"
      ? ArticleLanguage.EN
      : undefined;
}

function publishedWhere(language?: SiteLanguage) {
  const value = languageValue(language);
  return {
    status: "PUBLISHED" as const,
    publishedAt: { lte: new Date() },
    ...(value ? { language: value } : {})
  };
}

function filterDemo(language?: SiteLanguage) {
  if (!language) return demoArticles;
  return demoArticles.filter((article) => article.language === language);
}

export async function getAdSettings() {
  try {
    return await db.adSetting.findUnique({ where: { id: "main" } });
  } catch {
    return null;
  }
}

export async function getPublishedCategories(language?: SiteLanguage) {
  try {
    return await db.category.findMany({
      where: {
        articles: {
          some: { article: publishedWhere(language) }
        }
      },
      orderBy: { name: "asc" }
    });
  } catch {
    return [];
  }
}

export async function getPublishedArticles(limit = 12, language?: SiteLanguage) {
  try {
    return await db.article.findMany({
      where: publishedWhere(language),
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: articleInclude
    });
  } catch {
    return filterDemo(language).slice(0, limit) as any;
  }
}

export async function getFeaturedArticles(language?: SiteLanguage) {
  try {
    const featured = await db.article.findMany({
      where: { ...publishedWhere(language), featured: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: articleInclude
    });
    return featured.length ? featured : await getPublishedArticles(3, language);
  } catch {
    return filterDemo(language).slice(0, 3);
  }
}

export async function getBreakingArticles(limit = 5, language?: SiteLanguage) {
  try {
    return await db.article.findMany({
      where: { ...publishedWhere(language), isBreaking: true },
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: articleInclude
    });
  } catch {
    return filterDemo(language).filter((article) => article.isBreaking).slice(0, limit);
  }
}

export async function getMostReadArticles(limit = 5, language?: SiteLanguage, excludeSlug?: string) {
  try {
    return await db.article.findMany({
      where: {
        ...publishedWhere(language),
        ...(excludeSlug ? { slug: { not: excludeSlug } } : {})
      },
      orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
      take: limit,
      include: articleInclude
    });
  } catch {
    return filterDemo(language)
      .filter((article) => article.slug !== excludeSlug)
      .slice(0, limit);
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    return await db.article.findFirst({
      where: { slug, ...publishedWhere() },
      include: articleInclude
    });
  } catch {
    return demoArticles.find((item) => item.slug === slug) ?? null;
  }
}

export async function getRelatedArticles(
  categorySlug?: string,
  excludeSlug?: string,
  language?: SiteLanguage
) {
  try {
    return await db.article.findMany({
      where: {
        ...publishedWhere(language),
        slug: { not: excludeSlug || "" },
        ...(categorySlug
          ? { categories: { some: { category: { slug: categorySlug } } } }
          : {})
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: articleInclude
    });
  } catch {
    return filterDemo(language).filter((x) => x.slug !== excludeSlug).slice(0, 3);
  }
}

export async function searchArticles(q: string, language?: SiteLanguage) {
  const query = q.trim();
  if (!query) return [];

  try {
    return await db.article.findMany({
      where: {
        ...publishedWhere(language),
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { excerpt: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
          {
            tags: {
              some: { tag: { name: { contains: query, mode: "insensitive" } } }
            }
          }
        ]
      },
      orderBy: { publishedAt: "desc" },
      take: 30,
      include: articleInclude
    });
  } catch {
    return filterDemo(language).filter((x) =>
      (x.title + " " + x.excerpt).toLowerCase().includes(query.toLowerCase())
    );
  }
}
