import { prisma } from "@/lib/db/prisma";
import { createUserNotification } from "@/lib/alerts/notify";
import { ASSIGNMENT_ROLE, ASSIGNMENT_STATUS, decideClaim, waitingListWhere } from "@/lib/assignments/rules";

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
      patient: {
        include: {
          user: { select: { id: true } },
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

  return updated;
}

export function facilityWaitingWhere(facilityId: string) {
  return waitingListWhere(facilityId);
}
