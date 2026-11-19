import { requireAdmin } from "@/lib/admin/guard";
import { AssignmentError, releasePatientAsAdmin } from "@/lib/assignments/service";
import { adminReleaseSchema } from "@/lib/utils/validators";
import { jsonError } from "@/lib/utils/helpers";

export async function POST(req: Request) {
  const { error, actor } = await requireAdmin();
  if (error || !actor) return error!;

  const body = await req.json().catch(() => null);
  const parsed = adminReleaseSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");

  try {
    await releasePatientAsAdmin({ patientId: parsed.data.patientId, actor });
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof AssignmentError) return jsonError(err.message, err.status);
    console.error("Admin release failed", err);
    return jsonError("Could not release this mother.", 500);
  }
}
