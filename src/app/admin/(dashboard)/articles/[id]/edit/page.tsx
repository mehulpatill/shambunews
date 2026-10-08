import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import ArticleForm from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";

export default async function EditArticle({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const [article, categories, tags] = await Promise.all([
    db.article.findUnique({
      where: { id },
      include: { categories: true, tags: true }
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.tag.findMany({ orderBy: { name: "asc" } })
  ]);

  if (!article) notFound();

  return (
    <>
      <header className="admin-topbar">
        <div>
          <div className="kicker">Editorial</div>
          <h1>Edit article</h1>
          <div className="meta">Update the story, metadata or publication status.</div>
        </div>
        <Link className="btn" href="/admin/articles">Back to articles</Link>
      </header>
      <ArticleForm article={article} categories={categories} tags={tags} />
    </>
  );
}
