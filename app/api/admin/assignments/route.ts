import { requireAdmin } from "@/lib/admin/guard";
import { AssignmentError, assignPatientAsAdmin } from "@/lib/assignments/service";
import { adminAssignSchema } from "@/lib/utils/validators";
import { jsonError } from "@/lib/utils/helpers";

export async function POST(req: Request) {
  const { error, actor } = await requireAdmin();
  if (error || !actor) return error!;

  const body = await req.json().catch(() => null);
  const parsed = adminAssignSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");

  try {
    const result = await assignPatientAsAdmin({ ...parsed.data, actor });
    return Response.json({ ok: true, replaced: result.replaced });
  } catch (err) {
    if (err instanceof AssignmentError) return jsonError(err.message, err.status);
    console.error("Admin assign failed", err);
    return jsonError("Could not assign this mother.", 500);
  }
}
