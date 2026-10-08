import { NextResponse } from "next/server";
import { getMedia } from "@/lib/media";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const media = await getMedia(id);

    return new NextResponse(media.data as unknown as BodyInit, {
      headers: {
        "content-type": media.mime,
        "cache-control": "public, max-age=31536000, immutable"
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Media not found" },
      { status: error?.status || 404 }
    );
  }
}
