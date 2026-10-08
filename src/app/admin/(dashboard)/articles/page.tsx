import Link from "next/link";
import { listAdminArticles, listCategories } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import ArticleFilters from "@/components/admin/ArticleFilters";
import ArticleActions from "@/components/admin/ArticleActions";

export const dynamic = "force-dynamic";

export default async function ArticlesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string; language?: string }>;
}) {
  const filters = await searchParams;
  const [rows, categories] = await Promise.all([
    listAdminArticles(filters),
    listCategories()
  ]);

  return (
    <>
      <header className="admin-topbar">
        <div>
          <div className="kicker">Editorial</div>
          <h1>Articles</h1>
          <div className="meta">Write, edit, schedule and publish stories.</div>
        </div>
        <Link className="btn primary" href="/admin/articles/new">+ New article</Link>
      </header>

      <ArticleFilters initial={filters} />

      <section className="admin-card">
        {rows.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Headline</th>
                  <th>Section</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Publish time</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((article: any) => (
                  <tr key={article.id}>
                    <td>
                      <strong>{article.title}</strong>
                      <div className="meta">
                        {article.is_breaking ? "BREAKING · " : ""}
                        /{article.slug}
                      </div>
                    </td>
                    <td>{article.category?.name_en || "—"}</td>
                    <td>{article.language === "hi" ? "हिंदी" : "English"}</td>
                    <td><span className={"status status-" + article.status}>{article.status}</span></td>
                    <td>{formatDate(article.published_at, article.language)}</td>
                    <td>{formatDate(article.updated_at, article.language)}</td>
                    <td style={{ minWidth: 210 }}>
                      <div style={{ display: "grid", gap: 7 }}>
                        <Link className="btn" href={"/admin/articles/" + article.id}>Edit</Link>
                        <ArticleActions id={article.id} status={article.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">No matching articles.</div>
        )}
      </section>
    </>
  );
}
