import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import AdvertisingForm from "@/components/admin/AdvertisingForm";

export const dynamic = "force-dynamic";

export default async function Advertising() {
  await requireAdmin();
  let settings: any = { enabled: false, provider: "NONE", publisherId: "" };
  try {
    settings = await db.adSetting.findUnique({ where: { id: "main" } }) || settings;
  } catch {}

  return (
    <>
      <header className="admin-topbar">
        <div>
          <div className="kicker">Monetization</div>
          <h1>Advertising</h1>
          <div className="meta">Control where and when advertisements appear on the public site.</div>
        </div>
        <Link className="btn" href="/admin/settings">Site settings</Link>
      </header>
      <AdvertisingForm initial={settings} />
    </>
  );
}
