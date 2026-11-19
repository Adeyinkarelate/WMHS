import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { AuditTable } from "@/components/admin/AuditTable";
import { actionsInCategory, type AuditCategory } from "@/lib/audit/actions";
import { cn } from "@/lib/utils/helpers";

const PAGE_SIZE = 25;

const FILTERS: Array<{ value: "ALL" | AuditCategory; label: string }> = [
  { value: "ALL", label: "All activity" },
  { value: "USERS", label: "Users and roles" },
  { value: "ASSIGNMENTS", label: "Assignments" },
];

export default async function AuditPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const category = FILTERS.some((f) => f.value === searchParams.category)
    ? (searchParams.category as "ALL" | AuditCategory)
    : "ALL";
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  const where = category === "ALL" ? {} : { action: { in: actionsInCategory(category) } };

  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number, c = category) => `/admin/audit?category=${c}&page=${p}`;

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Accountability"
        title="Audit log"
        description="A permanent record of who changed accounts, roles and clinician assignments, and when."
      />
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter audit log">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={href(1, f.value)}
            role="tab"
            aria-selected={category === f.value}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
              category === f.value
                ? "border-navy bg-navy text-white"
                : "border-line bg-white text-navy hover:border-navy"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>
      <Card>
        {rows.length === 0 ? (
          <EmptyState title="Nothing recorded" description="No entries match this filter yet." />
        ) : (
          <AuditTable rows={rows} />
        )}
        {pages > 1 && (
          <nav className="mt-4 flex items-center justify-between border-t border-line pt-4 text-sm" aria-label="Pagination">
            {page > 1 ? (
              <Link href={href(page - 1)} className="font-semibold text-primary">
                Newer
              </Link>
            ) : (
              <span />
            )}
            <span className="text-ink-muted">
              Page {page} of {pages} · {total} entries
            </span>
            {page < pages ? (
              <Link href={href(page + 1)} className="font-semibold text-primary">
                Older
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </Card>
    </PageTransition>
  );
}
