import { PublicShell } from "@/app/layout";
import PublicHome from "@/components/PublicHome";

export const dynamic = "force-dynamic";

export default function Home() { return <PublicShell><PublicHome /></PublicShell>; }
