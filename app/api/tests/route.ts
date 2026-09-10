import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { testResultSchema } from "@/lib/utils/validators";
import { jsonError } from "@/lib/utils/helpers";
import { parseDateOnly } from "@/lib/utils/formatters";
import { runAndStoreRisk } from "@/lib/ai/runAssessment";

export async function POST(req: Request) {
  const { error, user } = await requireUser(["PATIENT"]);
  if (error || !user) return error!;
  if (!user.patientId) return jsonError("Patient profile missing", 400);

  const body = await req.json().catch(() => null);
  const parsed = testResultSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");
  const testDate = parseDateOnly(parsed.data.testDate);
  if (!testDate) return jsonError("Enter a valid test date");

  const test = await prisma.testResult.create({
    data: {
      patientId: user.patientId,
      testType: parsed.data.testType,
      resultValue: parsed.data.resultValue,
      resultUnit: parsed.data.resultUnit,
      testDate,
      notes: parsed.data.notes ?? "",
      fileReference: parsed.data.fileReference,
      fileUrl: parsed.data.fileUrl,
      filePublicId: parsed.data.filePublicId,
    },
  });
  try {
    const { assessment, result } = await runAndStoreRisk(user.patientId);
    return Response.json({ test, assessment, result }, { status: 201 });
  } catch (err) {
    console.error("Risk assessment failed after test save", err);
    return Response.json(
      { test, assessment: null, result: null, warning: "Saved, but risk could not be recalculated." },
      { status: 201 }
    );
  }
}
