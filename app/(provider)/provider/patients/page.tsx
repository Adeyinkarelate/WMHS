import { getProviderContext } from "@/lib/auth/providerContext";
import { assignedPatientsWhere } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { PatientList } from "@/components/provider/PatientList";

export default async function PatientsPage() {
  const { session } = await getProviderContext();
  const patients = await prisma.patient.findMany({
    where: assignedPatientsWhere(session.user),
    include: {
      user: { select: { name: true, email: true } },
      riskAssessments: { orderBy: { assessedAt: "desc" }, take: 1 },
      alerts: { where: { status: { in: ["ACTIVE", "ACKNOWLEDGED"] } } },
    },
  });

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Caseload"
        title="Patients"
        description="Search and filter by risk stratification."
      />
      <div className="mt-6">
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
      </div>
    </PageTransition>
  );
}
