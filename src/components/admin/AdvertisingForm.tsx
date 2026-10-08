"use client";

import { useState } from "react";

const slots = [
  ["homepageTop", "Homepage — Top"],
  ["homepageMid", "Homepage — Between sections"],
  ["articleTop", "Article — Top"],
  ["articleBottom", "Article — Bottom"],
  ["sidebar", "Article — Sidebar"]
] as const;

export default function AdvertisingForm({ initial }: { initial: any }) {
  const [value, setValue] = useState<any>({
    enabled: false,
    provider: "NONE",
    publisherId: "",
    homepageTopSlot: "", homepageMidSlot: "", articleTopSlot: "", articleBottomSlot: "", sidebarSlot: "",
    homepageTopImage: "", homepageMidImage: "", articleTopImage: "", articleBottomImage: "", sidebarImage: "",
    homepageTopLink: "", homepageMidLink: "", articleTopLink: "", articleBottomLink: "", sidebarLink: "",
    ...initial
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key: string, fieldValue: any) => setValue((current: any) => ({ ...current, [key]: fieldValue }));

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const r = await fetch("/api/advertising", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(value)
      });
      const data = await r.json().catch(() => ({}));
      setMessage(r.ok ? "Advertising settings saved" : data.error || "Could not save");
    } catch {
      setMessage("Could not connect to the server");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-card" onSubmit={save}>
      <div className="ad-settings-intro">
        <div>
          <div className="kicker">Monetization</div>
          <h2>Advertising</h2>
          <p>Ads stay completely off until you enable them here.</p>
        </div>
        <label className="switch-row">
          <input type="checkbox" checked={Boolean(value.enabled)} onChange={(e) => set("enabled", e.target.checked)} />
          <span>Advertising enabled</span>
        </label>
      </div>

      <div className="settings-grid">
        <div className="field">
          <label>Ad provider</label>
          <select className="select" value={value.provider} onChange={(e) => set("provider", e.target.value)}>
            <option value="NONE">None</option>
            <option value="ADSENSE">Google AdSense</option>
            <option value="CUSTOM">Custom banner</option>
          </select>
        </div>
        {value.provider === "ADSENSE" && (
          <div className="field">
            <label>Publisher ID</label>
            <input className="input" value={value.publisherId || ""} onChange={(e) => set("publisherId", e.target.value)} placeholder="ca-pub-XXXXXXXXXXXXXXXX" />
          </div>
        )}
      </div>

      <div className="ad-placement-list">
        {slots.map(([key, label]) => {
          const slotKey = key + "Slot";
          const imageKey = key + "Image";
          const linkKey = key + "Link";
          return (
            <section className="ad-placement" key={key}>
              <div className="ad-placement-head">
                <div>
                  <div className="kicker">Placement</div>
                  <h3>{label}</h3>
                </div>
                <span className="meta">{value.provider === "ADSENSE" ? "AdSense slot ID" : value.provider === "CUSTOM" ? "Banner image" : "Disabled"}</span>
              </div>

              {value.provider === "ADSENSE" && (
                <div className="field">
                  <label>Slot ID</label>
                  <input className="input" value={value[slotKey] || ""} onChange={(e) => set(slotKey, e.target.value)} placeholder="1234567890" />
                </div>
              )}

              {value.provider === "CUSTOM" && (
                <div className="settings-grid">
                  <div className="field">
                    <label>Banner image URL</label>
                    <input className="input" value={value[imageKey] || ""} onChange={(e) => set(imageKey, e.target.value)} placeholder="https://..." />
                  </div>
                  <div className="field">
                    <label>Destination URL</label>
                    <input className="input" value={value[linkKey] || ""} onChange={(e) => set(linkKey, e.target.value)} placeholder="https://advertiser.example" />
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="meta" style={{ margin: "18px 0" }}>
        Ads are shown only when advertising is enabled and the selected placement has valid configuration.
      </div>

      <button className="btn primary" disabled={saving}>{saving ? "Saving…" : "Save advertising settings"}</button>
      {message && <span className="meta" style={{ marginLeft: 12 }}>{message}</span>}
    </form>
  );
}
