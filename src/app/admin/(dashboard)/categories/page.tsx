import { listCategories } from "@/lib/admin";
import CategoryManager from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <>
      <header className="admin-topbar">
        <div>
          <div className="kicker">Taxonomy</div>
          <h1>Sections</h1>
          <div className="meta">Manage the bilingual newsroom sections.</div>
        </div>
      </header>
      <CategoryManager initial={categories} />
    </>
  );
}
