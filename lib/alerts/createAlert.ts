import { prisma } from "@/lib/db/prisma";
import { createUserNotification } from "@/lib/alerts/notify";
import { sendCriticalSms } from "@/lib/alerts/sms";
import { alertTypeLabel, patientAlertHref, providerAlertHref } from "@/lib/alerts/labels";
import type { AlertSeverity, AlertSource, AlertType } from "@/types";

const OPEN_STATUSES = ["ACTIVE", "ACKNOWLEDGED"] as const;

export async function createClinicalAlert(input: {
  patientId: string;
  alertType: AlertType;
  severity: AlertSeverity;
  notes: string;
  source?: AlertSource;
}) {
  const existing = await prisma.alert.findFirst({
    where: {
      patientId: input.patientId,
      alertType: input.alertType,
      status: { in: [...OPEN_STATUSES] },
    },
  });
  if (existing) {
    return { alert: existing, created: false as const };
  }

  const alert = await prisma.alert.create({
    data: {
      patientId: input.patientId,
      alertType: input.alertType,
      severity: input.severity,
      notes: input.notes,
      source: input.source ?? "RISK_ENGINE",
    },
  });

  await fanOutAlertNotifications(alert.id, input.patientId, {
    alertType: input.alertType,
    severity: input.severity,
    notes: input.notes,
  });

  return { alert, created: true as const };
}

async function fanOutAlertNotifications(
  alertId: string,
  patientId: string,
  payload: { alertType: AlertType; severity: AlertSeverity; notes: string }
) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      user: { select: { id: true, name: true } },
      assignments: { include: { provider: { select: { userId: true } } } },
    },
  });
  if (!patient) return;

  const label = alertTypeLabel(payload.alertType);
  const alwaysNotifyPatient = payload.severity === "CRITICAL" || payload.alertType === "EMERGENCY";
  if (patient.notifyAlerts || alwaysNotifyPatient) {
    await createUserNotification({
      userId: patient.user.id,
      title: payload.severity === "CRITICAL" ? `Urgent: ${label}` : label,
      content:
        payload.notes ||
        "A new clinical alert was added to your record. Review it and contact a clinician if you have danger signs.",
      type: "ALERT",
      severity: payload.severity,
      alertId,
      link: patientAlertHref(),
    });
  }

  const title = `${label}: ${patient.user.name}`;
  const content = payload.notes || `${label} alert needs review.`;
  const seen = new Set<string>();

  for (const row of patient.assignments) {
    if (seen.has(row.provider.userId)) continue;
    seen.add(row.provider.userId);
    await createUserNotification({
      userId: row.provider.userId,
      title,
      content,
      type: "ALERT",
      severity: payload.severity,
      alertId,
      link: providerAlertHref(patientId),
    });
  }

  if (payload.severity === "CRITICAL" || payload.alertType === "EMERGENCY") {
    try {
      await sendCriticalSms({
        patientId,
        phone: patient.phone,
        patientName: patient.user.name,
        alertType: payload.alertType,
        notes: payload.notes,
        alertId,
      });
    } catch (err) {
      console.error("Critical SMS stub failed", err);
    }
  }

  if (payload.severity === "CRITICAL") {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    for (const admin of admins) {
      if (seen.has(admin.id)) continue;
      seen.add(admin.id);
      await createUserNotification({
        userId: admin.id,
        title: `Critical alert — ${patient.user.name}`,
        content,
        type: "ALERT",
        severity: payload.severity,
        alertId,
        link: providerAlertHref(patientId),
      });
    }
  }
}

export async function notifyAlertStatusChange(input: {
  patientUserId: string;
  patientId: string;
  alertType: string;
  status: "ACKNOWLEDGED" | "RESOLVED";
  clinicianName: string;
  notifyPatient: boolean;
}) {
  if (!input.notifyPatient) return;
  const label = alertTypeLabel(input.alertType);
  await createUserNotification({
    userId: input.patientUserId,
    title: input.status === "RESOLVED" ? `${label} resolved` : `${label} seen by your clinician`,
    content:
      input.status === "RESOLVED"
        ? `${input.clinicianName} marked this alert as resolved.`
        : `${input.clinicianName} has acknowledged this alert and will follow up.`,
    type: "ALERT",
    link: patientAlertHref(),
  });
}
