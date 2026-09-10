import Link from "next/link";
import { getProviderContext } from "@/lib/auth/providerContext";
import { assignedCaseloadWhere, assignedPatientsWhere } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { PageTransition } from "@/components/shared/PageTransition";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PatientList } from "@/components/provider/PatientList";
import { RiskDistributionChart } from "@/components/provider/RiskDistributionChart";
import { PageHeader } from "@/components/shared/PageHeader";
import { Icons } from "@/components/shared/Icons";
import { formatDateTime } from "@/lib/utils/formatters";
import { alertTypeLabel } from "@/lib/alerts/labels";

export default async function ProviderDashboardPage() {
  const { session } = await getProviderContext();
  const where = assignedPatientsWhere(session.user);

  const patients = await prisma.patient.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      riskAssessments: { orderBy: { assessedAt: "desc" }, take: 1 },
      alerts: { where: { status: { in: ["ACTIVE", "ACKNOWLEDGED"] } } },
    },
  });
  const alerts = await prisma.alert.findMany({
    where: { status: { in: ["ACTIVE", "ACKNOWLEDGED"] }, ...assignedCaseloadWhere(session.user) },
    include: { patient: { include: { user: { select: { name: true } } } } },
    orderBy: { alertedAt: "desc" },
    take: 8,
  });
  const referralCount = await prisma.referral.count({
    where: { status: "PENDING", ...assignedCaseloadWhere(session.user) },
  });

  const high = patients.filter((p) => p.riskAssessments[0]?.riskLevel === "HIGH").length;
  const medium = patients.filter((p) => p.riskAssessments[0]?.riskLevel === "MEDIUM").length;
  const low = patients.filter((p) => p.riskAssessments[0]?.riskLevel === "LOW").length;
  const unassessed = patients.filter((p) => !p.riskAssessments[0]).length;

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Clinic"
        title="Caseload"
        description="Risk first. Then names. Who needs a call this morning."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Patients" value={patients.length} icon={<Icons.users size={18} />} />
        <StatCard label="High risk" value={high} hint="Need same-day eyes" accent="danger" icon={<Icons.shield size={18} />} />
        <StatCard label="Open alerts" value={alerts.length} accent="warning" icon={<Icons.bell size={18} />} />
        <StatCard label="Pending referrals" value={referralCount} icon={<Icons.pin size={18} />} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle className="text-xl">Risk distribution</CardTitle>
          <div className="mt-4 h-56">
            <RiskDistributionChart low={low} medium={medium} high={high} unassessed={unassessed} />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Alerts</CardTitle>
            <Link href="/provider/alerts" className="text-sm font-semibold text-primary">
              All
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {alerts.length === 0 && <li className="text-sm text-ink-muted">No open alerts.</li>}
            {alerts.map((a) => (
              <li key={a.id} className="rounded-xl bg-canvas px-3 py-2.5 text-sm">
                <Link href={`/provider/patients/${a.patientId}`} className="font-semibold text-navy">
                  {a.patient.user.name}
                </Link>
                <p className="text-ink-muted">
                  {alertTypeLabel(a.alertType)} · {formatDateTime(a.alertedAt)}
                </p>
                <StatusBadge value={a.severity} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="mt-8">
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
