import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Icons } from "@/components/shared/Icons";
import { EmptyState } from "@/components/shared/EmptyState";
import { AuditTable } from "@/components/admin/AuditTable";

export default async function AdminDashboardPage() {
  const [patients, clinicians, admins, inactive, unassigned, openAlerts, recent] = await Promise.all([
    prisma.user.count({ where: { role: "PATIENT" } }),
    prisma.user.count({ where: { role: "PROVIDER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.patient.count({ where: { assignments: { none: { status: "ACTIVE" } } } }),
    prisma.alert.count({ where: { status: { in: ["ACTIVE", "ACKNOWLEDGED"] } } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Administration"
        title="System overview"
        description="Manage who can sign in, which clinician sees which mother, and review what changed."
        action={
          <ButtonLink href="/admin/users" size="sm">
            <Icons.plus size={16} />
            Manage users
          </ButtonLink>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Mothers" value={patients} icon={<Icons.heart size={18} />} />
        <StatCard label="Clinicians" value={clinicians} icon={<Icons.users size={18} />} />
        <StatCard label="Administrators" value={admins} icon={<Icons.shield size={18} />} />
        <StatCard
          label="Deactivated accounts"
          value={inactive}
          hint={inactive ? "Cannot sign in" : "All accounts active"}
          accent={inactive ? "warning" : "success"}
          icon={<Icons.user size={18} />}
        />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Mothers without a clinician"
          value={unassigned}
          hint="Waiting for a named clinician"
          accent={unassigned ? "warning" : "success"}
          icon={<Icons.link size={18} />}
        />
        <StatCard label="Open clinical alerts" value={openAlerts} accent={openAlerts ? "danger" : "success"} icon={<Icons.bell size={18} />} />
      </div>

      <Card className="mt-8">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Recent activity</CardTitle>
          <Link href="/admin/audit" className="text-sm font-semibold text-primary">
            Full audit log
          </Link>
        </div>
        <div className="mt-4">
          {recent.length === 0 ? (
            <EmptyState title="No activity yet" description="Account and assignment changes will appear here." />
          ) : (
            <AuditTable rows={recent} compact />
          )}
        </div>
      </Card>
    </PageTransition>
  );
}
