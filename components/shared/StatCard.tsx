import { Card } from "@/components/ui/Card";
import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  accent?: "default" | "danger" | "warning" | "success";
}) {
  const ring = {
    default: "from-primary-soft to-sage-light",
    danger: "from-danger-soft to-blush-soft",
    warning: "from-warning-soft to-warning-soft",
    success: "from-success-soft to-sage-light",
  }[accent ?? "default"];

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${ring} surface-hover`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-caption font-medium text-ink-muted">{label}</p>
        {icon && <span className="text-navy/60">{icon}</span>}
      </div>
      <p className="mt-2 font-heading text-3xl text-navy">{value}</p>
      {hint && <p className="mt-1 text-caption text-ink-muted">{hint}</p>}
    </Card>
  );
}
