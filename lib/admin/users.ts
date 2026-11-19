import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { createUserNotification } from "@/lib/alerts/notify";
import { ASSIGNMENT_STATUS } from "@/lib/assignments/rules";
import { AUDIT_ACTIONS } from "@/lib/audit/actions";
import { writeAudit, type AuditActor } from "@/lib/audit/log";
import { checkCreateUser, checkRoleChange, checkStatusChange, type RuleResult } from "@/lib/admin/rules";
import type { Role } from "@/types";

export class AdminError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "AdminError";
  }
}

function enforce(result: RuleResult) {
  if (!result.ok) throw new AdminError(result.message, result.status);
}

async function activeAdminCount() {
  return prisma.user.count({ where: { role: "ADMIN", isActive: true } });
}

export async function createManagedUser(input: {
  actor: AuditActor;
  name: string;
  email: string;
  password: string;
  role: Role;
  specialization?: string;
  facilityId?: string;
}) {
  enforce(checkCreateUser(input));
  const email = input.email.trim().toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) {
    throw new AdminError("An account with that email already exists.", 409);
  }
  if (input.role === "PROVIDER") {
    const facility = await prisma.facility.findUnique({ where: { id: input.facilityId! } });
    if (!facility) throw new AdminError("Select a valid facility.", 400);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: input.name.trim(),
        email,
        passwordHash,
        role: input.role,
        ...(input.role === "PROVIDER"
          ? {
              provider: {
                create: {
                  specialization: input.specialization!.trim(),
                  facilityId: input.facilityId!,
                },
              },
            }
          : {}),
      },
    });
    await writeAudit(
      {
        actor: input.actor,
        action: AUDIT_ACTIONS.USER_CREATED,
        targetType: "USER",
        targetId: user.id,
        targetLabel: user.name,
        details: { email: user.email, role: user.role },
      },
      tx
    );
    return user;
  });
}

async function loadTarget(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { provider: { select: { id: true } } },
  });
  if (!user) throw new AdminError("User not found.", 404);
  return {
    user,
    target: {
      id: user.id,
      role: user.role,
      isActive: user.isActive,
      hasProviderProfile: Boolean(user.provider),
    },
  };
}

export async function changeUserRole(input: { actor: AuditActor; userId: string; role: Role }) {
  const { user, target } = await loadTarget(input.userId);
  enforce(
    checkRoleChange({
      actorId: input.actor.id,
      target,
      newRole: input.role,
      activeAdminCount: await activeAdminCount(),
    })
  );

  return prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({ where: { id: user.id }, data: { role: input.role } });
    await writeAudit(
      {
        actor: input.actor,
        action: AUDIT_ACTIONS.USER_ROLE_CHANGED,
        targetType: "USER",
        targetId: user.id,
        targetLabel: user.name,
        details: { from: user.role, to: input.role, email: user.email },
      },
      tx
    );
    return updated;
  });
}

/**
 * Deactivating a clinician also ends their active assignments, so mothers return to the
 * facility waiting list instead of sitting with a clinician who can no longer sign in.
 */
export async function setUserActive(input: { actor: AuditActor; userId: string; isActive: boolean }) {
  const { user, target } = await loadTarget(input.userId);
  enforce(
    checkStatusChange({
      actorId: input.actor.id,
      target,
      nextActive: input.isActive,
      activeAdminCount: await activeAdminCount(),
    })
  );

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: user.id },
      data: { isActive: input.isActive, deactivatedAt: input.isActive ? null : new Date() },
    });

    let releasedPatients: Array<{ userId: string; name: string; facility: string | null }> = [];
    if (!input.isActive && user.provider) {
      const active = await tx.patientAssignment.findMany({
        where: { providerId: user.provider.id, status: ASSIGNMENT_STATUS.ACTIVE },
        include: {
          patient: {
            include: {
              user: { select: { id: true, name: true } },
              bookedFacility: { select: { name: true } },
            },
          },
        },
      });
      if (active.length) {
        await tx.patientAssignment.updateMany({
          where: { id: { in: active.map((row) => row.id) } },
          data: { status: ASSIGNMENT_STATUS.ENDED, endedAt: new Date() },
        });
      }
      releasedPatients = active.map((row) => ({
        userId: row.patient.user.id,
        name: row.patient.user.name,
        facility: row.patient.bookedFacility?.name ?? null,
      }));
    }

    await writeAudit(
      {
        actor: input.actor,
        action: input.isActive ? AUDIT_ACTIONS.USER_REACTIVATED : AUDIT_ACTIONS.USER_DEACTIVATED,
        targetType: "USER",
        targetId: user.id,
        targetLabel: user.name,
        details: {
          email: user.email,
          role: user.role,
          ...(releasedPatients.length ? { releasedPatients: releasedPatients.map((p) => p.name) } : {}),
        },
      },
      tx
    );
    return { updated, releasedPatients };
  });

  for (const patient of result.releasedPatients) {
    await createUserNotification({
      userId: patient.userId,
      title: "Waiting for a named clinician",
      content: `Your clinician is no longer available. You are back on the waiting list at ${patient.facility ?? "your booked clinic"} and a clinician there will take you onto their caseload.`,
      type: "INFO",
      link: "/patient/profile",
    });
  }
  return result.updated;
}
