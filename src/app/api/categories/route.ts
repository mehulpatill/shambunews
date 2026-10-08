import { NextResponse } from "next/server";
import { createCategory, listCategories } from "@/lib/admin";
import { requireToken } from "@/lib/auth";

export async function GET() {
  try {
    await requireToken();
    return NextResponse.json(await listCategories());
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unauthorized" }, { status: error?.status || 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireToken();
    const body = await request.json();
    const nameEn = String(body.name_en || "").trim();
    const nameHi = String(body.name_hi || "").trim();
    const slug = String(body.slug || "").trim().toLowerCase();
    if (!nameEn || !nameHi || !slug) {
      return NextResponse.json({ error: "English name, Hindi name and slug are required" }, { status: 400 });
    }
    return NextResponse.json(await createCategory({
      name_en: nameEn,
      name_hi: nameHi,
      slug,
      sort_order: Number(body.sort_order) || 0
    }), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Create failed" }, { status: error?.status || 400 });
  }
}
