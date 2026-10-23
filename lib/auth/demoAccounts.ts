export function showDemoLogin() {
  if (process.env.NEXT_PUBLIC_SHOW_DEMO_LOGIN === "true") return true;
  if (process.env.NEXT_PUBLIC_SHOW_DEMO_LOGIN === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export const DEMO_PASSWORD = "Password123!";

export const DEMO_ACCOUNTS = [
  {
    role: "PATIENT" as const,
    email: "patient@wmhs.ng",
    password: DEMO_PASSWORD,
    label: "Try as mother",
    hint: "Amina Bello · high-risk walkthrough",
  },
  {
    role: "PROVIDER" as const,
    email: "provider@wmhs.ng",
    password: DEMO_PASSWORD,
    label: "Try as clinician",
    hint: "Dr. Chioma Okeke · caseload",
  },
];
