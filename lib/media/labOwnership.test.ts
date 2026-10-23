import { describe, expect, it, vi, afterEach } from "vitest";
import { assertOwnedLabAttachment, isOwnedLabPublicId, labFolderForPatient } from "@/lib/media/labOwnership";

describe("lab ownership", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("scopes the Cloudinary folder to the patient", () => {
    expect(labFolderForPatient("pat-1")).toBe("wmhs/tests/pat-1");
    expect(isOwnedLabPublicId("pat-1", "wmhs/tests/pat-1/lab.pdf")).toBe(true);
    expect(isOwnedLabPublicId("pat-1", "wmhs/tests/other/lab.pdf")).toBe(false);
    expect(isOwnedLabPublicId("pat-1", "wmhs/tests/pat-1")).toBe(false);
  });

  it("allows a matching Cloudinary attachment", () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "wmhs-test");
    expect(() =>
      assertOwnedLabAttachment({
        patientId: "pat-1",
        filePublicId: "wmhs/tests/pat-1/hb.pdf",
        fileUrl: "https://res.cloudinary.com/wmhs-test/image/upload/v1/wmhs/tests/pat-1/hb.pdf",
      })
    ).not.toThrow();
  });

  it("rejects a URL that is not this patient's upload", () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "wmhs-test");
    expect(() =>
      assertOwnedLabAttachment({
        patientId: "pat-1",
        filePublicId: "wmhs/tests/other/hb.pdf",
        fileUrl: "https://res.cloudinary.com/wmhs-test/image/upload/v1/wmhs/tests/other/hb.pdf",
      })
    ).toThrow(/does not belong/i);
  });

  it("rejects a client-supplied http URL", () => {
    expect(() =>
      assertOwnedLabAttachment({
        patientId: "pat-1",
        filePublicId: "wmhs/tests/pat-1/hb.pdf",
        fileUrl: "http://evil.example/hb.pdf",
      })
    ).toThrow(/HTTPS/i);
  });

  it("rejects when Cloudinary is not configured", () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "");
    expect(() =>
      assertOwnedLabAttachment({
        patientId: "pat-1",
        filePublicId: "wmhs/tests/pat-1/hb.pdf",
        fileUrl: "https://res.cloudinary.com/wmhs-test/image/upload/v1/wmhs/tests/pat-1/hb.pdf",
      })
    ).toThrow(/not configured/i);
  });

  it("rejects a public id that is not in the stored URL", () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "wmhs-test");
    expect(() =>
      assertOwnedLabAttachment({
        patientId: "pat-1",
        filePublicId: "wmhs/tests/pat-1/hb.pdf",
        fileUrl: "https://res.cloudinary.com/wmhs-test/image/upload/v1/wmhs/tests/pat-1/other.pdf",
      })
    ).toThrow(/does not match/i);
  });

  it("rejects an incomplete attachment", () => {
    expect(() =>
      assertOwnedLabAttachment({
        patientId: "pat-1",
        fileUrl: "https://res.cloudinary.com/wmhs-test/image/upload/v1/wmhs/tests/pat-1/hb.pdf",
      })
    ).toThrow(/incomplete/i);
  });
});
