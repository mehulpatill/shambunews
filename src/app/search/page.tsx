import { PublicShell } from "@/app/layout";
import ArticleCard from "@/components/ArticleCard";
import { searchArticles } from "@/lib/articles";
import type { SiteLanguage } from "@/lib/config";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; lang?: string }>;
}) {
  const { q = "", lang } = await searchParams;
  const language: SiteLanguage = lang === "hi" ? "hi" : "en";
  const results = q ? await searchArticles(q, language) : [];

  return (
    <PublicShell
      language={language}
      languageLinks={{
        en: "/search?q=" + encodeURIComponent(q) + "&lang=en",
        hi: "/search?q=" + encodeURIComponent(q) + "&lang=hi"
      }}
    >
      <div className="page">
        <div className="container">
          <div className="search-shell">
            <div className="section-bar">
              <div>
                <div className="eyebrow">{language === "hi" ? "आर्काइव" : "Archive"}</div>
                <h1>{language === "hi" ? "कहानियाँ खोजें" : "Search stories"}</h1>
              </div>
              {q ? <span className="meta">{results.length} results</span> : null}
            </div>

            <div className="language-filter" aria-label="Filter by language">
              <span className="language-filter-label">{language === "hi" ? "संस्करण" : "Edition"}</span>
              <Link className={language === "en" ? "active" : ""} href={"/search?q=" + encodeURIComponent(q) + "&lang=en"}>English</Link>
              <Link className={language === "hi" ? "active" : ""} href={"/search?q=" + encodeURIComponent(q) + "&lang=hi"}>हिंदी</Link>
            </div>

            <form className="searchbar">
              <input className="input" name="q" defaultValue={q} placeholder={language === "hi" ? "हेडलाइन या विषय खोजें" : "Search headlines or topics"} />
              <input type="hidden" name="lang" value={language} />
              <button className="btn primary">{language === "hi" ? "खोजें" : "Search"}</button>
            </form>

            {q ? (
              <div style={{ marginTop: 24 }}>
                {results.length ? (
                  <div className="section-grid">
                    {results.map((article) => (
                      <ArticleCard key={article.id} article={article} language={language} />
                    ))}
                  </div>
                ) : (
                  <div className="empty">
                    {language === "hi"
                      ? "इस भाषा में कोई मिलती-जुलती कहानी नहीं मिली।"
                      : "No matching stories found in this language."}
                  </div>
                )}
              </div>
            ) : (
              <div className="empty" style={{ marginTop: 22 }}>
                {language === "hi"
                  ? "हेडलाइन, विषय या टैग से शम्बुन्यूज़ आर्काइव खोजें।"
                  : "Search the Shambunews archive by headline, topic or tag."}
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
