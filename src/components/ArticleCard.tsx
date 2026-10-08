import Link from "next/link";
import { categoryName, mediaUrl } from "@/lib/articles";
import { formatDate } from "@/lib/format";
import type { SiteLanguage } from "@/lib/config";

function StoryImage({ article, className = "" }: { article: any; className?: string }) {
  const source = mediaUrl(article.cover_media_id);
  if (!source) {
    return <div className={className + " media-placeholder"}>Shambunews</div>;
  }

  return <img src={source} alt={article.cover?.alt_text || article.title} className={className} loading="lazy" />;
}

export default function ArticleCard({
  article,
  language,
  featured = false
}: {
  article: any;
  language: SiteLanguage;
  featured?: boolean;
}) {
  const category = categoryName(article.category, language);

  if (featured) {
    return (
      <article className="hero-copy">
        <div className="eyebrow">{category}</div>
        <h1><Link href={"/news/" + article.slug}>{article.title}</Link></h1>
        {article.excerpt && <p className="hero-dek">{article.excerpt}</p>}
        <div className="byline">
          <span>{language === "hi" ? "शम्बुन्यूज़ डेस्क" : "Shambunews Desk"}</span>
          <span>•</span>
          <span>{formatDate(article.published_at, language)}</span>
        </div>
        <div className="hero-actions">
          <Link href={"/news/" + article.slug} className="btn primary">
            {language === "hi" ? "पूरी कहानी" : "Read story"}
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="section-story">
      <Link href={"/news/" + article.slug}>
        <StoryImage article={article} className="section-story-image" />
      </Link>
      <div className="eyebrow" style={{ marginTop: 13 }}>{category}</div>
      <h3><Link href={"/news/" + article.slug}>{article.title}</Link></h3>
      {article.excerpt && <p>{article.excerpt}</p>}
      <div className="meta" style={{ marginTop: 10 }}>{formatDate(article.published_at, language)}</div>
    </article>
  );
}
