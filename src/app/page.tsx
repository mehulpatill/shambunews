import { PublicShell } from "@/app/layout";
import PublicHome from "@/components/PublicHome";
import type { SiteLanguage } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const language: SiteLanguage = lang === "hi" ? "hi" : "en";

  return (
    <PublicShell language={language}>
      <PublicHome language={language} />
    </PublicShell>
  );
}
