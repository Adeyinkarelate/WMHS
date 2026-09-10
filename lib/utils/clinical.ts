/** Naegele's Rule: EDD = LMP + 7 days − 3 months + 1 year (280-day pregnancy). */
export function calculateEdd(lmp: Date): Date {
  const edd = new Date(lmp.getTime());
  edd.setUTCDate(edd.getUTCDate() + 7);
  edd.setUTCMonth(edd.getUTCMonth() - 3);
  edd.setUTCFullYear(edd.getUTCFullYear() + 1);
  return edd;
}

export function gestationalAgeWeeks(lmp: Date, on: Date = new Date()): number {
  const ms = on.getTime() - lmp.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24 * 7)));
}

export function gestationalAgeLabel(lmp: Date | null | undefined, on: Date = new Date()): string {
  if (!lmp) return "Not set";
  const weeks = gestationalAgeWeeks(lmp, on);
  const days = Math.floor(((on.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24)) % 7);
  if (weeks === 0 && days === 0) return "Day 0";
  return `${weeks}w + ${days}d`;
}

/** Mean Arterial Pressure. MAP ≥ 90 in the second trimester indicates increased risk. */
export function meanArterialPressure(sbp: number, dbp: number): number {
  return (sbp + 2 * dbp) / 3;
}

/** WHO BMI: weight (kg) / height (m)² */
export function bodyMassIndex(weightKg: number, heightCm: number): number {
  const metres = heightCm / 100;
  if (metres <= 0) return 0;
  return weightKg / (metres * metres);
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function yearsBetween(from: Date, to: Date = new Date()): number {
  const diff = to.getTime() - from.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export function isPostpartum(edd: Date | null | undefined, on: Date = new Date()): boolean {
  if (!edd) return false;
  return on.getTime() > edd.getTime();
}

export function trimester(weeks: number): "First" | "Second" | "Third" | "Post-term" {
  if (weeks < 14) return "First";
  if (weeks < 28) return "Second";
  if (weeks < 42) return "Third";
  return "Post-term";
}
