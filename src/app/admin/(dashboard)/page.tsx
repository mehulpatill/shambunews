import Link from "next/link";
import { listAdminArticles, listCategories } from "@/lib/admin";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [rows, categories] = await Promise.all([
    listAdminArticles(),
    listCategories()
  ]);

  const published = rows.filter((x: any) => x.status === "published").length;
  const drafts = rows.filter((x: any) => x.status === "draft").length;
  const breaking = rows.filter((x: any) => x.is_breaking && x.status === "published").length;

  return (
    <>
      <header className="admin-topbar">
        <div>
          <div className="kicker">Control room</div>
          <h1>Dashboard</h1>
          <div className="meta">A quick view of what the newsroom is publishing.</div>
        </div>
        <Link className="btn primary" href="/admin/articles/new">+ New article</Link>
      </header>

      <section className="stat-grid" aria-label="Publication statistics">
        <div className="stat"><div className="label">All articles</div><div className="num">{rows.length}</div></div>
        <div className="stat"><div className="label">Published</div><div className="num">{published}</div></div>
        <div className="stat"><div className="label">Drafts</div><div className="num">{drafts}</div></div>
        <div className="stat"><div className="label">Breaking live</div><div className="num">{breaking}</div></div>
      </section>

      <section className="admin-card">
        <div className="admin-topbar" style={{ marginBottom: 14 }}>
          <div>
            <div className="kicker">Desk queue</div>
            <h2 style={{ margin: "3px 0 0", font: "600 24px/1.1 Georgia, serif" }}>
              Recent articles
            </h2>
          </div>
          <span className="meta">{categories.length} sections</span>
        </div>

        {rows.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Headline</th>
                  <th>Section</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 12).map((article: any) => (
                  <tr key={article.id}>
                    <td><strong>{article.title}</strong><div className="meta">/{article.slug}</div></td>
                    <td>{article.category?.name_en || "—"}</td>
                    <td>{article.language === "hi" ? "हिंदी" : "English"}</td>
                    <td><span className={"status status-" + article.status}>{article.status}</span></td>
                    <td>{formatDate(article.updated_at)}</td>
                    <td><Link className="btn" href={"/admin/articles/" + article.id}>Edit</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">No articles yet. Start with your first story.</div>
        )}
      </section>
    </>
  );
}
