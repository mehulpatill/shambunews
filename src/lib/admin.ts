import { revalidateTag } from "next/cache";
import { adminRest } from "@/lib/auth";
import { siteConfig } from "@/lib/config";
import { sanitizeArticleHtml } from "@/lib/sanitize";

export type ArticleInput = {
  title: string;
  excerpt?: string;
  body_html: string;
  language: "en" | "hi";
  category_id: string;
  cover_media_id?: string | null;
  status: "draft" | "published";
  published_at?: string | null;
  is_featured?: boolean;
  is_breaking?: boolean;
  tags?: string[];
};

const adminArticleSelect =
  "*,category:categories!articles_category_id_fkey(id,slug,name_en,name_hi,sort_order),cover:media!articles_cover_media_id_fkey(id,mime,width,height,bytes)";

function slugify(input: string) {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "") || "article";
}

export async function uniqueSlug(title: string, id?: string) {
  const base = slugify(title);
  const existing = await adminRest<{ id: string; slug: string }[]>(
    "/rest/v1/articles?select=id,slug&slug=like." +
      encodeURIComponent(base + "%")
  );

  const taken = new Set(existing.filter((x) => x.id !== id).map((x) => x.slug));
  if (!taken.has(base)) return base;

  let n = 2;
  while (taken.has(base + "-" + n)) n += 1;
  return base + "-" + n;
}

function normalizePublishedAt(input?: string | null, status?: ArticleInput["status"]) {
  if (status !== "published") return null;
  return input ? new Date(input).toISOString() : new Date().toISOString();
}

export async function listAdminArticles(
  options: { q?: string; status?: string; language?: string } = {}
) {
  const params = new URLSearchParams({
    select: adminArticleSelect,
    order: "updated_at.desc",
    limit: "100"
  });
  if (options.status && ["draft", "published"].includes(options.status)) {
    params.set("status", "eq." + options.status);
  }
  if (options.language && ["en", "hi"].includes(options.language)) {
    params.set("language", "eq." + options.language);
  }
  if (options.q?.trim()) {
    const q = options.q.trim().replace(/[,*()]/g, " ");
    params.set(
      "or",
      "(title.ilike.*" + q + "*,slug.ilike.*" + q + "*,excerpt.ilike.*" + q + "*)"
    );
  }

  return await adminRest<any[]>("/rest/v1/articles?" + params.toString());
}

export async function getAdminArticle(id: string) {
  const rows = await adminRest<any[]>(
    "/rest/v1/articles?select=" +
      adminArticleSelect +
      "&id=eq." +
      encodeURIComponent(id) +
      "&limit=1"
  );
  return rows[0] || null;
}

export async function saveArticle(id: string | null, input: ArticleInput) {
  if (!input.cover_media_id) {
    throw new Error("Cover image is required before saving a story.");
  }

  const slug = await uniqueSlug(input.title, id || undefined);
  const cleanBody = sanitizeArticleHtml(input.body_html);
  const publishedAt = normalizePublishedAt(input.published_at, input.status);

  const payload = {
    title: input.title.trim(),
    slug,
    excerpt: input.excerpt?.trim() || null,
    body_html: cleanBody,
    language: input.language,
    category_id: input.category_id,
    cover_media_id: input.cover_media_id || null,
    status: input.status,
    published_at: publishedAt,
    is_featured: Boolean(input.is_featured),
    is_breaking: Boolean(input.is_breaking),
    tags: input.tags || []
  };

  const result = id
    ? await adminRest<any[]>(
        "/rest/v1/articles?id=eq." + encodeURIComponent(id),
        {
          method: "PATCH",
          headers: { prefer: "return=representation" },
          body: JSON.stringify(payload)
        }
      )
    : await adminRest<any[]>(
        "/rest/v1/articles",
        {
          method: "POST",
          headers: { prefer: "return=representation" },
          body: JSON.stringify(payload)
        }
      );

  const saved = result[0];
  if (saved?.id) {
    const availableTags = await listTags();
    const selectedNames = Array.from(new Set(input.tags || []));
    const selectedIds = availableTags
      .filter((tag) => selectedNames.includes(tag.name))
      .map((tag) => tag.id);
    await adminRest("/rest/v1/rpc/set_article_tags", {
      method: "POST",
      body: JSON.stringify({ p_article_id: saved.id, p_tag_ids: selectedIds })
    });
  }

  revalidateTag(siteConfig.cacheTag, { expire: 0 });
  return saved;
}

export async function publishArticle(id: string) {
  const result = await adminRest<any[]>(
    "/rest/v1/articles?id=eq." + encodeURIComponent(id),
    {
      method: "PATCH",
      headers: { prefer: "return=representation" },
      body: JSON.stringify({
        status: "published",
        published_at: new Date().toISOString()
      })
    }
  );
  revalidateTag(siteConfig.cacheTag, { expire: 0 });
  return result[0];
}

export async function unpublishArticle(id: string) {
  const result = await adminRest<any[]>(
    "/rest/v1/articles?id=eq." + encodeURIComponent(id),
    {
      method: "PATCH",
      headers: { prefer: "return=representation" },
      body: JSON.stringify({
        status: "draft",
        published_at: null,
        is_breaking: false
      })
    }
  );
  revalidateTag(siteConfig.cacheTag, { expire: 0 });
  return result[0];
}

export async function deleteArticle(id: string) {
  await adminRest(
    "/rest/v1/articles?id=eq." + encodeURIComponent(id),
    { method: "DELETE" }
  );
  revalidateTag(siteConfig.cacheTag, { expire: 0 });
}

export async function listCategories() {
  return await adminRest<any[]>(
    "/rest/v1/categories?select=id,slug,name_en,name_hi,sort_order&order=sort_order.asc"
  );
}

async function uniqueCategorySlug(nameEn: string, id?: string) {
  const base = slugify(nameEn);
  const existing = await adminRest<{ id: string; slug: string }[]>(
    "/rest/v1/categories?select=id,slug&slug=like." + encodeURIComponent(base + "%")
  );

  const taken = new Set(existing.filter((x) => x.id !== id).map((x) => x.slug));
  if (!taken.has(base)) return base;

  let n = 2;
  while (taken.has(base + "-" + n)) n += 1;
  return base + "-" + n;
}

export async function createCategory(input: {
  name_en: string;
  name_hi: string;
  sort_order?: number;
}) {
  const slug = await uniqueCategorySlug(input.name_en);
  const result = await adminRest<any[]>("/rest/v1/categories", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify({
      name_en: input.name_en,
      name_hi: input.name_hi,
      slug,
      sort_order: input.sort_order || 0
    })
  });
  revalidateTag(siteConfig.cacheTag, { expire: 0 });
  return result[0];
}

export async function updateCategory(
  id: string,
  input: { name_en: string; name_hi: string; sort_order?: number }
) {
  const slug = await uniqueCategorySlug(input.name_en, id);
  const result = await adminRest<any[]>(
    "/rest/v1/categories?id=eq." + encodeURIComponent(id),
    {
      method: "PATCH",
      headers: { prefer: "return=representation" },
      body: JSON.stringify({
        name_en: input.name_en,
        name_hi: input.name_hi,
        slug,
        sort_order: input.sort_order || 0
      })
    }
  );
  revalidateTag(siteConfig.cacheTag, { expire: 0 });
  return result[0];
}

export async function deleteCategory(id: string) {
  await adminRest(
    "/rest/v1/categories?id=eq." + encodeURIComponent(id),
    { method: "DELETE" }
  );
  revalidateTag(siteConfig.cacheTag, { expire: 0 });
}

export async function listTags() {
  return await adminRest<any[]>(
    "/rest/v1/tags?select=id,name,slug,created_at,updated_at&order=name.asc"
  );
}

async function uniqueTagSlug(name: string, id?: string) {
  const base = slugify(name);
  const existing = await adminRest<{ id: string; slug: string }[]>(
    "/rest/v1/tags?select=id,slug&slug=like." + encodeURIComponent(base + "%")
  );
  const taken = new Set(existing.filter((x) => x.id !== id).map((x) => x.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(base + "-" + n)) n += 1;
  return base + "-" + n;
}

export async function createTag(name: string) {
  const clean = name.trim();
  if (!clean) throw new Error("Tag name is required");
  const slug = await uniqueTagSlug(clean);
  const result = await adminRest<any[]>("/rest/v1/tags", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify({ name: clean, slug })
  });
  revalidateTag(siteConfig.cacheTag, { expire: 0 });
  return result[0];
}

export async function updateTag(id: string, name: string) {
  const clean = name.trim();
  if (!clean) throw new Error("Tag name is required");
  const slug = await uniqueTagSlug(clean, id);
  const result = await adminRest<any[]>(
    "/rest/v1/tags?id=eq." + encodeURIComponent(id),
    {
      method: "PATCH",
      headers: { prefer: "return=representation" },
      body: JSON.stringify({ name: clean, slug })
    }
  );
  revalidateTag(siteConfig.cacheTag, { expire: 0 });
  return result[0];
}

export async function deleteTag(id: string) {
  await adminRest(
    "/rest/v1/tags?id=eq." + encodeURIComponent(id),
    { method: "DELETE" }
  );
  revalidateTag(siteConfig.cacheTag, { expire: 0 });
}
