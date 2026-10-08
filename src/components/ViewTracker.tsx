"use client";

import { useEffect, useRef } from "react";

export default function ViewTracker({ articleId }: { articleId: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void fetch("/api/views/" + articleId, {
      method: "POST",
      cache: "no-store"
    }).catch(() => {});
  }, [articleId]);

  return null;
}
