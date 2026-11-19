import { getSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { UserManager, type ManagedUser } from "@/components/admin/UserManager";

export default async function AdminUsersPage() {
  const session = await getSession();
  const [users, facilities] = await Promise.all([
    prisma.user.findMany({
      include: {
        provider: { select: { specialization: true, facility: { select: { name: true } } } },
        patient: { select: { bookedFacility: { select: { name: true } } } },
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
    prisma.facility.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const rows: ManagedUser[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
    detail: u.provider
      ? `${u.provider.specialization}${u.provider.facility ? ` · ${u.provider.facility.name}` : ""}`
      : u.patient?.bookedFacility
        ? `Booked at ${u.patient.bookedFacility.name}`
        : null,
  }));

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Access"
        title="Users and roles"
        description="Control who can sign in and what they can do. Every change is recorded in the audit log."
      />
      <UserManager users={rows} facilities={facilities} currentUserId={session!.user.id} />
    </PageTransition>
  );
}
