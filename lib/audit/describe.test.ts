import { describe, expect, it } from "vitest";
import { describeAudit } from "@/lib/audit/describe";

describe("describeAudit", () => {
  it("describes a role change in plain words", () => {
    const text = describeAudit("USER_ROLE_CHANGED", JSON.stringify({ from: "PROVIDER", to: "ADMIN" }));
    expect(text).toBe("Role changed from Clinician to Administrator.");
  });

  it("lists patients returned to the waiting list on deactivation", () => {
    const text = describeAudit("USER_DEACTIVATED", JSON.stringify({ releasedPatients: ["Amina Bello"] }));
    expect(text).toContain("Amina Bello");
  });

  it("mentions replaced clinicians on admin assignment", () => {
    const text = describeAudit(
      "ASSIGNMENT_ADMIN_ASSIGNED",
      JSON.stringify({ clinician: "Dr. B", facility: "LUTH", replacedClinicians: ["Dr. A"] })
    );
    expect(text).toBe("Assigned to Dr. B (LUTH), replacing Dr. A.");
  });

  it("survives malformed details and unknown actions", () => {
    expect(describeAudit("USER_REACTIVATED", "not json")).toBe("Sign-in restored.");
    expect(describeAudit("SOMETHING_NEW", "{}")).toBe("");
  });
});
