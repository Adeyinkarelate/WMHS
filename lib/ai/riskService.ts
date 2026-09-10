import type {
  AlertType,
  ComplicationScreen,
  FeatureContribution,
  RiskEngineResult,
  RiskFeatures,
  RiskLevel,
  RiskRecommendation,
} from "@/types";
import { bodyMassIndex, gestationalAgeWeeks, meanArterialPressure } from "@/lib/utils/clinical";
import { clamp } from "@/lib/utils/helpers";

type Context = {
  lmp?: Date | null;
  heightCm?: number | null;
  weightKg?: number | null;
  parity?: number | null;
  preExistingConditions?: string[];
  otherSymptoms?: Array<{ symptomType: string; severity: number }>;
};

const ENGINE_SYMPTOM_PATTERN =
  /headache|vision|swelling|bleeding|abdominal|dizziness|fetal|stress|fever/i;

export function extraSymptomsForContext(
  symptoms: Array<{ symptomType: string; severity: number }>
) {
  return symptoms.filter((s) => s.severity >= 1 && !ENGINE_SYMPTOM_PATTERN.test(s.symptomType));
}

function historyFlags(conditions: string[] | undefined) {
  const hay = (conditions ?? []).join(" ").toLowerCase();
  return {
    hypertension: /hypertens|pre-?eclamp|\bpet\b/.test(hay),
    diabetes: /diabet/.test(hay),
    sickle: /sickle/.test(hay),
  };
}

function historyScoreBoost(context: Context): number {
  const flags = historyFlags(context.preExistingConditions);
  return (flags.hypertension ? 0.08 : 0) + (flags.diabetes ? 0.06 : 0) + (flags.sickle ? 0.05 : 0);
}

function applyHistoryFactors(factors: string[], context: Context) {
  const flags = historyFlags(context.preExistingConditions);
  if (flags.hypertension) factors.push("History of hypertension / pre-eclampsia");
  if (flags.diabetes) factors.push("Pre-existing or family history of diabetes");
  if (flags.sickle) factors.push("Sickle cell disease");
  for (const symptom of context.otherSymptoms ?? []) {
    factors.push(`${symptom.symptomType} (severity ${symptom.severity})`);
  }
}

/**
 * Weighted ensemble approximating a Random Forest trained on maternal
 * vital + symptom features. Coefficients are calibrated to clinical
 * thresholds (WHO, ACOG, NICE) rather than a private dataset.
 * Missing vitals are skipped — they are never treated as normal.
 */
const WEIGHTS: Record<keyof RiskFeatures, number> = {
  age: 0.06,
  systolicBp: 0.16,
  diastolicBp: 0.12,
  bloodSugar: 0.1,
  heartRate: 0.05,
  bodyTemperature: 0.04,
  severeHeadache: 0.08,
  blurredVision: 0.09,
  swelling: 0.06,
  vaginalBleeding: 0.12,
  abdominalPain: 0.07,
  dizziness: 0.04,
  lowFetalMovement: 0.1,
  highStress: 0.03,
};

function addContribution(
  contributions: FeatureContribution[],
  key: keyof RiskFeatures,
  label: string,
  contribution: number,
  recorded: boolean
) {
  contributions.push({
    key,
    label,
    weight: WEIGHTS[key],
    contribution: Number(contribution.toFixed(4)),
    recorded,
  });
}

function featureContribution(features: RiskFeatures): {
  score: number;
  factors: string[];
  missing: string[];
  contributions: FeatureContribution[];
} {
  const factors: string[] = [];
  const missing: string[] = [];
  const contributions: FeatureContribution[] = [];
  let raw = 0;

  const ageRisk =
    features.age < 18 ? 0.55 : features.age >= 40 ? 0.7 : features.age >= 35 ? 0.5 : 0.08;
  const agePoints = WEIGHTS.age * ageRisk;
  raw += agePoints;
  addContribution(contributions, "age", `Age (${features.age})`, agePoints, true);
  if (features.age < 18) factors.push("Adolescent pregnancy (age under 18)");
  if (features.age >= 35) factors.push("Advanced maternal age (35+)");

  const vitals: Array<{
    key: keyof RiskFeatures;
    value: number | null;
    label: string;
    missingLabel: string;
    risk: (n: number) => number;
    factor: (n: number) => string | null;
  }> = [
    {
      key: "systolicBp",
      value: features.systolicBp,
      label: "Systolic BP",
      missingLabel: "Systolic BP not recorded",
      risk: (n) => (n >= 160 ? 1 : n >= 140 ? 0.75 : n >= 130 ? 0.35 : 0.05),
      factor: (n) => (n >= 140 ? `Elevated systolic BP (${n} mmHg)` : null),
    },
    {
      key: "diastolicBp",
      value: features.diastolicBp,
      label: "Diastolic BP",
      missingLabel: "Diastolic BP not recorded",
      risk: (n) => (n >= 110 ? 1 : n >= 90 ? 0.75 : n >= 85 ? 0.3 : 0.05),
      factor: (n) => (n >= 90 ? `Elevated diastolic BP (${n} mmHg)` : null),
    },
    {
      key: "bloodSugar",
      value: features.bloodSugar,
      label: "Blood glucose",
      missingLabel: "Blood glucose not recorded",
      risk: (n) => (n >= 200 ? 1 : n >= 140 ? 0.7 : n >= 95 ? 0.35 : 0.05),
      factor: (n) =>
        n >= 140
          ? `Elevated blood glucose (${n} mg/dL)`
          : n >= 95
            ? `Borderline fasting glucose (${n} mg/dL)`
            : null,
    },
    {
      key: "heartRate",
      value: features.heartRate,
      label: "Heart rate",
      missingLabel: "Heart rate not recorded",
      risk: (n) => (n >= 120 ? 0.7 : n >= 100 ? 0.4 : n > 0 && n < 50 ? 0.5 : 0.05),
      factor: (n) =>
        n >= 100 ? `Tachycardia (${n} bpm)` : n > 0 && n < 50 ? `Bradycardia (${n} bpm)` : null,
    },
    {
      key: "bodyTemperature",
      value: features.bodyTemperature,
      label: "Temperature",
      missingLabel: "Temperature not recorded",
      risk: (n) => (n >= 38.5 ? 0.8 : n >= 38 ? 0.45 : 0.05),
      factor: (n) => (n >= 38 ? `Fever (${n} °C)` : null),
    },
  ];

  for (const vital of vitals) {
    if (vital.value == null) {
      missing.push(vital.missingLabel);
      addContribution(contributions, vital.key, vital.label, 0, false);
      continue;
    }
    const points = WEIGHTS[vital.key] * vital.risk(vital.value);
    raw += points;
    addContribution(contributions, vital.key, `${vital.label} (${vital.value})`, points, true);
    const factor = vital.factor(vital.value);
    if (factor) factors.push(factor);
  }

  const binaries: Array<[keyof RiskFeatures, string]> = [
    ["severeHeadache", "Severe headache"],
    ["blurredVision", "Blurred vision"],
    ["swelling", "Swelling of face, hands or legs"],
    ["vaginalBleeding", "Vaginal bleeding"],
    ["abdominalPain", "Abdominal pain"],
    ["dizziness", "Dizziness"],
    ["lowFetalMovement", "Reduced fetal movement"],
    ["highStress", "High reported stress"],
  ];
  for (const [key, label] of binaries) {
    const on = Boolean(features[key]);
    const points = on ? WEIGHTS[key] : 0;
    raw += points;
    addContribution(contributions, key, label, points, on);
    if (on) factors.push(label);
  }

  contributions.sort((a, b) => b.contribution - a.contribution);
  return { score: clamp(raw, 0, 1), factors, missing, contributions };
}

function classify(score: number, features: RiskFeatures): RiskLevel {
  const sbp = features.systolicBp;
  const dbp = features.diastolicBp;
  const emergency =
    features.vaginalBleeding ||
    features.lowFetalMovement ||
    (sbp != null && dbp != null && sbp >= 160 && dbp >= 110) ||
    (features.severeHeadache && features.blurredVision);
  const pecPattern =
    sbp != null &&
    sbp >= 140 &&
    dbp != null &&
    dbp >= 90 &&
    (features.severeHeadache || features.blurredVision || features.swelling);
  const severeHyperglycaemia = features.bloodSugar != null && features.bloodSugar >= 200;
  if (emergency || pecPattern || severeHyperglycaemia || score >= 0.55) return "HIGH";
  if (score >= 0.28 || (features.bloodSugar != null && features.bloodSugar >= 140)) return "MEDIUM";
  return "LOW";
}

function screenComplications(
  features: RiskFeatures,
  context: Context,
  riskLevel: RiskLevel
): ComplicationScreen[] {
  const weeks = context.lmp ? gestationalAgeWeeks(context.lmp) : null;
  const map =
    features.systolicBp != null && features.diastolicBp != null
      ? meanArterialPressure(features.systolicBp, features.diastolicBp)
      : null;
  const oliguria = (context.otherSymptoms ?? []).some(
    (s) => s.symptomType.toLowerCase().includes("urine") && s.severity >= 1
  );
  const history = historyFlags(context.preExistingConditions);

  const preReasons: string[] = [];
  if (features.systolicBp != null && features.systolicBp >= 140) preReasons.push("SBP ≥ 140 mmHg");
  if (features.diastolicBp != null && features.diastolicBp >= 90) preReasons.push("DBP ≥ 90 mmHg");
  if (map != null && map >= 90 && weeks !== null && weeks >= 14 && weeks < 28) {
    preReasons.push(`MAP ${map.toFixed(0)} ≥ 90 in second trimester`);
  }
  if (features.severeHeadache) preReasons.push("Severe headache");
  if (features.blurredVision) preReasons.push("Visual disturbance");
  if (features.swelling) preReasons.push("Oedema");
  if (oliguria) preReasons.push("Reduced urine output");
  if (history.hypertension) preReasons.push("History of hypertension / pre-eclampsia");
  const preProb = clamp(
    (features.systolicBp != null && features.systolicBp >= 140 ? 0.35 : 0) +
      (features.diastolicBp != null && features.diastolicBp >= 90 ? 0.25 : 0) +
      (features.severeHeadache ? 0.15 : 0) +
      (features.blurredVision ? 0.2 : 0) +
      (features.swelling ? 0.1 : 0) +
      (oliguria ? 0.1 : 0) +
      (history.hypertension ? 0.1 : 0),
    0,
    1
  );

  const gdmReasons: string[] = [];
  if (features.bloodSugar != null && features.bloodSugar >= 126) {
    gdmReasons.push("Glucose ≥ 126 mg/dL");
  } else if (features.bloodSugar != null && features.bloodSugar >= 95) {
    gdmReasons.push("Glucose ≥ 95 mg/dL (fasting threshold)");
  }
  if (history.diabetes) gdmReasons.push("Pre-existing or family history of diabetes");
  const sugar = features.bloodSugar;
  const gdmProb = clamp(
    (sugar == null ? 0 : sugar >= 200 ? 0.9 : sugar >= 140 ? 0.7 : sugar >= 95 ? 0.4 : 0.05) +
      (history.diabetes ? 0.15 : 0),
    0,
    1
  );

  const ptReasons: string[] = [];
  if (features.abdominalPain) ptReasons.push("Abdominal pain / contractions");
  if (features.vaginalBleeding) ptReasons.push("Vaginal bleeding");
  if (weeks !== null && weeks < 37) ptReasons.push(`Gestational age ${weeks} weeks (< 37)`);
  const ptProb = clamp(
    (features.abdominalPain ? 0.35 : 0) +
      (features.vaginalBleeding ? 0.4 : 0) +
      (weeks !== null && weeks < 37 && (features.abdominalPain || features.vaginalBleeding) ? 0.25 : 0),
    0,
    1
  );

  const results: ComplicationScreen[] = [
    {
      type: "PRE_ECLAMPSIA",
      probability: preProb,
      triggered: preProb >= 0.45,
      reasons: preReasons,
    },
    {
      type: "GESTATIONAL_DIABETES",
      probability: gdmProb,
      triggered: gdmProb >= 0.5,
      reasons: gdmReasons,
    },
    {
      type: "PRETERM_LABOUR",
      probability: ptProb,
      triggered: ptProb >= 0.4 && weeks !== null && weeks < 37,
      reasons: ptReasons,
    },
  ];

  if (riskLevel === "LOW") {
    return results.map((r) => ({ ...r, triggered: false }));
  }
  return results;
}

function buildRecommendations(
  level: RiskLevel,
  features: RiskFeatures,
  complications: ComplicationScreen[],
  missingVitals: string[]
): RiskRecommendation {
  const tests: string[] = [];
  const actions: string[] = [];

  if (
    (features.systolicBp != null && features.systolicBp >= 130) ||
    (features.diastolicBp != null && features.diastolicBp >= 85)
  ) {
    tests.push("Repeat blood pressure (both arms, seated)");
    tests.push("Urine protein");
  }
  if (features.bloodSugar != null && features.bloodSugar >= 95) tests.push("Fasting blood glucose / OGTT");
  if (features.bodyTemperature != null && features.bodyTemperature >= 38) {
    tests.push("Full blood count and malaria screen");
  }
  if (features.lowFetalMovement) tests.push("Fetal heart rate / kick count review");
  if (level !== "LOW") tests.push("Haemoglobin");
  if (missingVitals.length) tests.push("Record missing vitals: " + missingVitals.join(", "));

  const pec = complications.find((c) => c.type === "PRE_ECLAMPSIA" && c.triggered);
  const gdm = complications.find((c) => c.type === "GESTATIONAL_DIABETES" && c.triggered);
  const pt = complications.find((c) => c.type === "PRETERM_LABOUR" && c.triggered);

  let urgency: RiskRecommendation["urgency"] = "monitor";
  if (
    features.vaginalBleeding ||
    features.lowFetalMovement ||
    (features.systolicBp != null && features.systolicBp >= 160) ||
    (features.severeHeadache && features.blurredVision)
  ) {
    urgency = "emergency";
    actions.push("Seek emergency obstetric care now — do not wait");
    actions.push("Go to a facility with emergency services (CEmONC if available)");
  } else if (level === "HIGH" || pec || pt) {
    urgency = "consult";
    actions.push("Contact your provider today for same-day review");
    actions.push("Do not remain alone; have a family member stay with you");
  } else if (level === "MEDIUM" || gdm) {
    urgency = "consult";
    actions.push("Book a clinic visit within 48 hours");
    actions.push("Continue daily symptom logging and rest");
  } else {
    actions.push("Continue routine antenatal visits");
    actions.push("Log symptoms if anything new appears");
    actions.push("Stay hydrated, rest, and keep kick counts after 28 weeks");
  }

  if (pec) actions.push("Pre-eclampsia pathway: BP monitoring and urine protein");
  if (gdm) actions.push("Diabetes pathway: dietary counselling and glucose monitoring");
  if (pt) actions.push("Preterm labour pathway: tocolysis assessment at a equipped facility");

  const carePlan =
    urgency === "emergency"
      ? "Emergency referral. Present to the nearest facility with emergency obstetric care immediately."
      : urgency === "consult"
        ? "Escalated antenatal review. A clinician should assess you within 24–48 hours."
        : "Routine surveillance. Keep logging symptoms and attending scheduled ANC visits.";

  return { tests: Array.from(new Set(tests)), actions: Array.from(new Set(actions)), carePlan, urgency };
}

export function extractFeaturesFromRecords(input: {
  age: number;
  symptoms: Array<{ symptomType: string; severity: number }>;
  tests: Array<{ testType: string; resultValue: number }>;
}): RiskFeatures {
  const latest = (type: string): number | null => {
    const match = input.tests.find((t) => t.testType.toLowerCase().includes(type.toLowerCase()));
    return match?.resultValue ?? null;
  };
  const has = (...labels: string[]) =>
    input.symptoms.some((s) =>
      labels.some((l) => s.symptomType.toLowerCase().includes(l.toLowerCase()) && s.severity >= 1)
    );
  const recordedTemp = latest("Temperature");
  const fever = input.symptoms.find(
    (s) => s.symptomType.toLowerCase().includes("fever") && s.severity >= 1
  );
  const bodyTemperature =
    recordedTemp ?? (fever ? (fever.severity >= 3 ? 38.5 : 38) : null);

  return {
    age: input.age,
    systolicBp: latest("Systolic"),
    diastolicBp: latest("Diastolic"),
    bloodSugar: latest("Glucose"),
    heartRate: latest("Heart Rate"),
    bodyTemperature,
    severeHeadache: has("Headache"),
    blurredVision: has("Vision"),
    swelling: has("Swelling"),
    vaginalBleeding: has("Bleeding"),
    abdominalPain: has("Abdominal"),
    dizziness: has("Dizziness"),
    lowFetalMovement: has("Fetal"),
    highStress: has("Stress"),
  };
}

export function assessRisk(features: RiskFeatures, context: Context = {}): RiskEngineResult {
  const { score, factors, missing, contributions } = featureContribution(features);
  applyHistoryFactors(factors, context);
  const adjustedScore = clamp(score + historyScoreBoost(context), 0, 1);
  const riskLevel = classify(adjustedScore, features);
  const map =
    features.systolicBp != null && features.diastolicBp != null
      ? meanArterialPressure(features.systolicBp, features.diastolicBp)
      : null;
  const bmi =
    context.heightCm && context.weightKg ? bodyMassIndex(context.weightKg, context.heightCm) : null;
  const weeks = context.lmp ? gestationalAgeWeeks(context.lmp) : null;

  if (bmi && bmi >= 30) factors.push(`BMI ${bmi.toFixed(1)} (obese)`);
  if (context.parity && context.parity >= 5) factors.push("Grand multiparity");
  if (weeks !== null && weeks < 37 && riskLevel !== "LOW") {
    factors.push(`Preterm gestational age (${weeks} weeks)`);
  }
  if (missing.length) factors.push(`Incomplete vitals: ${missing.join("; ")}`);

  const complications = screenComplications(features, context, riskLevel);

  if (
    features.vaginalBleeding ||
    features.lowFetalMovement ||
    (features.severeHeadache &&
      features.blurredVision &&
      features.systolicBp != null &&
      features.systolicBp >= 140)
  ) {
    complications.push({
      type: "EMERGENCY",
      probability: 0.9,
      triggered: true,
      reasons: ["Emergency danger signs present"],
    });
  }

  const uniqueFactors = Array.from(new Set(factors));
  const recommendations: RiskRecommendation = {
    ...buildRecommendations(riskLevel, features, complications, missing),
    complications,
    map: map ? Number(map.toFixed(1)) : null,
    bmi: bmi ? Number(bmi.toFixed(1)) : null,
    gestationalAgeWeeks: weeks,
    contributions,
    missingVitals: missing,
  };

  const urgentExtra = (context.otherSymptoms ?? []).some(
    (s) =>
      s.severity >= 3 &&
      /chest pain|shortness of breath|breathing/.test(s.symptomType.toLowerCase())
  );
  if (urgentExtra) {
    if (recommendations.urgency === "monitor") recommendations.urgency = "consult";
    recommendations.actions = Array.from(
      new Set(["Urgent review for chest pain or breathing difficulty", ...recommendations.actions])
    );
  }

  const emergencyTriggered = complications.some((c) => c.type === "EMERGENCY" && c.triggered);

  return {
    riskLevel,
    riskScore: Number(adjustedScore.toFixed(3)),
    riskFactors: uniqueFactors,
    assessmentSource: emergencyTriggered || riskLevel === "HIGH" ? "RULE_BASED" : "GUIDELINE_ENGINE",
    complications,
    recommendations,
    map: map ? Number(map.toFixed(1)) : null,
    bmi: bmi ? Number(bmi.toFixed(1)) : null,
    gestationalAgeWeeks: weeks,
    contributions,
    missingVitals: missing,
  };
}

export function complicationToAlertType(type: AlertType): AlertType {
  return type;
}
