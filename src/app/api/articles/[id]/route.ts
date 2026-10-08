import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiAdmin } from "@/lib/auth";
import { uniqueArticleSlug } from "@/lib/article-slug";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  featuredImage: z.string().optional(),
  imageAlt: z.string().optional(),
  language: z.enum(["EN", "HI"]).default("EN"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  featured: z.boolean().default(false),
  isBreaking: z.boolean().default(false),
  publishedAt: z.string().datetime({ offset: true }).optional().nullable(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).default([])
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiAdmin();
    const { id } = await params;
    const body = schema.parse(await req.json());
    const existing = await db.article.findUnique({
      where: { id },
      select: { publishedAt: true }
    });

    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const slug = await uniqueArticleSlug(body.title, id);
    const publishedAt =
      body.status === "PUBLISHED"
        ? (body.publishedAt
            ? new Date(body.publishedAt)
            : (existing.publishedAt || new Date()))
        : null;

    const article = await db.article.update({
      where: { id },
      data: {
        title: body.title,
        slug,
        excerpt: body.excerpt || null,
        content: body.content,
        featuredImage: body.featuredImage || null,
        imageAlt: body.imageAlt || null,
        language: body.language,
        status: body.status,
        featured: !!body.featured,
        isBreaking: !!body.isBreaking,
        seoTitle: body.seoTitle?.trim() || body.title.trim(),
        seoDescription:
          body.seoDescription?.trim() || body.excerpt?.trim() || null,
        publishedAt,
        categories: body.categoryId
          ? { deleteMany: {}, create: { categoryId: body.categoryId } }
          : { deleteMany: {} },
        tags: {
          deleteMany: {},
          ...(body.tagIds.length
            ? { create: body.tagIds.map((tagId) => ({ tagId })) }
            : {})
        }
      }
    });

    return NextResponse.json(article);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Update failed" },
      { status: error?.message === "UNAUTHORIZED" ? 401 : 400 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiAdmin();
    const { id } = await params;
    await db.article.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Delete failed" },
      { status: error?.message === "UNAUTHORIZED" ? 401 : 400 }
    );
  }
}
