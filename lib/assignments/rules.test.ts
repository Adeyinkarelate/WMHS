import { describe, expect, it } from "vitest";
import { decideClaim, waitingListWhere } from "@/lib/assignments/rules";

describe("decideClaim", () => {
  it("creates a new named relationship when nobody holds the mother", () => {
    expect(
      decideClaim({
        providerId: "prov-1",
        existingPair: null,
        activePrimaryProviderId: null,
      })
    ).toBe("create");
  });

  it("reactivates a previous pair after release", () => {
    expect(
      decideClaim({
        providerId: "prov-1",
        existingPair: { status: "ENDED" },
        activePrimaryProviderId: null,
      })
    ).toBe("reactivate");
  });

  it("does not steal a mother who already has a named clinician", () => {
    expect(
      decideClaim({
        providerId: "prov-2",
        existingPair: null,
        activePrimaryProviderId: "prov-1",
      })
    ).toBe("already_assigned");
  });

  it("is a no-op when the clinician already holds the mother", () => {
    expect(
      decideClaim({
        providerId: "prov-1",
        existingPair: { status: "ACTIVE" },
        activePrimaryProviderId: "prov-1",
      })
    ).toBe("already_yours");
  });
});

describe("waitingListWhere", () => {
  it("scopes to the booked facility and mothers with no active clinician", () => {
    expect(waitingListWhere("fac-1")).toEqual({
      bookedFacilityId: "fac-1",
      assignments: { none: { status: "ACTIVE" } },
    });
  });
});
