import { requireUser } from "@/lib/auth/guards";
import { AssignmentError, releasePatient } from "@/lib/assignments/service";
import { assignmentActionSchema } from "@/lib/utils/validators";
import { jsonError } from "@/lib/utils/helpers";

export async function POST(req: Request) {
  const { error, user } = await requireUser(["PROVIDER", "ADMIN"]);
  if (error || !user) return error!;
  if (!user.providerId) return jsonError("Clinician profile missing", 400);

  const body = await req.json().catch(() => null);
  const parsed = assignmentActionSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");

  try {
    await releasePatient({
      patientId: parsed.data.patientId,
      providerId: user.providerId,
    });
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof AssignmentError) return jsonError(err.message, err.status);
    console.error("Release assignment failed", err);
    return jsonError("Could not release this mother from your caseload.", 500);
  }
}
