import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { db } from "@/lib/db";
import { getPublishedCategories } from "@/lib/queries";
import Brand from "@/components/Brand";

export const metadata: Metadata = {
  title: { default: "Shambunews", template: "%s | Shambunews" },
  description: "Independent news, sharp analysis, and stories from India and beyond.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}

export async function PublicShell({ children }: { children: React.ReactNode }) {
  let settings: any = {
    siteName: "Shambunews",
    tagline: "News that matters. Stories that stay.",
    footerText: "© 2026 Shambunews. All rights reserved."
  };

  try {
    settings = await db.siteSetting.findUnique({ where: { id: "main" } }) || settings;
  } catch {}

  const categories = await getPublishedCategories();
  const today = new Intl.DateTimeFormat("en-IN", { dateStyle: "full" }).format(new Date());

  return (
    <>
      <header className="site-header">
        <div className="header-utility">
          <div className="container header-utility-inner">
            <div className="utility-left">
              <span className="utility-live">Live desk</span>
              <span className="utility-link">India &amp; world</span>
            </div>
            <div className="utility-right">
              <span>{today}</span>
              <Link className="utility-link" href="/admin">Editorial login</Link>
            </div>
          </div>
        </div>

        <div className="container masthead">
          <div className="masthead-side">
            <strong>Independent journalism</strong>
            Reporting, context and stories worth reading.
          </div>

          <Brand />

          <div className="masthead-side right">
            <strong>{settings.tagline || "News that matters. Stories that stay."}</strong>
            <Link href="/search">Search the archive →</Link>
          </div>
        </div>

        <div className="primary-nav-wrap">
          <div className="container">
            <nav className="primary-nav" aria-label="Primary navigation">
              <Link href="/">Home</Link>
              {categories.map((category) => (
                <Link key={category.id} href={"/category/" + category.slug}>
                  {category.name}
                </Link>
              ))}
              <Link className="search-link" href="/search">Search ↗</Link>
            </nav>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <Brand compact />
            <p style={{ marginTop: 12, maxWidth: 390 }}>
              {settings.tagline || "News that matters. Stories that stay."}
            </p>
          </div>
          <div>
            <h2 className="footer-title">Sections</h2>
            <div className="footer-links">
              {categories.slice(0, 8).map((category) => (
                <Link key={category.id} href={"/category/" + category.slug}>
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="footer-title">Archive</h2>
            <div className="footer-links">
              <Link href="/search">Search stories</Link>
              <Link href="/admin">Editorial admin</Link>
            </div>
          </div>
        </div>

        <div className="container" style={{ marginTop: 26, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
          <p>{settings.footerText || "© 2026 Shambunews. All rights reserved."}</p>
        </div>
      </footer>
    </>
  );
}
