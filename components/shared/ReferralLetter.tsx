"use client";

import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils/formatters";
import { gestationalAgeLabel } from "@/lib/utils/clinical";
import type { RiskLevel } from "@/types";

export type ReferralLetterData = {
  patientName: string;
  phone: string;
  address: string;
  lmp?: Date | string | null;
  edd?: Date | string | null;
  riskLevel?: RiskLevel | string | null;
  riskScore?: number | null;
  factors?: string[];
  facilityName: string;
  facilityAddress: string;
  facilityPhone: string;
  reason: string;
  transportNotes?: string | null;
  referredAt: Date | string;
  clinicianName?: string | null;
};

export function ReferralLetter({ data }: { data: ReferralLetterData }) {
  return (
    <section className="referral-letter rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
      <div className="no-print mb-4 flex justify-end">
        <Button variant="outline" size="sm" type="button" onClick={() => window.print()}>
          Print referral letter
        </Button>
      </div>
      <header className="border-b border-line pb-4">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.18em] text-sage">
          WMHS clinical referral
        </p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-navy">Referral to {data.facilityName}</h2>
        <p className="mt-1 text-sm text-ink-muted">{formatDate(data.referredAt)}</p>
      </header>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-caption text-ink-muted">Patient</dt>
          <dd className="font-semibold text-navy">{data.patientName}</dd>
          <dd className="text-sm text-ink">{data.phone}</dd>
          <dd className="text-sm text-ink-muted">{data.address}</dd>
        </div>
        <div>
          <dt className="text-caption text-ink-muted">Pregnancy</dt>
          <dd className="text-sm text-ink">GA {gestationalAgeLabel(data.lmp ? new Date(data.lmp) : null)}</dd>
          <dd className="text-sm text-ink-muted">EDD {formatDate(data.edd)}</dd>
          <dd className="text-sm text-ink">
            Risk {data.riskLevel ?? "—"}
            {typeof data.riskScore === "number" ? ` (${Math.round(data.riskScore * 100)}%)` : ""}
          </dd>
        </div>
      </dl>
      <div className="mt-5">
        <p className="text-caption text-ink-muted">Receiving facility</p>
        <p className="font-semibold text-navy">{data.facilityName}</p>
        <p className="text-sm text-ink">{data.facilityAddress}</p>
        <p className="text-sm text-ink">{data.facilityPhone}</p>
      </div>
      <div className="mt-5">
        <p className="text-caption text-ink-muted">Reason</p>
        <p className="mt-1 text-sm leading-relaxed text-ink">{data.reason}</p>
      </div>
      {data.factors && data.factors.length > 0 && (
        <div className="mt-5">
          <p className="text-caption text-ink-muted">Key factors</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {data.factors.slice(0, 8).map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
        </div>
      )}
      {data.transportNotes && (
        <p className="mt-5 text-sm">
          <span className="font-semibold text-navy">Transport: </span>
          {data.transportNotes}
        </p>
      )}
      <p className="mt-8 text-caption text-ink-muted">
        Decision support only — not a diagnosis. {data.clinicianName ? `Prepared with ${data.clinicianName}.` : ""}
      </p>
    </section>
  );
}
