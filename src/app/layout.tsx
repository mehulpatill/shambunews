import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Brand from "@/components/Brand";
import { getCategories, getBreakingArticles } from "@/lib/articles";
import { categoryName } from "@/lib/articles";
import { getSiteUrl, type SiteLanguage } from "@/lib/config";

export const metadata: Metadata = {
  title: { default: "Shambunews", template: "%s | Shambunews" },
  description: "Independent news, sharp analysis, and stories from India and beyond.",
  metadataBase: new URL(getSiteUrl())
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}

export async function PublicShell({
  children,
  language,
  languageLinks = { en: "/?lang=en", hi: "/?lang=hi" }
}: {
  children: React.ReactNode;
  language: SiteLanguage;
  languageLinks?: { en: string; hi: string };
}) {
  const [categories, breaking] = await Promise.all([
    getCategories(),
    getBreakingArticles(language, 5)
  ]);

  const today = new Intl.DateTimeFormat(
    language === "hi" ? "hi-IN" : "en-IN",
    { dateStyle: "full", timeZone: "Asia/Kolkata" }
  ).format(new Date());

  return (
    <div lang={language}>
      <header className="site-header">
        <div className="header-utility">
          <div className="container header-utility-inner">
            <div className="utility-left">
              <span className="utility-live">{language === "hi" ? "लाइव डेस्क" : "Live desk"}</span>
              <span className="utility-link">
                {language === "hi" ? "भारत और दुनिया" : "India & world"}
              </span>
            </div>
            <div className="utility-right">
              <span className="utility-date">{today}</span>
              <div className="language-switch">
                <Link
                  className={language === "en" ? "language-active" : "utility-link"}
                  href={languageLinks.en}
                >
                  English
                </Link>
                <span>·</span>
                <Link
                  className={language === "hi" ? "language-active" : "utility-link"}
                  href={languageLinks.hi}
                >
                  हिंदी
                </Link>
              </div>
              <Link className="utility-link utility-login" href="/admin">Editorial login</Link>
            </div>
          </div>
        </div>

        <div className="container masthead">
          <div className="masthead-side">
            <strong>{language === "hi" ? "स्वतंत्र पत्रकारिता" : "Independent journalism"}</strong>
            {language === "hi"
              ? "रिपोर्टिंग, संदर्भ और पढ़ने लायक कहानियाँ।"
              : "Reporting, context and stories worth reading."}
          </div>

          <Brand />

          <div className="masthead-side right">
            <strong>{language === "hi" ? "जो मायने रखता है, वह खबर यहाँ है।" : "News that matters. Stories that stay."}</strong>
            <Link href={"/search?lang=" + language}>
              {language === "hi" ? "आर्काइव खोजें →" : "Search the archive →"}
            </Link>
          </div>
        </div>

        <div className="primary-nav-wrap">
          <div className="container">
            <nav className="primary-nav" aria-label="Primary navigation">
              <Link href={language === "en" ? "/?lang=en" : "/?lang=hi"}>{language === "hi" ? "होम" : "Home"}</Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={"/category/" + category.slug + "?lang=" + language}
                >
                  {categoryName(category, language)}
                </Link>
              ))}
              <Link className="search-link" href={"/search?lang=" + language}>
                {language === "hi" ? "खोज ↗" : "Search ↗"}
              </Link>
            </nav>
          </div>
        </div>

        {breaking.length > 0 && (
          <div className="breaking-bar" aria-label={language === "hi" ? "ब्रेकिंग न्यूज़" : "Breaking news"}>
            <div className="container breaking-inner">
              <span className="breaking-label">{language === "hi" ? "ब्रेकिंग" : "Breaking"}</span>
              <div className="breaking-track">
                {breaking.map((article) => (
                  <Link key={article.id} href={"/news/" + article.slug}>
                    {article.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <Brand compact />
            <p style={{ marginTop: 12, maxWidth: 390 }}>
              {language === "hi"
                ? "स्वतंत्र समाचार, तेज़ संदर्भ और भारत से दुनिया तक की कहानियाँ।"
                : "Independent news, sharp context and stories from India to the world."}
            </p>
          </div>

          <div>
            <h2 className="footer-title">{language === "hi" ? "सेक्शन" : "Sections"}</h2>
            <div className="footer-links">
              {categories.map((category) => (
                <Link key={category.id} href={"/category/" + category.slug + "?lang=" + language}>
                  {categoryName(category, language)}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="footer-title">{language === "hi" ? "आर्काइव" : "Archive"}</h2>
            <div className="footer-links">
              <Link href={"/search?lang=" + language}>{language === "hi" ? "कहानियाँ खोजें" : "Search stories"}</Link>
              <Link href="/admin">{language === "hi" ? "एडिटोरियल एडमिन" : "Editorial admin"}</Link>
            </div>
          </div>
        </div>

        <div className="container footer-bottom">
          <p>© 2026 Shambunews. {language === "hi" ? "सर्वाधिकार सुरक्षित।" : "All rights reserved."}</p>
        </div>
      </footer>
    </div>
  );
}
