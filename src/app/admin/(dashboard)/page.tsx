import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();

  let stats = { articles: 0, published: 0, drafts: 0, categories: 0 };
  let latest: any[] = [];

  try {
    const [articles, published, drafts, categories] = await Promise.all([
      db.article.count(),
      db.article.count({ where: { status: "PUBLISHED" } }),
      db.article.count({ where: { status: "DRAFT" } }),
      db.category.count()
    ]);

    stats = { articles, published, drafts, categories };

    latest = await db.article.findMany({
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: {
        author: { select: { name: true } },
        categories: { include: { category: true } }
      }
    });
  } catch {}

  return (
    <>
      <header className="admin-topbar">
        <div>
          <div className="kicker">Control room</div>
          <h1>Dashboard</h1>
          <div className="meta">A quick view of what is being published.</div>
        </div>
        <Link className="btn primary" href="/admin/articles/new">+ New article</Link>
      </header>

      <section className="stat-grid" aria-label="Publication statistics">
        <div className="stat">
          <div className="label">All articles</div>
          <div className="num">{stats.articles}</div>
        </div>
        <div className="stat">
          <div className="label">Published</div>
          <div className="num">{stats.published}</div>
        </div>
        <div className="stat">
          <div className="label">Drafts</div>
          <div className="num">{stats.drafts}</div>
        </div>
        <div className="stat">
          <div className="label">Sections</div>
          <div className="num">{stats.categories}</div>
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-topbar" style={{ marginBottom: 14 }}>
          <div>
            <div className="kicker">Desk queue</div>
            <h2 style={{ margin: "3px 0 0", font: "600 24px/1.1 Georgia, serif" }}>
              Recent articles
            </h2>
          </div>
          <Link href="/admin/articles" className="kicker">View all →</Link>
        </div>

        {latest.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Headline</th>
                  <th>Section</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {latest.map((article: any) => (
                  <tr key={article.id}>
                    <td>
                      <strong>{article.title}</strong>
                      <div className="meta">{article.author?.name || "Shambhu Desk"}</div>
                    </td>
                    <td>{article.categories?.[0]?.category?.name || "—"}</td>
                    <td><span className={`status status-${article.status.toLowerCase()}`}>{article.status}</span></td>
                    <td>{formatDate(article.updatedAt)}</td>
                    <td>
                      <Link className="btn" href={`/admin/articles/${article.id}/edit`}>Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            No articles yet. Start with your first story.
          </div>
        )}
      </section>
    </>
  );
}
