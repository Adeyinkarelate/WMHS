import { describe, expect, it } from "vitest";
import {
  OBSTETRIC_HISTORY_OPTIONS,
  obstetricHistoryFactors,
  obstetricHistoryFlags,
} from "@/lib/clinical/history";

describe("obstetric history", () => {
  it("maps every listed option onto at least one flag", () => {
    for (const option of OBSTETRIC_HISTORY_OPTIONS) {
      const flags = obstetricHistoryFlags([option.value]);
      expect(Object.values(flags).some(Boolean)).toBe(true);
    }
  });

  it("does not treat gestational diabetes as pre-existing diabetes", () => {
    const flags = obstetricHistoryFlags(["Previous gestational diabetes"]);
    expect(flags.previousGdm).toBe(true);
    expect(flags.diabetes).toBe(false);
    expect(obstetricHistoryFactors(flags).join(" ")).not.toMatch(/pre-existing/i);
  });

  it("keeps both GDM and pre-existing diabetes when both are documented", () => {
    const flags = obstetricHistoryFlags(["Previous gestational diabetes", "Diabetes"]);
    expect(flags.previousGdm).toBe(true);
    expect(flags.diabetes).toBe(true);
  });

  it("labels hypertension as hypertension, not pre-eclampsia", () => {
    expect(obstetricHistoryFactors(obstetricHistoryFlags(["Hypertension"]))).toEqual([
      "History of hypertension",
    ]);
  });
});
