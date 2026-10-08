import Link from "next/link";
import { redirect } from "next/navigation";
import Brand from "@/components/Brand";
import { requireAdminPage, signOut } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminPage();

  return (
    <div className="admin-shell">
      <div className="admin-wrap">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <Brand compact />
          </div>

          <div className="admin-nav-label">Editorial</div>
          <nav className="admin-nav" aria-label="Admin navigation">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/articles">Articles</Link>
            <Link href="/admin/articles/new">New article</Link>
            <Link href="/admin/categories">Sections</Link>
            <Link href="/admin/tags">Tags</Link>
          </nav>

          <div className="admin-sidebar-note">
            <strong>Shambunews</strong>
            <span>{user.email || "Editorial desk"}</span>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut();
              redirect("/admin/login");
            }}
            className="admin-signout"
          >
            <button className="btn" style={{ width: "100%" }}>
              Sign out
            </button>
          </form>
        </aside>

        <main className="admin-main">
          <div className="admin-content">{children}</div>
        </main>
      </div>
    </div>
  );
}
