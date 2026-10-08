import Link from "next/link";
import { formatDate } from "@/lib/format";
import { getAdSettings, getPublishedArticles, getPublishedCategories } from "@/lib/queries";
import AdSlot from "@/components/AdSlot";

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

export default async function PublicHome() {
  const [articles, categories, ads] = await Promise.all([
    getPublishedArticles(12),
    getPublishedCategories(),
    getAdSettings()
  ]);

  const lead = articles[0];

  if (!lead) {
    return (
      <div className="page">
        <div className="container">
          <div className="section-bar">
            <div>
              <div className="eyebrow">Shambunews</div>
              <h1>No stories yet</h1>
            </div>
          </div>
          <div className="empty">The newsroom has not published a story yet.</div>
        </div>
      </div>
    );
  }

  const latest = articles.slice(1, 7);
  const more = articles.slice(7, 10);

  return (
    <div className="page">
      <div className="container">
        <AdSlot settings={ads} placement="homepageTop" />

        <section>
          <div className="section-bar">
            <div>
              <div className="eyebrow">The front page</div>
              <h2>Today’s lead</h2>
            </div>
            <span className="meta">{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date())}</span>
          </div>

          <div className="home-hero">
            <div className="hero-copy">
              <div className="eyebrow">{lead.categories?.[0]?.category?.name || "News"}</div>
              <h1>
                <Link href={`/news/${lead.slug}`}>{lead.title}</Link>
              </h1>
              {lead.excerpt && <p className="hero-dek">{lead.excerpt}</p>}
              <div className="byline">
                <span>{lead.author?.name || "Shambhu Desk"}</span>
                <span>•</span>
                <span>{formatDate(lead.publishedAt)}</span>
              </div>
              <div className="hero-actions">
                <Link href={`/news/${lead.slug}`} className="btn primary">Read story</Link>
                <Link href="/search" className="btn">Browse all</Link>
              </div>
            </div>

            <Link href={`/news/${lead.slug}`} className="hero-media">
              <StoryImage article={lead} className="hero-media-image" />
            </Link>
          </div>
        </section>

        <AdSlot settings={ads} placement="homepageMid" />

        <section className="story-section">
          <div className="section-bar">
            <div>
              <div className="eyebrow">Newsroom</div>
              <h2>Latest stories</h2>
            </div>
            <Link href="/search">See archive →</Link>
          </div>

          <div className="story-section-grid">
            <div className="latest-list">
              {latest.length ? latest.map((article: any) => (
                <article className="latest-item" key={article.id}>
                  <Link href={`/news/${article.slug}`}>
                    <StoryImage article={article} className="latest-image" />
                  </Link>
                  <div>
                    <div className="eyebrow">{article.categories?.[0]?.category?.name || "News"}</div>
                    <h3><Link href={`/news/${article.slug}`}>{article.title}</Link></h3>
                    {article.excerpt && <p>{article.excerpt}</p>}
                    <div className="meta">{formatDate(article.publishedAt)}</div>
                  </div>
                </article>
              )) : (
                <div className="empty">More stories will appear here as the newsroom publishes them.</div>
              )}
            </div>

            <aside className="news-sidebar">
              <div className="eyebrow">Explore</div>
              <h3>Sections</h3>
              <p className="sidebar-intro">Follow the parts of the newsroom that matter to you.</p>
              {categories.map((category: any, index: number) => (
                <div className="sidebar-item" key={category.id}>
                  <div className="num">{String(index + 1).padStart(2, "0")}</div>
                  <h4><Link href={`/category/${category.slug}`}>{category.name}</Link></h4>
                </div>
              ))}
            </aside>
          </div>
        </section>

        {more.length ? (
          <section className="section-block">
            <div className="section-bar">
              <div>
                <div className="eyebrow">More coverage</div>
                <h2>Keep reading</h2>
              </div>
            </div>
            <div className="section-grid">
              {more.map((article: any) => (
                <article className="section-story" key={article.id}>
                  <Link href={`/news/${article.slug}`}>
                    <StoryImage article={article} className="section-story-image" />
                  </Link>
                  <div className="eyebrow" style={{ marginTop: 13 }}>
                    {article.categories?.[0]?.category?.name || "News"}
                  </div>
                  <h3><Link href={`/news/${article.slug}`}>{article.title}</Link></h3>
                  {article.excerpt && <p>{article.excerpt}</p>}
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
