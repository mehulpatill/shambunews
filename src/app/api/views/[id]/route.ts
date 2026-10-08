import { NextResponse } from "next/server";
import { incrementView } from "@/lib/articles";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await incrementView(id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Could not update views" },
      { status: 400 }
    );
  }
}
