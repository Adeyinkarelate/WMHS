import { notFound } from "next/navigation";
import { getProviderContext } from "@/lib/auth/providerContext";
import { assertPatientAccess } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { PageTransition } from "@/components/shared/PageTransition";
import { Avatar } from "@/components/shared/Avatar";
import { RiskIndicator } from "@/components/shared/RiskIndicator";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { gestationalAgeLabel, gestationalAgeWeeks, bodyMassIndex } from "@/lib/utils/clinical";
import { formatDate, formatDateTime } from "@/lib/utils/formatters";
import { ProviderNotes } from "@/components/provider/ProviderNotes";
import { ComplicationScreens } from "@/components/shared/ComplicationScreens";
import { AlertsPanel } from "@/components/provider/AlertsPanel";
import { RaiseAlertForm } from "@/components/provider/RaiseAlertForm";
import { fromJsonString } from "@/lib/utils/json";
import { alertTypeLabel, toAlertRow } from "@/lib/alerts/labels";
import { buildAncSchedule, nextAncVisit } from "@/lib/utils/anc";
import { AncSchedule } from "@/components/shared/AncSchedule";
import { MaternalSummary } from "@/components/shared/MaternalSummary";
import { SmsLog } from "@/components/shared/SmsLog";
import { RiskExplainer } from "@/components/shared/RiskExplainer";
import { LabFileLink } from "@/components/shared/LabFileLink";
import { RecalculateRisk } from "@/components/patient/RecalculateRisk";
import type { ComplicationScreen, RiskLevel, RiskRecommendation } from "@/types";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export default async function ProviderPatientPage({ params }: Ctx) {
  const { session } = await getProviderContext();
  const allowed = await assertPatientAccess(params.id, session.user);
  if (!allowed) notFound();
  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      symptoms: { orderBy: { submissionDate: "desc" }, take: 10 },
      testResults: { orderBy: { testDate: "desc" }, take: 10 },
      riskAssessments: { orderBy: { assessedAt: "desc" }, take: 6 },
      alerts: { orderBy: { alertedAt: "desc" } },
      referrals: { include: { facility: true }, orderBy: { referredAt: "desc" } },
      clinicalNotes: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      outboundMessages: { orderBy: { createdAt: "desc" }, take: 6 },
      ancAttendances: true,
    },
  });
  if (!patient) notFound();
  const latest = patient.riskAssessments[0];
  const rec = latest
    ? fromJsonString<RiskRecommendation>(latest.recommendations, {
        tests: [],
        actions: [],
        carePlan: "",
        urgency: "monitor",
      })
    : null;
  const screens: ComplicationScreen[] = rec?.complications ?? [];
  const ancVisits = buildAncSchedule(patient.lmp, new Date(), patient.ancAttendances);
  const nextAnc = nextAncVisit(ancVisits);
  const conditions = fromJsonString<string[]>(patient.preExistingConditions, []);
  const openAlerts = patient.alerts.filter((a) => a.status !== "RESOLVED");
  const liveBmi =
    patient.heightCm && patient.weightKg
      ? Number(bodyMassIndex(patient.weightKg, patient.heightCm).toFixed(1))
      : rec?.bmi ?? null;
  const liveWeeks = patient.lmp ? gestationalAgeWeeks(patient.lmp) : rec?.gestationalAgeWeeks ?? null;

  return (
    <PageTransition>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
        <Avatar name={patient.user.name} size="lg" />
        <div>
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.18em] text-sage">Patient chart</p>
          <h1 className="mt-1 font-heading text-h2 text-navy">{patient.user.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {patient.user.email} · {patient.phone} · GA {gestationalAgeLabel(patient.lmp)} · EDD{" "}
            {formatDate(patient.edd)}
          </p>
        </div>
        </div>
        <RecalculateRisk patientId={patient.id} />
      </div>
      <div className="mb-6">
        <MaternalSummary
          data={{
            patientName: patient.user.name,
            phone: patient.phone,
            address: patient.address,
            lmp: patient.lmp,
            edd: patient.edd,
            parity: patient.parity,
            riskLevel: latest?.riskLevel,
            riskScore: latest?.riskScore,
            openAlerts: openAlerts.map((a) => alertTypeLabel(a.alertType)),
            nextAnc: nextAnc
              ? `${nextAnc.title} · ${formatDate(nextAnc.dueDate)}`
              : ancVisits.length
                ? "All eight contacts attended"
                : null,
            lastVitals: patient.testResults.slice(0, 4).map((t) => `${t.testType}: ${t.resultValue} ${t.resultUnit}`),
            conditions,
          }}
        />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {latest ? (
          <RiskIndicator level={latest.riskLevel as RiskLevel} score={latest.riskScore} />
        ) : (
          <Card>
            <p className="text-caption text-ink-muted">Risk</p>
            <p className="mt-2 font-heading text-2xl text-navy">Not assessed</p>
            <p className="mt-1 text-caption text-ink-muted">No triage pass on this chart yet.</p>
          </Card>
        )}
        <Card>
          <p className="text-caption text-ink-muted">Address</p>
          <p className="mt-2 text-sm">{patient.address}</p>
          <p className="mt-3 text-caption text-ink-muted">Parity {patient.parity}</p>
          {conditions.length > 0 && (
            <p className="mt-3 text-sm text-ink">
              <span className="text-caption text-ink-muted">History · </span>
              {conditions.join(", ")}
            </p>
          )}
        </Card>
        <ProviderNotes patientId={patient.id} notes={patient.clinicalNotes} />
      </div>
      {latest && rec && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ComplicationScreens
            screens={screens}
            map={rec.map}
            bmi={liveBmi}
            gestationalAgeWeeks={liveWeeks}
          />
          <RiskExplainer contributions={rec.contributions} missingVitals={rec.missingVitals} />
        </div>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle className="text-xl">Alerts</CardTitle>
          <p className="mt-1 text-sm text-ink-muted">
            {patient.alerts.length === 0
              ? "No alerts on this chart yet."
              : openAlerts.length === 0
                ? `${patient.alerts.length} resolved`
                : `${openAlerts.length} open · ${alertTypeLabel(openAlerts[0].alertType)} most recent`}
          </p>
          <div className="mt-4">
            {patient.alerts.length === 0 ? (
              <p className="text-sm text-ink-muted">Risk, vitals, or a manual flag will appear here.</p>
            ) : (
              <AlertsPanel
                alerts={patient.alerts.map((a) => toAlertRow(a, { id: patient.id, name: patient.user.name }))}
              />
            )}
          </div>
        </Card>
        <Card>
          <CardTitle className="text-xl">Raise an alert</CardTitle>
          <p className="mt-1 text-sm text-ink-muted">Notifies the patient and assigned clinicians.</p>
          <div className="mt-4">
            <RaiseAlertForm patientId={patient.id} />
          </div>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="text-xl">Symptoms</CardTitle>
          {patient.symptoms.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">No symptoms logged.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line text-sm">
              {patient.symptoms.map((s) => (
                <li key={s.id} className="flex justify-between py-2">
                  <span>
                    {s.symptomType} ({s.severity})
                  </span>
                  <span className="text-ink-muted">{formatDate(s.submissionDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardTitle className="text-xl">Tests</CardTitle>
          {patient.testResults.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">No tests on this chart.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line text-sm">
              {patient.testResults.map((t) => (
                <li key={t.id} className="py-2">
                  <div className="flex justify-between gap-3">
                    <span>
                      {t.testType}: {t.resultValue} {t.resultUnit}
                    </span>
                    <span className="text-ink-muted">{formatDate(t.testDate)}</span>
                  </div>
                  <LabFileLink fileUrl={t.fileUrl} fileName={t.fileReference} />
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardTitle className="text-xl">Risk history</CardTitle>
          {patient.riskAssessments.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">No assessments yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {patient.riskAssessments.map((r) => (
                <li key={r.id} className="flex items-center justify-between">
                  <span>{formatDateTime(r.assessedAt)}</span>
                  <StatusBadge value={r.riskLevel} />
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardTitle className="text-xl">Referrals</CardTitle>
          {patient.referrals.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">No referrals on this chart.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {patient.referrals.map((r) => (
                <li key={r.id} className="flex items-center justify-between">
                  <span>{r.facility.name}</span>
                  <StatusBadge value={r.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AncSchedule visits={ancVisits} patientId={patient.id} canEdit />
        <SmsLog messages={patient.outboundMessages} />
      </div>
    </PageTransition>
  );
}
