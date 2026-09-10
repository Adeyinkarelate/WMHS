import type { RiskLevel } from "@/types";

type AssistantContext = {
  name: string;
  riskLevel?: RiskLevel | null;
  gestationalAge?: string | null;
  factors?: string[];
};

type Answer = {
  question: string;
  answer: string;
  escalate: boolean;
};

const KNOWLEDGE: Array<{ keys: string[]; answer: string; escalate?: boolean }> = [
  {
    keys: ["preeclampsia", "pre-eclampsia", "high blood", "headache", "vision"],
    answer:
      "Pre-eclampsia is high blood pressure in pregnancy, often after 20 weeks, sometimes with protein in the urine, headache, or visual changes. It needs a clinician — not home treatment. If you have a severe headache, blurred vision, or BP of 140/90 or more, seek care today.",
    escalate: true,
  },
  {
    keys: ["diabetes", "glucose", "sugar"],
    answer:
      "Gestational diabetes is high blood sugar that starts in pregnancy. It is managed with diet, activity, glucose checks, and sometimes medication. Log your glucose results here so your provider can see the trend.",
  },
  {
    keys: ["kick", "fetal movement", "baby mov"],
    answer:
      "From about 28 weeks, notice your baby's usual pattern. If movements reduce or stop, lie on your left side and count. If you do not feel 10 movements in 2 hours, or the pattern is clearly less, go to a facility immediately.",
    escalate: true,
  },
  {
    keys: ["bleeding", "spotting"],
    answer:
      "Any vaginal bleeding in pregnancy should be assessed. Spotting can have many causes; heavy bleeding, pain, or dizziness is an emergency. Do not wait overnight if bleeding is more than spotting.",
    escalate: true,
  },
  {
    keys: ["due date", "edd", "lmp", "when is my"],
    answer:
      "Your estimated due date is calculated from the first day of your last menstrual period using Naegele's rule (LMP + 7 days − 3 months + 1 year), about 280 days. An early ultrasound is more accurate if dates are unsure.",
  },
  {
    keys: ["anc", "visit", "how often", "antenatal"],
    answer:
      "WHO recommends at least eight antenatal contacts. In Nigeria, attend as scheduled by your facility — typically monthly until 28 weeks, then more often. High-risk pregnancies need closer follow-up.",
  },
  {
    keys: ["eat", "diet", "food", "nutrition"],
    answer:
      "Aim for regular meals with staples, beans or fish, greens, fruit, and iodised salt. Take iron and folic acid as prescribed. Limit sugary drinks if glucose is high. Avoid alcohol, unpasteurised dairy, and undercooked meat.",
  },
  {
    keys: ["danger", "emergency", "when to go"],
    answer:
      "Go now for: heavy bleeding, severe headache or vision change, convulsions, severe abdominal pain, fever, difficulty breathing, waters breaking before term, or if the baby has stopped moving. Take your WMHS summary if you can.",
    escalate: true,
  },
  {
    keys: ["risk", "score", "what does"],
    answer:
      "WMHS uses a guideline-backed triage engine (WHO, ACOG, NICE thresholds) — not a black-box diagnosis. Missing vitals are skipped, not treated as normal. High means a clinician should review you promptly. The score updates each time you log a symptom or test.",
  },
  {
    keys: ["medication", "iron", "folic", "malaria"],
    answer:
      "Take iron, folic acid, and any prescribed malaria prevention exactly as your clinic directed. Do not start or stop prescription medicines from this chat. Ask your provider about anything you are unsure of.",
    escalate: true,
  },
];

export const SUGGESTED_PROMPTS = [
  "What is pre-eclampsia?",
  "When should I go to the hospital?",
  "How is my due date calculated?",
  "What does my risk level mean?",
  "My baby is moving less — what should I do?",
];

export function answerQuestion(question: string, ctx: AssistantContext): Answer {
  const q = question.toLowerCase();
  const match = KNOWLEDGE.find((item) => item.keys.some((k) => q.includes(k)));

  const prefix =
    ctx.riskLevel === "HIGH"
      ? `${ctx.name}, your current WMHS risk level is High. Please treat new danger signs as urgent. `
      : ctx.riskLevel === "MEDIUM"
        ? `${ctx.name}, your current WMHS risk level is Medium — keep logging and attend follow-up. `
        : "";

  if (match) {
    return {
      question,
      answer: prefix + match.answer,
      escalate: Boolean(match.escalate) || ctx.riskLevel === "HIGH",
    };
  }

  return {
    question,
    answer:
      prefix +
      "I can explain pregnancy danger signs, due dates, nutrition, and what your WMHS risk result means. I am not a replacement for a clinician. If you feel unwell, contact your provider or the nearest facility.",
    escalate: ctx.riskLevel === "HIGH",
  };
}
