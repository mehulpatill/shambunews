import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Articles() {
  await requireAdmin();

  let rows: any[] = [];
  try {
    rows = await db.article.findMany({
      orderBy: { updatedAt: "desc" },
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
          <div className="kicker">Editorial</div>
          <h1>Articles</h1>
          <div className="meta">Write, edit and publish stories.</div>
        </div>
        <Link className="btn primary" href="/admin/articles/new">+ New article</Link>
      </header>

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
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((article: any) => (
                  <tr key={article.id}>
                    <td>
                      <strong>{article.title}</strong>
                      <div className="meta">/{article.slug}</div>
                    </td>
                    <td>{article.categories?.[0]?.category?.name || "—"}</td>
                    <td>{article.language === "HI" ? "हिंदी" : "English"}{article.isBreaking ? " · Breaking" : ""}</td>
                    <td>
                      <span className={`status status-${article.status.toLowerCase()}`}>
                        {article.status}
                      </span>
                    </td>
                    <td>{formatDate(article.updatedAt)}</td>
                    <td>
                      <Link className="btn" href={`/admin/articles/${article.id}/edit`}>
                        Edit
                      </Link>
                    </td>
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
