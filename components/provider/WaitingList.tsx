"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar } from "@/components/shared/Avatar";
import { EmptyState } from "@/components/shared/EmptyState";
import type { RiskLevel } from "@/types";

export type WaitingRow = {
  id: string;
  name: string;
  email: string;
  facilityName: string | null;
  risk: RiskLevel | string;
  score: number;
  alerts: number;
};

export function WaitingList({
  facilityName,
  patients,
}: {
  facilityName: string | null;
  patients: WaitingRow[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function claim(patientId: string) {
    setError("");
    setBusyId(patientId);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not add this mother.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not add this mother.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card>
      <p className="font-heading text-xs font-semibold uppercase tracking-[0.18em] text-sage">
        Facility waiting list
      </p>
      <h2 className="mt-1 font-heading text-xl text-navy">
        {facilityName ? `${facilityName}` : "Unassigned mothers"}
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        Mothers who booked this clinic and do not yet have a named clinician. Add one to your caseload
        to open the chart and receive alerts.
      </p>
      {error && (
        <p className="mt-3 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger-ink" role="alert">
          {error}
        </p>
      )}
      {patients.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="Waiting list is clear"
            description={
              facilityName
                ? `No unassigned mothers at ${facilityName}. New registrations at this clinic will appear here.`
                : "Join a facility to see mothers waiting for a named clinician."
            }
          />
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-line">
          {patients.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={p.name} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-navy">{p.name}</p>
                  <p className="text-caption text-ink-muted">{p.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge value={p.risk} />
                <Button
                  type="button"
                  size="sm"
                  loading={busyId === p.id}
                  disabled={busyId !== null && busyId !== p.id}
                  onClick={() => claim(p.id)}
                >
                  Add to my caseload
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
