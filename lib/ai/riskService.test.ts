import { describe, expect, it } from "vitest";
import { assessRisk, extractFeaturesFromRecords } from "@/lib/ai/riskService";
import type { RiskFeatures } from "@/types";

const baseline: RiskFeatures = {
  age: 28,
  systolicBp: 110,
  diastolicBp: 70,
  bloodSugar: 88,
  heartRate: 78,
  bodyTemperature: 36.7,
  severeHeadache: false,
  blurredVision: false,
  swelling: false,
  vaginalBleeding: false,
  abdominalPain: false,
  dizziness: false,
  lowFetalMovement: false,
  highStress: false,
};

describe("assessRisk", () => {
  it("scores a well mother with complete vitals as LOW", () => {
    const result = assessRisk(baseline);
    expect(result.riskLevel).toBe("LOW");
    expect(result.missingVitals).toEqual([]);
    expect(result.assessmentSource).toBe("GUIDELINE_ENGINE");
  });

  it("does not treat missing blood pressure as normal", () => {
    const result = assessRisk({
      ...baseline,
      systolicBp: null,
      diastolicBp: null,
    });
    expect(result.missingVitals).toEqual(
      expect.arrayContaining(["Systolic BP not recorded", "Diastolic BP not recorded"])
    );
    const sbp = result.contributions.find((c) => c.key === "systolicBp");
    expect(sbp?.recorded).toBe(false);
    expect(sbp?.contribution).toBe(0);
  });

  it("flags emergency danger signs as HIGH with a rule-based screen", () => {
    const result = assessRisk({
      ...baseline,
      systolicBp: 168,
      diastolicBp: 112,
      severeHeadache: true,
      blurredVision: true,
    });
    expect(result.riskLevel).toBe("HIGH");
    expect(result.assessmentSource).toBe("RULE_BASED");
    expect(result.complications.some((c) => c.type === "EMERGENCY" && c.triggered)).toBe(true);
    expect(result.recommendations.urgency).toBe("emergency");
  });

  it("opens a pre-eclampsia screen on high BP with headache and oedema", () => {
    const result = assessRisk(
      {
        ...baseline,
        systolicBp: 148,
        diastolicBp: 96,
        severeHeadache: true,
        blurredVision: true,
        swelling: true,
      },
      { lmp: new Date(Date.now() - 32 * 7 * 24 * 60 * 60 * 1000) }
    );
    expect(result.riskLevel).toBe("HIGH");
    const pec = result.complications.find((c) => c.type === "PRE_ECLAMPSIA");
    expect(pec?.triggered).toBe(true);
  });

  it("treats hypertensive BP with headache or oedema as HIGH so screens can open", () => {
    const result = assessRisk({
      ...baseline,
      systolicBp: 148,
      diastolicBp: 96,
      severeHeadache: true,
      swelling: true,
    });
    expect(result.riskLevel).toBe("HIGH");
    expect(result.complications.find((c) => c.type === "PRE_ECLAMPSIA")?.triggered).toBe(true);
  });

  it("does not score elevated glucose as LOW", () => {
    const result = assessRisk({ ...baseline, bloodSugar: 168 });
    expect(result.riskLevel).toBe("MEDIUM");
    expect(result.complications.find((c) => c.type === "GESTATIONAL_DIABETES")?.triggered).toBe(true);
  });

  it("raises risk when a documented hypertensive history is present", () => {
    const withHistory = assessRisk(baseline, {
      preExistingConditions: ["Previous gestational hypertension"],
    });
    const without = assessRisk(baseline);
    expect(withHistory.riskScore).toBeGreaterThan(without.riskScore);
    expect(withHistory.riskFactors.join(" ")).toMatch(/hypertension/i);
  });
});

describe("extractFeaturesFromRecords", () => {
  it("returns null for vitals that were never logged", () => {
    const features = extractFeaturesFromRecords({
      age: 30,
      symptoms: [{ symptomType: "Severe Headache", severity: 3 }],
      tests: [],
    });
    expect(features.systolicBp).toBeNull();
    expect(features.bloodSugar).toBeNull();
    expect(features.severeHeadache).toBe(true);
  });

  it("counts a mild logged danger sign instead of ignoring severity 1", () => {
    const features = extractFeaturesFromRecords({
      age: 30,
      symptoms: [{ symptomType: "Vaginal Bleeding", severity: 1 }],
      tests: [],
    });
    expect(features.vaginalBleeding).toBe(true);
  });

  it("infers fever from a Fever symptom when temperature was not recorded", () => {
    const features = extractFeaturesFromRecords({
      age: 30,
      symptoms: [{ symptomType: "Fever", severity: 2 }],
      tests: [],
    });
    expect(features.bodyTemperature).toBe(38);
  });

  it("does not override a recorded temperature with a Fever symptom", () => {
    const features = extractFeaturesFromRecords({
      age: 30,
      symptoms: [{ symptomType: "Fever", severity: 4 }],
      tests: [{ testType: "Body Temperature", resultValue: 37.2 }],
    });
    expect(features.bodyTemperature).toBe(37.2);
  });

  it("uses the latest matching test type", () => {
    const features = extractFeaturesFromRecords({
      age: 30,
      symptoms: [],
      tests: [
        { testType: "Blood Pressure Systolic", resultValue: 142 },
        { testType: "Blood Pressure Diastolic", resultValue: 91 },
      ],
    });
    expect(features.systolicBp).toBe(142);
    expect(features.diastolicBp).toBe(91);
  });
});
