"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TagManager({ initial }: { initial: any[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function add(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/tags", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Could not add tag");
      setSaving(false);
      return;
    }
    setItems((current) => [...current, data].sort((a, b) => a.name.localeCompare(b.name)));
    setName("");
    setSaving(false);
    router.refresh();
  }

  async function edit(item: any) {
    const nextName = window.prompt("Tag name", item.name);
    if (nextName === null) return;

    const response = await fetch("/api/tags/" + item.id, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: nextName })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Could not update tag");
      return;
    }
    setItems((current) =>
      current.map((x) => (x.id === item.id ? data : x)).sort((a, b) => a.name.localeCompare(b.name))
    );
    router.refresh();
  }

  async function remove(item: any) {
    if (!window.confirm("Delete tag " + item.name + "?")) return;
    const response = await fetch("/api/tags/" + item.id, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Could not delete tag");
      return;
    }
    setItems((current) => current.filter((x) => x.id !== item.id));
    router.refresh();
  }

  return (
    <section className="admin-card">
      <form onSubmit={add} className="category-create-grid">
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tag name"
          required
        />
        <div className="input meta" style={{ display: "flex", alignItems: "center" }}>
          /{name ? name.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "") || "tag" : "slug-auto"}
        </div>
        <button className="btn primary" disabled={saving}>
          {saving ? "Adding…" : "Add tag"}
        </button>
      </form>

      {error && <div className="notice danger-notice">{error}</div>}

      {items.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Slug</th><th /></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong></td>
                  <td>/{item.slug}</td>
                  <td style={{ display: "flex", gap: 7 }}>
                    <button className="btn" type="button" onClick={() => edit(item)}>Edit</button>
                    <button className="btn danger" type="button" onClick={() => remove(item)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">No tags yet.</div>
      )}
    </section>
  );
}
