import { requireUser } from "@/lib/auth/guards";
import { AssignmentError, claimPatient } from "@/lib/assignments/service";
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
    const result = await claimPatient({
      patientId: parsed.data.patientId,
      providerId: user.providerId,
      actorUserId: user.id,
    });
    return Response.json({ ok: true, decision: result.decision, id: result.assignment.id });
  } catch (err) {
    if (err instanceof AssignmentError) return jsonError(err.message, err.status);
    console.error("Claim assignment failed", err);
    return jsonError("Could not add this mother to your caseload.", 500);
  }
}
