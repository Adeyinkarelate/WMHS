import type { AlertSeverity, AlertType } from "@/types";

type TestRow = { testType: string; resultValue: number };

export type VitalHit = {
  alertType: AlertType;
  severity: AlertSeverity;
  notes: string;
};

function latest(tests: TestRow[], ...needles: string[]) {
  const match = tests.find((t) =>
    needles.some((n) => t.testType.toLowerCase().includes(n.toLowerCase()))
  );
  return match ?? null;
}

function worse(a: AlertSeverity, b: AlertSeverity): AlertSeverity {
  const rank: Record<AlertSeverity, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
  return rank[a] >= rank[b] ? a : b;
}

/**
 * WHO / ACOG-style thresholds on recorded tests only (no fallbacks).
 */
export function detectVitalAlerts(tests: TestRow[]): VitalHit[] {
  const hits: VitalHit[] = [];
  const vitalNotes: string[] = [];
  let vitalSeverity: AlertSeverity = "MEDIUM";

  const sbp = latest(tests, "Systolic");
  const dbp = latest(tests, "Diastolic");
  if (sbp && sbp.resultValue >= 160) {
    vitalNotes.push(`Systolic BP ${sbp.resultValue} mmHg (≥ 160)`);
    vitalSeverity = worse(vitalSeverity, "CRITICAL");
  } else if (sbp && sbp.resultValue >= 140) {
    vitalNotes.push(`Systolic BP ${sbp.resultValue} mmHg (≥ 140)`);
    vitalSeverity = worse(vitalSeverity, "HIGH");
  }
  if (dbp && dbp.resultValue >= 110) {
    vitalNotes.push(`Diastolic BP ${dbp.resultValue} mmHg (≥ 110)`);
    vitalSeverity = worse(vitalSeverity, "CRITICAL");
  } else if (dbp && dbp.resultValue >= 90) {
    vitalNotes.push(`Diastolic BP ${dbp.resultValue} mmHg (≥ 90)`);
    vitalSeverity = worse(vitalSeverity, "HIGH");
  }

  const glucose = latest(tests, "Glucose");
  if (glucose && glucose.resultValue >= 200) {
    vitalNotes.push(`Blood glucose ${glucose.resultValue} mg/dL (≥ 200)`);
    vitalSeverity = worse(vitalSeverity, "CRITICAL");
  } else if (glucose && glucose.resultValue >= 140) {
    vitalNotes.push(`Blood glucose ${glucose.resultValue} mg/dL (≥ 140)`);
    vitalSeverity = worse(vitalSeverity, "HIGH");
  }

  const hr = latest(tests, "Heart Rate");
  if (hr && (hr.resultValue >= 120 || (hr.resultValue > 0 && hr.resultValue < 50))) {
    vitalNotes.push(
      hr.resultValue >= 120
        ? `Heart rate ${hr.resultValue} bpm (tachycardia)`
        : `Heart rate ${hr.resultValue} bpm (bradycardia)`
    );
    vitalSeverity = worse(vitalSeverity, "HIGH");
  }

  const temp = latest(tests, "Temperature");
  if (temp && temp.resultValue >= 38.5) {
    vitalNotes.push(`Temperature ${temp.resultValue} °C (severe fever)`);
    vitalSeverity = worse(vitalSeverity, "HIGH");
  } else if (temp && temp.resultValue >= 38) {
    vitalNotes.push(`Temperature ${temp.resultValue} °C (fever)`);
    vitalSeverity = worse(vitalSeverity, "MEDIUM");
  }

  if (vitalNotes.length) {
    hits.push({
      alertType: "ABNORMAL_VITAL",
      severity: vitalSeverity,
      notes: vitalNotes.join("; "),
    });
  }

  const hb = latest(tests, "Haemoglobin", "Hemoglobin");
  if (hb) {
    if (hb.resultValue < 7) {
      hits.push({
        alertType: "ANAEMIA",
        severity: "CRITICAL",
        notes: `Haemoglobin ${hb.resultValue} g/dL (severe anaemia, WHO < 7)`,
      });
    } else if (hb.resultValue < 11) {
      hits.push({
        alertType: "ANAEMIA",
        severity: "HIGH",
        notes: `Haemoglobin ${hb.resultValue} g/dL (pregnancy anaemia, WHO < 11)`,
      });
    }
  }

  const protein = latest(tests, "Urine Protein", "Protein");
  if (protein && protein.resultValue >= 2) {
    hits.push({
      alertType: "PROTEINURIA",
      severity: protein.resultValue >= 3 ? "CRITICAL" : "HIGH",
      notes: `Urine protein ${protein.resultValue}+ (significant proteinuria)`,
    });
  } else if (protein && protein.resultValue >= 1) {
    hits.push({
      alertType: "PROTEINURIA",
      severity: "MEDIUM",
      notes: `Urine protein ${protein.resultValue}+ (trace/1+ — repeat and review)`,
    });
  }

  return hits;
}
