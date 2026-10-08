"use client";

import { useEffect } from "react";

export default function ViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    void fetch("/api/views/" + articleId, {
      method: "POST",
      cache: "no-store"
    }).catch(() => {});
  }, [articleId]);

  return null;
}
