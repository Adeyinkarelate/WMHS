import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { PatientShell } from "@/components/patient/PatientShell";

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (session.user.role === "PROVIDER") redirect("/provider/dashboard");
  return <PatientShell name={session.user.name ?? "Patient"}>{children}</PatientShell>;
}
