import { getProviderContext } from "@/lib/auth/providerContext";
import { assignedPatientsWhere } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { PatientList } from "@/components/provider/PatientList";
import { WaitingList } from "@/components/provider/WaitingList";
import { getFacilityWaitingList, toWaitingRows } from "@/lib/assignments/queries";

export default async function PatientsPage() {
  const { session, provider } = await getProviderContext();
  const [patients, waiting] = await Promise.all([
    prisma.patient.findMany({
      where: assignedPatientsWhere(session.user),
      include: {
        user: { select: { name: true, email: true } },
        riskAssessments: { orderBy: { assessedAt: "desc" }, take: 1 },
        alerts: { where: { status: { in: ["ACTIVE", "ACKNOWLEDGED"] } } },
      },
    }),
    getFacilityWaitingList(provider?.facilityId),
  ]);

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Caseload"
        title="Patients"
        description="Mothers you have named, then the waiting list at your facility."
      />
      <div className="mt-6 space-y-8">
        <PatientList
          patients={patients.map((p) => ({
            id: p.id,
            name: p.user.name,
            email: p.user.email,
            risk: p.riskAssessments[0]?.riskLevel ?? "UNASSESSED",
            score: p.riskAssessments[0]?.riskScore ?? 0,
            alerts: p.alerts.length,
          }))}
        />
        <WaitingList
          facilityName={provider?.facility?.name ?? null}
          patients={toWaitingRows(waiting)}
        />
      </div>
    </PageTransition>
  );
}
