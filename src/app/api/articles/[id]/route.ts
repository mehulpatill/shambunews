import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiAdmin } from "@/lib/auth";
import { uniqueArticleSlug } from "@/lib/article-slug";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiAdmin();
    const { id } = await params;
    const body = await req.json();
    const existing = await db.article.findUnique({ where: { id }, select: { publishedAt: true } });
    if (!existing) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    const slug = await uniqueArticleSlug(body.title, id);

    const article = await db.article.update({
      where: { id },
      data: {
        title: body.title, slug, excerpt: body.excerpt || null, content: body.content,
        featuredImage: body.featuredImage || null, imageAlt: body.imageAlt || null, status: body.status,
        featured: !!body.featured, seoTitle: body.seoTitle?.trim() || body.title.trim(), seoDescription: body.seoDescription?.trim() || body.excerpt?.trim() || null,
        publishedAt: body.status === "PUBLISHED" ? (existing.publishedAt || new Date()) : null,
        categories: body.categoryId ? { deleteMany: {}, create: { categoryId: body.categoryId } } : { deleteMany: {} },
        tags: { deleteMany: {}, ...(Array.isArray(body.tagIds) && body.tagIds.length ? { create: body.tagIds.map((tagId: string) => ({ tagId })) } : {}) }
      }
    });
    return NextResponse.json(article);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Update failed" }, { status: error?.message === "UNAUTHORIZED" ? 401 : 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiAdmin();
    const { id } = await params;
    await db.article.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Delete failed" }, { status: error?.message === "UNAUTHORIZED" ? 401 : 400 });
  }
}
