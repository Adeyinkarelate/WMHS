import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { symptomSchema } from "@/lib/utils/validators";
import { jsonError } from "@/lib/utils/helpers";
import { parseDateOnly } from "@/lib/utils/formatters";
import { runAndStoreRisk } from "@/lib/ai/runAssessment";

export async function POST(req: Request) {
  const { error, user } = await requireUser(["PATIENT"]);
  if (error || !user) return error!;
  if (!user.patientId) return jsonError("Patient profile missing", 400);

  const body = await req.json().catch(() => null);
  const parsed = symptomSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");
  const submissionDate = parseDateOnly(parsed.data.submissionDate);
  if (!submissionDate) return jsonError("Enter a valid date");

  const symptom = await prisma.symptom.create({
    data: {
      patientId: user.patientId,
      symptomType: parsed.data.symptomType,
      severity: parsed.data.severity,
      notes: parsed.data.notes ?? "",
      submissionDate,
    },
  });
  try {
    const { assessment, result } = await runAndStoreRisk(user.patientId);
    return Response.json({ symptom, assessment, result }, { status: 201 });
  } catch (err) {
    console.error("Risk assessment failed after symptom save", err);
    return Response.json(
      { symptom, assessment: null, result: null, warning: "Saved, but risk could not be recalculated." },
      { status: 201 }
    );
  }
}
