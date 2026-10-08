import { NextResponse } from "next/server";
import { deleteCategory, updateCategory } from "@/lib/admin";
import { requireToken } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireToken();
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json(await updateCategory(id, {
      name_en: String(body.name_en || "").trim(),
      name_hi: String(body.name_hi || "").trim(),
      slug: String(body.slug || "").trim().toLowerCase(),
      sort_order: Number(body.sort_order) || 0
    }));
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
    await deleteCategory(id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Delete failed" }, { status: error?.status || 400 });
  }
}
