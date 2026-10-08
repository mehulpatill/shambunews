"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ArticleActions({
  id,
  status
}: {
  id: string;
  status: "draft" | "published";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function togglePublish() {
    setBusy(true);
    const response =
      status === "draft"
        ? await fetch("/api/articles/" + id + "/publish", { method: "POST" })
        : await fetch("/api/articles/" + id + "/publish", { method: "DELETE" });

    if (response.ok) router.refresh();
    setBusy(false);
  }

  async function remove() {
    if (!window.confirm("Delete this story?")) return;
    setBusy(true);
    const response = await fetch("/api/articles/" + id, { method: "DELETE" });
    if (response.ok) router.refresh();
    setBusy(false);
  }

  return (
    <div style={{ display: "flex", gap: 7, justifyContent: "flex-end", flexWrap: "wrap" }}>
      <button type="button" className="btn" onClick={togglePublish} disabled={busy}>
        {busy ? "…" : status === "draft" ? "Publish" : "Unpublish"}
      </button>
      <button type="button" className="btn danger" onClick={remove} disabled={busy}>
        Delete
      </button>
    </div>
  );
}
