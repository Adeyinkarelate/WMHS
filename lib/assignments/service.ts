import { prisma } from "@/lib/db/prisma";
import { createUserNotification } from "@/lib/alerts/notify";
import { ASSIGNMENT_ROLE, ASSIGNMENT_STATUS, decideClaim, waitingListWhere } from "@/lib/assignments/rules";
import { AUDIT_ACTIONS } from "@/lib/audit/actions";
import { writeAudit, writeAuditSafe, type AuditActor } from "@/lib/audit/log";

export class AssignmentError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "AssignmentError";
  }
}

async function loadClaimContext(patientId: string, providerId: string) {
  const [patient, provider, existingPair, activePrimary] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: { select: { id: true, name: true } },
        bookedFacility: { select: { id: true, name: true } },
      },
    }),
    prisma.provider.findUnique({
      where: { id: providerId },
      include: {
        user: { select: { id: true, name: true } },
        facility: { select: { id: true, name: true } },
      },
    }),
    prisma.patientAssignment.findUnique({
      where: { patientId_providerId: { patientId, providerId } },
    }),
    prisma.patientAssignment.findFirst({
      where: { patientId, role: ASSIGNMENT_ROLE.PRIMARY, status: ASSIGNMENT_STATUS.ACTIVE },
    }),
  ]);
  return { patient, provider, existingPair, activePrimary };
}

export async function claimPatient(input: {
  patientId: string;
  providerId: string;
  actorUserId: string;
}) {
  const { patient, provider, existingPair, activePrimary } = await loadClaimContext(
    input.patientId,
    input.providerId
  );
  if (!patient) throw new AssignmentError("Patient not found", 404);
  if (!provider) throw new AssignmentError("Clinician profile missing", 400);
  if (!provider.facilityId) {
    throw new AssignmentError("Join a facility before taking mothers onto your caseload.", 400);
  }
  if (!patient.bookedFacilityId) {
    throw new AssignmentError("This mother has not booked a facility yet.", 400);
  }
  if (patient.bookedFacilityId !== provider.facilityId) {
    throw new AssignmentError("This mother booked a different facility.", 403);
  }

  const decision = decideClaim({
    providerId: input.providerId,
    existingPair: existingPair ? { status: existingPair.status } : null,
    activePrimaryProviderId: activePrimary?.providerId ?? null,
  });

  if (decision === "already_assigned") {
    throw new AssignmentError("This mother already has a named clinician.", 409);
  }

  const assignment =
    decision === "create"
      ? await prisma.patientAssignment.create({
          data: {
            patientId: input.patientId,
            providerId: input.providerId,
            role: ASSIGNMENT_ROLE.PRIMARY,
            status: ASSIGNMENT_STATUS.ACTIVE,
            assignedById: input.actorUserId,
            assignedAt: new Date(),
            endedAt: null,
          },
        })
      : decision === "reactivate"
        ? await prisma.patientAssignment.update({
            where: { id: existingPair!.id },
            data: {
              role: ASSIGNMENT_ROLE.PRIMARY,
              status: ASSIGNMENT_STATUS.ACTIVE,
              assignedById: input.actorUserId,
              assignedAt: new Date(),
              endedAt: null,
            },
          })
        : existingPair!;

  if (decision !== "already_yours") {
    const facilityName = patient.bookedFacility?.name ?? provider.facility?.name ?? "your clinic";
    await createUserNotification({
      userId: patient.user.id,
      title: "Your named clinician",
      content: `${provider.user.name} at ${facilityName} is now your antenatal clinician.`,
      type: "INFO",
      link: "/patient/profile",
    });
    await writeAuditSafe({
      actor: { id: provider.user.id, name: provider.user.name, role: "PROVIDER" },
      action: AUDIT_ACTIONS.ASSIGNMENT_CLAIMED,
      targetType: "PATIENT",
      targetId: patient.id,
      targetLabel: patient.user.name,
      details: { clinician: provider.user.name, facility: facilityName, decision },
    });
  }

  return { assignment, decision };
}

export async function releasePatient(input: {
  patientId: string;
  providerId: string;
}) {
  const assignment = await prisma.patientAssignment.findUnique({
    where: { patientId_providerId: { patientId: input.patientId, providerId: input.providerId } },
    include: {
      provider: { include: { user: { select: { id: true, name: true } } } },
      patient: {
        include: {
          user: { select: { id: true, name: true } },
          bookedFacility: { select: { name: true } },
        },
      },
    },
  });
  if (!assignment || assignment.status !== ASSIGNMENT_STATUS.ACTIVE) {
    throw new AssignmentError("This mother is not on your caseload.", 409);
  }

  const updated = await prisma.patientAssignment.update({
    where: { id: assignment.id },
    data: { status: ASSIGNMENT_STATUS.ENDED, endedAt: new Date() },
  });

  const facilityName = assignment.patient.bookedFacility?.name ?? "your booked clinic";
  await createUserNotification({
    userId: assignment.patient.user.id,
    title: "Waiting for a named clinician",
    content: `You are back on the waiting list at ${facilityName}. A clinician there will take you onto their caseload.`,
    type: "INFO",
    link: "/patient/profile",
  });
  await writeAuditSafe({
    actor: { id: assignment.provider.user.id, name: assignment.provider.user.name, role: "PROVIDER" },
    action: AUDIT_ACTIONS.ASSIGNMENT_RELEASED,
    targetType: "PATIENT",
    targetId: assignment.patientId,
    targetLabel: assignment.patient.user.name,
    details: { clinician: assignment.provider.user.name, facility: facilityName },
  });

  return updated;
}

/**
 * Administrator assignment. Unlike a clinician claim this may move a mother across
 * facilities and replaces any current primary clinician in one transaction.
 */
export async function assignPatientAsAdmin(input: {
  patientId: string;
  providerId: string;
  actor: AuditActor;
}) {
  const [patient, provider] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: input.patientId },
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.provider.findUnique({
      where: { id: input.providerId },
      include: {
        user: { select: { id: true, name: true, isActive: true } },
        facility: { select: { name: true } },
      },
    }),
  ]);
  if (!patient) throw new AssignmentError("Patient not found", 404);
  if (!provider) throw new AssignmentError("Clinician not found", 404);
  if (!provider.user.isActive) {
    throw new AssignmentError("That clinician's account is deactivated.", 409);
  }

  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.patientAssignment.findMany({
      where: { patientId: patient.id, status: ASSIGNMENT_STATUS.ACTIVE },
      include: { provider: { include: { user: { select: { name: true } } } } },
    });
    const alreadyTheirs = current.some((row) => row.providerId === provider.id);
    if (alreadyTheirs && current.length === 1) {
      throw new AssignmentError("This mother is already assigned to that clinician.", 409);
    }

    const replaced = current.filter((row) => row.providerId !== provider.id);
    if (replaced.length) {
      await tx.patientAssignment.updateMany({
        where: { id: { in: replaced.map((row) => row.id) } },
        data: { status: ASSIGNMENT_STATUS.ENDED, endedAt: new Date() },
      });
    }

    const existingPair = await tx.patientAssignment.findUnique({
      where: { patientId_providerId: { patientId: patient.id, providerId: provider.id } },
    });
    const data = {
      role: ASSIGNMENT_ROLE.PRIMARY,
      status: ASSIGNMENT_STATUS.ACTIVE,
      assignedById: input.actor.id,
      assignedAt: new Date(),
      endedAt: null,
    };
    const assignment = existingPair
      ? await tx.patientAssignment.update({ where: { id: existingPair.id }, data })
      : await tx.patientAssignment.create({
          data: { patientId: patient.id, providerId: provider.id, ...data },
        });

    await writeAudit(
      {
        actor: input.actor,
        action: AUDIT_ACTIONS.ASSIGNMENT_ADMIN_ASSIGNED,
        targetType: "PATIENT",
        targetId: patient.id,
        targetLabel: patient.user.name,
        details: {
          clinician: provider.user.name,
          facility: provider.facility?.name ?? null,
          replacedClinicians: replaced.map((row) => row.provider.user.name),
        },
      },
      tx
    );
    return { assignment, replaced: replaced.map((row) => row.provider.user.name) };
  });

  await createUserNotification({
    userId: patient.user.id,
    title: "Your named clinician",
    content: `${provider.user.name}${provider.facility ? ` at ${provider.facility.name}` : ""} is now your antenatal clinician.`,
    type: "INFO",
    link: "/patient/profile",
  });
  return result;
}

/** Administrator release: ends every active assignment and returns the mother to the waiting list. */
export async function releasePatientAsAdmin(input: { patientId: string; actor: AuditActor }) {
  const patient = await prisma.patient.findUnique({
    where: { id: input.patientId },
    include: {
      user: { select: { id: true, name: true } },
      bookedFacility: { select: { name: true } },
    },
  });
  if (!patient) throw new AssignmentError("Patient not found", 404);

  const released = await prisma.$transaction(async (tx) => {
    const current = await tx.patientAssignment.findMany({
      where: { patientId: patient.id, status: ASSIGNMENT_STATUS.ACTIVE },
      include: { provider: { include: { user: { select: { name: true } } } } },
    });
    if (current.length === 0) {
      throw new AssignmentError("This mother has no active clinician to release.", 409);
    }
    await tx.patientAssignment.updateMany({
      where: { id: { in: current.map((row) => row.id) } },
      data: { status: ASSIGNMENT_STATUS.ENDED, endedAt: new Date() },
    });
    await writeAudit(
      {
        actor: input.actor,
        action: AUDIT_ACTIONS.ASSIGNMENT_ADMIN_RELEASED,
        targetType: "PATIENT",
        targetId: patient.id,
        targetLabel: patient.user.name,
        details: { releasedClinicians: current.map((row) => row.provider.user.name) },
      },
      tx
    );
    return current.map((row) => row.provider.user.name);
  });

  await createUserNotification({
    userId: patient.user.id,
    title: "Waiting for a named clinician",
    content: `You are back on the waiting list at ${patient.bookedFacility?.name ?? "your booked clinic"}. A clinician there will take you onto their caseload.`,
    type: "INFO",
    link: "/patient/profile",
  });
  return { released };
}

export function facilityWaitingWhere(facilityId: string) {
  return waitingListWhere(facilityId);
}
