import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleForm from "@/components/admin/ArticleForm";
import { getAdminArticle, listCategories, listTags } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, categories, tags] = await Promise.all([
    getAdminArticle(id),
    listCategories(),
    listTags()
  ]);

  if (!article) notFound();

  return (
    <>
      <header className="admin-topbar">
        <div>
          <div className="kicker">Editorial</div>
          <h1>Edit article</h1>
          <div className="meta">Update story content, language, scheduling or publication status.</div>
        </div>
        <Link className="btn" href="/admin/articles">Back to articles</Link>
      </header>

      <ArticleForm article={article} categories={categories} availableTags={tags} />
    </>
  );
}
