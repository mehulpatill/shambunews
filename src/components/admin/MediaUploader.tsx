"use client";

import { useState } from "react";

export default function MediaUploader({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function upload(file: File) {
    setBusy(true); setMsg("");
    try {
      const provider = process.env.NEXT_PUBLIC_MEDIA_PROVIDER || "s3";
      if (provider === "cloudinary") {
        const form = new FormData(); form.append("file", file);
        const response = await fetch("/api/media/upload", { method: "POST", body: form });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Cloudinary upload failed");
        onChange(result.url);
      } else {
        const presign = await fetch("/api/media/presign", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ filename: file.name, contentType: file.type }) });
        const result = await presign.json();
        if (!presign.ok) throw new Error(result.error || "Could not prepare upload");
        const put = await fetch(result.uploadUrl, { method: "PUT", headers: { "content-type": file.type }, body: file });
        if (!put.ok) throw new Error("S3 upload failed");
        onChange(result.url);
      }
      setMsg("Uploaded");
    } catch (error: any) {
      setMsg(error?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return <div>
    <input className="input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) upload(file); }} />
    {busy && <div className="meta" style={{ marginTop: 7 }}>Uploading…</div>}
    {msg && <div className="meta" style={{ marginTop: 7 }}>{msg}</div>}
    {value && <div style={{ marginTop: 10 }}><img src={value} alt="Selected featured image" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", border: "1px solid #ddd" }} /></div>}
  </div>;
}
