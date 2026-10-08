import { NextResponse } from "next/server";
import { requireToken } from "@/lib/auth";
import { uploadMedia } from "@/lib/media";
import { Buffer } from "node:buffer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireToken();
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be smaller than 8 MB" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await uploadMedia({
      mime: file.type,
      dataBase64: bytes.toString("base64"),
      width: Number(form.get("width")) || null,
      height: Number(form.get("height")) || null,
      altText: String(form.get("altText") || "")
    });

    const id = (result as any)?.id;
    if (!id) throw new Error("Media upload returned no id");

    return NextResponse.json({ id });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Upload failed" },
      { status: error?.status || 400 }
    );
  }
}
