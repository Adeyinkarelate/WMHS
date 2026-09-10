"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDistance } from "@/lib/utils/haversine";

type Facility = {
  id: string;
  name: string;
  address: string;
  contactPhone: string;
  emergencyAvailable: boolean;
  servicesOffered: string[];
  distanceKm: number;
  capacity: number;
};

export function NearbyFacilities({
  facilities,
  rankedForRisk = false,
}: {
  facilities: Facility[];
  rankedForRisk?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function refer(facilityId: string, name: string) {
    setBusy(facilityId);
    setError("");
    setOk("");
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId,
          reason: `Patient-initiated referral to ${name}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not request that referral.");
        return;
      }
      setOk(`Referral requested to ${name}.`);
      router.refresh();
    } catch {
      setError("Could not request that referral.");
    } finally {
      setBusy(null);
    }
  }

  if (facilities.length === 0) {
    return (
      <EmptyState
        title="No facilities on record"
        description="We could not rank nearby clinics for this location. Save your coordinates on your profile and try again."
        actionLabel="Update profile"
        actionHref="/patient/profile"
      />
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger-ink" role="alert">
          {error}
        </p>
      )}
      {ok && (
        <p className="rounded-xl bg-success-soft px-3 py-2 text-sm text-success-ink" role="status">
          {ok}
        </p>
      )}
      {facilities.map((f) => (
        <article key={f.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-heading text-xl text-navy">{f.name}</h3>
              <p className="mt-1 text-sm text-ink-muted">{f.address}</p>
              <p className="mt-1 text-sm">
                {formatDistance(f.distanceKm)} · {f.contactPhone}
                {f.emergencyAvailable ? " · Emergency available" : ""}
              </p>
              {rankedForRisk && (
                <p className="mt-1 text-caption font-semibold text-primary">
                  Ranked for your current risk
                </p>
              )}
              <p className="mt-2 text-caption text-ink-muted">
                {(Array.isArray(f.servicesOffered) ? f.servicesOffered : []).join(" · ")}
              </p>
            </div>
            <Button size="sm" loading={busy === f.id} onClick={() => refer(f.id, f.name)}>
              Request referral
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
