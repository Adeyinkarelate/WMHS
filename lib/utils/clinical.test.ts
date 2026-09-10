import { describe, expect, it } from "vitest";
import { calculateEdd, gestationalAgeWeeks, meanArterialPressure } from "@/lib/utils/clinical";
import { buildAncSchedule, nextAncVisit } from "@/lib/utils/anc";

describe("clinical helpers", () => {
  it("applies Naegele's rule", () => {
    const lmp = new Date(Date.UTC(2026, 0, 15, 12, 0, 0));
    const edd = calculateEdd(lmp);
    expect(edd.getUTCFullYear()).toBe(2026);
    expect(edd.getUTCMonth()).toBe(9);
    expect(edd.getUTCDate()).toBe(22);
  });

  it("computes MAP", () => {
    expect(meanArterialPressure(140, 90)).toBeCloseTo(106.67, 1);
  });

  it("counts gestational weeks from LMP", () => {
    const lmp = new Date("2026-01-01T12:00:00Z");
    const on = new Date("2026-04-16T12:00:00Z");
    expect(gestationalAgeWeeks(lmp, on)).toBe(15);
  });
});

describe("ANC schedule", () => {
  it("builds eight WHO contacts from LMP", () => {
    const lmp = new Date("2026-01-15T12:00:00Z");
    const visits = buildAncSchedule(lmp, new Date("2026-09-01T12:00:00Z"));
    expect(visits).toHaveLength(8);
    expect(nextAncVisit(visits)?.contact).toBeGreaterThan(0);
  });

  it("returns empty without an LMP", () => {
    expect(buildAncSchedule(null)).toEqual([]);
  });
});
