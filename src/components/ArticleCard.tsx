import Link from "next/link";
import { formatDate } from "@/lib/format";

function StoryImage({ article, className = "" }: { article: any; className?: string }) {
  if (!article?.featuredImage) {
    return <div className={`${className} media-placeholder`}>Shambunews</div>;
  }

  return (
    <img
      src={article.featuredImage}
      alt={article.imageAlt || article.title}
      className={className}
      loading="lazy"
    />
  );
}

export default function ArticleCard({ article, featured = false }: { article: any; featured?: boolean }) {
  const category = article.categories?.[0]?.category?.name || "News";

  if (featured) {
    return (
      <article className="hero-copy">
        <div className="eyebrow">{category}</div>
        <h1>
          <Link href={`/news/${article.slug}`}>{article.title}</Link>
        </h1>
        {article.excerpt && <p className="hero-dek">{article.excerpt}</p>}
        <div className="byline">
          <span>{article.author?.name || "Shambhu Desk"}</span>
          <span>•</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>
        <div className="hero-actions">
          <Link href={`/news/${article.slug}`} className="btn primary">Read story</Link>
        </div>
      </article>
    );
  }

  return (
    <article className="section-story">
      <Link href={`/news/${article.slug}`}>
        <StoryImage article={article} className="section-story-image" />
      </Link>
      <div className="eyebrow" style={{ marginTop: 13 }}>{category}</div>
      <h3>
        <Link href={`/news/${article.slug}`}>{article.title}</Link>
      </h3>
      {article.excerpt && <p>{article.excerpt}</p>}
      <div className="meta" style={{ marginTop: 10 }}>{formatDate(article.publishedAt)}</div>
    </article>
  );
}
