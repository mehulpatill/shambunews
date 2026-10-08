import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const article = await db.article.findFirst({
    where: {
      id,
      status: "PUBLISHED",
      publishedAt: { lte: new Date() }
    },
    select: { id: true }
  });

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  await db.article.update({
    where: { id },
    data: { views: { increment: 1 } }
  });

  return NextResponse.json({ ok: true });
}
