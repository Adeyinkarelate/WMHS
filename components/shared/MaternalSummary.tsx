"use client";

import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils/formatters";
import { gestationalAgeLabel } from "@/lib/utils/clinical";
import type { RiskLevel } from "@/types";

export type MaternalSummaryData = {
  patientName: string;
  phone: string;
  address: string;
  lmp?: Date | string | null;
  edd?: Date | string | null;
  parity?: number | null;
  riskLevel?: RiskLevel | string | null;
  riskScore?: number | null;
  openAlerts?: string[];
  nextAnc?: string | null;
  lastVitals?: string[];
  conditions?: string[];
};

export function MaternalSummary({ data }: { data: MaternalSummaryData }) {
  return (
    <section className="maternal-summary rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
      <div className="no-print mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.18em] text-sage">
            Carry to clinic
          </p>
          <h2 className="mt-1 font-heading text-xl text-navy">Maternal summary</h2>
        </div>
        <Button variant="outline" size="sm" type="button" onClick={() => window.print()}>
          Print summary
        </Button>
      </div>
      <header className="border-b border-line pb-4">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.18em] text-sage">
          WMHS maternal summary
        </p>
        <h3 className="mt-2 font-heading text-2xl font-bold text-navy">{data.patientName}</h3>
        <p className="mt-1 text-sm text-ink-muted">
          {data.phone} · {data.address}
        </p>
      </header>
      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-caption text-ink-muted">Pregnancy</dt>
          <dd className="font-heading text-lg font-semibold text-navy">
            {gestationalAgeLabel(data.lmp ? new Date(data.lmp) : null)}
          </dd>
          <dd className="text-sm text-ink-muted">EDD {formatDate(data.edd)}</dd>
          <dd className="text-sm text-ink-muted">Parity {data.parity ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-caption text-ink-muted">Risk</dt>
          <dd className="mt-1">
            {data.riskLevel ? (
              <StatusBadge value={data.riskLevel} />
            ) : (
              <span className="text-sm text-ink-muted">Not assessed</span>
            )}
          </dd>
          {typeof data.riskScore === "number" && (
            <dd className="mt-1 font-heading text-lg font-bold text-navy">
              {Math.round(data.riskScore * 100)}%
            </dd>
          )}
        </div>
        <div>
          <dt className="text-caption text-ink-muted">Next ANC</dt>
          <dd className="mt-1 text-sm text-ink">{data.nextAnc ?? "Set an LMP to generate contacts."}</dd>
        </div>
      </dl>
      {data.conditions && data.conditions.length > 0 && (
        <p className="mt-4 text-sm">
          <span className="font-semibold text-navy">History: </span>
          {data.conditions.join(", ")}
        </p>
      )}
      {data.lastVitals && data.lastVitals.length > 0 && (
        <div className="mt-4">
          <p className="text-caption text-ink-muted">Recent vitals</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {data.lastVitals.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {data.openAlerts && data.openAlerts.length > 0 && (
        <div className="mt-4 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger-ink">
          Open alerts: {data.openAlerts.join(" · ")}
        </div>
      )}
      <p className="mt-5 text-caption text-ink-muted">
        Decision support only — not a diagnosis and not an emergency dispatch service.
      </p>
    </section>
  );
}
