import { assertPatientAccess, requireUser, resolveRecordPatientId } from "@/lib/auth/guards";
import { saveTestAndAssess } from "@/lib/clinical/recordVisit";
import { jsonError } from "@/lib/utils/helpers";
import { parseDateOnly } from "@/lib/utils/formatters";
import { testResultSchema } from "@/lib/utils/validators";

export async function POST(req: Request) {
  const { error, user } = await requireUser(["PATIENT", "PROVIDER", "ADMIN"]);
  if (error || !user) return error!;

  const body = await req.json().catch(() => null);
  const parsed = testResultSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");

  const patientId = resolveRecordPatientId(user, parsed.data.patientId);
  if (!patientId) return jsonError("patientId is required");
  if (!(await assertPatientAccess(patientId, user))) return jsonError("Forbidden", 403);

  const testDate = parseDateOnly(parsed.data.testDate);
  if (!testDate) return jsonError("Enter a valid test date");

  try {
    const saved = await saveTestAndAssess({
      patientId,
      testType: parsed.data.testType,
      resultValue: parsed.data.resultValue,
      resultUnit: parsed.data.resultUnit,
      testDate,
      notes: parsed.data.notes ?? "",
      fileReference: parsed.data.fileReference,
      fileUrl: parsed.data.fileUrl,
      filePublicId: parsed.data.filePublicId,
    });
    return Response.json(saved, { status: 201 });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Could not save test");
  }
}
