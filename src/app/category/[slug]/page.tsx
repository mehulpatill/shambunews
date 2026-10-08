import { notFound } from "next/navigation";
import { PublicShell } from "@/app/layout";
import ArticleCard from "@/components/ArticleCard";
import { db } from "@/lib/db";
import type { SiteLanguage } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const language: SiteLanguage = lang === "hi" ? "hi" : "en";
  const category = await db.category.findUnique({ where: { slug } });

  if (!category) notFound();

  const links = await db.articleCategory.findMany({
    where: {
      categoryId: category.id,
      article: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        language: language === "hi" ? "HI" : "EN"
      }
    },
    orderBy: { article: { publishedAt: "desc" } },
    include: {
      article: {
        include: {
          author: { select: { name: true } },
          categories: { include: { category: true } },
          tags: { include: { tag: true } }
        }
      }
    }
  });

  const articles = links.map((item: any) => item.article);

  return (
    <PublicShell language={language}>
      <div className="page">
        <div className="container">
          <div className="section-bar">
            <div>
              <div className="eyebrow">
                {language === "hi" ? "हिंदी संस्करण" : "English edition"}
              </div>
              <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1 }}>{category.name}</h1>
            </div>
            <span className="meta">
              {articles.length} {articles.length === 1 ? "story" : "stories"}
            </span>
          </div>

          {articles.length ? (
            <div className="section-grid">
              {articles.map((article: any) => (
                <ArticleCard article={article} key={article.id} />
              ))}
            </div>
          ) : (
            <div className="empty">
              No published stories in this section for this language yet.
            </div>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
