import { PublicShell } from "@/app/layout";
import ArticleCard from "@/components/ArticleCard";
import { searchArticles } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const results = q ? await searchArticles(q) : [];

  return (
    <PublicShell>
      <div className="page">
        <div className="container">
          <div className="search-shell">
            <div className="section-bar">
              <div>
                <div className="eyebrow">Archive</div>
                <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1 }}>Search stories</h1>
              </div>
              {q ? <span className="meta">{results.length} results</span> : null}
            </div>

            <form className="searchbar">
              <input
                className="input"
                name="q"
                defaultValue={q}
                placeholder="Search headlines, stories or topics"
                aria-label="Search stories"
              />
              <button className="btn primary">Search</button>
            </form>

            {q ? (
              <div style={{ marginTop: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Results for “{q}”</div>
                {results.length ? (
                  <div className="section-grid">
                    {results.map((article: any) => (
                      <ArticleCard article={article} key={article.id} />
                    ))}
                  </div>
                ) : (
                  <div className="empty">No matching stories found. Try a broader search term.</div>
                )}
              </div>
            ) : (
              <div className="empty" style={{ marginTop: 22 }}>
                Search the Shambunews archive by headline, topic or tag.
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
