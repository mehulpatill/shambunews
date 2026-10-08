import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import ArticleForm from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";

export default async function NewArticle() {
  await requireAdmin();

  let categories: any[] = [];
  let tags: any[] = [];

  try {
    [categories, tags] = await Promise.all([
      db.category.findMany({ orderBy: { name: "asc" } }),
      db.tag.findMany({ orderBy: { name: "asc" } })
    ]);
  } catch {}

  return (
    <>
      <header className="admin-topbar">
        <div>
          <div className="kicker">Editorial</div>
          <h1>New article</h1>
          <div className="meta">Create a story for the Shambunews desk.</div>
        </div>
        <Link className="btn" href="/admin/articles">Back to articles</Link>
      </header>
      {!categories.length && (
        <div className="notice">
          Add at least one category before publishing your first story.
        </div>
      )}
      <ArticleForm categories={categories} tags={tags} />
    </>
  );
}
