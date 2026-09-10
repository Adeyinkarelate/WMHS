import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { assignedCaseloadWhere } from "@/lib/auth/guards";
import { ProviderShell } from "@/components/provider/ProviderShell";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (session.user.role === "PATIENT") redirect("/patient/dashboard");
  const activeAlertCount = await prisma.alert.count({
    where: {
      status: { in: ["ACTIVE", "ACKNOWLEDGED"] },
      ...assignedCaseloadWhere(session.user),
    },
  });
  return (
    <ProviderShell name={session.user.name ?? "Provider"} activeAlertCount={activeAlertCount}>
      {children}
    </ProviderShell>
  );
}
