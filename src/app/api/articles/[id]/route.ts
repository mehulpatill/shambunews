import { NextResponse } from "next/server";
import { deleteArticle, getAdminArticle, saveArticle } from "@/lib/admin";
import { requireToken } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireToken();
    const { id } = await params;
    const article = await getAdminArticle(id);
    if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    return NextResponse.json(article);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unauthorized" }, { status: error?.status || 401 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireToken();
    const { id } = await params;
    const body = await request.json();
    const article = await saveArticle(id, body);
    return NextResponse.json(article);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Update failed" }, { status: error?.status || 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireToken();
    const { id } = await params;
    await deleteArticle(id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Delete failed" }, { status: error?.status || 400 });
  }
}
