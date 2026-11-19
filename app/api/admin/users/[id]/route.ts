import { requireAdmin } from "@/lib/admin/guard";
import { AdminError, changeUserRole, setUserActive } from "@/lib/admin/users";
import { adminUpdateUserSchema } from "@/lib/utils/validators";
import { jsonError } from "@/lib/utils/helpers";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { error, actor } = await requireAdmin();
  if (error || !actor) return error!;

  const body = await req.json().catch(() => null);
  const parsed = adminUpdateUserSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");

  try {
    if (parsed.data.role !== undefined) {
      await changeUserRole({ actor, userId: params.id, role: parsed.data.role });
    }
    if (parsed.data.isActive !== undefined) {
      await setUserActive({ actor, userId: params.id, isActive: parsed.data.isActive });
    }
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof AdminError) return jsonError(err.message, err.status);
    console.error("Admin update user failed", err);
    return jsonError("Could not update this user.", 500);
  }
}
