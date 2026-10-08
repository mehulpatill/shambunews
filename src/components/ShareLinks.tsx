"use client";

import { useState } from "react";

type ShareLinksProps = {
  url: string;
  title: string;
  language: "en" | "hi";
};

export default function ShareLinks({ url, title, language }: ShareLinksProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const whatsappText = encodeURIComponent(title + " " + url);

  return (
    <>
      <a
        className="tool-link"
        href={"https://wa.me/?text=" + whatsappText}
        target="_blank"
        rel="noreferrer"
      >
        WhatsApp
      </a>
      <button className="tool-link tool-button" type="button" onClick={copyLink}>
        {copied
          ? language === "hi"
            ? "लिंक कॉपी हुआ"
            : "Copied"
          : language === "hi"
            ? "लिंक कॉपी करें"
            : "Copy link"}
      </button>
    </>
  );
}
