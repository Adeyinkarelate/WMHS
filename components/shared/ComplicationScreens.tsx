import { Badge } from "@/components/ui/Badge";
import { Card, CardTitle } from "@/components/ui/Card";
import { ALERT_TYPE_LABELS } from "@/lib/alerts/labels";
import type { ComplicationScreen } from "@/types";

const LABELS: Record<string, string> = ALERT_TYPE_LABELS;

export function ComplicationScreens({
  screens,
  map,
  bmi,
  gestationalAgeWeeks,
}: {
  screens: ComplicationScreen[];
  map?: number | null;
  bmi?: number | null;
  gestationalAgeWeeks?: number | null;
}) {
  const hasMetrics = map != null || bmi != null || gestationalAgeWeeks != null;

  return (
    <Card>
      <CardTitle className="text-xl">Complication screens</CardTitle>
      <p className="mt-1 text-sm text-ink-muted">
        Rule-based screens open when the engine finds a matching pattern. This is decision
        support, not a diagnosis.
      </p>
      {hasMetrics && (
        <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-canvas px-3 py-2">
            <dt className="text-caption text-ink-muted">MAP</dt>
            <dd className="text-sm font-semibold text-navy">{map != null ? `${map} mmHg` : "—"}</dd>
          </div>
          <div className="rounded-xl bg-canvas px-3 py-2">
            <dt className="text-caption text-ink-muted">BMI</dt>
            <dd className="text-sm font-semibold text-navy">{bmi != null ? bmi.toFixed(1) : "—"}</dd>
          </div>
          <div className="rounded-xl bg-canvas px-3 py-2">
            <dt className="text-caption text-ink-muted">Gestational age</dt>
            <dd className="text-sm font-semibold text-navy">
              {gestationalAgeWeeks != null ? `${gestationalAgeWeeks} weeks` : "—"}
            </dd>
          </div>
        </dl>
      )}
      {screens.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">No complication pattern triggered on this pass.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {screens.map((screen) => (
            <li
              key={screen.type}
              className="rounded-xl border border-line bg-canvas/60 px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-navy">{LABELS[screen.type] ?? screen.type}</p>
                <Badge tone={screen.triggered ? "danger" : "default"}>
                  {screen.triggered ? "Triggered" : "Not triggered"}
                </Badge>
              </div>
              <p className="mt-1 text-caption text-ink-muted">
                Probability {Math.round(screen.probability * 100)}%
              </p>
              {screen.reasons.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {screen.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
