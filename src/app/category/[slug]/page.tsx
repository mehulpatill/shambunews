import { notFound } from "next/navigation";
import { PublicShell } from "@/app/layout";
import ArticleCard from "@/components/ArticleCard";
import { getCategories, getCategoryBySlug, getSectionArticles, categoryName } from "@/lib/articles";
import type { SiteLanguage } from "@/lib/config";

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
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const articles = await getSectionArticles(category.id, language, 30);

  return (
    <PublicShell
      language={language}
      languageLinks={{
        en: "/category/" + category.slug + "?lang=en",
        hi: "/category/" + category.slug + "?lang=hi"
      }}
    >
      <div className="page">
        <div className="container">
          <div className="section-bar">
            <div>
              <div className="eyebrow">{language === "hi" ? "सेक्शन" : "Section"}</div>
              <h1>{categoryName(category, language)}</h1>
            </div>
            <span className="meta">{articles.length} {language === "hi" ? "कहानियाँ" : "stories"}</span>
          </div>

          {articles.length ? (
            <div className="section-grid">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} language={language} />
              ))}
            </div>
          ) : (
            <div className="empty">
              {language === "hi"
                ? "इस सेक्शन में अभी इस भाषा की कोई प्रकाशित कहानी नहीं है।"
                : "No published stories in this language are available in this section yet."}
            </div>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
