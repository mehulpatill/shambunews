import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import SiteSettingsForm from "@/components/admin/SiteSettingsForm";

export const dynamic = "force-dynamic";

export default async function Settings() {
  await requireAdmin();

  let settings: any = {
    tagline: "News that matters. Stories that stay.",
    footerText: "© 2026 Shambunews. All rights reserved."
  };

  try {
    const saved = await db.siteSetting.findUnique({ where: { id: "main" } });
    if (saved) settings = saved;
  } catch {}

  return (
    <>
      <header className="admin-topbar">
        <div>
          <div className="kicker">Site</div>
          <h1>Settings</h1>
          <div className="meta">Manage the small pieces of publication copy shown across the site.</div>
        </div>
      </header>
      <SiteSettingsForm initial={settings} />
    </>
  );
}
