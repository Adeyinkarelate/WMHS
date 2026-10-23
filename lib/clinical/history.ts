export const OBSTETRIC_HISTORY_OPTIONS = [
  { value: "Previous caesarean section", label: "Previous caesarean section" },
  { value: "Previous stillbirth", label: "Previous stillbirth" },
  { value: "Previous pre-eclampsia", label: "Previous pre-eclampsia" },
  { value: "Previous gestational diabetes", label: "Previous gestational diabetes" },
  { value: "Multiple pregnancy (twins+)", label: "This pregnancy is twins or more" },
  { value: "HIV positive", label: "Known HIV positive" },
  { value: "Hypertension", label: "Chronic hypertension" },
  { value: "Diabetes", label: "Pre-existing diabetes" },
  { value: "Sickle cell disease", label: "Sickle cell disease" },
] as const;

export type ObstetricHistoryFlag = {
  previousCs: boolean;
  previousStillbirth: boolean;
  previousPreEclampsia: boolean;
  previousGdm: boolean;
  multiplePregnancy: boolean;
  hivPositive: boolean;
  hypertension: boolean;
  diabetes: boolean;
  sickle: boolean;
};

export function obstetricHistoryFlags(conditions: string[] | undefined): ObstetricHistoryFlag {
  const hay = (conditions ?? []).join(" ").toLowerCase();
  return {
    previousCs: /caesarean|cesarean|\bcs\b|c-section/.test(hay),
    previousStillbirth: /stillbirth|still birth|intrauterine death|\biud\b/.test(hay),
    previousPreEclampsia: /pre-?eclamp|\bpet\b/.test(hay),
    previousGdm: /gestational diabet|gdm/.test(hay),
    multiplePregnancy: /twin|triplet|multiple pregnancy/.test(hay),
    hivPositive: /\bhiv\b/.test(hay),
    hypertension: /hypertens/.test(hay),
    diabetes: /diabet/.test(
      hay.replace(/gestational diabet(?:es)?/g, "").replace(/\bgdm\b/g, "")
    ),
    sickle: /sickle/.test(hay),
  };
}

export function obstetricHistoryBoost(flags: ObstetricHistoryFlag): number {
  return (
    (flags.previousCs ? 0.04 : 0) +
    (flags.previousStillbirth ? 0.08 : 0) +
    (flags.previousPreEclampsia ? 0.04 : 0) +
    (flags.previousGdm ? 0.03 : 0) +
    (flags.multiplePregnancy ? 0.06 : 0) +
    (flags.hivPositive ? 0.05 : 0) +
    (flags.hypertension ? 0.08 : 0) +
    (flags.diabetes ? 0.06 : 0) +
    (flags.sickle ? 0.05 : 0)
  );
}

export function obstetricHistoryFactors(flags: ObstetricHistoryFlag): string[] {
  const factors: string[] = [];
  if (flags.previousCs) factors.push("Previous caesarean section");
  if (flags.previousStillbirth) factors.push("Previous stillbirth");
  if (flags.previousPreEclampsia) factors.push("History of pre-eclampsia");
  if (flags.previousGdm) factors.push("Previous gestational diabetes");
  if (flags.multiplePregnancy) factors.push("Multiple pregnancy");
  if (flags.hivPositive) factors.push("Known HIV positive — PMTCT pathway");
  if (flags.hypertension) factors.push("History of hypertension");
  if (flags.diabetes) factors.push("Pre-existing or family history of diabetes");
  if (flags.sickle) factors.push("Sickle cell disease");
  return factors;
}
