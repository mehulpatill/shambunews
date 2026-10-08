import type { MetadataRoute } from "next";
import { getCategories, getPublishedArticles } from "@/lib/articles";
import { getSiteUrl } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().replace(/\/$/, "");
  const [categories, articles] = await Promise.all([
    getCategories(),
    getPublishedArticles(1000)
  ]);

  return [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: base + "/search", changeFrequency: "daily", priority: 0.5 },
    ...categories.map((category) => ({
      url: base + "/category/" + category.slug + "?lang=en",
      changeFrequency: "hourly" as const,
      priority: 0.7
    })),
    ...articles.map((article) => ({
      url: base + "/news/" + article.slug,
      lastModified: new Date(article.updated_at),
      changeFrequency: "daily" as const,
      priority: 0.8
    }))
  ];
}
