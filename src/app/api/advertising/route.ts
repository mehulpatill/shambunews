import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiAdmin } from "@/lib/auth";

const fields = {
  enabled: true, provider: true, publisherId: true,
  homepageTopSlot: true, homepageMidSlot: true, articleTopSlot: true, articleBottomSlot: true, sidebarSlot: true,
  homepageTopImage: true, homepageMidImage: true, articleTopImage: true, articleBottomImage: true, sidebarImage: true,
  homepageTopLink: true, homepageMidLink: true, articleTopLink: true, articleBottomLink: true, sidebarLink: true
} as const;

export async function PUT(req: Request) {
  try {
    await requireApiAdmin();
    const body = await req.json();
    const allowedProviders = ["NONE", "ADSENSE", "CUSTOM"];
    const provider = allowedProviders.includes(body.provider) ? body.provider : "NONE";
    const clean = (value: unknown) => typeof value === "string" ? value.trim() || null : null;
    const data = {
      enabled: Boolean(body.enabled), provider, publisherId: clean(body.publisherId),
      homepageTopSlot: clean(body.homepageTopSlot), homepageMidSlot: clean(body.homepageMidSlot),
      articleTopSlot: clean(body.articleTopSlot), articleBottomSlot: clean(body.articleBottomSlot), sidebarSlot: clean(body.sidebarSlot),
      homepageTopImage: clean(body.homepageTopImage), homepageMidImage: clean(body.homepageMidImage),
      articleTopImage: clean(body.articleTopImage), articleBottomImage: clean(body.articleBottomImage), sidebarImage: clean(body.sidebarImage),
      homepageTopLink: clean(body.homepageTopLink), homepageMidLink: clean(body.homepageMidLink),
      articleTopLink: clean(body.articleTopLink), articleBottomLink: clean(body.articleBottomLink), sidebarLink: clean(body.sidebarLink)
    };
    const item = await db.adSetting.upsert({
      where: { id: "main" },
      update: data,
      create: { id: "main", ...data },
      select: fields
    });
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to save advertising settings" }, { status: error?.message === "UNAUTHORIZED" ? 401 : 400 });
  }
}
