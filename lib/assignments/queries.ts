import { prisma } from "@/lib/db/prisma";
import { waitingListWhere } from "@/lib/assignments/rules";

export async function getFacilityWaitingList(facilityId: string | null | undefined) {
  if (!facilityId) return [];
  return prisma.patient.findMany({
    where: waitingListWhere(facilityId),
    include: {
      user: { select: { name: true, email: true } },
      bookedFacility: { select: { name: true } },
      riskAssessments: { orderBy: { assessedAt: "desc" }, take: 1 },
      alerts: { where: { status: { in: ["ACTIVE", "ACKNOWLEDGED"] } } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export function toWaitingRows(
  patients: Awaited<ReturnType<typeof getFacilityWaitingList>>
) {
  return patients.map((p) => ({
    id: p.id,
    name: p.user.name,
    email: p.user.email,
    facilityName: p.bookedFacility?.name ?? null,
    risk: p.riskAssessments[0]?.riskLevel ?? "UNASSESSED",
    score: p.riskAssessments[0]?.riskScore ?? 0,
    alerts: p.alerts.length,
  }));
}
