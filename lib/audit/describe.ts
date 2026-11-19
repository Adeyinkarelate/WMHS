import { fromJsonString } from "@/lib/utils/json";

const ROLE_LABEL: Record<string, string> = {
  PATIENT: "Mother",
  PROVIDER: "Clinician",
  ADMIN: "Administrator",
};

export function roleLabel(role: string) {
  return ROLE_LABEL[role] ?? role;
}

function list(value: unknown): string {
  return Array.isArray(value) ? value.filter((v) => typeof v === "string").join(", ") : "";
}

/** One readable line of context for an audit row. Never throws on unexpected details. */
export function describeAudit(action: string, rawDetails: string): string {
  const d = fromJsonString<Record<string, unknown>>(rawDetails, {});
  switch (action) {
    case "USER_CREATED":
      return `${roleLabel(String(d.role ?? ""))} account created for ${d.email ?? "unknown email"}.`;
    case "USER_ROLE_CHANGED":
      return `Role changed from ${roleLabel(String(d.from ?? ""))} to ${roleLabel(String(d.to ?? ""))}.`;
    case "USER_DEACTIVATED": {
      const released = list(d.releasedPatients);
      return released
        ? `Sign-in disabled. Returned to the waiting list: ${released}.`
        : "Sign-in disabled.";
    }
    case "USER_REACTIVATED":
      return "Sign-in restored.";
    case "ASSIGNMENT_CLAIMED":
      return `Taken onto ${d.clinician ?? "a clinician"}'s caseload${d.facility ? ` at ${d.facility}` : ""}.`;
    case "ASSIGNMENT_RELEASED":
      return `Released from ${d.clinician ?? "a clinician"}'s caseload. Back on the waiting list.`;
    case "ASSIGNMENT_ADMIN_ASSIGNED": {
      const replaced = list(d.replacedClinicians);
      return `Assigned to ${d.clinician ?? "a clinician"}${d.facility ? ` (${d.facility})` : ""}${
        replaced ? `, replacing ${replaced}` : ""
      }.`;
    }
    case "ASSIGNMENT_ADMIN_RELEASED": {
      const released = list(d.releasedClinicians);
      return `Removed from ${released || "the caseload"}. Back on the waiting list.`;
    }
    default:
      return "";
  }
}
