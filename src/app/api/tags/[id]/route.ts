import { NextResponse } from "next/server";
import { deleteTag, updateTag } from "@/lib/admin";
import { requireToken } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireToken();
    const { id } = await params;
    const body = await request.json();
    const nameEn = String(body.name_en || "").trim();
    const nameHi = String(body.name_hi || "").trim();
    if (!nameEn || !nameHi) return NextResponse.json({ error: "English and Hindi tag names are required" }, { status: 400 });
    return NextResponse.json(await updateTag(id, nameEn, nameHi));
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Update failed" }, { status: error?.status || 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireToken();
    const { id } = await params;
    await deleteTag(id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Delete failed" }, { status: error?.status || 400 });
  }
}
