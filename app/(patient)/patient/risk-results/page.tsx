import { getPatientContext } from "@/lib/auth/patientContext";
import { prisma } from "@/lib/db/prisma";
import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { RiskIndicator } from "@/components/shared/RiskIndicator";
import { Card, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDateTime } from "@/lib/utils/formatters";
import { PrintShare } from "@/components/patient/PrintShare";
import { RecalculateRisk } from "@/components/patient/RecalculateRisk";
import { ComplicationScreens } from "@/components/shared/ComplicationScreens";
import { RiskExplainer } from "@/components/shared/RiskExplainer";
import { fromJsonString } from "@/lib/utils/json";
import { QueryNotice } from "@/components/shared/QueryNotice";
import { bodyMassIndex, gestationalAgeWeeks } from "@/lib/utils/clinical";
import type { ComplicationScreen, RiskLevel, RiskRecommendation } from "@/types";

const SOURCE_LABELS: Record<string, string> = {
  GUIDELINE_ENGINE: "Guideline engine",
  RULE_BASED: "Rule-based engine",
  AI_MODEL: "AI model",
};

export default async function RiskResultsPage({
  searchParams,
}: {
  searchParams?: { notice?: string };
}) {
  const { patient } = await getPatientContext();
  const latest = await prisma.riskAssessment.findFirst({
    where: { patientId: patient.id },
    orderBy: { assessedAt: "desc" },
  });

  if (!latest) {
    return (
      <PageTransition>
        <PageHeader
          eyebrow="Triage"
          title="Risk results"
          description="Log a symptom or test to run the WMHS engine, or recalculate from the current record."
          action={<RecalculateRisk />}
        />
        <EmptyState
          title="No assessment yet"
          description="Log a symptom or test to run the WMHS engine."
          actionLabel="Log a symptom"
          actionHref="/patient/symptoms/new"
        />
      </PageTransition>
    );
  }

  const rec = fromJsonString<RiskRecommendation>(latest.recommendations, {
    tests: [],
    actions: [],
    carePlan: "",
    urgency: "monitor",
  });
  const factors = fromJsonString<string[]>(latest.riskFactors, []);
  const screens: ComplicationScreen[] = rec.complications ?? [];
  const sourceLabel = SOURCE_LABELS[latest.assessmentSource] ?? latest.assessmentSource.replaceAll("_", " ");
  const liveBmi =
    patient.heightCm && patient.weightKg
      ? Number(bodyMassIndex(patient.weightKg, patient.heightCm).toFixed(1))
      : rec.bmi ?? null;
  const liveWeeks = patient.lmp ? gestationalAgeWeeks(patient.lmp) : rec.gestationalAgeWeeks ?? null;

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Triage"
        title="Risk results"
        description={`Assessed ${formatDateTime(latest.assessedAt)}`}
        action={
          <div className="flex flex-wrap items-start gap-2">
            <RecalculateRisk />
            <PrintShare title="WMHS risk results" />
          </div>
        }
      />
      <QueryNotice notice={searchParams?.notice} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <RiskIndicator level={latest.riskLevel as RiskLevel} score={latest.riskScore} />
          <p className="mt-3 text-caption text-ink-muted">Source: {sourceLabel}</p>
        </div>
        <Card className="lg:col-span-2">
          <CardTitle className="text-xl">Care plan</CardTitle>
          <p className="mt-3 text-sm leading-relaxed text-ink">{rec.carePlan}</p>
        </Card>
      </div>
      <div className="mt-6">
        <ComplicationScreens
          screens={screens}
          map={rec.map}
          bmi={liveBmi}
          gestationalAgeWeeks={liveWeeks}
        />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="text-xl">Risk factors</CardTitle>
          {factors.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">No elevated factors on this pass.</p>
          ) : (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {factors.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardTitle className="text-xl">Suggested tests</CardTitle>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {(rec.tests?.length ? rec.tests : ["Continue routine ANC panel"]).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Card>
        <div className="lg:col-span-2">
          <RiskExplainer contributions={rec.contributions} missingVitals={rec.missingVitals} />
        </div>
        <Card className="lg:col-span-2">
          <CardTitle className="text-xl">Actions</CardTitle>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {(rec.actions?.length ? rec.actions : ["Continue routine monitoring"]).map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Card>
      </div>
    </PageTransition>
  );
}
