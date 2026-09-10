import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

export async function POST() {
  // Client should call next-auth signOut; this exists for PRD completeness.
  const session = await getServerSession(authOptions);
  return Response.json({ ok: true, authenticated: Boolean(session) });
}
