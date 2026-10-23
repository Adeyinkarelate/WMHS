import { timingSafeEqual } from "crypto";

function codesEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function providerRegistrationGate(inviteCode?: string | null):
  | { ok: true }
  | { ok: false; message: string } {
  const expected = process.env.PROVIDER_INVITE_CODE?.trim() ?? "";
  const production = process.env.NODE_ENV === "production";

  if (!expected) {
    if (production) {
      return {
        ok: false,
        message: "Clinician registration is closed. Ask your facility administrator for an invite.",
      };
    }
    return { ok: true };
  }

  if (!codesEqual((inviteCode ?? "").trim(), expected)) {
    return { ok: false, message: "That invite code is not valid." };
  }
  return { ok: true };
}
