import { prisma } from "@/lib/db/prisma";
import { assertPatientAccess, requireUser } from "@/lib/auth/guards";
import { jsonError } from "@/lib/utils/helpers";

type Ctx = { params: { patientId: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const { error, user } = await requireUser();
  if (error || !user) return error!;
  if (!(await assertPatientAccess(params.patientId, user))) return jsonError("Forbidden", 403);
  const referrals = await prisma.referral.findMany({
    where: { patientId: params.patientId },
    include: { facility: true },
    orderBy: { referredAt: "desc" },
  });
  return Response.json(referrals);
}
