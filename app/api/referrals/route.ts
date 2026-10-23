import { prisma } from "@/lib/db/prisma";
import { assertPatientAccess, assignedCaseloadWhere, requireUser, resolveRecordPatientId } from "@/lib/auth/guards";
import { jsonError } from "@/lib/utils/helpers";
import { createUserNotification } from "@/lib/alerts/notify";
import { createReferralSchema } from "@/lib/utils/validators";

export async function POST(req: Request) {
  const { error, user } = await requireUser();
  if (error || !user) return error!;
  const body = await req.json().catch(() => null);
  const parsed = createReferralSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");

  const patientId = resolveRecordPatientId(user, parsed.data.patientId);
  if (!patientId) return jsonError("patientId is required");
  if (!(await assertPatientAccess(patientId, user))) return jsonError("Forbidden", 403);

  const facility = await prisma.facility.findUnique({ where: { id: parsed.data.facilityId } });
  if (!facility) return jsonError("Facility not found", 404);

  const referral = await prisma.referral.create({
    data: {
      patientId,
      facilityId: parsed.data.facilityId,
      reason: parsed.data.reason,
      transportNotes: parsed.data.transportNotes ?? "",
    },
    include: { facility: true },
  });
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (patient) {
    await createUserNotification({
      userId: patient.userId,
      title: "Referral created",
      content: `You have been referred to ${referral.facility.name}.`,
      type: "REFERRAL",
      link: "/patient/referrals",
    });
  }
  return Response.json(referral, { status: 201 });
}

export async function GET() {
  const { error, user } = await requireUser(["PROVIDER", "ADMIN"]);
  if (error || !user) return error!;
  const where = assignedCaseloadWhere(user);
  const referrals = await prisma.referral.findMany({
    where,
    include: {
      facility: true,
      patient: { include: { user: { select: { name: true } } } },
    },
    orderBy: { referredAt: "desc" },
  });
  return Response.json(referrals);
}
