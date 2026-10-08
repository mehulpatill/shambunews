"use client";

import { useRef, useState } from "react";

async function resizeImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Image must be smaller than 8 MB.");

  const source = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read image."));
      img.src = source;
    });

    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Image processing unavailable.");
    ctx.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.86)
    );
    if (!blob) throw new Error("Could not prepare image.");
    return { blob, width, height };
  } finally {
    URL.revokeObjectURL(source);
  }
}

export default function MediaUploader({
  value,
  onChange
}: {
  value?: string | null;
  onChange: (id: string | null) => void;
}) {
  const input = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="media-uploader">
      {value ? (
        <div className="media-preview">
          <img src={value.startsWith("/media/") ? value : value} alt="" />
          <button type="button" className="btn" onClick={() => onChange(null)}>Remove cover</button>
        </div>
      ) : (
        <button type="button" className="btn" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? "Uploading…" : "Upload cover image"}
        </button>
      )}

      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.currentTarget.value = "";
          if (!file) return;

          setBusy(true);
          setError("");
          try {
            const resized = await resizeImage(file);
            const form = new FormData();
            form.set("file", new File([resized.blob], "cover.webp", { type: "image/webp" }));
            form.set("width", String(resized.width));
            form.set("height", String(resized.height));
            const response = await fetch("/admin/api/upload", { method: "POST", body: form });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Upload failed");
            onChange("/media/" + data.id);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Upload failed");
          } finally {
            setBusy(false);
          }
        }}
      />
      {error && <div className="notice">{error}</div>}
    </div>
  );
}
