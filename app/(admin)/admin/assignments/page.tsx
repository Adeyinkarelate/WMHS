import { prisma } from "@/lib/db/prisma";
import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  AssignmentManager,
  type AssignmentRow,
  type ClinicianOption,
} from "@/components/admin/AssignmentManager";

export default async function AdminAssignmentsPage() {
  const [patients, providers] = await Promise.all([
    prisma.patient.findMany({
      include: {
        user: { select: { name: true, email: true } },
        bookedFacility: { select: { name: true } },
        riskAssessments: { orderBy: { assessedAt: "desc" }, take: 1, select: { riskLevel: true } },
        assignments: {
          where: { status: "ACTIVE" },
          include: {
            provider: {
              include: {
                user: { select: { name: true } },
                facility: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.provider.findMany({
      where: { user: { isActive: true } },
      include: { user: { select: { name: true } }, facility: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const rows: AssignmentRow[] = patients.map((p) => {
    const current = p.assignments[0];
    return {
      patientId: p.id,
      name: p.user.name,
      email: p.user.email,
      bookedFacility: p.bookedFacility?.name ?? null,
      risk: p.riskAssessments[0]?.riskLevel ?? "UNASSESSED",
      clinicianId: current?.providerId ?? null,
      clinicianName: current?.provider.user.name ?? null,
      clinicianFacility: current?.provider.facility?.name ?? null,
    };
  });
  const clinicians: ClinicianOption[] = providers.map((p) => ({
    id: p.id,
    name: p.user.name,
    facility: p.facility?.name ?? null,
  }));

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Access"
        title="Clinician assignments"
        description="A clinician only sees mothers assigned to them. Assign, move or release a mother here. Each change is audited and the mother is notified."
      />
      <AssignmentManager rows={rows} clinicians={clinicians} />
    </PageTransition>
  );
}
