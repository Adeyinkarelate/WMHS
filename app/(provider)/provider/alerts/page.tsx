import { getProviderContext } from "@/lib/auth/providerContext";
import { assignedCaseloadWhere } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { AlertsPanel } from "@/components/provider/AlertsPanel";
import { EmptyState } from "@/components/shared/EmptyState";
import { toAlertRow } from "@/lib/alerts/labels";

export default async function AlertsPage() {
  const { session } = await getProviderContext();
  const alerts = await prisma.alert.findMany({
    where: assignedCaseloadWhere(session.user),
    include: { patient: { include: { user: { select: { name: true } } } } },
    orderBy: { alertedAt: "desc" },
  });

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Watchlist"
        title="Alerts"
        description="Open flags first. Acknowledge, resolve, and keep an audit trail on the record."
      />
      <div className="mt-6">
        {alerts.length === 0 ? (
          <EmptyState title="Quiet caseload" description="No alerts for assigned patients." />
        ) : (
          <AlertsPanel
            alerts={alerts.map((a) => toAlertRow(a, { id: a.patientId, name: a.patient.user.name }))}
          />
        )}
      </div>
    </PageTransition>
  );
}
