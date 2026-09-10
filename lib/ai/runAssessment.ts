import { prisma } from "@/lib/db/prisma";
import { assessRisk, extractFeaturesFromRecords, extraSymptomsForContext } from "@/lib/ai/riskService";
import { createClinicalAlert } from "@/lib/alerts/createAlert";
import { createUserNotification } from "@/lib/alerts/notify";
import { patientAlertHref, providerAlertHref } from "@/lib/alerts/labels";
import { detectVitalAlerts } from "@/lib/alerts/vitalRules";
import { yearsBetween } from "@/lib/utils/clinical";
import { haversineKm } from "@/lib/utils/haversine";
import { fromJsonString, toJsonString } from "@/lib/utils/json";
import type { AlertType, RiskLevel } from "@/types";

export async function runAndStoreRisk(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      user: true,
      symptoms: { orderBy: { submissionDate: "desc" }, take: 20 },
      testResults: { orderBy: { testDate: "desc" }, take: 30 },
    },
  });
  if (!patient) throw new Error("Patient not found");

  const age = yearsBetween(patient.dateOfBirth);
  const features = extractFeaturesFromRecords({
    age,
    symptoms: patient.symptoms,
    tests: patient.testResults,
  });
  const result = assessRisk(features, {
    lmp: patient.lmp,
    heightCm: patient.heightCm,
    weightKg: patient.weightKg,
    parity: patient.parity,
    preExistingConditions: fromJsonString<string[]>(patient.preExistingConditions, []),
    otherSymptoms: extraSymptomsForContext(patient.symptoms),
  });

  const assessment = await prisma.riskAssessment.create({
    data: {
      patientId,
      riskLevel: result.riskLevel,
      riskScore: result.riskScore,
      riskFactors: toJsonString(result.riskFactors),
      assessmentSource: result.assessmentSource,
      assessedAt: new Date(),
      recommendations: toJsonString(result.recommendations),
    },
  });

  let openedAlert = false;
  const triggered = result.complications.filter((c) => c.triggered);
  for (const item of triggered) {
    const severity =
      item.type === "EMERGENCY" ? "CRITICAL" : result.riskLevel === "HIGH" ? "HIGH" : "MEDIUM";
    const { created } = await createClinicalAlert({
      patientId,
      alertType: item.type as AlertType,
      severity,
      notes: item.reasons.join("; ") || "Triggered by latest risk assessment",
      source: "RISK_ENGINE",
    });
    if (created) openedAlert = true;
  }

  for (const hit of detectVitalAlerts(patient.testResults)) {
    const { created } = await createClinicalAlert({
      patientId,
      alertType: hit.alertType,
      severity: hit.severity,
      notes: hit.notes,
      source: "VITAL",
    });
    if (created) openedAlert = true;
  }

  if (result.riskLevel === "HIGH" && !openedAlert) {
    if (patient.notifyAlerts) {
      await createUserNotification({
        userId: patient.userId,
        title: "High-risk assessment",
        content:
          "Your latest WMHS assessment is High. Please review recommendations and contact a provider if you have danger signs.",
        type: "ALERT",
        severity: "HIGH",
        link: patientAlertHref(),
      });
    }
    const assignments = await prisma.patientAssignment.findMany({
      where: { patientId },
      include: { provider: true },
    });
    for (const row of assignments) {
      await createUserNotification({
        userId: row.provider.userId,
        title: `High-risk: ${patient.user.name}`,
        content: `Risk score ${result.riskScore}. ${result.riskFactors.slice(0, 3).join("; ")}`,
        type: "ALERT",
        severity: "HIGH",
        link: providerAlertHref(patientId),
      });
    }
  }

  return { assessment, result };
}

const HIGH_RISK_SERVICES = ["CEmONC", "emergency", "Theatre", "Blood bank", "Maternal ICU", "NICU"];

function serviceMatchCount(offered: string[], wanted: string[]) {
  if (!wanted.length) return 0;
  const haystack = offered.map((s) => s.toLowerCase());
  return wanted.filter((w) => haystack.some((s) => s.includes(w.toLowerCase()))).length;
}

export async function nearbyFacilities(
  lat: number,
  lng: number,
  options: number | { limit?: number; emergencyFirst?: boolean; services?: string[] } = 8
) {
  const opts = typeof options === "number" ? { limit: options } : options;
  const limit = opts.limit ?? 8;
  const emergencyFirst = opts.emergencyFirst ?? false;
  const services = opts.services ?? [];

  const facilities = await prisma.facility.findMany();
  return facilities
    .map((f) => {
      const servicesOffered = fromJsonString<string[]>(f.servicesOffered, []);
      return {
        ...f,
        servicesOffered,
        distanceKm: Number(haversineKm(lat, lng, f.locationLat, f.locationLng).toFixed(2)),
        serviceMatches: serviceMatchCount(servicesOffered, services),
      };
    })
    .sort((a, b) => {
      if (emergencyFirst && a.emergencyAvailable !== b.emergencyAvailable) {
        return a.emergencyAvailable ? -1 : 1;
      }
      if (b.serviceMatches !== a.serviceMatches) return b.serviceMatches - a.serviceMatches;
      return a.distanceKm - b.distanceKm;
    })
    .slice(0, limit);
}

export function referralMatchOptions(riskLevel?: RiskLevel | null, urgency?: string | null) {
  const high = riskLevel === "HIGH" || urgency === "emergency";
  return {
    emergencyFirst: high,
    services: high ? HIGH_RISK_SERVICES : riskLevel === "MEDIUM" ? ["ANC", "CEmONC"] : [],
  };
}
