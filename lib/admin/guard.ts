import { requireUser } from "@/lib/auth/guards";
import type { AuditActor } from "@/lib/audit/log";

/** Admin-only gate for /api/admin/*. Uses the live database role, not the JWT claim. */
export async function requireAdmin() {
  const { error, user } = await requireUser(["ADMIN"]);
  if (error || !user) return { error: error!, actor: null };
  const actor: AuditActor = { id: user.id, name: user.name ?? "Administrator", role: "ADMIN" };
  return { error: null, actor };
}
