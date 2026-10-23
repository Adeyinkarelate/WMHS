import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { PatientShell } from "@/components/patient/PatientShell";

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (session.user.role === "PROVIDER") redirect("/provider/dashboard");
  const openAlertCount = session.user.patientId
    ? await prisma.alert.count({
        where: {
          patientId: session.user.patientId,
          status: { in: ["ACTIVE", "ACKNOWLEDGED"] },
        },
      })
    : 0;
  return (
    <PatientShell name={session.user.name ?? "Patient"} openAlertCount={openAlertCount}>
      {children}
    </PatientShell>
  );
}
