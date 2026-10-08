import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import TagManager from "@/components/admin/TagManager";
export const dynamic="force-dynamic";
export default async function Tags(){ await requireAdmin();let tags:any[]=[];try{tags=await db.tag.findMany({orderBy:{name:"asc"},include:{_count:{select:{articles:true}}}});}catch{}return <><div className="admin-top"><div><div className="kicker">Taxonomy</div><h1>Tags</h1></div></div><TagManager initial={tags}/></>}
