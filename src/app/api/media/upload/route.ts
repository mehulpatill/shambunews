import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { requireApiAdmin } from "@/lib/auth";

const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    await requireApiAdmin();
    if ((process.env.MEDIA_PROVIDER || "s3").toLowerCase() !== "cloudinary") {
      return NextResponse.json({ error: "Cloudinary media provider is not enabled" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 500 });
    }

    const data = await req.formData();
    const input = data.get("file");
    if (!(input instanceof File)) return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    if (!input.type.startsWith("image/")) return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    if (input.size > MAX_SIZE) return NextResponse.json({ error: "Image must be 10 MB or smaller" }, { status: 400 });

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "shambhu-news/articles";
    const toSign = "folder=" + folder + "&timestamp=" + timestamp;
    const signature = crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");

    const upload = new FormData();
    upload.append("file", new Blob([await input.arrayBuffer()], { type: input.type }), input.name);
    upload.append("api_key", apiKey);
    upload.append("timestamp", String(timestamp));
    upload.append("folder", folder);
    upload.append("signature", signature);

    const response = await fetch("https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload", { method: "POST", body: upload });
    const result = await response.json();
    if (!response.ok || !result.secure_url) {
      return NextResponse.json({ error: result?.error?.message || "Cloudinary upload failed" }, { status: 502 });
    }
    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Upload failed" }, { status: error?.message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
