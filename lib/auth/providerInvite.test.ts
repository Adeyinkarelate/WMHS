import { describe, expect, it, vi, afterEach } from "vitest";
import { providerRegistrationGate } from "@/lib/auth/providerInvite";

describe("providerRegistrationGate", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows local registration when no invite code is configured", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("PROVIDER_INVITE_CODE", "");
    expect(providerRegistrationGate().ok).toBe(true);
  });

  it("closes clinician signup in production without a code", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PROVIDER_INVITE_CODE", "");
    const gate = providerRegistrationGate("anything");
    expect(gate.ok).toBe(false);
  });

  it("accepts the configured invite code", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PROVIDER_INVITE_CODE", "clinic-invite");
    expect(providerRegistrationGate("clinic-invite").ok).toBe(true);
    expect(providerRegistrationGate("wrong").ok).toBe(false);
  });
});
