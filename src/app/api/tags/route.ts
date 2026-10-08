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
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    return NextResponse.json(await createTag(name), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Create failed" }, { status: error?.status || 400 });
  }
}
