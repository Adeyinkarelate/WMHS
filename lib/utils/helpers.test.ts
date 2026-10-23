import { describe, expect, it } from "vitest";
import { safeInternalPath, telHref } from "@/lib/utils/helpers";
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

describe("telHref", () => {
  it("builds a tel link from a clinic number", () => {
    expect(telHref("+234 1 585 0737")).toBe("tel:+23415850737");
    expect(telHref("112")).toBe("tel:112");
    expect(telHref("")).toBeNull();
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

  it("stores obstetric history from checkboxes", () => {
    const parsed = profileSchema.parse({
      ...base,
      preExistingConditions: ["Previous caesarean section", "Sickle cell disease"],
    });
    expect(parsed.preExistingConditions).toEqual([
      "Previous caesarean section",
      "Sickle cell disease",
    ]);
  });

  it("keeps a free-text history note as one item", () => {
    const parsed = profileSchema.parse({
      ...base,
      preExistingConditions: ["Hypertension", "IUGR in last pregnancy, on aspirin"],
    });
    expect(parsed.preExistingConditions).toEqual([
      "Hypertension",
      "IUGR in last pregnancy, on aspirin",
    ]);
  });
});
