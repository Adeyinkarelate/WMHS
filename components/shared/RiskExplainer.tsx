import { Card, CardTitle } from "@/components/ui/Card";
import type { FeatureContribution } from "@/types";

export function RiskExplainer({
  contributions,
  missingVitals,
}: {
  contributions?: FeatureContribution[];
  missingVitals?: string[];
}) {
  const rows = (contributions ?? []).filter((c) => c.recorded || c.contribution > 0);
  const max = Math.max(...rows.map((c) => c.contribution), 0.01);

  return (
    <Card>
      <CardTitle className="text-xl">Why this score</CardTitle>
      <p className="mt-1 text-sm text-ink-muted">
        Guideline-weighted contributions. Missing vitals are skipped — they are not scored as
        normal.
      </p>
      {missingVitals && missingVitals.length > 0 && (
        <p className="mt-3 rounded-xl bg-warning-soft px-3 py-2 text-sm text-warning-ink">
          Not recorded: {missingVitals.join(" · ")}
        </p>
      )}
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">No measured features on this pass.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.slice(0, 8).map((row) => (
            <li key={row.key}>
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-navy">{row.label}</span>
                <span className="font-heading font-semibold text-navy">
                  {(row.contribution * 100).toFixed(1)}%
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.round((row.contribution / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
