"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import MediaUploader from "@/components/admin/MediaUploader";

function toLocalDateTimeValue(value: string | Date | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function ArticleForm({
  article,
  categories,
  tags
}: {
  article?: any;
  categories: any[];
  tags: any[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: article?.title || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "Write your story here…",
    featuredImage: article?.featuredImage || "",
    imageAlt: article?.imageAlt || "",
    language: article?.language || "EN",
    status: article?.status || "DRAFT",
    featured: article?.featured || false,
    isBreaking: article?.isBreaking || false,
    publishedAt: toLocalDateTimeValue(article?.publishedAt),
    seoTitle: article?.seoTitle || "",
    seoDescription: article?.seoDescription || "",
    categoryId: article?.categories?.[0]?.categoryId || "",
    tagIds: article?.tags?.map((x: any) => x.tagId) || []
  });

  const [seoTitleTouched, setSeoTitleTouched] = useState(Boolean(article?.seoTitle?.trim()));
  const [seoDescriptionTouched, setSeoDescriptionTouched] = useState(Boolean(article?.seoDescription?.trim()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, value: any) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateTitle = (value: string) => {
    setForm((current) => ({
      ...current,
      title: value,
      seoTitle: seoTitleTouched ? current.seoTitle : value
    }));
  };

  const updateExcerpt = (value: string) => {
    setForm((current) => ({
      ...current,
      excerpt: value,
      seoDescription: seoDescriptionTouched ? current.seoDescription : value
    }));
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = article ? `/api/articles/${article.id}` : "/api/articles";
    const method = article ? "PUT" : "POST";

    const payload = {
      ...form,
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
      seoTitle: form.seoTitle || form.title,
      seoDescription: form.seoDescription || form.excerpt
    };

    const r = await fetch(endpoint, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await r.json();

    if (!r.ok) {
      setError(data.error || "Could not save");
      setLoading(false);
      return;
    }

    router.push("/admin/articles");
    router.refresh();
  };

  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        <div>
          <div className="admin-card">
            <div className="field">
              <label>Headline</label>
              <input
                className="input"
                value={form.title}
                onChange={(e) => updateTitle(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Short description</label>
              <textarea
                className="textarea"
                rows={4}
                value={form.excerpt}
                onChange={(e) => updateExcerpt(e.target.value)}
                placeholder="A short summary of the story"
              />
            </div>

            <div className="field">
              <label>Story content</label>
              <textarea
                className="textarea editor"
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                required
              />
              <div className="meta">
                Supports plain paragraphs, <code>## headings</code> and <code>&gt; quotes</code>.
              </div>
            </div>

            <div className="field">
              <label>Featured image</label>
              <MediaUploader
                value={form.featuredImage}
                onChange={(value) => set("featuredImage", value)}
              />
              <input
                className="input"
                style={{ marginTop: 10 }}
                value={form.featuredImage}
                onChange={(e) => set("featuredImage", e.target.value)}
                placeholder="Or paste an existing image URL"
              />
            </div>

            <div className="field">
              <label>Image alt text</label>
              <input
                className="input"
                value={form.imageAlt}
                onChange={(e) => set("imageAlt", e.target.value)}
                placeholder="Describe the image"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="admin-card">
            <div className="field">
              <label>Language</label>
              <select
                className="select"
                value={form.language}
                onChange={(e) => set("language", e.target.value)}
              >
                <option value="EN">English</option>
                <option value="HI">हिंदी</option>
              </select>
              <div className="meta">Choose the language of this story for the public language filter.</div>
            </div>

            <div className="field">
              <label>Status</label>
              <select
                className="select"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option>DRAFT</option>
                <option>PUBLISHED</option>
                <option>ARCHIVED</option>
              </select>
            </div>

            <label
              style={{
                display: "flex",
                gap: 9,
                alignItems: "center",
                fontSize: 13,
                marginBottom: 10
              }}
            >
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
              />
              Featured story
            </label>

            <label
              style={{
                display: "flex",
                gap: 9,
                alignItems: "center",
                fontSize: 13,
                marginBottom: 16
              }}
            >
              <input
                type="checkbox"
                checked={form.isBreaking}
                onChange={(e) => set("isBreaking", e.target.checked)}
              />
              Breaking news
            </label>

            <div className="field">
              <label>Publish time</label>
              <input
                className="input"
                type="datetime-local"
                value={form.publishedAt}
                onChange={(e) => set("publishedAt", e.target.value)}
              />
              <div className="meta">
                Set a future time to schedule a published story. Leave blank to publish immediately.
              </div>
            </div>

            <div className="field">
              <label>Category</label>
              <select
                className="select"
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Tags</label>
              <div style={{ display: "grid", gap: 7 }}>
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    style={{ fontSize: 13, display: "flex", gap: 7, alignItems: "center" }}
                  >
                    <input
                      type="checkbox"
                      checked={form.tagIds.includes(tag.id)}
                      onChange={(e) =>
                        set(
                          "tagIds",
                          e.target.checked
                            ? [...form.tagIds, tag.id]
                            : form.tagIds.filter((id: string) => id !== tag.id)
                        )
                      }
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="field">
              <label>SEO title</label>
              <input
                className="input"
                value={seoTitleTouched ? form.seoTitle : form.title}
                onFocus={() => {
                  if (!seoTitleTouched) {
                    setSeoTitleTouched(true);
                    setForm((current) => ({ ...current, seoTitle: current.title }));
                  }
                }}
                onChange={(e) => {
                  setSeoTitleTouched(true);
                  set("seoTitle", e.target.value);
                }}
              />
              <div className="meta">Auto-generated from the headline. Edit it to customize.</div>
            </div>

            <div className="field">
              <label>SEO description</label>
              <textarea
                className="textarea"
                rows={5}
                value={seoDescriptionTouched ? form.seoDescription : form.excerpt}
                onFocus={() => {
                  if (!seoDescriptionTouched) {
                    setSeoDescriptionTouched(true);
                    setForm((current) => ({ ...current, seoDescription: current.excerpt }));
                  }
                }}
                onChange={(e) => {
                  setSeoDescriptionTouched(true);
                  set("seoDescription", e.target.value);
                }}
              />
              <div className="meta">Auto-generated from the short description. Edit it to customize.</div>
            </div>

            {error && (
              <div
                className="notice"
                style={{
                  background: "#fff0f0",
                  borderColor: "#f1c0c0",
                  color: "#8c1717"
                }}
              >
                {error}
              </div>
            )}

            <button className="btn primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Saving…" : article ? "Save changes" : "Create article"}
            </button>

            {article && (
              <button
                type="button"
                className="btn danger"
                style={{ width: "100%", marginTop: 9 }}
                onClick={async () => {
                  if (confirm("Delete this article?")) {
                    await fetch(`/api/articles/${article.id}`, { method: "DELETE" });
                    router.push("/admin/articles");
                  }
                }}
              >
                Delete article
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
