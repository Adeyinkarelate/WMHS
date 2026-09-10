import { prisma } from "@/lib/db/prisma";
import { assertPatientAccess, requireUser } from "@/lib/auth/guards";
import { jsonError } from "@/lib/utils/helpers";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const { error, user } = await requireUser();
  if (error || !user) return error!;
  const referral = await prisma.referral.findUnique({
    where: { id: params.id },
    include: { facility: true, patient: { include: { user: { select: { name: true } } } } },
  });
  if (!referral) return jsonError("Not found", 404);
  if (!(await assertPatientAccess(referral.patientId, user))) return jsonError("Forbidden", 403);
  return Response.json(referral);
}
