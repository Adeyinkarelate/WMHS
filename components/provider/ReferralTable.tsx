"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime } from "@/lib/utils/formatters";
import type { ReferralStatus } from "@/types";

type Row = {
  id: string;
  reason: string;
  status: ReferralStatus | string;
  referredAt: string | Date;
  transportNotes: string;
  facility: { name: string; contactPhone: string };
  patient: { user: { name: string } };
};

export function ReferralTable({ referrals }: { referrals: Row[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function update(id: string, status: ReferralStatus) {
    setBusy(id);
    setError("");
    try {
      const res = await fetch(`/api/referrals/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not update that referral.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not update that referral.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger-ink" role="alert">
          {error}
        </p>
      )}
      {referrals.map((r) => (
        <article key={r.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-navy">{r.patient.user.name}</p>
              <p className="text-sm">
                {r.facility.name} · {r.facility.contactPhone}
              </p>
              <p className="mt-1 text-caption text-ink-muted">
                {r.reason} · {formatDateTime(r.referredAt)}
              </p>
              {r.transportNotes && <p className="text-caption">{r.transportNotes}</p>}
              <div className="mt-2">
                <StatusBadge value={r.status} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {r.status === "PENDING" && (
                <Button size="sm" loading={busy === r.id} onClick={() => update(r.id, "APPROVED")}>
                  Approve
                </Button>
              )}
              {r.status === "APPROVED" && (
                <Button size="sm" loading={busy === r.id} onClick={() => update(r.id, "COMPLETED")}>
                  Mark complete
                </Button>
              )}
              {r.status !== "CANCELLED" && r.status !== "COMPLETED" && (
                <Button
                  size="sm"
                  variant="outline"
                  loading={busy === r.id}
                  onClick={() => update(r.id, "CANCELLED")}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
