import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiAdmin } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    await requireApiAdmin();
    const b = await req.json();
    const item = await db.siteSetting.upsert({
      where: { id: "main" },
      update: {
        tagline: typeof b.tagline === "string" ? b.tagline.trim() : undefined,
        footerText: typeof b.footerText === "string" ? b.footerText.trim() || null : null
      },
      create: {
        id: "main",
        siteName: "Shambunews",
        tagline:
          typeof b.tagline === "string" && b.tagline.trim()
            ? b.tagline.trim()
            : "News that matters. Stories that stay.",
        footerText:
          typeof b.footerText === "string" && b.footerText.trim()
            ? b.footerText.trim()
            : "© 2026 Shambunews. All rights reserved."
      }
    });
    return NextResponse.json(item);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed" },
      { status: e?.message === "UNAUTHORIZED" ? 401 : 400 }
    );
  }
}
