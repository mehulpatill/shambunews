import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import CategoryManager from "@/components/admin/CategoryManager";
export const dynamic="force-dynamic";
export default async function Categories(){ await requireAdmin();let categories:any[]=[];try{categories=await db.category.findMany({orderBy:{name:"asc"},include:{_count:{select:{articles:true}}}});}catch{}return <><div className="admin-top"><div><div className="kicker">Taxonomy</div><h1>Categories</h1></div></div><CategoryManager initial={categories}/></>}
