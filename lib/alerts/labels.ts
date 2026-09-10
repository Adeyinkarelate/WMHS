import type { AlertSource, AlertType } from "@/types";

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  PRE_ECLAMPSIA: "Pre-eclampsia",
  GESTATIONAL_DIABETES: "Gestational diabetes",
  PRETERM_LABOUR: "Preterm labour",
  EMERGENCY: "Emergency danger signs",
  ABNORMAL_VITAL: "Abnormal vital sign",
  ANAEMIA: "Anaemia",
  PROTEINURIA: "Proteinuria",
  CLINICAL: "Clinical review",
};

export const ALERT_SOURCE_LABELS: Record<AlertSource, string> = {
  RISK_ENGINE: "Risk assessment",
  VITAL: "Lab / vital",
  MANUAL: "Raised by clinician",
};

export function alertTypeLabel(type: string) {
  return ALERT_TYPE_LABELS[type as AlertType] ?? type.replaceAll("_", " ");
}

export function alertSourceLabel(source: string) {
  return ALERT_SOURCE_LABELS[source as AlertSource] ?? source.replaceAll("_", " ");
}

export function providerAlertHref(patientId: string) {
  return `/provider/patients/${patientId}`;
}

export function patientAlertHref() {
  return "/patient/alerts";
}

export function toAlertRow(
  alert: {
    id: string;
    alertType: string;
    severity: string;
    status: string;
    source?: string | null;
    notes: string;
    alertedAt: Date | string;
    escalatedAt?: Date | string | null;
  },
  patient: { id: string; name: string }
) {
  return {
    id: alert.id,
    alertType: alert.alertType,
    severity: alert.severity,
    status: alert.status,
    source: alert.source ?? undefined,
    notes: alert.notes,
    alertedAt: typeof alert.alertedAt === "string" ? alert.alertedAt : alert.alertedAt.toISOString(),
    escalatedAt: alert.escalatedAt
      ? typeof alert.escalatedAt === "string"
        ? alert.escalatedAt
        : alert.escalatedAt.toISOString()
      : null,
    patient: { id: patient.id, user: { name: patient.name } },
  };
}

const STALE_CRITICAL_MS = 2 * 60 * 60 * 1000;

export function isStaleCritical(alert: {
  severity: string;
  status: string;
  alertedAt: Date;
  escalatedAt?: Date | null;
}) {
  if (alert.severity !== "CRITICAL" || alert.status !== "ACTIVE") return false;
  return Date.now() - new Date(alert.alertedAt).getTime() >= STALE_CRITICAL_MS;
}

export const STALE_CRITICAL_HOURS = 2;
