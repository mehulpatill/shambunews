import Link from "next/link";
import ArticleForm from "@/components/admin/ArticleForm";
import { listCategories, listTags } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const [categories, tags] = await Promise.all([listCategories(), listTags()]);

  return (
    <>
      <header className="admin-topbar">
        <div>
          <div className="kicker">Editorial</div>
          <h1>New article</h1>
          <div className="meta">Create an English or Hindi story.</div>
        </div>
        <Link className="btn" href="/admin/articles">Back to articles</Link>
      </header>

      {!categories.length && (
        <div className="notice">Create a section before publishing your first article.</div>
      )}

      <ArticleForm categories={categories} availableTags={tags} />
    </>
  );
}
