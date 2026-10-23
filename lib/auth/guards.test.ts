import { describe, expect, it } from "vitest";
import { resolveRecordPatientId, type AuthUser } from "@/lib/auth/guards";

function user(partial: Partial<AuthUser> & Pick<AuthUser, "role">): AuthUser {
  return {
    id: "u1",
    name: "Test",
    email: "test@wmhs.ng",
    ...partial,
  } as AuthUser;
}

describe("resolveRecordPatientId", () => {
  it("patients always write their own record", () => {
    expect(resolveRecordPatientId(user({ role: "PATIENT", patientId: "pat-1" }), "other")).toBe(
      "pat-1"
    );
  });

  it("clinicians must pass a patient id", () => {
    const clinician = user({ role: "PROVIDER", providerId: "prv-1" });
    expect(resolveRecordPatientId(clinician, "pat-9")).toBe("pat-9");
    expect(resolveRecordPatientId(clinician, "  ")).toBeNull();
    expect(resolveRecordPatientId(clinician)).toBeNull();
  });
});
