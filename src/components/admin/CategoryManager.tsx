"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CategoryManager({ initial }: { initial: any[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [form, setForm] = useState({ name_en: "", name_hi: "", sort_order: "0" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function add(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Could not add section");
      setSaving(false);
      return;
    }
    setItems((current) => [...current, data].sort((a, b) => a.sort_order - b.sort_order));
    setForm({ name_en: "", name_hi: "", sort_order: "0" });
    setSaving(false);
    router.refresh();
  }

  async function edit(item: any) {
    const nameEn = window.prompt("English name", item.name_en);
    if (nameEn === null) return;
    const nameHi = window.prompt("Hindi name", item.name_hi);
    if (nameHi === null) return;
    const response = await fetch("/api/categories/" + item.id, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name_en: nameEn, name_hi: nameHi, sort_order: item.sort_order })
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Could not update section");
    setItems((current) => current.map((x) => (x.id === item.id ? data : x)));
    router.refresh();
  }

  async function remove(item: any) {
    if (!window.confirm("Delete " + item.name_en + "?")) return;
    const response = await fetch("/api/categories/" + item.id, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setError(data.error || "Could not delete section");
    setItems((current) => current.filter((x) => x.id !== item.id));
    router.refresh();
  }

  return (
    <section className="admin-card">
      <form onSubmit={add} className="category-create-grid">
        <input className="input" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} placeholder="English name" required />
        <input className="input" value={form.name_hi} onChange={(e) => setForm({ ...form, name_hi: e.target.value })} placeholder="Hindi name" required />
        <div className="input" style={{ display: "flex", alignItems: "center", color: form.name_en ? "#222" : "#999" }}>
          /{form.name_en
            ? form.name_en.trim().toLowerCase()
                .normalize("NFKC")
                .replace(/[^\p{L}\p{N}\s-]/gu, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-+|-+$/g, "") || "section"
            : "slug-auto"}
        </div>
        <input className="input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} placeholder="Order" />
        <button className="btn primary" disabled={saving}>{saving ? "Adding…" : "Add section"}</button>
      </form>

      {error && <div className="notice danger-notice">{error}</div>}

      {items.length ? (
        <div className="table-wrap">
          <table>
            <thead><tr><th>English</th><th>Hindi</th><th>Slug</th><th>Order</th><th /></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.name_en}</strong></td>
                  <td>{item.name_hi}</td>
                  <td>/{item.slug}</td>
                  <td>{item.sort_order}</td>
                  <td style={{ display: "flex", gap: 7 }}>
                    <button className="btn" type="button" onClick={() => edit(item)}>Edit</button>
                    <button className="btn danger" type="button" onClick={() => remove(item)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="empty">No sections yet.</div>}
    </section>
  );
}
