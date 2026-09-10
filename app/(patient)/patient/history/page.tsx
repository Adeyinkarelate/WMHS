import { getPatientContext } from "@/lib/auth/patientContext";
import { prisma } from "@/lib/db/prisma";
import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { HealthHistory } from "@/components/patient/HealthHistory";
import { formatDateTime } from "@/lib/utils/formatters";
import { PrintShare } from "@/components/patient/PrintShare";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function HistoryPage() {
  const { patient } = await getPatientContext();
  const [symptoms, tests, risks] = await Promise.all([
    prisma.symptom.findMany({
      where: { patientId: patient.id },
      orderBy: { submissionDate: "desc" },
    }),
    prisma.testResult.findMany({
      where: { patientId: patient.id },
      orderBy: { testDate: "desc" },
    }),
    prisma.riskAssessment.findMany({
      where: { patientId: patient.id },
      orderBy: { assessedAt: "desc" },
    }),
  ]);

  const events = [
    ...symptoms.map((s) => ({
      id: `symptom-${s.id}`,
      at: s.submissionDate,
      title: s.symptomType,
      detail: `Severity ${s.severity}${s.notes ? ` — ${s.notes}` : ""}`,
    })),
    ...tests.map((t) => ({
      id: `test-${t.id}`,
      at: t.testDate,
      title: t.testType,
      detail: `${t.resultValue} ${t.resultUnit}`,
    })),
    ...risks.map((r) => ({
      id: `risk-${r.id}`,
      at: r.assessedAt,
      title: `Risk ${r.riskLevel}`,
      detail: `Score ${Math.round(r.riskScore * 100)}%`,
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Timeline"
        title="Health history"
        description="Symptoms, tests and risk assessments in one place."
        action={<PrintShare title="WMHS health history" />}
      />
      <Card>
        <HealthHistory
          tests={tests.map((t) => ({
            id: t.id,
            testType: t.testType,
            resultValue: t.resultValue,
            testDate: t.testDate,
          }))}
        />
      </Card>
      {events.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No history yet"
            description="Log a symptom or test and it will appear on this timeline."
            actionLabel="Log a symptom"
            actionHref="/patient/symptoms/new"
          />
        </div>
      ) : (
        <ol className="mt-8 space-y-4 border-l border-line pl-6">
          {events.map((e) => (
            <li key={e.id} className="relative">
              <span className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-primary" />
              <p className="text-caption text-ink-muted">{formatDateTime(e.at)}</p>
              <p className="font-semibold text-navy">{e.title}</p>
              <p className="text-sm text-ink-muted">{e.detail}</p>
            </li>
          ))}
        </ol>
      )}
    </PageTransition>
  );
}
