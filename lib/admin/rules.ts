import type { Role } from "@/types";

/** Roles an administrator may assign. Mother (PATIENT) accounts are never re-roled. */
export const ASSIGNABLE_ROLES: Role[] = ["PROVIDER", "ADMIN"];

export type RuleResult = { ok: true } | { ok: false; message: string; status: number };

const ok: RuleResult = { ok: true };
const deny = (message: string, status = 409): RuleResult => ({ ok: false, message, status });

type Target = {
  id: string;
  role: string;
  isActive: boolean;
  hasProviderProfile: boolean;
};

export function checkRoleChange(input: {
  actorId: string;
  target: Target;
  newRole: Role;
  activeAdminCount: number;
}): RuleResult {
  const { actorId, target, newRole, activeAdminCount } = input;
  if (target.id === actorId) return deny("You cannot change your own role.", 403);
  if (target.role === "PATIENT") {
    return deny("Mother accounts cannot be given a different role.");
  }
  if (!ASSIGNABLE_ROLES.includes(newRole)) return deny("That role cannot be assigned.", 400);
  if (target.role === newRole) return deny("This user already has that role.");
  if (newRole === "PROVIDER" && !target.hasProviderProfile) {
    return deny("This administrator has no clinician profile, so they cannot be made a clinician.");
  }
  if (target.role === "ADMIN" && target.isActive && activeAdminCount <= 1) {
    return deny("At least one active administrator must remain.");
  }
  return ok;
}

export function checkStatusChange(input: {
  actorId: string;
  target: Target;
  nextActive: boolean;
  activeAdminCount: number;
}): RuleResult {
  const { actorId, target, nextActive, activeAdminCount } = input;
  if (target.id === actorId) return deny("You cannot change your own account status.", 403);
  if (target.isActive === nextActive) {
    return deny(nextActive ? "This account is already active." : "This account is already deactivated.");
  }
  if (!nextActive && target.role === "ADMIN" && activeAdminCount <= 1) {
    return deny("At least one active administrator must remain.");
  }
  return ok;
}

export function checkCreateUser(input: {
  role: Role;
  specialization?: string;
  facilityId?: string;
}): RuleResult {
  if (!ASSIGNABLE_ROLES.includes(input.role)) {
    return deny("Administrators can only create clinician or administrator accounts.", 400);
  }
  if (input.role === "PROVIDER") {
    if (!input.specialization?.trim()) return deny("Specialisation is required for clinicians.", 400);
    if (!input.facilityId) return deny("Select the facility the clinician works at.", 400);
  }
  return ok;
}
