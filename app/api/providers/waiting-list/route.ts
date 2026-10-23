import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { facilityWaitingWhere } from "@/lib/assignments/service";
import { jsonError } from "@/lib/utils/helpers";

export async function GET() {
  const { error, user } = await requireUser(["PROVIDER", "ADMIN"]);
  if (error || !user) return error!;

  const provider = user.providerId
    ? await prisma.provider.findUnique({
        where: { id: user.providerId },
        select: { facilityId: true, facility: { select: { id: true, name: true } } },
      })
    : null;
  if (!provider?.facilityId && user.role !== "ADMIN") {
    return jsonError("Join a facility to see its antenatal waiting list.", 400);
  }

  const patients = await prisma.patient.findMany({
    where: provider?.facilityId ? facilityWaitingWhere(provider.facilityId) : { assignments: { none: { status: "ACTIVE" } } },
    include: {
      user: { select: { name: true, email: true } },
      bookedFacility: { select: { name: true } },
      riskAssessments: { orderBy: { assessedAt: "desc" }, take: 1 },
      alerts: { where: { status: { in: ["ACTIVE", "ACKNOWLEDGED"] } } },
    },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({
    facility: provider?.facility ?? null,
    patients: patients.map((p) => ({
      id: p.id,
      name: p.user.name,
      email: p.user.email,
      facilityName: p.bookedFacility?.name ?? null,
      risk: p.riskAssessments[0]?.riskLevel ?? "UNASSESSED",
      score: p.riskAssessments[0]?.riskScore ?? 0,
      alerts: p.alerts.length,
    })),
  });
}