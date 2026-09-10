import Link from "next/link";
import { getPatientContext } from "@/lib/auth/patientContext";
import { prisma } from "@/lib/db/prisma";
import { PageTransition } from "@/components/shared/PageTransition";
import { RiskIndicator } from "@/components/shared/RiskIndicator";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Icons } from "@/components/shared/Icons";
import { gestationalAgeLabel } from "@/lib/utils/clinical";
import { formatDate } from "@/lib/utils/formatters";
import { buildAncSchedule } from "@/lib/utils/anc";
import type { RiskLevel } from "@/types";
import { photos } from "@/lib/media";
import { alertTypeLabel } from "@/lib/alerts/labels";
import { AncSchedule } from "@/components/shared/AncSchedule";

export default async function PatientDashboardPage() {
  const { patient } = await getPatientContext();
  const [latestRisk, symptoms, tests, referrals, alerts] = await Promise.all([
    prisma.riskAssessment.findFirst({
      where: { patientId: patient.id },
      orderBy: { assessedAt: "desc" },
    }),
    prisma.symptom.findMany({
      where: { patientId: patient.id },
      orderBy: { submissionDate: "desc" },
      take: 5,
    }),
    prisma.testResult.findMany({
      where: { patientId: patient.id },
      orderBy: { testDate: "desc" },
      take: 5,
    }),
    prisma.referral.findMany({
      where: { patientId: patient.id },
      include: { facility: true },
      orderBy: { referredAt: "desc" },
      take: 3,
    }),
    prisma.alert.findMany({
      where: { patientId: patient.id, status: { in: ["ACTIVE", "ACKNOWLEDGED"] } },
      orderBy: { alertedAt: "desc" },
      take: 3,
    }),
  ]);

  const firstName = patient.user.name.split(" ")[0];
  const ancVisits = buildAncSchedule(patient.lmp);

  return (
    <PageTransition>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[1.75rem] bg-primary text-white shadow-lift">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos.hero.src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/75 to-navy/40" />
          <div className="relative px-6 py-8 sm:px-8 sm:py-10">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Welcome back</p>
            <h1 className="mt-2 font-heading text-3xl sm:text-4xl">{firstName}</h1>
            <p className="mt-2 max-w-lg text-sm text-white/75">
              Your pregnancy record is here — symptoms, tests, risk and the next step, in one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/patient/symptoms/new">
                <Button variant="inverse">
                  <Icons.plus size={16} />
                  Log symptoms
                </Button>
              </Link>
              <Link href="/patient/tests/upload">
                <Button variant="ghostDark">
                  <Icons.upload size={16} />
                  Upload test
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
          {latestRisk ? (
            <RiskIndicator level={latestRisk.riskLevel as RiskLevel} score={latestRisk.riskScore} />
          ) : (
            <Card>
              <p className="text-caption text-ink-muted">Risk</p>
              <p className="mt-2 font-heading text-2xl text-navy">Not assessed</p>
              <p className="mt-1 text-caption text-ink-muted">Log a symptom or test to run triage.</p>
              <Link href="/patient/symptoms/new" className="mt-3 inline-block">
                <Button size="sm" variant="outline">
                  Log a symptom
                </Button>
              </Link>
            </Card>
          )}
          <Card className="bg-gradient-to-br from-white to-sage-light/50">
            <p className="text-caption text-ink-muted">Gestational age</p>
            <p className="mt-2 font-heading text-2xl text-navy">{gestationalAgeLabel(patient.lmp)}</p>
            <p className="mt-1 text-caption text-ink-muted">Due {formatDate(patient.edd)}</p>
          </Card>
          <Card className="bg-gradient-to-br from-white to-blush-soft/60">
            <p className="text-caption text-ink-muted">Parity</p>
            <p className="mt-2 font-heading text-2xl text-navy">{patient.parity}</p>
            <p className="mt-1 text-caption text-ink-muted">Previous births on record</p>
          </Card>
        </div>

        {alerts.length > 0 && (
          <Card className="border-danger/20 bg-danger-soft">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg">Open alerts</CardTitle>
              <Link href="/patient/alerts" className="text-sm font-semibold text-primary">
                All
              </Link>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {alerts.map((a) => (
                <li key={a.id} className="flex justify-between gap-3">
                  <span>{alertTypeLabel(a.alertType)}</span>
                  <StatusBadge value={a.severity} />
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { href: "/patient/symptoms/new", label: "Log a symptom", icon: Icons.pulse },
            { href: "/patient/tests/upload", label: "Add a test", icon: Icons.flask },
            { href: "/patient/assistant", label: "Ask the assistant", icon: Icons.chat },
          ].map((a) => (
            <Link key={a.href} href={a.href}>
              <Button variant="outline" className="w-full justify-start">
                <a.icon size={18} />
                {a.label}
              </Button>
            </Link>
          ))}
        </div>

        <AncSchedule visits={ancVisits} />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Recent symptoms</CardTitle>
              <Link href="/patient/symptoms" className="text-sm font-semibold text-primary">
                All
              </Link>
            </div>
            {symptoms.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title="No symptoms yet"
                  description="Log how you feel so WMHS can update your risk."
                  actionLabel="Log a symptom"
                  actionHref="/patient/symptoms/new"
                />
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {symptoms.map((s) => (
                  <li key={s.id} className="flex justify-between py-3 text-sm">
                    <span>
                      {s.symptomType} · severity {s.severity}
                    </span>
                    <span className="text-ink-muted">{formatDate(s.submissionDate)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Recent tests</CardTitle>
              <Link href="/patient/tests" className="text-sm font-semibold text-primary">
                All
              </Link>
            </div>
            {tests.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title="No tests yet"
                  description="Add blood pressure, glucose or a lab file."
                  actionLabel="Upload a test"
                  actionHref="/patient/tests/upload"
                />
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {tests.map((t) => (
                  <li key={t.id} className="flex justify-between py-3 text-sm">
                    <span>
                      {t.testType}: {t.resultValue} {t.resultUnit}
                    </span>
                    <span className="text-ink-muted">{formatDate(t.testDate)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Referrals</CardTitle>
            <Link href="/patient/referrals" className="text-sm font-semibold text-primary">
              All
            </Link>
          </div>
          {referrals.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">No referrals yet. High-risk results can recommend a nearby facility.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {referrals.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                  <span>
                    {r.facility.name} — {r.reason}
                  </span>
                  <StatusBadge value={r.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </PageTransition>
  );
}
