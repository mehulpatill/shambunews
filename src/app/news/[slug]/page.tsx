import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/app/layout";
import ArticleCard from "@/components/ArticleCard";
import { categoryName, getArticleBySlug, getRelatedArticles, mediaUrl } from "@/lib/articles";
import { getSiteUrl, type SiteLanguage } from "@/lib/config";
import { formatDate } from "@/lib/format";
import ViewTracker from "@/components/ViewTracker";
import ShareLinks from "@/components/ShareLinks";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const image = mediaUrl(article.cover_media_id);

  return {
    title: article.title,
    description: article.excerpt || undefined,
    alternates: { canonical: getSiteUrl().replace(/\/$/, "") + "/news/" + article.slug },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt || undefined,
      url: getSiteUrl().replace(/\/$/, "") + "/news/" + article.slug,
      images: image ? [{ url: image }] : []
    }
  };
}

export default async function ArticlePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const language: SiteLanguage = article.language;
  const related = await getRelatedArticles(article.category_id, article.slug, language);
  const image = mediaUrl(article.cover_media_id);
  const url = getSiteUrl().replace(/\/$/, "") + "/news/" + article.slug;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt || undefined,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "Shambunews" },
    image: image ? [image] : []
  };

  return (
    <PublicShell
      language={language}
      languageLinks={{ en: "/?lang=en", hi: "/?lang=hi" }}
    >
      <div className="article-page">
        <div className="container">
          <article className="article-wrap">
            <ViewTracker articleId={article.id} />
            <div className="article-topline">
              <span className="eyebrow">{categoryName(article.category, language)}</span>
              <Link href={"/category/" + article.category?.slug + "?lang=" + language}>
                {language === "hi" ? "सेक्शन देखें →" : "More in section →"}
              </Link>
            </div>

            <header className="article-head">
              <div className="eyebrow">
                {language === "hi" ? "हिंदी रिपोर्ट" : "English report"}
              </div>
              <h1>{article.title}</h1>
              {article.excerpt && <p className="article-dek">{article.excerpt}</p>}
              <div className="byline">
                <span>{language === "hi" ? "शम्बुन्यूज़ डेस्क" : "Shambunews Desk"}</span>
                <span>•</span>
                <span>{formatDate(article.published_at, language)}</span>
              </div>
            </header>

            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {image && (
              <>
                <img className="article-image" src={image} alt={article.title} />
              </>
            )}

            <div className="article-content-row">
              <div>
                <div
                  className="article-body rich-article-body"
                  lang={language}
                  dangerouslySetInnerHTML={{ __html: article.body_html }}
                />

                {article.tag_links?.length ? (
                  <div className="tag-row">
                    {article.tag_links.map((link) => {
                      const tag = link.tag;
                      if (!tag) return null;
                      const label = language === "hi" ? tag.name_hi : tag.name_en;
                      return (
                        <Link
                          className="tag"
                          href={"/search?q=" + encodeURIComponent(tag.name_en) + "&lang=" + language}
                          key={link.tag_id}
                        >
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <aside className="article-tools">
                <div className="label">{language === "hi" ? "शेयर" : "Share"}</div>
                <a
                  className="tool-link"
                  href={"https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Facebook
                </a>
                <a
                  className="tool-link"
                  href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent(article.title) + "&url=" + encodeURIComponent(url)}
                  target="_blank"
                  rel="noreferrer"
                >
                  X
                </a>
                <ShareLinks url={url} title={article.title} language={language} />
              </aside>
            </div>
          </article>

          {related.length ? (
            <section className="related-section">
              <div className="section-bar">
                <div>
                  <div className="eyebrow">{language === "hi" ? "आगे पढ़ें" : "Keep reading"}</div>
                  <h2>{language === "hi" ? "और खबरें" : "More stories"}</h2>
                </div>
              </div>
              <div className="section-grid">
                {related.map((item) => (
                  <ArticleCard key={item.id} article={item} language={language} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </PublicShell>
  );
}
