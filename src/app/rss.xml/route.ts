import { db } from "@/lib/db";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const items = await db.article.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: 30,
    select: { title: true, slug: true, excerpt: true, publishedAt: true }
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0"><channel>',
    "<title>Shambunews</title>",
    "<description>Independent news, sharp analysis, and stories from India and beyond.</description>",
    "<link>" + escapeXml(base) + "</link>",
    ...items.map((article) =>
      "<item>" +
      "<title>" + escapeXml(article.title) + "</title>" +
      "<link>" + escapeXml(base + "/news/" + article.slug) + "</link>" +
      "<guid isPermaLink=\"true\">" + escapeXml(base + "/news/" + article.slug) + "</guid>" +
      (article.excerpt ? "<description>" + escapeXml(article.excerpt) + "</description>" : "") +
      "<pubDate>" + new Date(article.publishedAt!).toUTCString() + "</pubDate>" +
      "</item>"
    ),
    "</channel></rss>"
  ].join("");

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, s-maxage=300, stale-while-revalidate=600"
    }
  });
}