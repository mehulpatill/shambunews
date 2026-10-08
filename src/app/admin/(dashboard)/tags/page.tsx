import TagManager from "@/components/admin/TagManager";
import { listTags } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const tags = await listTags();

  return (
    <>
      <header className="admin-topbar">
        <div>
          <div className="kicker">Taxonomy</div>
          <h1>Tags</h1>
          <div className="meta">Manage reusable story tags for the newsroom.</div>
        </div>
      </header>
      <TagManager initial={tags} />
    </>
  );
}
