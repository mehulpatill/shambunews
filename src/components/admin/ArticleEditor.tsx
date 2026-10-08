"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useRef } from "react";

async function resizeImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  const maxBytes = 8 * 1024 * 1024;
  if (file.size > maxBytes) throw new Error("Image must be smaller than 8 MB.");

  const src = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read image."));
      img.src = src;
    });

    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image processing is unavailable.");
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.86)
    );
    if (!blob) throw new Error("Could not prepare image.");

    return { blob, width, height };
  } finally {
    URL.revokeObjectURL(src);
  }
}

async function uploadInlineImage(file: File) {
  const resized = await resizeImage(file);
  const data = new FormData();
  data.set("file", new File([resized.blob], "inline.webp", { type: "image/webp" }));
  data.set("width", String(resized.width));
  data.set("height", String(resized.height));

  const response = await fetch("/admin/api/upload", { method: "POST", body: data });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Image upload failed.");
  return "/media/" + result.id;
}

export default function ArticleEditor({
  initialHtml,
  onChange
}: {
  initialHtml: string;
  onChange: (html: string) => void;
}) {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image.configure({ allowBase64: false, HTMLAttributes: { loading: "lazy" } })
    ],
    content: initialHtml,
    immediatelyRender: false,
    onUpdate({ editor: current }) {
      onChange(current.getHTML());
    }
  });

  if (!editor) return <div className="editor-loading">Loading editor…</div>;

  const addLink = () => {
    const url = window.prompt("Link URL");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = async (file: File) => {
    try {
      const url = await uploadInlineImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Image upload failed.");
    }
  };

  return (
    <div className="rich-editor">
      <div className="editor-toolbar">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "active" : ""}>Bold</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? "active" : ""}>Italic</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive("heading", { level: 2 }) ? "active" : ""}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive("bulletList") ? "active" : ""}>Bullets</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive("orderedList") ? "active" : ""}>Numbered</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive("blockquote") ? "active" : ""}>Quote</button>
        <button type="button" onClick={addLink} className={editor.isActive("link") ? "active" : ""}>Link</button>
        <button type="button" onClick={() => fileInput.current?.click()}>Image</button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.currentTarget.value = "";
            if (file) await addImage(file);
          }}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
