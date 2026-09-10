import { prisma } from "@/lib/db/prisma";
import { assertPatientAccess, requireUser } from "@/lib/auth/guards";
import { referralStatusSchema } from "@/lib/utils/validators";
import { jsonError } from "@/lib/utils/helpers";
import { createUserNotification } from "@/lib/alerts/notify";

type Ctx = { params: { id: string } };

export async function PUT(req: Request, { params }: Ctx) {
  const { error, user } = await requireUser(["PROVIDER", "ADMIN"]);
  if (error || !user) return error!;
  const body = await req.json().catch(() => null);
  const parsed = referralStatusSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");

  const existing = await prisma.referral.findUnique({ where: { id: params.id } });
  if (!existing) return jsonError("Not found", 404);
  if (!(await assertPatientAccess(existing.patientId, user))) return jsonError("Forbidden", 403);

  const referral = await prisma.referral.update({
    where: { id: params.id },
    data: {
      status: parsed.data.status,
      transportNotes: parsed.data.transportNotes ?? existing.transportNotes,
      completedAt:
        parsed.data.status === "COMPLETED" ? existing.completedAt ?? new Date() : null,
    },
    include: { facility: true, patient: true },
  });
  await createUserNotification({
    userId: referral.patient.userId,
    title: "Referral updated",
    content: `Your referral to ${referral.facility.name} is now ${parsed.data.status.toLowerCase()}.`,
    type: "REFERRAL",
    link: "/patient/referrals",
  });
  return Response.json(referral);
}
