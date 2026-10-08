import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import {
  getFeaturedArticles,
  getHomepageSections,
  getMostReadArticles,
  getPublishedArticles,
  mediaUrl,
  categoryName,
  getBreakingArticles
} from "@/lib/articles";
import type { SiteLanguage } from "@/lib/config";
import { formatDate } from "@/lib/format";

function imageFor(article: any) {
  const source = mediaUrl(article.cover_media_id);
  if (!source) return <div className="hero-media-image media-placeholder">Shambunews</div>;
  return <img className="hero-media-image" src={source} alt={article.cover?.alt_text || article.title} />;
}

export default async function PublicHome({ language }: { language: SiteLanguage }) {
  const [featured, published, mostRead, sections, breaking] = await Promise.all([
    getFeaturedArticles(language, 3),
    getPublishedArticles(12, language),
    getMostReadArticles(language, 5),
    getHomepageSections(language),
    getBreakingArticles(language, 5)
  ]);

  const lead = featured[0] || published[0];
  const topStories = (featured.length > 1 ? featured.slice(1) : published.slice(1, 4)).slice(0, 3);
  const latest = published.filter((item) => item.id !== lead?.id).slice(0, 6);

  if (!lead) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty">
            {language === "hi"
              ? "इस भाषा में अभी कोई प्रकाशित कहानी नहीं है।"
              : "There are no published stories in this language yet."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        {breaking.length > 0 && (
          <div className="mobile-breaking">
            <span>{language === "hi" ? "ब्रेकिंग" : "Breaking"}</span>
            {breaking[0].title}
          </div>
        )}

        <section>
          <div className="section-bar">
            <div>
              <div className="eyebrow">{language === "hi" ? "हिंदी संस्करण" : "English edition"}</div>
              <h2>{language === "hi" ? "आज की मुख्य खबर" : "Today’s lead"}</h2>
            </div>
            <span className="meta">{formatDate(new Date(), language)}</span>
          </div>

          <div className="home-hero">
            <ArticleCard article={lead} language={language} featured />
            <Link href={"/news/" + lead.slug} className="hero-media">
              {imageFor(lead)}
            </Link>
          </div>
        </section>

        {topStories.length > 0 && (
          <section className="section-block">
            <div className="section-bar">
              <div>
                <div className="eyebrow">{language === "hi" ? "चुनी हुई खबरें" : "Editor's desk"}</div>
                <h2>{language === "hi" ? "टॉप स्टोरीज़" : "Top stories"}</h2>
              </div>
            </div>
            <div className="section-grid">
              {topStories.map((article: any) => (
                <ArticleCard key={article.id} article={article} language={language} />
              ))}
            </div>
          </section>
        )}

        <section className="story-section">
          <div className="section-bar">
            <div>
              <div className="eyebrow">{language === "hi" ? "न्यूज़रूम" : "Newsroom"}</div>
              <h2>{language === "hi" ? "ताज़ा खबरें" : "Latest stories"}</h2>
            </div>
            <Link href={"/search?lang=" + language}>{language === "hi" ? "आर्काइव →" : "See archive →"}</Link>
          </div>

          <div className="story-section-grid">
            <div className="latest-list">
              {latest.map((article: any) => (
                <article className="latest-item" key={article.id}>
                  <Link href={"/news/" + article.slug}>
                    {imageFor({ ...article, cover_media_id: article.cover_media_id })}
                  </Link>
                  <div>
                    <div className="eyebrow">{categoryName(article.category, language)}</div>
                    <h3><Link href={"/news/" + article.slug}>{article.title}</Link></h3>
                    {article.excerpt && <p>{article.excerpt}</p>}
                    <div className="meta">{formatDate(article.published_at, language)}</div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="news-sidebar">
              <div className="eyebrow">{language === "hi" ? "देखें" : "Explore"}</div>
              <h3>{language === "hi" ? "सबसे ज्यादा पढ़ी गई" : "Most read"}</h3>
              <div className="most-read-list">
                {mostRead.map((article: any, index: number) => (
                  <Link key={article.id} className="most-read-item" href={"/news/" + article.slug}>
                    <span className="most-read-number">{String(index + 1).padStart(2, "0")}</span>
                    <span className="most-read-title">{article.title}</span>
                    <span className="most-read-views">{article.views}</span>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </section>

        {sections.map((section) => (
          <section key={section.category.id} className="section-block">
            <div className="section-bar">
              <div>
                <div className="eyebrow">{language === "hi" ? "सेक्शन" : "Section"}</div>
                <h2>{categoryName(section.category, language)}</h2>
              </div>
              <Link href={"/category/" + section.category.slug + "?lang=" + language}>
                {language === "hi" ? "सभी →" : "View all →"}
              </Link>
            </div>
            <div className="section-grid">
              {section.articles.map((article: any) => (
                <ArticleCard key={article.id} article={article} language={language} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
