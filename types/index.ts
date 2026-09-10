export type Role = "PATIENT" | "PROVIDER" | "ADMIN";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type AssessmentSource = "GUIDELINE_ENGINE" | "RULE_BASED" | "AI_MODEL";
export type ReferralStatus = "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED";
export type AlertType =
  | "PRE_ECLAMPSIA"
  | "GESTATIONAL_DIABETES"
  | "PRETERM_LABOUR"
  | "EMERGENCY"
  | "ABNORMAL_VITAL"
  | "ANAEMIA"
  | "PROTEINURIA"
  | "CLINICAL";
export type AlertSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type AlertStatus = "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
export type AlertSource = "RISK_ENGINE" | "VITAL" | "MANUAL";
export type NotificationType = "ALERT" | "REFERRAL" | "INFO";

export type RiskFeatures = {
  age: number;
  systolicBp: number | null;
  diastolicBp: number | null;
  bloodSugar: number | null;
  heartRate: number | null;
  bodyTemperature: number | null;
  severeHeadache: boolean;
  blurredVision: boolean;
  swelling: boolean;
  vaginalBleeding: boolean;
  abdominalPain: boolean;
  dizziness: boolean;
  lowFetalMovement: boolean;
  highStress: boolean;
};

export type FeatureContribution = {
  key: string;
  label: string;
  weight: number;
  contribution: number;
  recorded: boolean;
};

export type ComplicationScreen = {
  type: AlertType;
  probability: number;
  triggered: boolean;
  reasons: string[];
};

export type RiskRecommendation = {
  tests: string[];
  actions: string[];
  carePlan: string;
  urgency: "monitor" | "consult" | "emergency";
  complications?: ComplicationScreen[];
  map?: number | null;
  bmi?: number | null;
  gestationalAgeWeeks?: number | null;
  contributions?: FeatureContribution[];
  missingVitals?: string[];
};

export type RiskEngineResult = {
  riskLevel: RiskLevel;
  riskScore: number;
  riskFactors: string[];
  assessmentSource: AssessmentSource;
  complications: ComplicationScreen[];
  recommendations: RiskRecommendation;
  map: number | null;
  bmi: number | null;
  gestationalAgeWeeks: number | null;
  contributions: FeatureContribution[];
  missingVitals: string[];
};

export const SYMPTOM_TYPES = [
  "Severe Headache",
  "Blurred Vision",
  "Swelling",
  "Vaginal Bleeding",
  "Abdominal Pain",
  "Dizziness",
  "Low Fetal Movement",
  "High Stress",
  "Nausea / Vomiting",
  "Fever",
  "Reduced Urine Output",
  "Chest Pain",
  "Shortness of Breath",
  "Other",
] as const;

export const TEST_TYPES = [
  { value: "Blood Pressure Systolic", unit: "mmHg" },
  { value: "Blood Pressure Diastolic", unit: "mmHg" },
  { value: "Blood Glucose", unit: "mg/dL" },
  { value: "Haemoglobin", unit: "g/dL" },
  { value: "Urine Protein", unit: "+" },
  { value: "Heart Rate", unit: "bpm" },
  { value: "Body Temperature", unit: "°C" },
  { value: "Weight", unit: "kg" },
] as const;
