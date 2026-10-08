"use client";

import { useEffect } from "react";
import Link from "next/link";

type AdSettings = {
  enabled: boolean;
  provider: string;
  publisherId?: string | null;
  [key: string]: any;
};

const SLOT_MAP = {
  homepageTop: { slot: "homepageTopSlot", image: "homepageTopImage", link: "homepageTopLink", label: "Homepage — Top" },
  homepageMid: { slot: "homepageMidSlot", image: "homepageMidImage", link: "homepageMidLink", label: "Homepage — Between sections" },
  articleTop: { slot: "articleTopSlot", image: "articleTopImage", link: "articleTopLink", label: "Article — Top" },
  articleBottom: { slot: "articleBottomSlot", image: "articleBottomImage", link: "articleBottomLink", label: "Article — Bottom" },
  sidebar: { slot: "sidebarSlot", image: "sidebarImage", link: "sidebarLink", label: "Sidebar" }
} as const;

export default function AdSlot({
  settings,
  placement,
  className = ""
}: {
  settings: AdSettings | null;
  placement: keyof typeof SLOT_MAP;
  className?: string;
}) {
  const map = SLOT_MAP[placement];
  const activeSettings = settings;
  const configured = Boolean(
    settings?.enabled &&
    settings.provider !== "NONE" &&
    (settings.provider === "ADSENSE"
      ? settings.publisherId && settings[map.slot]
      : settings.provider === "CUSTOM" && settings[map.image])
  );

  useEffect(() => {
    if (!configured || settings?.provider !== "ADSENSE") return;

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-shambhu-adsense="true"]'
    );

    const activate = () => {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      } catch {}
    };

    if (existing) {
      activate();
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + settings.publisherId;
    script.crossOrigin = "anonymous";
    script.dataset.shambhuAdsense = "true";
    script.onload = activate;
    document.head.appendChild(script);
  }, [configured, settings?.provider, settings?.publisherId]);

  if (!activeSettings || !configured) return null;

  const image = activeSettings[map.image] as string | null | undefined;
  const link = activeSettings[map.link] as string | null | undefined;

  return (
    <aside className={"ad-render " + className} aria-label="Advertisement">
      {activeSettings.provider === "CUSTOM" && image ? (
        link ? (
          <Link href={link} target="_blank" rel="sponsored noopener">
            <img src={image} alt="Sponsored advertisement" className="ad-image" />
          </Link>
        ) : (
          <img src={image} alt="Sponsored advertisement" className="ad-image" />
        )
      ) : activeSettings.provider === "ADSENSE" ? (
        <div className="adsense-slot">
          <ins
            className="adsbygoogle"
            style={{ display: "block", minHeight: 90 }}
            data-ad-client={activeSettings.publisherId || undefined}
            data-ad-slot={activeSettings[map.slot] || undefined}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      ) : null}
    </aside>
  );
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}
