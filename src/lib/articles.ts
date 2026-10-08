import { publicRest, ApiError, rest } from "@/lib/api";
import { type SiteLanguage, getSiteUrl, siteConfig } from "@/lib/config";
import type { Article, Category } from "@/lib/types";

const articleSelect =
  "*,category:categories!articles_category_id_fkey(id,slug,name_en,name_hi,sort_order),cover:media!articles_cover_media_id_fkey(id,mime,width,height,bytes,alt_text)";

function languageValue(language?: SiteLanguage) {
  return language || undefined;
}

function publishedFilter(language?: SiteLanguage) {
  const now = encodeURIComponent(new Date().toISOString());
  const params = [
    "status=eq.published",
    "published_at=lte." + now
  ];
  if (languageValue(language)) {
    params.push("language=eq." + languageValue(language));
  }
  return params.join("&");
}

export async function getCategories() {
  try {
    return await publicRest<Category[]>(
      "/rest/v1/categories?select=id,slug,name_en,name_hi,sort_order&order=sort_order.asc"
    );
  } catch {
    return [];
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const rows = await publicRest<Category[]>(
      "/rest/v1/categories?select=id,slug,name_en,name_hi,sort_order&slug=eq." +
        encodeURIComponent(slug) +
        "&limit=1"
    );
    return rows[0] || null;
  } catch {
    return null;
  }
}

export async function getPublishedArticles(
  limit = 12,
  language?: SiteLanguage,
  offset = 0
) {
  try {
    return await publicRest<Article[]>(
      "/rest/v1/articles?select=" +
        articleSelect +
        "&" +
        publishedFilter(language) +
        "&order=published_at.desc&offset=" +
        offset +
        "&limit=" +
        limit
    );
  } catch {
    return [];
  }
}

export async function getFeaturedArticles(language?: SiteLanguage, limit = 3) {
  try {
    const rows = await publicRest<Article[]>(
      "/rest/v1/articles?select=" +
        articleSelect +
        "&" +
        publishedFilter(language) +
        "&is_featured=eq.true&order=published_at.desc&limit=" +
        limit
    );
    return rows;
  } catch {
    return [];
  }
}

export async function getBreakingArticles(language?: SiteLanguage, limit = 5) {
  try {
    return await publicRest<Article[]>(
      "/rest/v1/articles?select=" +
        articleSelect +
        "&" +
        publishedFilter(language) +
        "&is_breaking=eq.true&order=published_at.desc&limit=" +
        limit
    );
  } catch {
    return [];
  }
}

export async function getMostReadArticles(language?: SiteLanguage, limit = 5) {
  try {
    return await publicRest<Article[]>(
      "/rest/v1/articles?select=" +
        articleSelect +
        "&" +
        publishedFilter(language) +
        "&order=views.desc,published_at.desc&limit=" +
        limit
    );
  } catch {
    return [];
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    const rows = await publicRest<Article[]>(
      "/rest/v1/articles?select=" +
        articleSelect +
        "&" +
        publishedFilter() +
        "&slug=eq." +
        encodeURIComponent(slug) +
        "&limit=1"
    );
    return rows[0] || null;
  } catch {
    return null;
  }
}

export async function getSectionArticles(
  categoryId: string,
  language: SiteLanguage,
  limit = 4,
  excludeSlug?: string
) {
  try {
    return await publicRest<Article[]>(
      "/rest/v1/articles?select=" +
        articleSelect +
        "&" +
        publishedFilter(language) +
        "&category_id=eq." +
        encodeURIComponent(categoryId) +
        (excludeSlug ? "&slug=not.eq." + encodeURIComponent(excludeSlug) : "") +
        "&order=published_at.desc&limit=" +
        limit
    );
  } catch {
    return [];
  }
}

export async function getRelatedArticles(
  categoryId: string,
  excludeSlug: string,
  language: SiteLanguage,
  limit = 3
) {
  return getSectionArticles(categoryId, language, limit, excludeSlug);
}

export async function getHomepageSections(language: SiteLanguage) {
  const categories = await getCategories();
  const sections = await Promise.all(
    categories.map(async (category) => ({
      category,
      articles: await getSectionArticles(category.id, language, 3)
    }))
  );
  return sections.filter((section) => section.articles.length > 0);
}

export async function searchArticles(query: string, language: SiteLanguage) {
  const q = query.trim().replace(/[,*()]/g, " ");
  if (!q) return [];

  try {
    const common =
      "/rest/v1/articles?select=" +
      articleSelect +
      "&" +
      publishedFilter(language) +
      "&limit=30";

    const textRows = await publicRest<Article[]>(
      common +
        "&or=(title.ilike.*" +
        encodeURIComponent(q) +
        "*,excerpt.ilike.*" +
        encodeURIComponent(q) +
        "*)&order=published_at.desc"
    );

    let tagRows: Article[] = [];
    try {
      tagRows = await publicRest<Article[]>(
        common +
          "&tags=cs.%7B" +
          encodeURIComponent(q) +
          "%7D&order=published_at.desc"
      );
    } catch {}

    const merged = new Map<string, Article>();
    [...textRows, ...tagRows].forEach((row) => merged.set(row.id, row));
    return [...merged.values()]
      .sort(
        (a, b) =>
          new Date(b.published_at || 0).getTime() -
          new Date(a.published_at || 0).getTime()
      )
      .slice(0, 30);
  } catch {
    return [];
  }
}

export async function incrementView(articleId: string) {
  const body = { p_id: articleId };
  return rest<void>("/rest/v1/rpc/increment_article_views", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function mediaUrl(id: string | null | undefined) {
  return id ? getSiteUrl().replace(/\/$/, "") + "/media/" + id : null;
}

export function categoryName(
  category: Category | null | undefined,
  language: SiteLanguage
) {
  if (!category) return language === "hi" ? "समाचार" : "News";
  return language === "hi" ? category.name_hi : category.name_en;
}

export async function safePublicArticleBySlug(slug: string) {
  try {
    return await getArticleBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError) return null;
    return null;
  }
}
