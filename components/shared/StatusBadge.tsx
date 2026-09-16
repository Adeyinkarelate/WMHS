import { Badge } from "@/components/ui/Badge";
import type { AlertStatus, ReferralStatus, RiskLevel } from "@/types";

export function StatusBadge({
  value,
}: {
  value: RiskLevel | ReferralStatus | AlertStatus | string;
}) {
  const map: Record<string, { tone: "success" | "warning" | "danger" | "info" | "default"; label: string }> = {
    LOW: { tone: "success", label: "Low" },
    MEDIUM: { tone: "warning", label: "Medium" },
    HIGH: { tone: "danger", label: "High" },
    PENDING: { tone: "warning", label: "Pending" },
    APPROVED: { tone: "info", label: "Approved" },
    COMPLETED: { tone: "success", label: "Completed" },
    CANCELLED: { tone: "default", label: "Cancelled" },
    ACTIVE: { tone: "danger", label: "Active" },
    ACKNOWLEDGED: { tone: "warning", label: "Acknowledged" },
    RESOLVED: { tone: "success", label: "Resolved" },
    CRITICAL: { tone: "danger", label: "Critical" },
    ESCALATED: { tone: "danger", label: "Escalated" },
    DUE: { tone: "warning", label: "Due" },
    OVERDUE: { tone: "danger", label: "Overdue" },
    UPCOMING: { tone: "info", label: "Upcoming" },
    UNASSESSED: { tone: "default", label: "Not assessed" },
    STUBBED: { tone: "info", label: "SMS stub" },
    SENT: { tone: "success", label: "Sent" },
    FAILED: { tone: "danger", label: "Failed" },
    QUEUED: { tone: "warning", label: "Queued" },
  };
  const item = map[value] ?? { tone: "default" as const, label: value };
  return <Badge tone={item.tone}>{item.label}</Badge>;
}
