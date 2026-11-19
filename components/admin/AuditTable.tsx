import { Badge } from "@/components/ui/Badge";
import { auditActionMeta } from "@/lib/audit/actions";
import { describeAudit, roleLabel } from "@/lib/audit/describe";
import { formatDateTime } from "@/lib/utils/formatters";

export type AuditRow = {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetLabel: string;
  details: string;
  createdAt: Date | string;
};

export function AuditTable({ rows, compact = false }: { rows: AuditRow[]; compact?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-caption uppercase text-ink-muted">
            <th className="py-2 pr-4 font-semibold">When</th>
            <th className="py-2 pr-4 font-semibold">Who</th>
            <th className="py-2 pr-4 font-semibold">Action</th>
            <th className="py-2 font-semibold">Target</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const meta = auditActionMeta(row.action);
            const detail = describeAudit(row.action, row.details);
            return (
              <tr key={row.id} className="border-b border-line align-top last:border-0">
                <td className="whitespace-nowrap py-3 pr-4 text-ink-muted">{formatDateTime(row.createdAt)}</td>
                <td className="py-3 pr-4">
                  <p className="font-semibold text-navy">{row.actorName}</p>
                  <p className="text-caption text-ink-muted">{roleLabel(row.actorRole)}</p>
                </td>
                <td className="py-3 pr-4">
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </td>
                <td className="py-3">
                  <p className="font-semibold text-navy">{row.targetLabel}</p>
                  {!compact && detail && <p className="text-caption text-ink-muted">{detail}</p>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
