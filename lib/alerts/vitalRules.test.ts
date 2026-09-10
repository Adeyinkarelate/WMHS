import { describe, expect, it } from "vitest";
import { detectVitalAlerts } from "@/lib/alerts/vitalRules";

describe("detectVitalAlerts", () => {
  it("returns nothing when no tests are present", () => {
    expect(detectVitalAlerts([])).toEqual([]);
  });

  it("marks severe hypertension as a critical vital alert", () => {
    const hits = detectVitalAlerts([
      { testType: "Blood Pressure Systolic", resultValue: 168 },
      { testType: "Blood Pressure Diastolic", resultValue: 112 },
    ]);
    const vital = hits.find((h) => h.alertType === "ABNORMAL_VITAL");
    expect(vital?.severity).toBe("CRITICAL");
  });

  it("flags WHO severe anaemia", () => {
    const hits = detectVitalAlerts([{ testType: "Haemoglobin", resultValue: 6.4 }]);
    expect(hits[0]).toMatchObject({ alertType: "ANAEMIA", severity: "CRITICAL" });
  });

  it("flags significant proteinuria", () => {
    const hits = detectVitalAlerts([{ testType: "Urine Protein", resultValue: 2 }]);
    expect(hits[0]).toMatchObject({ alertType: "PROTEINURIA", severity: "HIGH" });
  });
});
