import { prisma } from "@/lib/db/prisma";
import { createUserNotification } from "@/lib/alerts/notify";
import { alertTypeLabel, providerAlertHref, STALE_CRITICAL_HOURS } from "@/lib/alerts/labels";

const STALE_CRITICAL_MS = STALE_CRITICAL_HOURS * 60 * 60 * 1000;

export async function escalateStaleCriticalAlerts() {
  const cutoff = new Date(Date.now() - STALE_CRITICAL_MS);
  const stale = await prisma.alert.findMany({
    where: {
      status: "ACTIVE",
      severity: "CRITICAL",
      escalatedAt: null,
      alertedAt: { lte: cutoff },
    },
    include: {
      patient: {
        include: {
          user: { select: { name: true } },
          assignments: { include: { provider: { select: { userId: true } } } },
        },
      },
    },
  });

  for (const alert of stale) {
    const label = alertTypeLabel(alert.alertType);
    const recipients = new Set<string>();
    for (const row of alert.patient.assignments) recipients.add(row.provider.userId);
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    for (const admin of admins) recipients.add(admin.id);

    for (const userId of Array.from(recipients)) {
      await createUserNotification({
        userId,
        title: `Unacknowledged critical: ${alert.patient.user.name}`,
        content: `${label} has been active for over 2 hours and needs a clinician now.`,
        type: "ALERT",
        severity: "CRITICAL",
        alertId: alert.id,
        link: providerAlertHref(alert.patientId),
      });
    }

    await prisma.alert.update({
      where: { id: alert.id },
      data: { escalatedAt: new Date() },
    });
  }

  return stale.length;
}
