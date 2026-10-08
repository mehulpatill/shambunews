import { NextResponse } from "next/server";
import { createTag, listTags } from "@/lib/admin";
import { requireToken } from "@/lib/auth";

export async function GET() {
  try {
    await requireToken();
    return NextResponse.json(await listTags());
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
    if (!nameEn || !nameHi) return NextResponse.json({ error: "English and Hindi tag names are required" }, { status: 400 });
    return NextResponse.json(await createTag(nameEn, nameHi), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Create failed" }, { status: error?.status || 400 });
  }
}
