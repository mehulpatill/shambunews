import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/app/layout";
import ArticleCard from "@/components/ArticleCard";
import { getAdSettings, getArticleBySlug, getRelatedArticles } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import AdSlot from "@/components/AdSlot";
import ViewTracker from "@/components/ViewTracker";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article: any = await getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      images: article.featuredImage ? [article.featuredImage] : []
    },
    alternates: { canonical: "/news/" + article.slug }
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function contentToHtml(content: string) {
  const newline = String.fromCharCode(10);

  return content
    .split(newline + newline)
    .map((raw) => {
      const block = escapeHtml(raw.trim()).split(newline).join("<br />");
      if (block.startsWith("## ")) return "<h2>" + block.slice(3) + "</h2>";
      if (block.startsWith("> ")) return "<blockquote>" + block.slice(2) + "</blockquote>";
      return "<p>" + block + "</p>";
    })
    .join("");
}

export default async function ArticlePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article: any = await getArticleBySlug(slug);
  if (!article) notFound();

  const category = article.categories?.[0]?.category;
  const language = article.language === "HI" ? "hi" : "en";
  const [related, ads] = await Promise.all([
    getRelatedArticles(category?.slug, article.slug, language),
    getAdSettings()
  ]);

  const shareUrl =
    (process.env.NEXT_PUBLIC_SITE_URL || "") + "/news/" + article.slug;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author?.name || "Shambhu Desk"
    },
    image: article.featuredImage ? [article.featuredImage] : []
  };

  return (
    <PublicShell language={language}>
      <div className="article-page">
        <div className="container">
          <AdSlot settings={ads} placement="articleTop" />

          <article className="article-wrap">
            <ViewTracker articleId={article.id} />
            <div className="article-topline">
              <span className="eyebrow">{category?.name || "News"}</span>
              {category && (
                <Link href={"/category/" + category.slug}>More in {category.name} →</Link>
              )}
            </div>

            <header className="article-head">
              <div className="eyebrow">
                {language === "hi" ? "हिंदी रिपोर्ट" : "English report"}
              </div>
              <h1>{article.title}</h1>
              {article.excerpt && <p className="article-dek">{article.excerpt}</p>}
              <div className="byline">
                <span>By {article.author?.name || "Shambhu Desk"}</span>
                <span>•</span>
                <span>{formatDate(article.publishedAt)}</span>
              </div>
            </header>

            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {article.featuredImage && (
              <>
                <img
                  className="article-image"
                  src={article.featuredImage}
                  alt={article.imageAlt || article.title}
                />
                {article.imageAlt && (
                  <div className="article-caption">{article.imageAlt}</div>
                )}
              </>
            )}

            <div className="article-content-row">
              <div>
                <div className="article-body" lang={language}
                  dangerouslySetInnerHTML={{
                    __html: contentToHtml(article.content || "")
                  }}
                />

                {article.tags?.length ? (
                  <div className="tag-row">
                    {article.tags.map((tagLink: any) => (
                      <Link
                        className="tag"
                        href={"/search?q=" + encodeURIComponent(tagLink.tag.name)}
                        key={tagLink.tag.id}
                      >
                        {tagLink.tag.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>

              <aside className="article-tools">
                <div className="label">Share</div>
                <a
                  className="tool-link"
                  href={
                    "https://www.facebook.com/sharer/sharer.php?u=" +
                    encodeURIComponent(shareUrl)
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Facebook
                </a>
                <a
                  className="tool-link"
                  href={
                    "https://twitter.com/intent/tweet?text=" +
                    encodeURIComponent(article.title) +
                    "&url=" +
                    encodeURIComponent(shareUrl)
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  X
                </a>
                <a
                  className="tool-link"
                  href={
                    "mailto:?subject=" +
                    encodeURIComponent(article.title) +
                    "&body=" +
                    encodeURIComponent(shareUrl)
                  }
                >
                  Email
                </a>
              </aside>
            </div>

            <AdSlot settings={ads} placement="articleBottom" />
          </article>

          {related.length ? (
            <section className="related-section">
              <div className="section-bar">
                <div>
                  <div className="eyebrow">Keep reading</div>
                  <h2>More from {category?.name || "the newsroom"}</h2>
                </div>
              </div>
              <div className="section-grid">
                {related.map((item: any) => (
                  <ArticleCard key={item.id} article={item} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </PublicShell>
  );
}
