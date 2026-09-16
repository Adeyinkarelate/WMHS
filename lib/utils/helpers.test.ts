import { describe, expect, it } from "vitest";
import { safeInternalPath } from "@/lib/utils/helpers";
import { profileSchema } from "@/lib/utils/validators";
import { mapsDirectionsUrl } from "@/lib/utils/haversine";

describe("safeInternalPath", () => {
  it("allows relative app paths", () => {
    expect(safeInternalPath("/patient/dashboard")).toBe("/patient/dashboard");
    expect(safeInternalPath("/provider/patients/abc?tab=alerts")).toBe(
      "/provider/patients/abc?tab=alerts"
    );
  });

  it("rejects open redirects", () => {
    expect(safeInternalPath("https://evil.example")).toBeNull();
    expect(safeInternalPath("//evil.example")).toBeNull();
    expect(safeInternalPath("/\\evil.example")).toBeNull();
    expect(safeInternalPath("http://localhost:3000/patient")).toBeNull();
    expect(safeInternalPath(null)).toBeNull();
    expect(safeInternalPath("")).toBeNull();
  });
});

describe("maps URLs", () => {
  it("builds a directions link with origin", () => {
    expect(mapsDirectionsUrl({ lat: 6.5, lng: 3.3 }, { lat: 6.6, lng: 3.35 })).toContain(
      "origin=6.6,3.35"
    );
  });
});

describe("profileSchema", () => {
  const base = { name: "Amina Bello", phone: "+2348035550142", address: "Ikeja, Lagos" };

  it("stores notifyAlerts false from an unchecked checkbox", () => {
    const parsed = profileSchema.parse({ ...base, notifyAlerts: "false" });
    expect(parsed.notifyAlerts).toBe(false);
  });

  it("stores notifyAlerts true when the checkbox is last", () => {
    const parsed = profileSchema.parse({ ...base, notifyAlerts: ["false", "true"] });
    expect(parsed.notifyAlerts).toBe(true);
  });

  it("accepts a cleared LMP", () => {
    const parsed = profileSchema.parse({ ...base, lmp: "" });
    expect(parsed.lmp).toBe("");
  });
});
