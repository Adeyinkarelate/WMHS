import Link from "next/link";
import { getPatientContext } from "@/lib/auth/patientContext";
import { prisma } from "@/lib/db/prisma";
import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AlertBanner } from "@/components/shared/AlertBanner";
import { Button } from "@/components/ui/Button";
import { alertSourceLabel, alertTypeLabel } from "@/lib/alerts/labels";
import { formatDateTime } from "@/lib/utils/formatters";

export default async function PatientAlertsPage() {
  const { patient } = await getPatientContext();
  const alerts = await prisma.alert.findMany({
    where: { patientId: patient.id },
    orderBy: { alertedAt: "desc" },
  });
  const open = alerts.filter((a) => a.status !== "RESOLVED");
  const critical = open.filter((a) => a.severity === "CRITICAL" || a.alertType === "EMERGENCY");

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Watchlist"
        title="Your alerts"
        description="Clinical flags from your symptoms, tests, and your care team."
      />
      {critical.length > 0 && (
        <div className="mt-6">
          <AlertBanner title="Seek care now" tone="danger">
            You have an urgent alert. Go to the nearest emergency-capable facility or call your midwife. This
            system is not an emergency line.
          </AlertBanner>
        </div>
      )}
      <div className="mt-6 space-y-3">
        {alerts.length === 0 ? (
          <EmptyState
            title="No alerts yet"
            description="When a danger sign, abnormal test, or clinician flag is raised, it will appear here."
            actionLabel="Log a symptom"
            actionHref="/patient/symptoms/new"
          />
        ) : (
          alerts.map((a) => (
            <article
              key={a.id}
              className={`rounded-2xl border bg-white p-5 shadow-card ${
                a.status !== "RESOLVED" && a.severity === "CRITICAL" ? "border-danger/30 bg-danger-soft/40" : "border-line"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-navy">{alertTypeLabel(a.alertType)}</h2>
                  <p className="mt-1 text-sm text-ink-muted">{formatDateTime(a.alertedAt)}</p>
                  {a.notes && <p className="mt-2 text-sm leading-relaxed text-ink">{a.notes}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusBadge value={a.severity} />
                    <StatusBadge value={a.status} />
                    <span className="text-caption text-ink-muted">{alertSourceLabel(a.source)}</span>
                  </div>
                </div>
                {a.status !== "RESOLVED" && (
                  <Link href="/patient/assistant">
                    <Button size="sm" variant="outline">
                      Ask the assistant
                    </Button>
                  </Link>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </PageTransition>
  );
}
