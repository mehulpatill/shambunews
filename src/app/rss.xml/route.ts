import { getPublishedArticles, mediaUrl } from "@/lib/articles";
import { getSiteUrl } from "@/lib/config";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const base = getSiteUrl().replace(/\/$/, "");
  const items = await getPublishedArticles(30);

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
      (mediaUrl(article.cover_media_id) ? "<enclosure url=\"" + escapeXml(mediaUrl(article.cover_media_id)!) + "\" type=\"image/jpeg\" />" : "") +
      "<pubDate>" + new Date(article.published_at!).toUTCString() + "</pubDate>" +
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
