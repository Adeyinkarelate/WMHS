import { describe, expect, it } from "vitest";
import { answerQuestion } from "@/lib/ai/assistant";

const ctx = { name: "Amina", riskLevel: "LOW" as const };

describe("answerQuestion keyword matching", () => {
  it("answers danger-sign questions even though 'pregnancy' contains 'anc'", () => {
    const res = answerQuestion("What are danger signs in pregnancy?", ctx);
    expect(res.answer).toMatch(/heavy bleeding|severe headache/i);
    expect(res.escalate).toBe(true);
  });

  it("still answers antenatal visit questions", () => {
    const res = answerQuestion("How often are my ANC visits?", ctx);
    expect(res.answer).toMatch(/eight antenatal contacts/i);
  });

  it("does not match 'eat' inside 'breathing'", () => {
    const res = answerQuestion("I have difficulty breathing", ctx);
    expect(res.answer).not.toMatch(/regular meals/i);
  });
});
