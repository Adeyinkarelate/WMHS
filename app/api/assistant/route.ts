import { requireUser } from "@/lib/auth/guards";
import { jsonError } from "@/lib/utils/helpers";
import { answerQuestion } from "@/lib/ai/assistant";
import { prisma } from "@/lib/db/prisma";
import { gestationalAgeLabel } from "@/lib/utils/clinical";
import { fromJsonString } from "@/lib/utils/json";

export async function POST(req: Request) {
  const { error, user } = await requireUser();
  if (error || !user) return error!;
  const body = await req.json().catch(() => null);
  const question = String(body?.question ?? "").trim();
  if (!question) return jsonError("Question is required");

  let riskLevel = undefined as "LOW" | "MEDIUM" | "HIGH" | undefined;
  let gestationalAge: string | null = null;
  let factors: string[] = [];
  if (user.patientId) {
    const patient = await prisma.patient.findUnique({
      where: { id: user.patientId },
      include: { riskAssessments: { orderBy: { assessedAt: "desc" }, take: 1 } },
    });
    gestationalAge = patient?.lmp ? gestationalAgeLabel(patient.lmp) : null;
    const latest = patient?.riskAssessments[0];
    riskLevel = latest?.riskLevel as typeof riskLevel;
    factors = fromJsonString<string[]>(latest?.riskFactors, []);
  }

  const answer = answerQuestion(question, {
    name: user.name ?? "there",
    riskLevel,
    gestationalAge,
    factors,
  });
  return Response.json(answer);
}
