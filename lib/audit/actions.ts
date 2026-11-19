/** Every auditable action. Stored as a string; keep values stable. */
export const AUDIT_ACTIONS = {
  USER_CREATED: "USER_CREATED",
  USER_ROLE_CHANGED: "USER_ROLE_CHANGED",
  USER_DEACTIVATED: "USER_DEACTIVATED",
  USER_REACTIVATED: "USER_REACTIVATED",
  ASSIGNMENT_CLAIMED: "ASSIGNMENT_CLAIMED",
  ASSIGNMENT_RELEASED: "ASSIGNMENT_RELEASED",
  ASSIGNMENT_ADMIN_ASSIGNED: "ASSIGNMENT_ADMIN_ASSIGNED",
  ASSIGNMENT_ADMIN_RELEASED: "ASSIGNMENT_ADMIN_RELEASED",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export type AuditCategory = "USERS" | "ASSIGNMENTS";

const META: Record<AuditAction, { label: string; category: AuditCategory; tone: "info" | "success" | "warning" | "danger" }> = {
  USER_CREATED: { label: "User created", category: "USERS", tone: "success" },
  USER_ROLE_CHANGED: { label: "Role changed", category: "USERS", tone: "warning" },
  USER_DEACTIVATED: { label: "Account deactivated", category: "USERS", tone: "danger" },
  USER_REACTIVATED: { label: "Account reactivated", category: "USERS", tone: "success" },
  ASSIGNMENT_CLAIMED: { label: "Clinician took patient", category: "ASSIGNMENTS", tone: "info" },
  ASSIGNMENT_RELEASED: { label: "Clinician released patient", category: "ASSIGNMENTS", tone: "info" },
  ASSIGNMENT_ADMIN_ASSIGNED: { label: "Admin assigned patient", category: "ASSIGNMENTS", tone: "warning" },
  ASSIGNMENT_ADMIN_RELEASED: { label: "Admin released patient", category: "ASSIGNMENTS", tone: "warning" },
};

export function auditActionMeta(action: string) {
  return META[action as AuditAction] ?? { label: action, category: "USERS" as AuditCategory, tone: "info" as const };
}

export function actionsInCategory(category: AuditCategory): AuditAction[] {
  return (Object.keys(META) as AuditAction[]).filter((a) => META[a].category === category);
}
