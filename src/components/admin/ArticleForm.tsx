"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ArticleEditor from "@/components/admin/ArticleEditor";
import MediaUploader from "@/components/admin/MediaUploader";

function toISTDateTimeValue(value: string | Date | null | undefined) {
  if (!value) return "";
  return new Date(value)
    .toLocaleString("sv-SE", {
      timeZone: "Asia/Kolkata",
      hour12: false
    })
    .replace(" ", "T")
    .slice(0, 16);
}

function fromISTDateTimeValue(value: string) {
  if (!value) return null;
  const [date, time] = value.split("T");
  return new Date(date + "T" + time + ":00+05:30").toISOString();
}

function plainTextFromHtml(html: string) {
  if (typeof window === "undefined") return "";
  const element = document.createElement("div");
  element.innerHTML = html;
  return (element.textContent || "").replace(/\s+/g, " ").trim();
}

export default function ArticleForm({
  article,
  categories,
  availableTags
}: {
  article?: any;
  categories: any[];
  availableTags: any[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: article?.title || "",
    excerpt: article?.excerpt || "",
    body_html: article?.body_html || "<p>Write your story here…</p>",
    language: article?.language || "en",
    category_id: article?.category_id || categories[0]?.id || "",
    cover_media_id: article?.cover_media_id || null,
    status: article?.status || "draft",
    published_at: toISTDateTimeValue(article?.published_at),
    is_featured: Boolean(article?.is_featured),
    is_breaking: Boolean(article?.is_breaking),
    tags: Array.isArray(article?.tags) ? article.tags : []
  });

  const [excerptTouched, setExcerptTouched] = useState(Boolean(article?.excerpt));
  const [selectedTags, setSelectedTags] = useState<string[]>(Array.isArray(article?.tags) ? article.tags : []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const summaryPreview = useMemo(() => plainTextFromHtml(form.body_html).slice(0, 240), [form.body_html]);

  function setField(key: string, value: any) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateBody(html: string) {
    setForm((current) => ({
      ...current,
      body_html: html,
      excerpt: excerptTouched
        ? current.excerpt
        : plainTextFromHtml(html).slice(0, 280)
    }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      tags: selectedTags.slice(0, 20),
      published_at: fromISTDateTimeValue(form.published_at)
    };

    const response = await fetch(
      article ? "/api/articles/" + article.id : "/api/articles",
      {
        method: article ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "Could not save article.");
      setSaving(false);
      return;
    }

    router.push("/admin/articles");
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        <div>
          <section className="admin-card">
            <div className="field">
              <label htmlFor="article-title">Headline</label>
              <input
                id="article-title"
                className="input"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="article-excerpt">Summary</label>
              <textarea
                id="article-excerpt"
                className="textarea"
                rows={4}
                value={form.excerpt}
                onChange={(e) => {
                  setExcerptTouched(true);
                  setField("excerpt", e.target.value);
                }}
                placeholder="Optional summary. It auto-fills from the story until you edit it."
              />
              {summaryPreview && !excerptTouched && (
                <div className="meta">Auto summary preview: {summaryPreview}</div>
              )}
            </div>

            <div className="field">
              <label>Story</label>
              <ArticleEditor initialHtml={form.body_html} onChange={updateBody} />
            </div>
          </section>
        </div>

        <div>
          <section className="admin-card">
            <div className="field">
              <label>Language</label>
              <select className="select" value={form.language} onChange={(e) => setField("language", e.target.value)}>
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>

            <div className="field">
              <label>Section</label>
              <select className="select" value={form.category_id} onChange={(e) => setField("category_id", e.target.value)} required>
                <option value="">Select section</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name_en} / {category.name_hi}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Cover image</label>
              <MediaUploader
                value={form.cover_media_id ? "/media/" + form.cover_media_id : null}
                onChange={(value) => setField("cover_media_id", value?.replace("/media/", "") || null)}
              />
            </div>

            <div className="field">
              <label>Tags</label>
              {availableTags.length ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {availableTags.map((tag) => {
                    const checked = selectedTags.includes(tag.name);
                    return (
                      <label
                        key={tag.id}
                        className="check-row"
                        style={{ width: "auto", padding: "7px 10px", border: "1px solid #d8cfc2", borderRadius: 999 }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSelectedTags((current) =>
                              checked
                                ? current.filter((name) => name !== tag.name)
                                : [...current, tag.name]
                            )
                          }
                        />
                        {tag.name}
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="notice">Create tags in Taxonomy → Tags before adding them to a story.</div>
              )}
            </div>

            <div className="field">
              <label>Status</label>
              <select className="select" value={form.status} onChange={(e) => setField("status", e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="field">
              <label>Publish time (IST)</label>
              <input
                className="input"
                type="datetime-local"
                value={form.published_at}
                onChange={(e) => setField("published_at", e.target.value)}
              />
              <div className="meta">Choose a future time to schedule a published story.</div>
            </div>

            <label className="check-row">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setField("is_featured", e.target.checked)} />
              Featured story
            </label>

            <label className="check-row">
              <input type="checkbox" checked={form.is_breaking} onChange={(e) => setField("is_breaking", e.target.checked)} />
              Breaking news
            </label>

            {error && <div className="notice danger-notice">{error}</div>}

            <button
              className="btn primary"
              style={{ width: "100%" }}
              disabled={saving || !form.cover_media_id}
              title={!form.cover_media_id ? "Upload a cover image before saving" : undefined}
            >
              {saving ? "Saving…" : article ? "Update story" : "Save story"}
            </button>
            {!form.cover_media_id && (
              <div className="meta" style={{ marginTop: 8, color: "#8c1717" }}>
                Upload a cover image before saving this story.
              </div>
            )}

            {article && (
              <button
                type="button"
                className="btn danger"
                style={{ width: "100%", marginTop: 9 }}
                onClick={async () => {
                  if (!window.confirm("Delete this story?")) return;
                  const response = await fetch("/api/articles/" + article.id, { method: "DELETE" });
                  if (response.ok) {
                    router.push("/admin/articles");
                    router.refresh();
                  }
                }}
              >
                Delete story
              </button>
            )}
          </section>
        </div>
      </div>
    </form>
  );
}
