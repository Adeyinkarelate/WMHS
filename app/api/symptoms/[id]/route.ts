import { prisma } from "@/lib/db/prisma";
import { assertPatientAccess, requireUser } from "@/lib/auth/guards";
import { jsonError } from "@/lib/utils/helpers";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const { error, user } = await requireUser();
  if (error || !user) return error!;
  const symptom = await prisma.symptom.findUnique({ where: { id: params.id } });
  if (!symptom) return jsonError("Not found", 404);
  if (!(await assertPatientAccess(symptom.patientId, user))) return jsonError("Forbidden", 403);
  return Response.json(symptom);
}
