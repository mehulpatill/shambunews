import { NextResponse } from "next/server";
import { verifyCredentials, setSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    if (!email || !password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    const user = await verifyCredentials(email, password);
    if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    await setSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Login failed" }, { status: 500 });
  }
}
