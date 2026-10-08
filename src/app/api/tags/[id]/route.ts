import { NextResponse } from "next/server";
import { deleteTag, updateTag } from "@/lib/admin";
import { requireToken } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireToken();
    const { id } = await params;
    const body = await request.json();
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    return NextResponse.json(await updateTag(id, name));
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
