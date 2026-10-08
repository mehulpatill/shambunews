import { notFound } from "next/navigation";
import { PublicShell } from "@/app/layout";
import ArticleCard from "@/components/ArticleCard";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });

  if (!category) notFound();

  const links = await db.articleCategory.findMany({
    where: {
      categoryId: category.id,
      article: { status: "PUBLISHED", publishedAt: { not: null } }
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
    <PublicShell>
      <div className="page">
        <div className="container">
          <div className="section-bar">
            <div>
              <div className="eyebrow">Section</div>
              <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1 }}>{category.name}</h1>
            </div>
            <span className="meta">{articles.length} {articles.length === 1 ? "story" : "stories"}</span>
          </div>

          {articles.length ? (
            <div className="section-grid">
              {articles.map((article: any) => (
                <ArticleCard article={article} key={article.id} />
              ))}
            </div>
          ) : (
            <div className="empty">No published stories in this section yet.</div>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
