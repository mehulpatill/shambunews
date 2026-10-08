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

export async function POST(req: Request) {
  try {
    const user = await requireApiAdmin();
    const body = schema.parse(await req.json());
    const slug = await uniqueArticleSlug(body.title);
    const publishedAt =
      body.status === "PUBLISHED"
        ? (body.publishedAt ? new Date(body.publishedAt) : new Date())
        : null;

    const article = await db.article.create({
      data: {
        title: body.title,
        slug,
        excerpt: body.excerpt,
        content: body.content,
        featuredImage: body.featuredImage || null,
        imageAlt: body.imageAlt || null,
        language: body.language,
        status: body.status,
        featured: body.featured,
        isBreaking: body.isBreaking,
        seoTitle: body.seoTitle?.trim() || body.title.trim(),
        seoDescription: body.seoDescription?.trim() || body.excerpt?.trim() || null,
        publishedAt,
        authorId: user.id,
        categories: body.categoryId
          ? { create: { categoryId: body.categoryId } }
          : undefined,
        tags: body.tagIds.length
          ? { create: body.tagIds.map((tagId) => ({ tagId })) }
          : undefined
      }
    });

    return NextResponse.json(article);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Create failed" },
      { status: e?.message === "UNAUTHORIZED" ? 401 : 400 }
    );
  }
}
