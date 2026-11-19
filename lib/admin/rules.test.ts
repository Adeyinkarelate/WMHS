import { describe, expect, it } from "vitest";
import { checkCreateUser, checkRoleChange, checkStatusChange } from "@/lib/admin/rules";

const clinician = { id: "u-clin", role: "PROVIDER", isActive: true, hasProviderProfile: true };
const admin = { id: "u-admin2", role: "ADMIN", isActive: true, hasProviderProfile: false };
const mother = { id: "u-mum", role: "PATIENT", isActive: true, hasProviderProfile: false };

describe("checkRoleChange", () => {
  it("lets an admin promote a clinician", () => {
    expect(
      checkRoleChange({ actorId: "u-admin", target: clinician, newRole: "ADMIN", activeAdminCount: 1 }).ok
    ).toBe(true);
  });

  it("blocks changing your own role", () => {
    const res = checkRoleChange({ actorId: "u-clin", target: clinician, newRole: "ADMIN", activeAdminCount: 2 });
    expect(res).toMatchObject({ ok: false, status: 403 });
  });

  it("never re-roles a mother", () => {
    const res = checkRoleChange({ actorId: "u-admin", target: mother, newRole: "ADMIN", activeAdminCount: 1 });
    expect(res.ok).toBe(false);
  });

  it("rejects a no-op change", () => {
    const res = checkRoleChange({ actorId: "u-admin", target: clinician, newRole: "PROVIDER", activeAdminCount: 1 });
    expect(res.ok).toBe(false);
  });

  it("will not make an admin a clinician without a clinician profile", () => {
    const res = checkRoleChange({ actorId: "u-admin", target: admin, newRole: "PROVIDER", activeAdminCount: 2 });
    expect(res.ok).toBe(false);
  });

  it("keeps at least one active administrator", () => {
    const res = checkRoleChange({
      actorId: "u-admin",
      target: { ...admin, hasProviderProfile: true },
      newRole: "PROVIDER",
      activeAdminCount: 1,
    });
    expect(res).toMatchObject({ ok: false });
  });

  it("allows demoting an admin who has a clinician profile when others remain", () => {
    const res = checkRoleChange({
      actorId: "u-admin",
      target: { ...admin, hasProviderProfile: true },
      newRole: "PROVIDER",
      activeAdminCount: 2,
    });
    expect(res.ok).toBe(true);
  });
});

describe("checkStatusChange", () => {
  it("blocks deactivating yourself", () => {
    const res = checkStatusChange({ actorId: "u-clin", target: clinician, nextActive: false, activeAdminCount: 1 });
    expect(res).toMatchObject({ ok: false, status: 403 });
  });

  it("blocks deactivating the last active admin", () => {
    const res = checkStatusChange({ actorId: "u-other", target: admin, nextActive: false, activeAdminCount: 1 });
    expect(res.ok).toBe(false);
  });

  it("allows deactivating a clinician and reactivating them", () => {
    expect(
      checkStatusChange({ actorId: "u-admin", target: clinician, nextActive: false, activeAdminCount: 1 }).ok
    ).toBe(true);
    expect(
      checkStatusChange({
        actorId: "u-admin",
        target: { ...clinician, isActive: false },
        nextActive: true,
        activeAdminCount: 1,
      }).ok
    ).toBe(true);
  });

  it("rejects a no-op status change", () => {
    const res = checkStatusChange({ actorId: "u-admin", target: clinician, nextActive: true, activeAdminCount: 1 });
    expect(res.ok).toBe(false);
  });
});

describe("checkCreateUser", () => {
  it("requires specialisation and facility for clinicians", () => {
    expect(checkCreateUser({ role: "PROVIDER" }).ok).toBe(false);
    expect(checkCreateUser({ role: "PROVIDER", specialization: "Obstetrics" }).ok).toBe(false);
    expect(checkCreateUser({ role: "PROVIDER", specialization: "Obstetrics", facilityId: "f1" }).ok).toBe(true);
  });

  it("allows administrators without a facility", () => {
    expect(checkCreateUser({ role: "ADMIN" }).ok).toBe(true);
  });

  it("does not let admins create mother accounts", () => {
    expect(checkCreateUser({ role: "PATIENT" }).ok).toBe(false);
  });
});
