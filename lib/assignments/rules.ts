export const ASSIGNMENT_STATUS = {
  ACTIVE: "ACTIVE",
  ENDED: "ENDED",
} as const;

export const ASSIGNMENT_ROLE = {
  PRIMARY: "PRIMARY",
  COVERING: "COVERING",
} as const;

export type ClaimDecision = "create" | "reactivate" | "already_yours" | "already_assigned";

export function decideClaim(input: {
  providerId: string;
  existingPair: { status: string } | null;
  activePrimaryProviderId: string | null;
}): ClaimDecision {
  if (input.activePrimaryProviderId && input.activePrimaryProviderId !== input.providerId) {
    return "already_assigned";
  }
  if (input.existingPair?.status === ASSIGNMENT_STATUS.ACTIVE) return "already_yours";
  if (input.existingPair) return "reactivate";
  return "create";
}

export function waitingListWhere(facilityId: string) {
  return {
    bookedFacilityId: facilityId,
    assignments: { none: { status: ASSIGNMENT_STATUS.ACTIVE } },
  };
}

export function activeAssignmentSome(providerId: string) {
  return {
    assignments: { some: { providerId, status: ASSIGNMENT_STATUS.ACTIVE } },
  };
}

export function activeAssignmentOnPatient(providerId: string) {
  return {
    patient: { assignments: { some: { providerId, status: ASSIGNMENT_STATUS.ACTIVE } } },
  };
}
