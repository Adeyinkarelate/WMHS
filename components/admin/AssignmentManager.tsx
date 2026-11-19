"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/shared/Avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";

export type AssignmentRow = {
  patientId: string;
  name: string;
  email: string;
  bookedFacility: string | null;
  risk: string;
  clinicianId: string | null;
  clinicianName: string | null;
  clinicianFacility: string | null;
};

export type ClinicianOption = { id: string; name: string; facility: string | null };

export function AssignmentManager({
  rows,
  clinicians,
}: {
  rows: AssignmentRow[];
  clinicians: ClinicianOption[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [view, setView] = useState("ALL");
  const [choice, setChoice] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      const matchQ = !term || r.name.toLowerCase().includes(term) || r.email.toLowerCase().includes(term);
      const matchView =
        view === "ALL" || (view === "UNASSIGNED" ? !r.clinicianName : Boolean(r.clinicianName));
      return matchQ && matchView;
    });
  }, [rows, q, view]);

  async function call(path: string, row: AssignmentRow, body: object, success: string) {
    setBusy(row.patientId);
    setError("");
    setNotice("");
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "That change could not be saved.");
        return;
      }
      setNotice(success);
      setChoice((prev) => ({ ...prev, [row.patientId]: "" }));
      router.refresh();
    } catch {
      setError("That change could not be saved.");
    } finally {
      setBusy(null);
    }
  }

  function assign(row: AssignmentRow) {
    const providerId = choice[row.patientId];
    if (!providerId) return;
    const clinician = clinicians.find((c) => c.id === providerId);
    if (row.clinicianName) {
      const ok = window.confirm(
        `Move ${row.name} from ${row.clinicianName} to ${clinician?.name}? ${row.clinicianName} will lose access to her record.`
      );
      if (!ok) return;
    }
    void call(
      "/api/admin/assignments",
      row,
      { patientId: row.patientId, providerId },
      `${row.name} is now assigned to ${clinician?.name}.`
    );
  }

  function release(row: AssignmentRow) {
    const ok = window.confirm(
      `Release ${row.name} from ${row.clinicianName}? She returns to the facility waiting list and ${row.clinicianName} loses access.`
    );
    if (ok) {
      void call("/api/admin/assignments/release", row, { patientId: row.patientId }, `${row.name} is back on the waiting list.`);
    }
  }

  return (
    <div className="space-y-4">
      {notice && (
        <p className="rounded-xl bg-success-soft px-3 py-2 text-sm text-success-ink" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger-ink" role="alert">
          {error}
        </p>
      )}
      <Card>
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <Input label="Search mothers" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or email" />
          <Select
            label="Show"
            value={view}
            onChange={(e) => setView(e.target.value)}
            options={[
              { value: "ALL", label: "All mothers" },
              { value: "UNASSIGNED", label: "Waiting for a clinician" },
              { value: "ASSIGNED", label: "With a clinician" },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-caption uppercase text-ink-muted">
                <th className="py-2 pr-4 font-semibold">Mother</th>
                <th className="py-2 pr-4 font-semibold">Risk</th>
                <th className="py-2 pr-4 font-semibold">Named clinician</th>
                <th className="py-2 font-semibold">Assign</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-ink-muted">
                    No mothers match this view.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.patientId} className="border-b border-line align-middle last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.name} size="sm" />
                        <span>
                          <span className="block font-semibold text-navy">{r.name}</span>
                          <span className="block text-caption text-ink-muted">
                            {r.bookedFacility ? `Booked at ${r.bookedFacility}` : "No clinic booked"}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge value={r.risk} />
                    </td>
                    <td className="py-3 pr-4">
                      {r.clinicianName ? (
                        <span>
                          <span className="block font-semibold text-navy">{r.clinicianName}</span>
                          {r.clinicianFacility && (
                            <span className="block text-caption text-ink-muted">{r.clinicianFacility}</span>
                          )}
                        </span>
                      ) : (
                        <Badge tone="warning">Waiting</Badge>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          aria-label={`Clinician for ${r.name}`}
                          value={choice[r.patientId] ?? ""}
                          disabled={busy === r.patientId || clinicians.length === 0}
                          onChange={(e) => setChoice((prev) => ({ ...prev, [r.patientId]: e.target.value }))}
                          className="h-10 max-w-[14rem] rounded-xl border border-line bg-white px-3 text-sm text-ink shadow-sm"
                        >
                          <option value="">{r.clinicianName ? "Move to…" : "Choose clinician…"}</option>
                          {clinicians
                            .filter((c) => c.id !== r.clinicianId)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                                {c.facility ? ` · ${c.facility}` : ""}
                              </option>
                            ))}
                        </select>
                        <Button
                          type="button"
                          size="sm"
                          loading={busy === r.patientId}
                          disabled={!choice[r.patientId]}
                          onClick={() => assign(r)}
                        >
                          {r.clinicianName ? "Move" : "Assign"}
                        </Button>
                        {r.clinicianName && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={busy === r.patientId}
                            onClick={() => release(r)}
                          >
                            Release
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
