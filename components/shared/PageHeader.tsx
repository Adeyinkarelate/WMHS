import { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 font-heading text-xs font-semibold uppercase tracking-[0.18em] text-sage">{eyebrow}</p>
        )}
        <h1 className="font-heading text-h2 text-navy text-balance">{title}</h1>
        {description && <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
