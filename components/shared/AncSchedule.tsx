"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils/formatters";
import { nextAncVisit, type AncVisit } from "@/lib/utils/anc";

type VisitRow = Omit<AncVisit, "dueDate" | "attendedAt"> & {
  dueDate: Date | string;
  attendedAt?: Date | string | null;
};

export function AncSchedule({
  visits,
  patientId,
  canEdit = false,
}: {
  visits: VisitRow[];
  patientId?: string;
  canEdit?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");

  if (visits.length === 0) {
    return (
      <Card>
        <CardTitle className="text-xl">ANC contacts</CardTitle>
        <p className="mt-3 text-sm text-ink-muted">
          Add a last menstrual period on the profile to generate the WHO eight-contact schedule.
        </p>
      </Card>
    );
  }

  const next = nextAncVisit(visits as AncVisit[]);
  const done = visits.filter((v) => v.status === "COMPLETED").length;

  async function setAttendance(contact: number, attended: boolean) {
    if (!patientId) return;
    setBusy(contact);
    setError("");
    try {
      const res = await fetch(`/api/patients/${patientId}/anc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, attended }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not update that contact.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not update that contact.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardTitle className="text-xl">ANC contacts</CardTitle>
      <p className="mt-1 text-sm text-ink-muted">
        WHO eight-contact model from the last menstrual period. {done} of 8 attended
        {canEdit ? " — tick a visit when it happens so overdue contacts stay visible." : "."}
      </p>
      {next && (
        <p className="mt-3 rounded-xl bg-sage-light px-3 py-2 text-sm text-navy">
          Next: {next.title} · {formatDate(next.dueDate)} · week {next.week}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger-ink" role="alert">
          {error}
        </p>
      )}
      <ol className="mt-4 space-y-2">
        {visits.map((visit) => (
          <li
            key={visit.contact}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 py-2 last:border-0 last:pb-0"
          >
            <span className="min-w-0 text-sm">
              <span className="font-heading font-semibold text-navy">{visit.contact}.</span> {visit.title}
              <span className="text-ink-muted"> · {formatDate(visit.dueDate)}</span>
              {visit.attendedAt ? (
                <span className="block text-caption text-ink-muted">Attended {formatDate(visit.attendedAt)}</span>
              ) : null}
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <StatusBadge value={visit.status} />
              {canEdit && patientId ? (
                visit.status === "COMPLETED" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    loading={busy === visit.contact}
                    onClick={() => setAttendance(visit.contact, false)}
                  >
                    Undo
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={busy === visit.contact}
                    onClick={() => setAttendance(visit.contact, true)}
                  >
                    Mark attended
                  </Button>
                )
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
