import { NextResponse } from "next/server";
import { saveArticle, listAdminArticles } from "@/lib/admin";
import { requireToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireToken();
    const url = new URL(request.url);
    const rows = await listAdminArticles({
      q: url.searchParams.get("q") || "",
      status: url.searchParams.get("status") || "",
      language: url.searchParams.get("language") || ""
    });
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unauthorized" },
      { status: error?.status || 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireToken();
    const body = await request.json();
    const article = await saveArticle(null, body);
    return NextResponse.json(article, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Create failed" },
      { status: error?.status || 400 }
    );
  }
}
