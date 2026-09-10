import { Card, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils/formatters";
import { nextAncVisit, type AncVisit } from "@/lib/utils/anc";

export function AncSchedule({ visits }: { visits: AncVisit[] }) {
  if (visits.length === 0) {
    return (
      <Card>
        <CardTitle className="text-xl">ANC contacts</CardTitle>
        <p className="mt-3 text-sm text-ink-muted">
          Add a last menstrual period on your profile to generate the WHO eight-contact schedule.
        </p>
      </Card>
    );
  }

  const next = nextAncVisit(visits);
  const done = visits.filter((v) => v.status === "COMPLETED").length;

  return (
    <Card>
      <CardTitle className="text-xl">ANC contacts</CardTitle>
      <p className="mt-1 text-sm text-ink-muted">
        WHO eight-contact model from your LMP. {done} of 8 timed contacts passed.
      </p>
      {next && (
        <p className="mt-3 rounded-xl bg-sage-light px-3 py-2 text-sm text-navy">
          Next: {next.title} · {formatDate(next.dueDate)} · week {next.week}
        </p>
      )}
      <ol className="mt-4 space-y-2">
        {visits.map((visit) => (
          <li key={visit.contact} className="flex items-center justify-between gap-3 text-sm">
            <span>
              <span className="font-heading font-semibold text-navy">{visit.contact}.</span>{" "}
              {visit.title}
              <span className="text-ink-muted"> · {formatDate(visit.dueDate)}</span>
            </span>
            <StatusBadge value={visit.status} />
          </li>
        ))}
      </ol>
    </Card>
  );
}
