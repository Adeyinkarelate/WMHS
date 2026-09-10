import { gestationalAgeWeeks } from "@/lib/utils/clinical";

/** WHO eight-contact ANC model, timed from LMP. */
export const WHO_ANC_CONTACTS: Array<{ contact: number; week: number; title: string }> = [
  { contact: 1, week: 12, title: "Booking visit" },
  { contact: 2, week: 20, title: "Anatomy / mid-pregnancy" },
  { contact: 3, week: 26, title: "Third-trimester start" },
  { contact: 4, week: 30, title: "30-week contact" },
  { contact: 5, week: 34, title: "34-week contact" },
  { contact: 6, week: 36, title: "36-week contact" },
  { contact: 7, week: 38, title: "38-week contact" },
  { contact: 8, week: 40, title: "Term / delivery planning" },
];

export type AncVisitStatus = "COMPLETED" | "DUE" | "UPCOMING" | "OVERDUE";

export type AncVisit = {
  contact: number;
  week: number;
  title: string;
  dueDate: Date;
  status: AncVisitStatus;
};

export function ancDueDate(lmp: Date, week: number): Date {
  return new Date(lmp.getTime() + week * 7 * 24 * 60 * 60 * 1000);
}

export function buildAncSchedule(lmp: Date | null | undefined, on: Date = new Date()): AncVisit[] {
  if (!lmp) return [];
  const ga = gestationalAgeWeeks(lmp, on);
  const todayStart = Date.UTC(on.getUTCFullYear(), on.getUTCMonth(), on.getUTCDate());

  return WHO_ANC_CONTACTS.map((row) => {
    const dueDate = ancDueDate(lmp, row.week);
    const dueStart = Date.UTC(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate());
    let status: AncVisitStatus = "UPCOMING";
    if (ga > row.week + 1) status = "COMPLETED";
    else if (dueStart < todayStart && ga >= row.week) status = "OVERDUE";
    else if (Math.abs(ga - row.week) <= 1) status = "DUE";
    return { ...row, dueDate, status };
  });
}

export function nextAncVisit(visits: AncVisit[]): AncVisit | null {
  return visits.find((v) => v.status === "OVERDUE" || v.status === "DUE" || v.status === "UPCOMING") ?? null;
}
