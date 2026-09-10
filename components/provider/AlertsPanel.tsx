"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AlertBanner } from "@/components/shared/AlertBanner";
import { formatDateTime } from "@/lib/utils/formatters";
import { alertSourceLabel, alertTypeLabel, isStaleCritical } from "@/lib/alerts/labels";

type AlertRow = {
  id: string;
  alertType: string;
  severity: string;
  status: string;
  source?: string;
  notes: string;
  alertedAt: string | Date;
  escalatedAt?: string | Date | null;
  patient: { id: string; user: { name: string } };
};

const severityRank: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

export function AlertsPanel({ alerts }: { alerts: AlertRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [severity, setSeverity] = useState("ALL");

  const rows = useMemo(() => {
    return alerts
      .filter((a) => {
        if (status === "OPEN") return a.status === "ACTIVE" || a.status === "ACKNOWLEDGED";
        if (status !== "ALL") return a.status === status;
        return true;
      })
      .filter((a) => (severity === "ALL" ? true : a.severity === severity))
      .sort((a, b) => {
        const rank = (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9);
        if (rank !== 0) return rank;
        return new Date(b.alertedAt).getTime() - new Date(a.alertedAt).getTime();
      });
  }, [alerts, status, severity]);

  const staleCount = rows.filter((a) =>
    isStaleCritical({
      severity: a.severity,
      status: a.status,
      alertedAt: new Date(a.alertedAt),
      escalatedAt: a.escalatedAt ? new Date(a.escalatedAt) : null,
    })
  ).length;

  async function setAlertStatus(id: string, next: "ACKNOWLEDGED" | "RESOLVED") {
    setBusy(id);
    setError("");
    try {
      const res = await fetch("/api/providers/alerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      if (!res.ok) {
        setError("Could not update that alert. Try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not update that alert. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: "OPEN", label: "Open (active + acknowledged)" },
            { value: "ACTIVE", label: "Active" },
            { value: "ACKNOWLEDGED", label: "Acknowledged" },
            { value: "RESOLVED", label: "Resolved" },
            { value: "ALL", label: "All" },
          ]}
        />
        <Select
          label="Severity"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          options={[
            { value: "ALL", label: "All severities" },
            { value: "CRITICAL", label: "Critical" },
            { value: "HIGH", label: "High" },
            { value: "MEDIUM", label: "Medium" },
            { value: "LOW", label: "Low" },
          ]}
        />
      </div>
      {staleCount > 0 && (
        <AlertBanner title={`${staleCount} critical alert${staleCount === 1 ? "" : "s"} unacknowledged for over 2 hours`} tone="danger">
          Acknowledge or resolve these first. Assigned clinicians have been re-notified.
        </AlertBanner>
      )}
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-line bg-white px-5 py-8 text-sm text-ink-muted">
          No alerts match this filter.
        </p>
      ) : (
        rows.map((a) => {
          const stale = isStaleCritical({
            severity: a.severity,
            status: a.status,
            alertedAt: new Date(a.alertedAt),
            escalatedAt: a.escalatedAt ? new Date(a.escalatedAt) : null,
          });
          return (
            <article
              key={a.id}
              className={`rounded-2xl border bg-white p-5 shadow-card ${
                a.severity === "CRITICAL" && a.status === "ACTIVE"
                  ? "border-danger/30"
                  : "border-line"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={`/provider/patients/${a.patient.id}`} className="font-semibold text-navy">
                    {a.patient.user.name}
                  </Link>
                  <p className="mt-1 text-sm">
                    {alertTypeLabel(a.alertType)} · {formatDateTime(a.alertedAt)}
                  </p>
                  {a.notes && <p className="mt-1 text-caption text-ink-muted">{a.notes}</p>}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusBadge value={a.severity} />
                    <StatusBadge value={a.status} />
                    {stale && <StatusBadge value="ESCALATED" />}
                    {a.source && (
                      <span className="text-caption text-ink-muted">{alertSourceLabel(a.source)}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {a.status === "ACTIVE" && (
                    <Button
                      size="sm"
                      variant="outline"
                      loading={busy === a.id}
                      onClick={() => setAlertStatus(a.id, "ACKNOWLEDGED")}
                    >
                      Acknowledge
                    </Button>
                  )}
                  {a.status !== "RESOLVED" && (
                    <Button size="sm" loading={busy === a.id} onClick={() => setAlertStatus(a.id, "RESOLVED")}>
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}
