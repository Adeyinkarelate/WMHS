import { assertPatientAccess, requireUser, resolveRecordPatientId } from "@/lib/auth/guards";
import { saveSymptomAndAssess } from "@/lib/clinical/recordVisit";
import { jsonError } from "@/lib/utils/helpers";
import { parseDateOnly } from "@/lib/utils/formatters";
import { symptomSchema } from "@/lib/utils/validators";

export async function POST(req: Request) {
  const { error, user } = await requireUser(["PATIENT", "PROVIDER", "ADMIN"]);
  if (error || !user) return error!;

  const body = await req.json().catch(() => null);
  const parsed = symptomSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");

  const patientId = resolveRecordPatientId(user, parsed.data.patientId);
  if (!patientId) return jsonError("patientId is required");
  if (!(await assertPatientAccess(patientId, user))) return jsonError("Forbidden", 403);

  const submissionDate = parseDateOnly(parsed.data.submissionDate);
  if (!submissionDate) return jsonError("Enter a valid date");

  const saved = await saveSymptomAndAssess({
    patientId,
    symptomType: parsed.data.symptomType,
    severity: parsed.data.severity,
    notes: parsed.data.notes ?? "",
    submissionDate,
  });
  return Response.json(saved, { status: 201 });
}
