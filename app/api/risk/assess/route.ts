import { requireUser, assertPatientAccess } from "@/lib/auth/guards";
import { jsonError } from "@/lib/utils/helpers";
import { runAndStoreRisk } from "@/lib/ai/runAssessment";

export async function POST(req: Request) {
  const { error, user } = await requireUser();
  if (error || !user) return error!;
  const body = await req.json().catch(() => ({}));
  const patientId =
    user.role === "PATIENT" ? user.patientId : String(body.patientId ?? "");
  if (!patientId) return jsonError("patientId is required", 400);
  if (!(await assertPatientAccess(patientId, user))) return jsonError("Forbidden", 403);
  try {
    const payload = await runAndStoreRisk(patientId);
    return Response.json(payload);
  } catch (err) {
    console.error("Risk assessment failed", err);
    return jsonError("Could not complete risk assessment", 500);
  }
}
