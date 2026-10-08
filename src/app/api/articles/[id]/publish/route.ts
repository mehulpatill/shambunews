import { NextResponse } from "next/server";
import { publishArticle, unpublishArticle } from "@/lib/admin";
import { requireToken } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireToken();
    const { id } = await params;
    return NextResponse.json(await publishArticle(id));
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Publish failed" },
      { status: error?.status || 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireToken();
    const { id } = await params;
    return NextResponse.json(await unpublishArticle(id));
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unpublish failed" },
      { status: error?.status || 400 }
    );
  }
}
