"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ArticleFilters({
  initial
}: {
  initial: { q?: string; status?: string; language?: string };
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q || "");
  const [status, setStatus] = useState(initial.status || "");
  const [language, setLanguage] = useState(initial.language || "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    if (language) params.set("language", language);
    router.push("/admin/articles" + (params.toString() ? "?" + params : ""));
  }

  return (
    <form className="admin-card article-filters" onSubmit={submit} style={{ marginBottom: 18 }}>
      <div className="settings-grid">
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search headlines, slug or summary" />
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select className="select" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="">All languages</option>
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
        </select>
        <button className="btn primary">Filter</button>
      </div>
    </form>
  );
}
