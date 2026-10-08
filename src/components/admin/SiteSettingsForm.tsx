"use client";

import { useState } from "react";

export default function SiteSettingsForm({ initial }: { initial: any }) {
  const [value, setValue] = useState({
    tagline: initial?.tagline || "News that matters. Stories that stay.",
    footerText: initial?.footerText || "© 2026 Shambunews. All rights reserved."
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const r = await fetch("/api/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(value)
      });
      const data = await r.json().catch(() => ({}));
      setMessage(r.ok ? "Settings saved" : data.error || "Could not save");
    } catch {
      setMessage("Could not connect to the server");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-card" onSubmit={save}>
      <div style={{ marginBottom: 24 }}>
        <div className="kicker">Site identity</div>
        <h2 style={{ margin: "4px 0 6px", font: "600 27px/1.05 Georgia, serif" }}>
          Publication settings
        </h2>
        <p style={{ margin: 0, color: "#777166", font: "12px/1.5 Arial, sans-serif" }}>
          The Shambunews name and logo are part of the brand and are not editable here.
        </p>
      </div>

      <div className="field">
        <label>Tagline</label>
        <input
          className="input"
          value={value.tagline}
          onChange={(e) => setValue({ ...value, tagline: e.target.value })}
          placeholder="News that matters. Stories that stay."
        />
        <div className="meta">Shown beneath the masthead and in the footer.</div>
      </div>

      <div className="field">
        <label>Footer text</label>
        <textarea
          className="textarea"
          rows={3}
          value={value.footerText}
          onChange={(e) => setValue({ ...value, footerText: e.target.value })}
          placeholder="© 2026 Shambunews. All rights reserved."
        />
      </div>

      <button className="btn primary" disabled={saving}>
        {saving ? "Saving…" : "Save settings"}
      </button>
      {message && <span className="meta" style={{ marginLeft: 12 }}>{message}</span>}
    </form>
  );
}
